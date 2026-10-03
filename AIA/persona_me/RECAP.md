# Récapitulatif du projet Persona

## Vue d'ensemble
Agrégateur de news personnalisé avec chatbot IA (Mistral), système d'authentification, et envoi de newsletters par email. Tourne sur **n8n** dans Docker.

---

## Stack technique

| Technologie | Rôle |
|---|---|
| n8n 2.23.4 | Moteur de workflows |
| Docker / Docker Compose | Conteneurisation |
| PostgreSQL 16 | Base mémoire conversation (chat history) |
| SQLite (node:sqlite) | Base auth utilisateurs |
| JSON (filesystem) | Préférences, newsletters, audit |
| Mistral AI (mistral-small-latest) | LLM du chatbot |
| SMTP | Envoi d'emails |
| RSS (7 sources) | Agrégation de news |

---

## Ce qui est implémenté et fonctionnel ✅

### Auth (`Persona - Auth` + `Persona - Auth Handler`)
| Fonctionnalité | Statut |
|---|---|
| Inscription (email, username, password, consent RGPD) | ✅ |
| Connexion avec validation | ✅ |
| Gestion de sessions (token) | ✅ |
| Déconnexion (invalidation token) | ✅ |
| Suppression de compte (soft-delete) | ✅ |
| Export de données (RGPD portabilité) | ✅ |
| Rate limiting (10 tentatives/15min, blocage 15min) | ✅ |
| Audit logging (toutes les actions tracées) | ✅ |
| Validation des entrées (username 3-20, email regex, password >= 6) | ✅ |
| Protection injections SQL (prepared statements) | ✅ |

### Onboarding / Préférences (`Persona - Onboarding Handler`)
| Fonctionnalité | Statut |
|---|---|
| Lecture des préférences | ✅ |
| Sauvegarde des préférences (topics, email, scheduleTime, timezone) | ✅ |
| Mise à jour individuelle des réglages (articleCount, fréquence, sources, format, customPrompt) | ✅ |
| Désabonnement | ✅ |
| Validation : 18 topics, 10 sources, 3 fréquences, 2 formats email | ✅ |

### News Fetcher (`New Fetcher`)
| Fonctionnalité | Statut |
|---|---|
| 7 sources RSS (TechCrunch, BBC, The Verge, NASA, Hacker News, Le Monde, Wired) | ✅ |
| Parsing RSS par regex | ✅ |
| Filtrage par topics utilisateur | ✅ |
| Filtrage par sources | ✅ |
| Déduplication par URL | ✅ |
| Limite d'articles par utilisateur (articleCount, défaut: 5) | ✅ |
| Génération de newsletter HTML stylée | ✅ |
| Lien de désabonnement dans l'email | ✅ |
| Planification à l'heure choisie | ✅ |
| Historique (max 100 articles/user dans newsletters.json) | ✅ |

### Désabonnement (`Persona - Unsubscribe Webhook`)
| Fonctionnalité | Statut |
|---|---|
| Webhook GET /webhook/unsubscribe?userId=xxx | ✅ |
| Désactivation du compte dans preferences.json | ✅ |
| Page HTML de confirmation | ✅ |

