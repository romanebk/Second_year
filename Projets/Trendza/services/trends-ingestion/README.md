# Service d'ingestion Google Trends

Service **Python autonome**, volontairement séparé de l'application Next.js.
Son unique rôle : interroger Google Trends, normaliser le résultat et écrire
dans la table `products` de Supabase.

Il n'est **jamais** appelé pendant une visite utilisateur : Google limite
fortement le débit, et une ingestion complète prend plusieurs minutes.

---

## ⚠️ À lire avant de déployer

**1. pytrends n'est plus maintenu.** Le dépôt a été archivé en avril 2025. La
bibliothèque fonctionne encore pour un usage léger, mais Google casse
régulièrement l'endpoint interne qu'elle utilise, et les erreurs `429` sont
fréquentes dès le premier appel.

Tout le service ne dépend de pytrends qu'à travers **un seul fichier** :
[`trends_source.py`](./trends_source.py), qui expose `fetch_keyword()` et le
type `TrendPoint`. Pour basculer vers `trendspy` (successeur maintenu), une API
payante (SerpApi, DataForSEO) ou l'API officielle Google, il suffit de réécrire
ce fichier en respectant le même contrat. Aucun autre module n'est à toucher.

**2. Google Trends ne fournit pas de produits.** Il mesure un *intérêt de
recherche*. Il ne donne ni prix, ni image, ni marge, ni fournisseur. Les
produits ingérés arrivent donc avec :

| Champ | Valeur à l'ingestion |
|---|---|
| `nom`, `categorie`, `score`, `pays_cible`, `mois_pertinents`, `description` | déduits de Trends |
| `prix_conseille` | `0` — **à compléter** |
| `image_url` | image neutre — **à compléter** |
| `marge_estimee`, `public_cible`, `arguments_vente`, `angles_marketing` | vides — **à compléter** |

Ils s'affichent avec un badge « À compléter » dans `/admin` tant que le prix
vaut 0. Ce sont des **candidats à enrichir**, pas des fiches prêtes à publier.

---

## Installation locale

```bash
cd services/trends-ingestion

python3 -m venv .venv
source .venv/bin/activate        # Windows : .venv\Scripts\activate

pip install -r requirements.txt

cp .env.example .env             # puis renseigner les valeurs
```

### Variables d'environnement

| Variable | Rôle |
|---|---|
| `SUPABASE_URL` | URL du projet Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé **service_role** (Project Settings → API) |
| `TRENDS_SERVICE_SECRET` | Secret partagé avec l'app Next.js, pour l'API HTTP |

> ⚠️ **La clé `service_role` contourne la Row Level Security.** Elle ne doit
> exister que dans l'environnement de ce service. Jamais dans l'application
> Next.js, jamais préfixée `NEXT_PUBLIC_`, jamais commitée. Le fichier `.env`
> est ignoré par git.

Générer le secret partagé :

```bash
openssl rand -hex 32
```

---

## Les deux façons de l'exécuter

### 1. En ligne de commande (tâche planifiée)

```bash
python ingest.py
```

Affiche un rapport et sort avec le code `1` si rien n'a été écrit — pratique
pour qu'un cron déclenche une alerte.

Exemple de cron quotidien à 4 h du matin :

```cron
0 4 * * * cd /chemin/vers/services/trends-ingestion && .venv/bin/python ingest.py >> /var/log/trendza-ingest.log 2>&1
```

### 2. En service HTTP (bouton de la page /admin)

```bash
uvicorn app:app --port 8000
```

| Route | Description |
|---|---|
| `GET /health` | Sonde de disponibilité, sans authentification |
| `POST /ingest` | Lance une ingestion. Exige `Authorization: Bearer <TRENDS_SERVICE_SECRET>` |

Test manuel :

```bash
curl -X POST http://localhost:8000/ingest \
  -H "Authorization: Bearer $TRENDS_SERVICE_SECRET"
```

Une seule ingestion tourne à la fois : un second appel simultané reçoit un
`409`.

---

## Configurer les mots-clés suivis

Tout se passe dans [`keywords.py`](./keywords.py) :

```python
MOTS_CLES = [
    Keyword("brasero", "Maison"),
    Keyword("sérum vitamine c", "Beauté"),
]

PAYS_SUIVIS = ["US", "CA", "FR", "CI", "SN", "CM", "ML"]
```

- Les **catégories** doivent exister dans `CATEGORIES` (`lib/constants.ts`).
- Les **codes pays** doivent exister dans `COUNTRIES` (`lib/constants.ts`), et
  leur libellé français doit être connu de `country_codes.py`.

`valider_configuration()` est appelée au démarrage de chaque ingestion et
interrompt le traitement avec un message clair si une valeur est invalide.

**Gardez la liste courte.** Chaque mot-clé coûte au moins deux requêtes à
Google, avec 8 à 15 secondes de pause entre chacun. Douze mots-clés ≈ 3 à 5
minutes.

---

## Déploiement

Ce service est un simple conteneur Python : il se déploie sur Render, Railway,
Fly.io, Scaleway, une VM, ou n'importe quel hébergeur supportant Python 3.11+.

**Il ne peut pas être déployé sur Vercel avec l'application Next.js** : les
fonctions serverless y sont limitées en durée, or une ingestion dure plusieurs
minutes.

Commande de démarrage attendue par la plupart des plateformes :

```bash
uvicorn app:app --host 0.0.0.0 --port $PORT
```

Renseignez ensuite, **côté application Next.js** (Vercel → Environment
Variables) :

| Variable | Valeur |
|---|---|
| `TRENDS_SERVICE_URL` | URL publique du service, ex. `https://trendza-ingest.onrender.com` |
| `TRENDS_SERVICE_SECRET` | Le **même** secret que côté service |

Si ces deux variables sont absentes, le bouton « Google Trends » de la page
`/admin` renvoie un message explicite au lieu d'échouer silencieusement.

---

## Comportement en cas d'échec

- Un mot-clé qui échoue est **ignoré**, les autres continuent (3 tentatives
  avec backoff progressif avant abandon).
- Le rapport final remonte `inserted`, `updated`, `failed` et les messages
  d'erreur, affichés dans l'interface d'administration.
- Une ré-exécution **met à jour** les produits déjà ingérés au lieu d'en créer
  des doublons : la correspondance se fait sur le nom, **restreinte à
  `source = 'pytrends'`**. Les produits saisis à la main ou importés par CSV ne
  sont jamais modifiés, même en cas d'homonymie.

---

## Architecture

```
app.py             API HTTP (FastAPI) — authentification par secret partagé
ingest.py          Orchestration + normalisation vers le schéma `products`
trends_source.py   ⚠️ Accès Google Trends — SEUL fichier à remplacer
country_codes.py   Nom de pays (en clair) → code ISO
keywords.py        Configuration : mots-clés, catégories, pays
supabase_store.py  Écriture Supabase (clé service_role)
```
