"""Accès à Google Trends — le seul module à remplacer si pytrends lâche.

⚠️ pytrends est archivé depuis avril 2025 et n'est plus maintenu. Il fonctionne
encore pour un usage léger, mais Google casse régulièrement l'endpoint interne
qu'il utilise, et la bibliothèque renvoie fréquemment des 429 dès le premier
appel à cause d'une gestion de session vieillissante.

Tout le reste du service ne connaît que `TrendPoint` et `fetch_keyword()` :
pour basculer vers `trendspy`, une API payante (SerpApi, DataForSEO) ou l'API
officielle Google, il suffit de réécrire `fetch_keyword()` en respectant ce
contrat. Aucun autre fichier n'est à toucher.
"""

from __future__ import annotations

import logging
import random
import time
from dataclasses import dataclass, field

from pytrends.request import TrendReq

from country_codes import nom_vers_code

logger = logging.getLogger(__name__)

# Fenêtre d'observation : 12 mois pour déduire une saisonnalité mensuelle.
TIMEFRAME = "today 12-m"

# Google tolère mal les rafales. Ces valeurs sont volontairement prudentes :
# l'ingestion est une tâche de fond, la lenteur n'est pas un problème.
PAUSE_ENTRE_MOTS_CLES_S = (8, 15)
MAX_TENTATIVES = 3
BACKOFF_BASE_S = 20


@dataclass
class TrendPoint:
    """Résultat normalisé pour un mot-clé, indépendant du fournisseur."""

    terme: str
    #: Intérêt moyen sur la période, 0-100.
    interet_moyen: float
    #: Intérêt du dernier point disponible, 0-100.
    interet_actuel: float
    #: Variation en % entre la première et la dernière moitié de la période.
    croissance_pct: float
    #: Intérêt par pays (code ISO → 0-100), restreint aux pays suivis.
    interet_par_pays: dict[str, float] = field(default_factory=dict)
    #: Numéros de mois (1-12) où l'intérêt dépasse la moyenne.
    mois_forts: list[int] = field(default_factory=list)


class TrendsUnavailable(RuntimeError):
    """Google Trends est injoignable ou limite le débit (429)."""


def _nouveau_client() -> TrendReq:
    # `retries`/`backoff_factor` sont passés à urllib3 par pytrends et
    # amortissent les 429 transitoires au niveau HTTP.
    return TrendReq(
        hl="fr-FR",
        tz=0,
        timeout=(10, 30),
        retries=2,
        backoff_factor=0.5,
    )


def _croissance(valeurs: list[float]) -> float:
    """Variation en % entre la première et la seconde moitié de la période."""
    if len(valeurs) < 4:
        return 0.0
    milieu = len(valeurs) // 2
    debut = sum(valeurs[:milieu]) / milieu
    fin = sum(valeurs[milieu:]) / (len(valeurs) - milieu)
    if debut <= 0:
        return 100.0 if fin > 0 else 0.0
    return round(((fin - debut) / debut) * 100, 1)


def fetch_keyword(terme: str, pays_suivis: list[str]) -> TrendPoint:
    """Interroge Google Trends pour un mot-clé.

    Lève `TrendsUnavailable` si Google refuse de répondre après plusieurs
    tentatives — l'appelant décide alors d'ignorer ce terme ou d'arrêter.
    """
    derniere_erreur: Exception | None = None

    for tentative in range(1, MAX_TENTATIVES + 1):
        try:
            client = _nouveau_client()
            client.build_payload([terme], timeframe=TIMEFRAME)

            over_time = client.interest_over_time()
            if over_time is None or over_time.empty or terme not in over_time:
                raise TrendsUnavailable(f"Aucune donnée temporelle pour « {terme} ».")

            serie = over_time[terme]
            valeurs = [float(v) for v in serie.tolist()]
            moyenne = sum(valeurs) / len(valeurs) if valeurs else 0.0

            # Mois où l'intérêt dépasse la moyenne annuelle → saisonnalité.
            mois_forts = sorted(
                {
                    int(horodatage.month)
                    for horodatage, valeur in serie.items()
                    if float(valeur) > moyenne
                }
            )

            # `interest_by_region` renvoie tous les pays : on ne garde que les nôtres.
            interet_par_pays: dict[str, float] = {}
            try:
                par_region = client.interest_by_region(resolution="COUNTRY")
                if par_region is not None and not par_region.empty and terme in par_region:
                    # L'index est le nom du pays en clair, pas son code ISO.
                    for nom_pays, valeur in par_region[terme].items():
                        code = nom_vers_code(str(nom_pays))
                        if code and code in pays_suivis:
                            interet_par_pays[code] = float(valeur)
            except Exception as exc:  # noqa: BLE001 - non bloquant
                logger.warning("interest_by_region indisponible pour « %s » : %s", terme, exc)

            return TrendPoint(
                terme=terme,
                interet_moyen=round(moyenne, 1),
                interet_actuel=round(valeurs[-1], 1) if valeurs else 0.0,
                croissance_pct=_croissance(valeurs),
                interet_par_pays=interet_par_pays,
                mois_forts=mois_forts,
            )

        except Exception as exc:  # noqa: BLE001 - on retente quelle que soit la cause
            derniere_erreur = exc
            if tentative < MAX_TENTATIVES:
                attente = BACKOFF_BASE_S * tentative + random.uniform(0, 5)
                logger.warning(
                    "Échec pour « %s » (tentative %d/%d) : %s — nouvelle tentative dans %.0f s",
                    terme,
                    tentative,
                    MAX_TENTATIVES,
                    exc,
                    attente,
                )
                time.sleep(attente)

    raise TrendsUnavailable(
        f"Google Trends injoignable pour « {terme} » après {MAX_TENTATIVES} tentatives : {derniere_erreur}"
    )


def pause_entre_requetes() -> None:
    """Attente aléatoire entre deux mots-clés, pour ne pas déclencher de 429."""
    time.sleep(random.uniform(*PAUSE_ENTRE_MOTS_CLES_S))
