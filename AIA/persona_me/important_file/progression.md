# 🎯 Persona — Plan de Progression

> Agrégateur de news personnalisé via N8N

---

## ✅ Étape 1 — Installation de N8N en local
**Statut : Terminé**

- [x] Installation de Docker
- [x] Création du groupe docker et ajout de l'utilisateur
- [x] Lancement du container N8N
- [x] Accès à l'interface sur `http://localhost:5678`

---

## 🔐 Étape 2 — Workflow 1 : Chatbot + Authentification
**Statut : Terminé**

### Objectif
Créer un point d'entrée sécurisé via chatbot avec gestion des utilisateurs.

### Nodes N8N
```
[Chat Trigger] → [AI Agent] → [Read/Write Files from Disk]
```

### Tâches
- [x] Ajouter le node **Chat Trigger**
- [x] Configurer un **AI Agent** pour gérer la conversation
- [x] Créer le fichier `users.json` pour stocker les comptes
- [x] Implémenter le **Register** (nouvel utilisateur)
- [x] Implémenter le **Login** (vérification mot de passe hashé)
- [x] Protéger contre les accès malveillants (rate limiting, injection)
- [x] Tester l'authentification en conditions réelles

### Conformité RGPD
- [x] **Consentement explicite** demandé avant inscription
- [x] **Droit d'accès** : l'utilisateur voit ses préférences
- [x] **Droit de rectification** : modification des infos via `update_setting`
- [x] **Droit à l'effacement** : `delete_account` supprime le compte
- [x] **Droit d'opposition** : `unsubscribe` pour ne plus recevoir de news
- [x] **Portabilité** : `export_data` télécharge toutes les données (compte + préférences)
- [x] **Information** : l'utilisateur est informé des données collectées avant inscription
- [x] **Consentement traçable** : `gdpr_consent` stocké dans la base

### Améliorations sécurité ajoutées
- [x] **Rate limiting** : 5 tentatives max → blocage 30 min
- [x] **Session token** : token généré au login, vérifiable, révocable
- [x] **Logout** : invalidation du token de session
- [x] **Delete account** : désactivation de compte avec confirmation
- [x] **Audit trail** : journalisation de toutes les actions dans `audit.json`
- [x] **Protection injection** renforcée dans le system prompt

### Structure `users.json`
```json
{
  "users": [
    {
      "id": "uuid-xxx",
      "username": "ariel",
      "email": "ariel@example.com",
      "password": "hashed_password",
      "createdAt": "2025-01-01T00:00:00Z",
      "gdpr_consent": true
    }
  ]
}
```

---

## 📋 Étape 3 — Workflow 2 : Onboarding utilisateur
**Statut : Terminé**

### Objectif
Collecter les préférences de l'utilisateur après authentification.

### Architecture (intégré dans le même workflow `Persona - Auth`)
```
[Chat Trigger] → [AI Agent]
                   ├─ [Tool: Auth Handler] (auth + sessions + rate limit)
                   └─ [Tool: Onboarding Handler] (préférences)
```

### Tâches
- [x] Demander les **centres d'intérêt** (topics)
- [x] Collecter l'**adresse email** de réception
- [x] Choisir l'**heure d'envoi** de la newsletter
- [x] Sauvegarder dans `preferences.json`
- [x] Permettre la **modification** des préférences
- [x] Implémenter la **désinscription** (RGPD)

### Structure `preferences.json`
```json
{
  "preferences": [
    {
      "userId": "uuid-xxx",
      "topics": ["tech", "AI", "science"],
      "scheduleTime": "08:00",
      "timezone": "Africa/Porto-Novo",
      "active": true
    }
  ]
}
```

---

## 📰 Étape 4 — Workflow 3 : News Fetcher
**Statut : Terminé**

### Objectif
Récupérer et filtrer les actualités depuis plusieurs sources selon les préférences.

### Workflow autonome (Schedule Trigger)
```
[Schedule (30min)] → [Code: Fetch & Filter News]
```

### Tâches
- [x] Configurer plusieurs sources **RSS** (BBC, TechCrunch, Le Monde...)
- [x] Fusionner les articles récupérés
- [x] Filtrer selon les topics de chaque user (matching keywords)
- [x] Générer des **résumés** (extrait de la description)
- [x] Sauvegarder les articles filtrés dans `newsletters.json`

### Sources RSS configurées (7)
TechCrunch, BBC News, The Verge, NASA, Hacker News, Le Monde, Wired