### Chatbot (système)
| Fonctionnalité | Statut |
|---|---|
| Prompt système détaillé (règles strictes, GDPR, flux de conversation) | ✅ |
| Interface chat web (http://localhost:5678/form/chat/...) | ✅ |
| Mémoire de conversation (Postgres Chat Memory - persistante) | ✅ |

---

## Ce qui ne fonctionne pas ou est incomplet ❌

### 🔴 Critique

| # | Problème | Fichier | Ligne |
|---|---|---|---|
| 1 | **Workflow `Persona - Auth` inactif** | `Persona - Auth.json` | 192 |
| 2 | **Workflow `New Fetcher` inactif** | `New Fetcher.json` | 87 (corrigé → `active: true`) |
| 3 | **Workflow `Persona - Unsubscribe Webhook` inactif** | `Persona - Unsubscribe Webhook.json` | 82 |
| 4 | **ID du Onboarding Handler = placeholder** (`PERSONA_ONBOARDING_HANDLER_ID`) | `Persona - Auth.json` | 99-101 |
| 5 | **ID du credential Mistral = placeholder** (`MISTRAL_CREDENTIAL_ID`) | `Persona - Auth.json` | 50 |
| 6 | **ID du credential Postgres = placeholder** (`POSTGRES_CREDENTIAL_ID`) | `Persona - Auth.json` | 72 |

### 🟡 Moyen

| # | Problème | Fichier | Ligne |
|---|---|---|---|
| 7 | **Credential SMTP non configuré** (host, port, user, password à remplir) | `New Fetcher.json` | 55-58 |
| 8 | **Clé API Mistral exposée** dans le workspace | `important_file/api_mistral_key.txt` | — |
| 9 | **Token JWT n8n exposé** dans le workspace | `important_file/api_key.txt` | — |
| 10 | **Clé de chiffrement hardcodée** dans docker-compose | `docker-compose.yml` | 15 |
| 11 | **Fichiers sensibles non gitignorés** (important_file/) | `.gitignore` | 1 |

### 🟢 Mineur

| # | Problème | Fichier | Ligne |
|---|---|---|---|
| 12 | `.gitignore` trop permissif (seulement `*.pdf`) | `.gitignore` | 1 |
| 13 | `api_key.txt` déjà commité dans l'historique git | Git history | commit `86effab` |
| 14 | Répertoire `data/` vide (monté dans le container) | `data/` | — |
| 15 | Noms de nœuds placeholders dans les workflows | Plusieurs fichiers | — |

---

## Fonctionnalités manquantes

| Fonctionnalité | Statut |
|---|---|
| Système de feedback utilisateur | ❌ Non implémenté |
| Fact-checking | ❌ Non implémenté (bonus) |
| Audit de sécurité avancé | ❌ Non implémenté (bonus) |
| Trigger Web/Discord/email | ❌ Non implémenté (bonus) |

---

## Configuration

### Docker Compose
- **Services :** `n8n` + `postgres` (16-alpine)
- **Ports :** `5678:5678` (n8n), `5432:5432` (postgres)
- **Timezone :** `Africa/Porto-Novo`
- **Postgres :** user `persona`, db `persona_memory`, password dans `POSTGRES_PASSWORD`
- **Volumes :**
  - `n8n_data` → `/home/node/.n8n`
  - `postgres_data` → `/var/lib/postgresql/data`
  - `./data` → `/data`
  - `.` → `/home/node/persona_me`
- **Builtins autorisés :** tous (`NODE_FUNCTION_ALLOW_BUILTIN=*`)

### Scripts
- `persona.sh` : up, down, restart, logs, status

---

## Git History (6 commits)

| Commit | Date | Message |
|---|---|---|
| `94f93df` | 2026-06-02 | Adding a gitignore |
| `e17bb65` | 2026-06-02 | Installation file |
| `fa6ebe8` | 2026-06-02 | Installation file |
| `a73c512` | 2026-06-02 | Installation file |
| `6423d9a` | 2026-06-03 | Adding filefile |
| `86effab` | 2026-06-04 | Adding file |

Branche `main`, 1 commit en avance sur origin.

---

## Plan d'action priorisé

1. **Créer le credential Postgres** dans n8n (host: `postgres`, db: `persona_memory`, user: `persona`, password: `persona_password`)
2. **Corriger les placeholders** : `POSTGRES_CREDENTIAL_ID`, `PERSONA_ONBOARDING_HANDLER_ID` et `MISTRAL_CREDENTIAL_ID` dans l'UI n8n
3. **Configurer le credential SMTP** dans n8n
4. **Activer les workflows** (Auth, Fetcher, Unsubscribe) dans l'interface n8n
5. **Nettoyer les fichiers sensibles** : gitignorer `important_file/` et supprimer du tracking git
6. **Mettre à jour `.gitignore`** pour exclure les fichiers sensibles
7. **Changer la clé de chiffrement** (N8N_ENCRYPTION_KEY) pour une clé sécurisée
