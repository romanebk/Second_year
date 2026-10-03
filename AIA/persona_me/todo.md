# Persona — TODO

## Dans l'interface n8n (http://localhost:5678)

- [ ] **New Fetcher** → Send an Email → ajouter `emailFormat: html`
- [ ] **Unsubscribe Webhook** → Respond to Webhook → `Respond With: JSON`
- [ ] **Credentials** → SMTP account → remplir les infos SMTP

## Flow de test

1. Aller sur http://localhost:5678/form/chat/ac45f651-092c-4942-a8f0-bfcd2f4e2265
2. Créer un compte → choix des topics, email, heure d'envoi
3. Attendre l'heure choisie → la newsletter arrive par email
4. Cliquer sur "Se désinscrire" dans l'email → webhook confirme

## Fichiers du repo

| Fichier | Rôle |
|---------|------|
| `Persona - Auth.json` | Chatbot principal |
| `Persona - Auth Handler.json` | Auth SQLite ( ✅ userId fix ) |
| `Persona - Onboarding Handler.json` | Préférences JSON |
| `New Fetcher.json` | RSS + envoi email ( ✅ code mis à jour ) |
| `Persona - Unsubscribe Webhook.json` | Désinscription |
