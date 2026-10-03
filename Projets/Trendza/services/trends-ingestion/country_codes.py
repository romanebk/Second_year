"""Correspondance nom de pays → code ISO, pour `interest_by_region`.

Google Trends renvoie les régions sous forme de noms en clair, dans la langue
demandée (`hl`), et non sous forme de codes ISO. Comme le service interroge en
français, on gère les libellés français, avec repli sur l'anglais au cas où
Google servirait la version anglaise.
"""

from __future__ import annotations

import unicodedata

# Uniquement les pays suivis par Trendza (voir keywords.PAYS_SUIVIS).
_NOMS_VERS_CODE = {
    # France
    "france": "FR",
    # Côte d'Ivoire
    "cote divoire": "CI",
    "cote d ivoire": "CI",
    "ivory coast": "CI",
    # Sénégal
    "senegal": "SN",
    # Cameroun
    "cameroun": "CM",
    "cameroon": "CM",
    # Mali
    "mali": "ML",
    # Canada
    "canada": "CA",
    # États-Unis
    "etats unis": "US",
    "united states": "US",
}


def _normaliser(nom: str) -> str:
    """Minuscules, sans accents ni ponctuation, pour comparer de façon robuste."""
    sans_accents = "".join(
        c for c in unicodedata.normalize("NFD", nom) if unicodedata.category(c) != "Mn"
    )
    nettoye = "".join(c if c.isalnum() else " " for c in sans_accents.lower())
    return " ".join(nettoye.split())


def nom_vers_code(nom: str) -> str | None:
    """Retourne le code ISO du pays, ou None s'il n'est pas suivi par Trendza."""
    return _NOMS_VERS_CODE.get(_normaliser(nom))
