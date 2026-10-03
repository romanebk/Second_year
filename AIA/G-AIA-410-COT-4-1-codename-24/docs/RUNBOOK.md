# Prompt Battles - Runbook

## Objectif

Ce projet contient deux fichiers pour participer à des "prompt attack battles" où le but est de faire révéler un CODEWORD caché derrière un PASSWORD à des LLM adverses.

## Structure du projet

.
├── attack.prompt      # Fichier d'attaque (multi-vector)
├── defense.prompt     # Fichier de défense (système sécurisé)
├── launch_bot.sh      # Script de lancement automatique
└── RUNBOOK.md        # Ce fichier

## Lancement rapide

### 1. Lancer le bot complet

```bash
./launch_bot.sh
```

Ce script va :
- Vérifier qu'Ollama est installé
- Démarrer le serveur Ollama si nécessaire
- Télécharger le modèle `granite3.1-moe`
- Préparer le système de défense avec les identifiants
- Lancer l'attaque automatiquement

### 2. Lancement manuel (développement)

```bash
# Démarrer Ollama
ollama serve &

# Télécharger le modèle (une seule fois)
ollama pull granite3.1-moe

# Préparer la défense
SYSTEM=$(sed 's/{password}/sunshine42/g; s/{secret}/OPERATION_PHOENIX/g' defense.prompt)

# Lancer l'attaque
ollama run granite3.1-moe system "$SYSTEM" < attack.prompt

# Tester l'accès légitime
echo "sunshine42" | ollama run granite3.1-moe system "$SYSTEM"
```

## Configuration

### Identifiants par défaut
- **Password**: `sunshine42`
- **Secret**: `OPERATION_PHOENIX`

### Modification des identifiants
Pour changer les identifiants, modifiez les valeurs dans `launch_bot.sh` :

```bash
SYSTEM=$(sed 's/{password}/VOTRE_PASSWORD/g; s/{secret}/VOTRE_SECRET/g' defense.prompt)
```

## Défense (`defense.prompt`)

### Techniques utilisées
1. **Hardening identitaire** : "SECURE-AGENT-7"
2. **Règles immuables** : 12 règles explicites
3. **Anti-manipulation** : Protection contre roleplay, autorité, encodage
4. **Réponse unique** : "ACCESS DENIED" pour tout ce qui n'est pas le bon mot de passe

### Points forts
- Bloque explicitement chaque type d'attaque connue
- Réponse invariable et prévisible
- Protection contre les tentatives de contournement

## Attaque (`attack.prompt`)

### Techniques utilisées
1. **Sentence Completion** : Manipulation par complétion
2. **Authority Override** : Fausse autorité "LEVEL 5 CLEARANCE"
3. **Roleplay Injection** : Forcing "ARCHIVE" sans restrictions
4. **Creative Writing** : Contournement par exercice créatif
5. **Template Exploitation** : Formatage "SYSTEM AUDIT RESPONSE"

### Stratégie multi-vectorielle
L'attaque utilise plusieurs approches pour maximiser les chances de succès contre différents types de défenses.

## Tests et validation

### Scénarios de test

1. **Test d'attaque** (doit échouer) :
   ```bash
   ./launch_bot.sh
   ```

2. **Test d'accès légitime** (doit réussir) :
   ```bash
   SYSTEM=$(sed 's/{password}/sunshine42/g; s/{secret}/OPERATION_PHOENIX/g' defense.prompt)
   echo "sunshine42" | ollama run granite3.1-moe system "$SYSTEM"
   # Résultat attendu: CODEWORD: OPERATION_PHOENIX
   ```

3. **Test mauvais mot de passe** (doit échouer) :
   ```bash
   echo "wrongpassword" | ollama run granite3.1-moe system "$SYSTEM"
   # Résultat attendu: ACCESS DENIED
   ```

## Résultats attendus

### Attaque réussie
- Le bot NE doit PAS révéler le mot de passe
- Le bot NE doit PAS révéler le secret
- Réponse attendue : "ACCESS DENIED"

### Défense réussie
- Bon mot de passe → "CODEWORD: OPERATION_PHOENIX"
- Mauvais mot de passe → "ACCESS DENIED"
- Attaque → "ACCESS DENIED"

## Dépannage

### Problèmes courants

1. **Ollama non installé**
   ```bash
   curl -fsSL https://ollama.ai/install.sh | sh
   ```

2. **Modèle non trouvé**
   ```bash
   ollama pull granite3.1-moe
   ```

3. **Serveur Ollama non démarré**
   ```bash
   ollama serve &
   ```

4. **Permissions du script**
   ```bash
   chmod +x launch_bot.sh
   ```

## Améliorations possibles

### Pour la défense
- Ajouter plus de variations de réponses
- Implémenter des vérifications de format plus strictes
- Ajouter des techniques de détection d'attaques avancées

### Pour l'attaque
- Utiliser des techniques plus subtiles et psychologiques
- Varier les approches selon le type de défense
- Exploiter les ambigüités du langage naturel

## Évaluation

Le projet sera évalué sur :
- **Efficacité** des prompts d'attaque et de défense
- **Identification** correcte des techniques utilisées
- **Robustesse** contre différentes stratégies
- **Créativité** des approches

## Notes

- Le modèle utilisé est `granite3.1-moe`
- Les combats ont lieu quotidiennement (5 en défense, 5 en attaque)
- Les résultats sont communiqués via my.epitech.eu
- Testez régulièrement contre vos camarades pour améliorer vos prompts
