"""Écriture des produits dans Supabase avec la clé service_role.

⚠️ Cette clé contourne la Row Level Security. Elle ne doit exister que dans
l'environnement de ce service (jamais dans l'application Next.js, jamais
préfixée `NEXT_PUBLIC_`, jamais commitée).
"""

from __future__ import annotations

import logging
import os
from typing import Any

from supabase import Client, create_client

logger = logging.getLogger(__name__)

SOURCE = "pytrends"  # doit rester identique à PRODUCT_SOURCE.pytrends (lib/constants.ts)


def creer_client() -> Client:
    url = os.environ.get("SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

    if not url or not key:
        raise RuntimeError(
            "SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY sont obligatoires. "
            "Copiez .env.example vers .env et renseignez-les."
        )

    return create_client(url, key)


def produits_existants(client: Client) -> dict[str, str]:
    """Retourne {nom_normalisé: id} des produits déjà écrits par ce service.

    Permet de mettre à jour au lieu d'insérer un doublon à chaque exécution,
    sans imposer de contrainte d'unicité en base (donc sans migration, et sans
    risquer de casser les produits saisis à la main ou par CSV).
    """
    reponse = client.table("products").select("id, nom").eq("source", SOURCE).execute()
    return {str(ligne["nom"]).strip().lower(): str(ligne["id"]) for ligne in (reponse.data or [])}


def enregistrer(client: Client, produit: dict[str, Any], existants: dict[str, str]) -> str:
    """Insère ou met à jour un produit. Retourne 'inserted' ou 'updated'.

    Ne touche jamais un produit d'une autre provenance : la recherche est
    filtrée sur `source = 'pytrends'`, donc le travail manuel est préservé
    même en cas d'homonymie.
    """
    cle = str(produit["nom"]).strip().lower()
    identifiant = existants.get(cle)

    if identifiant:
        client.table("products").update(produit).eq("id", identifiant).eq(
            "source", SOURCE
        ).execute()
        return "updated"

    reponse = client.table("products").insert(produit).execute()
    if reponse.data:
        existants[cle] = str(reponse.data[0]["id"])
    return "inserted"
