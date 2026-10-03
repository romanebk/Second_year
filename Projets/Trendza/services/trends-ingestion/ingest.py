"""Ingestion Google Trends → table `products` de Supabase.

Usage en tâche planifiée (cron) :

    python ingest.py

Le même code est exposé en HTTP par `app.py` pour le bouton de la page /admin.

⚠️ Ce que Google Trends fournit — et ne fournit pas
---------------------------------------------------
Trends mesure un **intérêt de recherche**, pas un produit. Il ne donne ni prix,
ni image, ni marge, ni fournisseur. Les champs correspondants sont donc laissés
volontairement vides (prix à 0, image `PLACEHOLDER_IMAGE`) : un produit ingéré
est un **candidat à enrichir** dans la page /admin, pas une fiche prête à
publier. Les écraser avec des valeurs inventées donnerait de faux chiffres à
l'utilisateur final.
"""

from __future__ import annotations

import logging
import sys
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any

from keywords import MOTS_CLES, PAYS_SUIVIS, valider_configuration
from supabase_store import SOURCE, creer_client, enregistrer, produits_existants
from trends_source import TrendsUnavailable, fetch_keyword, pause_entre_requetes

logger = logging.getLogger("ingest")

# Image neutre tant qu'un administrateur n'a pas fourni le vrai visuel.
# Le domaine doit être autorisé dans `next.config.ts` (images.remotePatterns).
PLACEHOLDER_IMAGE = "https://picsum.photos/seed/trendza-a-completer/800/600"

# En dessous de ce niveau d'intérêt, un pays n'est pas considéré comme ciblé.
SEUIL_INTERET_PAYS = 15.0


@dataclass
class Rapport:
    inserted: int = 0
    updated: int = 0
    failed: int = 0
    errors: list[str] = field(default_factory=list)

    def as_dict(self) -> dict[str, Any]:
        return {
            "inserted": self.inserted,
            "updated": self.updated,
            "failed": self.failed,
            # Bornées : ce rapport remonte jusqu'à l'interface d'administration.
            "errors": self.errors[:20],
        }


def _score(interet_actuel: float, croissance_pct: float) -> int:
    """Score 0-100 : niveau d'intérêt actuel, ajusté par la dynamique.

    L'intérêt Trends est déjà normalisé 0-100 sur la période. On le pondère
    par la croissance pour qu'un terme en progression passe devant un terme
    au même niveau mais en déclin.
    """
    bonus = max(-20.0, min(20.0, croissance_pct / 5))
    return max(0, min(100, round(interet_actuel + bonus)))


def _description(terme: str, point) -> str:
    sens = (
        "en progression"
        if point.croissance_pct > 5
        else "en recul"
        if point.croissance_pct < -5
        else "stable"
    )
    return (
        f"Intérêt de recherche {sens} pour « {terme} » sur les 12 derniers mois "
        f"(indice moyen {point.interet_moyen:.0f}/100, variation {point.croissance_pct:+.0f}%). "
        "Fiche à compléter : prix, visuel et arguments de vente ne proviennent pas de Google Trends."
    )


def construire_produit(point) -> dict[str, Any]:
    """Convertit un `TrendPoint` en ligne de la table `products`."""
    categorie = next(
        (kw.categorie for kw in MOTS_CLES if kw.terme == point.terme),
        "Tech",
    )

    pays_cible = [
        code
        for code, valeur in sorted(
            point.interet_par_pays.items(), key=lambda kv: kv[1], reverse=True
        )
        if valeur >= SEUIL_INTERET_PAYS
    ]

    return {
        "nom": point.terme.strip().capitalize(),
        "description": _description(point.terme, point),
        "categorie": categorie,
        "image_url": PLACEHOLDER_IMAGE,
        # Non disponibles via Google Trends — à renseigner dans /admin.
        "prix_conseille": 0,
        "marge_estimee": "",
        "public_cible": "",
        "arguments_vente": [],
        "angles_marketing": [],
        "score": _score(point.interet_actuel, point.croissance_pct),
        "pays_cible": pays_cible,
        "mois_pertinents": point.mois_forts,
        "source": SOURCE,
        "updated_at": datetime.now(timezone.utc).isoformat(),
    }


def executer() -> Rapport:
    """Interroge tous les mots-clés configurés et écrit le résultat en base."""
    rapport = Rapport()

    problemes = valider_configuration()
    if problemes:
        rapport.errors.extend(problemes)
        rapport.failed = len(MOTS_CLES)
        return rapport

    client = creer_client()
    existants = produits_existants(client)

    for index, kw in enumerate(MOTS_CLES):
        try:
            point = fetch_keyword(kw.terme, PAYS_SUIVIS)
            produit = construire_produit(point)
            action = enregistrer(client, produit, existants)
            if action == "inserted":
                rapport.inserted += 1
            else:
                rapport.updated += 1
            logger.info("%s : %s (score %s)", kw.terme, action, produit["score"])

        except TrendsUnavailable as exc:
            rapport.failed += 1
            rapport.errors.append(str(exc))
            logger.warning("Ignoré : %s", exc)

        except Exception as exc:  # noqa: BLE001 - un terme en échec ne doit pas tout arrêter
            rapport.failed += 1
            rapport.errors.append(f"{kw.terme} : {exc}")
            logger.exception("Erreur inattendue sur « %s »", kw.terme)

        # Pas de pause après le dernier terme.
        if index < len(MOTS_CLES) - 1:
            pause_entre_requetes()

    return rapport


def main() -> int:
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(levelname)s %(name)s — %(message)s",
    )
    rapport = executer()
    logger.info(
        "Terminé : %d ajouté(s), %d mis à jour, %d échec(s).",
        rapport.inserted,
        rapport.updated,
        rapport.failed,
    )
    for erreur in rapport.errors:
        logger.error(erreur)

    # Code de sortie non nul si rien n'a été écrit : le cron peut alerter.
    return 0 if (rapport.inserted + rapport.updated) > 0 else 1


if __name__ == "__main__":
    sys.exit(main())
