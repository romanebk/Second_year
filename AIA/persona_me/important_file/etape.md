# 🛠️ Comment sécuriser les fichiers JSON dans n8n (Anti-Bug)

Lorsque deux utilisateurs écrivent en même temps dans `users.json`, n8n risque d'écraser les données. Pour éviter cela :

- Chaque fois qu'un utilisateur s'inscrit ou modifie ses préférences, on utilise le nœud communautaire officiel `n8n-nodes-mutex` (autorisé par votre sujet) ou un nœud **Execute Workflow** centralisé (p. 3).
- Cela force n8n à traiter les demandes d'écriture une par une (file d'attente), garantissant qu'aucun fichier JSON ne sera corrompu.

---

# 🚀 Persona — Guide de Réalisation 100 % JSON

## 📁 Structure des fichiers à initialiser

Créez un dossier sur votre machine (partagé avec Docker) contenant trois fichiers JSON vides au départ :

- `users.json` : `[]` (un tableau vide)
- `preferences.json` : `[]`
- `newsletters.json` : `[]`

---

# 🔐 Étape 2 & 3 — Chatbot, Authentification & Onboarding JSON

## 1. Le Prompt Système de l'Agent IA

> *"Tu es Persona, un assistant de configuration de newsletter. Règle stricte : Tu ne dois rien faire tant que l'utilisateur n'est pas connecté. S'il est nouveau, appelle l'outil register_user. S'il a déjà un compte, appelle login_user. Une fois connecté, tu as le droit d'appeler update_preferences ou delete_account."*

## 2. L'Outil register_user (Custom Tool)

- **Entrées :** `username`, `email`, `password`.
- **Logique dans n8n :**
  1. **Read File from Disk** : Lire le fichier `users.json`.
  2. **Code (JavaScript)** :
     - Vérifier si le username existe déjà (si oui, renvoyer une erreur).
     - Générer un `userId` unique (UUID).
     - Hacher le mot de passe (ex: un chiffrement basique en JS via la bibliothèque crypto intégrée à n8n).
     - Ajouter le nouvel utilisateur dans le tableau.
  3. **Write File to Disk** : Sauvegarder le tableau mis à jour dans `users.json`.

## 3. L'Outil login_user (Custom Tool)

- **Entrées :** `username`, `password`.
- **Logique dans n8n :**
  1. **Read File from Disk** : Lire `users.json`.
  2. **Code (JavaScript)** : Chercher l'utilisateur. Si le mot de passe correspond au hash, retourner `success` et le `userId`.
  - L'Agent IA mémorise ce `userId` dans le contexte de la discussion.

## 4. L'Outil update_preferences & Option RGPD

- **Entrées :** `topics` (ex: tech, sport, politique), `scheduleTime` (ex: 08:00, 14:00).
- **Logique dans n8n :**
  1. **Read File from Disk** : Lire `preferences.json`.
  2. **Code (JavaScript)** : Chercher la ligne de l'utilisateur par `userId`. Si elle existe, mettre à jour les champs. Sinon, créer une nouvelle entrée avec `"active": true`.
  3. **Write File to Disk** : Sauvegarder le fichier.

**Option RGPD : suppression du compte**

- L'outil `delete_account` lira `users.json`, retirera l'utilisateur du tableau, puis lira `preferences.json` pour retirer également ses préférences, et sauvegardera les deux fichiers. Conforme RGPD (droit à l'effacement).

---

# 📰 Étape 4 & 5 — Enchaînement Completion du Workflow d'Envoi

```
[Schedule Trigger (Toutes les heures)]
          ↓
[Read File from Disk (preferences.json)]
          ↓
[Code Node: Filtrer les utilisateurs actifs à cette heure précise]
          ↓
[Loop Over Items (Pour chaque utilisateur filtré)]
          ↓
[HTTP / RSS Read (Récupération des flux d'actualités)]
          ↓
[Read File from Disk (newsletters.json - Historique)]
          ↓
[Code Node: Retirer les articles déjà présents dans l'historique de cet user]
          ↓
[Advanced AI Agent (Fait le résumé des articles restants sous format HTML)]
          ↓
[Gmail / SMTP Node (Envoie l'email à l'adresse de l'utilisateur)]
          ↓
[Write File to Disk (Met à jour newsletters.json avec les nouveaux envois)]
```

## L'astuce pour filtrer l'heure en JavaScript (Nœud Code)

Dans le premier nœud Code juste après la lecture de `preferences.json`, insérez ce script pour isoler les utilisateurs qui doivent recevoir leur mail maintenant :

```javascript
const heureActuelle = new Date()
  .toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Africa/Porto-Novo'
  })
  .slice(0, 3) + "00";
// Renvoie par exemple "08:00"

// On ne garde que les profils dont l'heure correspond
return items.filter(
  item => item.json.scheduleTime === heureActuelle && item.json.active === true
);
```

---

# 📧 Étape 6 — Le Webhook de Désinscription Directe (Bonus RGPD)

Même en JSON, le lien de désinscription dans l'email HTML fonctionne parfaitement (pp. 4-5) :

1. L'utilisateur clique sur `http://localhost:5678/webhook/unsubscribe?userId=xxx` (p. 4).
2. Le nœud **Webhook Trigger** intercepte la demande (p. 4).
3. Un nœud **Read File** lit `preferences.json`.
4. Un nœud **Code** trouve l'utilisateur avec ce `userId` et passe son statut à `"active": false` (p. 4).
5. Un nœud **Write File** réécrit le fichier JSON sur le disque.
6. Le nœud **Respond to Webhook** affiche une page de confirmation à l'écran.

En suivant cette structure, vous respectez à 100 % les contraintes du sujet (fichiers JSON uniquement), tout en évitant les bugs de superposition de données (pp. 2, 4).

---

Par quel bout du tunnel JSON voulez-vous commencer ? Je peux vous donner le code JavaScript exact pour le nœud d'inscription (register_user) pour créer proprement vos premiers utilisateurs dans le fichier JSON.
