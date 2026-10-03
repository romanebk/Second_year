"""Mots-clés suivis sur Google Trends et marchés interrogés.

C'est le seul fichier à éditer pour changer ce que le service ingère.
Chaque mot-clé devient un produit du catalogue Trendza.

Les catégories doivent correspondre exactement à `CATEGORIES` dans
`lib/constants.ts`, et les codes pays à `COUNTRIES` : une valeur inconnue
serait rejetée par l'application.
"""

from dataclasses import dataclass


@dataclass(frozen=True)
class Keyword:
    """Un terme suivi sur Google Trends, rattaché à une catégorie Trendza."""

    terme: str
    categorie: str


# Catégories valides côté application (lib/constants.ts → CATEGORIES).
CATEGORIES_VALIDES = {
    "Beauté",
    "Maison",
    "Tech",
    "Mode",
    "Sport",
    "Bébé",
    "Cuisine",
    "Bien-être",
}

# Codes pays valides côté application (lib/constants.ts → COUNTRIES).
# Google Trends utilise les mêmes codes ISO 3166-1 alpha-2.
PAYS_SUIVIS = ["US", "CA", "FR", "CI", "SN", "CM", "ML"]

# Mots-clés suivis. Garder une liste courte : Google limite fortement le
# rythme des requêtes, et chaque terme représente au moins deux appels.
MOTS_CLES = [
    Keyword("brasero", "Maison"),
    Keyword("sérum vitamine c", "Beauté"),
    Keyword("lampe solaire", "Maison"),
    Keyword("batterie externe solaire", "Tech"),
    Keyword("montre connectée", "Tech"),
    Keyword("tapis de yoga", "Sport"),
    Keyword("blender portable", "Cuisine"),
    Keyword("sac à langer", "Bébé"),
    Keyword("huile de karité", "Beauté"),
    Keyword("ventilateur rechargeable", "Maison"),
    Keyword("diffuseur huiles essentielles", "Bien-être"),
    Keyword("robe wax", "Mode"),
]


def valider_configuration() -> list[str]:
    """Retourne la liste des problèmes de configuration (vide si tout est bon)."""
    problemes: list[str] = []

    for kw in MOTS_CLES:
        if kw.categorie not in CATEGORIES_VALIDES:
            problemes.append(
                f"Catégorie inconnue « {kw.categorie} » pour le mot-clé « {kw.terme} ». "
                f"Valeurs acceptées : {', '.join(sorted(CATEGORIES_VALIDES))}."
            )

    if not MOTS_CLES:
        problemes.append("Aucun mot-clé configuré.")
    if not PAYS_SUIVIS:
        problemes.append("Aucun pays configuré.")

    return problemes
