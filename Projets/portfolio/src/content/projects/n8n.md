---
title: "Persona (n8n)"
description: "Plateforme d'automatisation n8n avec PostgreSQL et Mistral AI — chatbot agent, auth, profil, newsletter builder & scheduler."
heroImage: "/projects/n8n.webp"
badge: "n8n/IA"
category: "AIA"
github: "https://github.com/romanebk"
tags: ["n8n", "Automation", "Mistral AI", "PostgreSQL", "Groq"]
---

## À propos

Plateforme d'automatisation complète construite avec **n8n**, **PostgreSQL** et **Groq/Mistral AI**. Composée de 6 workflows interconnectés qui couvrent l'authentification, la gestion de profil, l'envoi de newsletters et la planification.

---

## Workflows

### 1. Chat Agent
Agent conversationnel avec mémoire et outils.

<a download href="/workflows/01_persona_chat_agent_fixed.json" class="inline-block px-3 py-1.5 my-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 text-cyan-400 no-underline text-sm font-medium hover:brightness-110 transition-all">⬇ Chat Agent (fixe)</a>
<a download href="/workflows/01_persona_chat_agent_postgres_memory.json" class="inline-block px-3 py-1.5 my-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 text-cyan-400 no-underline text-sm font-medium hover:brightness-110 transition-all">⬇ Chat Agent (memoire PostgreSQL)</a>

- **Persona Chat Trigger** — point d'entrée du chat
- **Persona Agent** + **Groq Model** — agent IA avec LLM
- **Session Memory** — mémoire de session
- **Outils :** `send_login_code`, `verify_login_code`, `set_my_interests`, `set_my_schedule`, `get_my_settings`, `send_newsletter_now`, `unsubscribe_me`, `resubscribe_me`, `set_my_preferences`

### 2. Backend — Auth
<a download href="/workflows/02_persona_backend_auth_fixed.json" class="inline-block px-3 py-1.5 my-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 text-cyan-400 no-underline text-sm font-medium hover:brightness-110 transition-all">⬇ Backend Auth</a>

Gestion d'authentification par OTP :
- **Route Action** — routage des requêtes
- **Generate OTP** / **Store OTP** / **Send OTP Email**
- **Validate OTP** / **Mark Session Verified** / **Upsert User**
- **Increment Attempts** — limitation des tentatives

### 3. Backend — Profile
<a download href="/workflows/03_persona_backend_profile_fixed.json" class="inline-block px-3 py-1.5 my-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 text-cyan-400 no-underline text-sm font-medium hover:brightness-110 transition-all">⬇ Backend Profile</a>

Gestion complète du profil utilisateur :
- **Resolve Session** + **Check Auth**
- **Get User** / **Update Interests** / **Update Schedule**
- **Unsubscribe** / **Resubscribe**
- **Call Newsletter Builder**
- **Update Preferences**

### 4. Newsletter Builder
<a download href="/workflows/04_persona_newsletter_builder_fixed.json" class="inline-block px-3 py-1.5 my-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 text-cyan-400 no-underline text-sm font-medium hover:brightness-110 transition-all">⬇ Newsletter Builder</a>

Génération automatique de newsletters :
- **Build Feed URLs** → **Fetch RSS** → **Select & Rank**
- **Summarize Articles** + **Summarize Model (Groq)**
- **Build Email Body** → **Send Newsletter**

### 5. Scheduler
<a download href="/workflows/05_persona_scheduler_fixed.json" class="inline-block px-3 py-1.5 my-1 rounded-lg bg-gradient-to-r from-cyan-500/10 to-fuchsia-500/10 border border-cyan-500/30 text-cyan-400 no-underline text-sm font-medium hover:brightness-110 transition-all">⬇ Scheduler</a>

Planification horaire :
- **Every Hour** → **Get Active Users** → **Filter Due Users** → **Send To Each User**

---

## Technologies

- **n8n** — orchestration des workflows
- **Groq / Mistral AI** — LLM pour le chat et les résumés
- **PostgreSQL** — base de données (sessions, profils, mémoires)
- **SMTP** — envoi d'emails (OTP, newsletters)
