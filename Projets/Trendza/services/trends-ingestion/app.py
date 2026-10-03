"""API HTTP du service d'ingestion, appelée par le bouton de la page /admin.

Lancement local :

    uvicorn app:app --port 8000

Le seul appelant légitime est la route Next.js `/api/admin/ingest-trends`,
qui a déjà vérifié que l'utilisateur est administrateur. Ce service vérifie
en plus un secret partagé : il ne doit jamais être exposé publiquement sans.
"""

from __future__ import annotations

import asyncio
import logging
import os
import secrets

from fastapi import FastAPI, Header, HTTPException

from ingest import executer

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s — %(message)s",
)
logger = logging.getLogger("app")

app = FastAPI(title="Trendza — ingestion Google Trends", docs_url=None, redoc_url=None)

# Une seule ingestion à la fois : pytrends est déjà limité par Google, et
# deux exécutions concurrentes se feraient bloquer mutuellement.
_verrou = asyncio.Lock()


def _verifier_secret(authorization: str | None) -> None:
    attendu = os.environ.get("TRENDS_SERVICE_SECRET")
    if not attendu:
        raise HTTPException(
            status_code=503,
            detail="TRENDS_SERVICE_SECRET n'est pas configuré côté service.",
        )

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="En-tête Authorization manquant.")

    fourni = authorization.removeprefix("Bearer ").strip()
    # Comparaison à temps constant : évite de divulguer le secret par timing.
    if not secrets.compare_digest(fourni, attendu):
        raise HTTPException(status_code=401, detail="Secret invalide.")


@app.get("/health")
def health() -> dict[str, str]:
    """Sonde de disponibilité (aucun secret requis, ne révèle rien)."""
    return {"status": "ok"}


@app.post("/ingest")
async def ingest(authorization: str | None = Header(default=None)) -> dict[str, object]:
    _verifier_secret(authorization)

    if _verrou.locked():
        raise HTTPException(status_code=409, detail="Une ingestion est déjà en cours.")

    async with _verrou:
        # `executer()` est bloquant (requêtes HTTP + pauses) : on le sort de la
        # boucle d'événements pour ne pas figer le serveur.
        rapport = await asyncio.to_thread(executer)
        logger.info(
            "Ingestion terminée : %d ajouté(s), %d mis à jour, %d échec(s).",
            rapport.inserted,
            rapport.updated,
            rapport.failed,
        )
        return rapport.as_dict()