### Notes
- Le workflow est **autonome** (pas de Chat Trigger)
- Se lance toutes les **30 minutes**
- Filtre par topics ET sources préférées de l'utilisateur
- Évite les doublons (déduplication par URL)

---

## 🗄️ Infrastructure ajoutée — PostgreSQL pour mémoire persistante
**Statut : Terminé**

### Objectif
Remplacer le **Simple Memory** (MemoryBufferWindow) volatile par une mémoire persistante **Postgres Chat Memory** qui survit aux redémarrages.

### Modifications
- [x] Ajout du service **PostgreSQL 16** dans `docker-compose.yml`
- [x] Volumes persistants (`postgres_data`)
- [x] Remplacé `@n8n/n8n-nodes-langchain.memoryBufferWindow` → `@n8n/n8n-nodes-langchain.memoryPostgres` dans `Persona - Auth.json`
- [x] Context Window Length : 10
- [x] Table : `n8n_chat_histories`

### Configuration credential Postgres (à faire dans l'UI n8n)
| Champ | Valeur |
|---|---|
| **Host** | `postgres` (nom du service Docker) |
| **Database** | `persona_memory` |
| **User** | `persona` |
| **Password** | `persona_password` |
| **Port** | `5432` |

### Sources RSS suggérées
| Source | URL RSS | Topics |
|--------|---------|--------|
| TechCrunch | `https://techcrunch.com/feed/` | Tech, Startup |
| BBC News | `http://feeds.bbci.co.uk/news/rss.xml` | Général |
| The Verge | `https://www.theverge.com/rss/index.xml` | Tech, Science |
| NASA | `https://www.nasa.gov/rss/dyn/breaking_news.rss` | Science, Space |
| Hacker News | `https://hnrss.org/frontpage` | Dev, Tech |

---

## 📧 Étape 5 — Workflow 4 : Newsletter Sender
**Statut : Terminé** (fusionné avec Étape 4 via `New Fetcher.json` — fetch + envoi + historique complètes)

### Objectif
Générer et envoyer la newsletter personnalisée par email à l'heure choisie.

### Nodes N8N
```
[Schedule Trigger] → [Read Files] → [AI Agent] → [Send Email]
```

### Tâches
- [x] Lire les articles filtrés depuis `newsletters.json`
- [x] Générer un email **HTML** formaté
- [x] Configurer le **Schedule** selon l'heure choisie par chaque user
- [x] Envoyer via **SMTP** (credential à configurer dans l'UI n8n)
- [x] Mettre à jour `newsletters.json` avec l'historique d'envoi
- [x] Ajouter un lien de **désinscription** dans chaque email

### Structure `newsletters.json`
```json
{
  "newsletters": [
    {
      "userId": "uuid-xxx",
      "sentAt": "2025-01-01T08:00:00Z",
      "articles": [
        {
          "title": "Titre de l'article",
          "summary": "Résumé généré par IA",
          "url": "https://source.com/article",
          "source": "TechCrunch"
        }
      ]
    }
  ]
}
```

---

## 🏆 Bonus — Fonctionnalités avancées
**Statut : Optionnel**

- [ ] Emails en format **HTML** rich (vs plaintext)
- [ ] **Fact-checking** des articles via sources secondaires
- [ ] **Prompt personnalisé** par utilisateur (ton, format, nombre d'articles)
- [ ] Système de **feedback** sur les newsletters reçues
- [ ] **Audit de sécurité** du workflow
- [ ] Preuve de conformité **RGPD complète**
- [ ] Optimisation des **tokens IA** utilisés
- [ ] Exposition via **endpoint web / Discord / email trigger**

---

## 📁 Structure des fichiers JSON

```
~/.n8n/persona/
├── users.json          # Comptes utilisateurs
├── preferences.json    # Topics, schedule, email par user
└── newsletters.json    # Historique des newsletters envoyées
```

---

## 🔗 Ressources utiles

- [Documentation N8N](https://docs.n8n.io)
- [N8N AI Agent](https://docs.n8n.io/advanced-ai/)
- [Community Nodes](https://www.npmjs.com/search?q=n8n-nodes)
- [N8N RSS Feed Node](https://docs.n8n.io/integrations/builtin/app-nodes/n8n-nodes-base.rssfeedread/)
- [RGPD & email](https://www.cnil.fr/fr/la-prospection-commerciale-par-courrier-electronique)