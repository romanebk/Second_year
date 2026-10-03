# Explication détaillée - poc_challenge1.py

## Script 1 : poc_challenge1.py (Divulgation d'informations via stéganographie PDF)

### Ligne par ligne

**Ligne 1** : `#!/usr/bin/env python3` - Shebang indiquant l'interpréteur Python 3

**Ligne 2-6** : Commentaires décrivant le POC pour le Challenge 1 et la vulnérabilité (divulgation d'informations)

**Ligne 8** : `import subprocess` - Importe le module pour exécuter des commandes système (exiftool, pdfinfo, pdfimages)

**Ligne 9** : `import os` - Importe le module pour manipuler le système de fichiers (création de répertoires)

**Ligne 10** : `import re` - Importe le module pour les expressions régulières (extraction du flag et du nonce CSRF)

**Ligne 11** : `import requests` - Importe le module pour les requêtes HTTP (connexion au site web)

**Ligne 12** : `import sys` - Importe le module pour les fonctions système (exit)

**Ligne 13** : `import getpass` - Importe le module pour la saisie sécurisée de mots de passe (ne s'affiche pas à l'écran)

**Ligne 14** : `from pathlib import Path` - Importe la classe Path pour manipuler les chemins de fichiers de manière moderne

**Ligne 19** : `PDF = "ECORP-Flyer.pdf"` - Variable contenant le nom du fichier PDF à analyser

**Ligne 20** : `OUTPUT_DIR = "extracted_images"` - Variable contenant le répertoire où extraire les images

**Ligne 21** : `BASE_URL = "https://ecorp.cyber.epitest.eu"` - Variable contenant l'URL principale du site

**Ligne 22** : `HIDDEN_PATH = "/challenge-draft-do-not-use"` - Variable contenant le chemin caché découvert dans le PDF

**Ligne 27** : `def analyse_pdf(pdf):` - Définit la fonction d'analyse du PDF avec le paramètre pdf

**Ligne 28** : `print("\n[*] Étape 1 : Analyse du fichier PDF...")` - Affiche un message indiquant l'étape en cours

**Ligne 29** : `for tool in ["exiftool", "pdfinfo"]:` - Boucle sur les deux outils d'analyse de PDF

**Ligne 30** : `result = subprocess.run([tool, pdf], capture_output=True, text=True)` - Exécute l'outil avec capture de la sortie standard et d'erreur en mode texte

**Ligne 31** : `print(result.stdout)` - Affiche la sortie standard de la commande (métadonnées du PDF)

**Ligne 36** : `def extract_images(pdf, output_dir):` - Définit la fonction d'extraction d'images avec deux paramètres

**Ligne 37** : `print("\n[*] Étape 2 : Extraction des images embarquées...")` - Affiche un message indiquant l'étape

**Ligne 38** : `os.makedirs(output_dir, exist_ok=True)` - Crée le répertoire de sortie s'il n'existe pas (exist_ok=True évite l'erreur si le répertoire existe déjà)

**Ligne 39** : `subprocess.run(["pdfimages", "-all", pdf, f"{output_dir}/image"], check=True)` - Exécute pdfimages avec l'option -all pour extraire toutes les images du PDF, préfixées par "image"

**Ligne 40** : `images = sorted(Path(output_dir).glob("image-*"))` - Liste tous les fichiers correspondant au pattern "image-*" dans le répertoire et les trie

**Ligne 41** : `print(f"[+] {len(images)} image(s) extraite(s) :")` - Affiche le nombre d'images extraites

**Ligne 42** : `for img in images:` - Boucle sur chaque image extraite

**Ligne 43** : `print(f"    - {img}")` - Affiche le chemin de chaque image

**Ligne 44** : `return [str(img) for img in images]` - Retourne une liste de chaînes de caractères représentant les chemins des images

**Ligne 49** : `def find_hidden_url():` - Définit la fonction pour trouver l'URL cachée

**Ligne 50** : `print(f"\n[*] Étape 3 : URL cachée identifiée dans image-004.jpg : {HIDDEN_PATH}")` - Affiche l'URL cachée identifiée manuellement

**Ligne 51** : `return HIDDEN_PATH` - Retourne le chemin caché

**Ligne 56** : `def login(session, base_url, user, password):` - Définit la fonction de connexion avec les paramètres session, base_url, user, password

**Ligne 57** : `print(f"\n[*] Étape 4 : Authentification sur {base_url}...")` - Affiche un message indiquant l'étape

**Ligne 58** : `r = session.get(f"{base_url}/login")` - Effectue une requête HTTP GET sur la page de login

**Ligne 59** : `nonce = re.search(r'<input[^>]+name="nonce"[^>]+value="([a-f0-9]+)"', r.text)` - Cherche le nonce CSRF dans le HTML de la page de login à l'aide d'une expression régulière

**Ligne 60** : (suite) - Le regex capture un champ input avec name="nonce" et extrait sa valeur hexadécimale

**Ligne 62** : `if not nonce:` - Vérifie si le nonce n'a pas été trouvé

**Ligne 63** : `print("[!] Nonce CSRF introuvable.")` - Affiche un message d'erreur

**Ligne 64** : `sys.exit(1)` - Quitte le programme avec un code d'erreur 1

**Ligne 66** : `nonce = nonce.group(1)` - Extrait le premier groupe capturé par l'expression régulière (la valeur du nonce)

**Ligne 67** : `print(f"[+] Nonce récupéré : {nonce}")` - Affiche le nonce récupéré

**Ligne 69-73** : `r = session.post(f"{base_url}/login", data={"name": user, "password": password, "nonce": nonce}, allow_redirects=True)` - Envoie une requête HTTP POST avec les identifiants et le nonce, en suivant les redirections

**Ligne 76** : `if r.url == f"{base_url}/" or "challenges" in r.text.lower():` - Vérifie si la connexion a réussi en testant l'URL de redirection ou la présence du mot "challenges"

**Ligne 77** : `print(f"[+] Authentification réussie !")` - Affiche le succès de l'authentification

**Ligne 79** : `else:` - Sinon (échec de l'authentification)

**Ligne 80** : `print(f"[!] Échec de l'authentification.")` - Affiche un message d'erreur

**Ligne 81** : `print(f"[!] Vérifie tes identifiants.")` - Affiche un conseil

**Ligne 82** : `sys.exit(1)` - Quitte le programme avec un code d'erreur

**Ligne 86** : `def fetch_page(session, base_url, path):` - Définit la fonction pour récupérer une page

**Ligne 87** : `full_url = f"{base_url}{path}"` - Construit l'URL complète en concaténant la base et le chemin

**Ligne 88** : `print(f"\n[*] Étape 5 : Requête sur {full_url}...")` - Affiche un message indiquant l'étape

**Ligne 89** : `r = session.get(full_url)` - Effectue une requête HTTP GET sur l'URL complète

**Ligne 90** : `print(f"[+] Status HTTP : {r.status_code}")` - Affiche le code de statut HTTP (200, 404, etc.)

**Ligne 91** : `return r.text` - Retourne le contenu HTML de la page

**Ligne 96** : `def extract_flag(body):` - Définit la fonction d'extraction du flag

**Ligne 97** : `print("\n[*] Étape 6 : Extraction du flag...")` - Affiche un message indiquant l'étape

**Ligne 98** : `match = re.search(r'EPI\{[^}]+\}', body)` - Cherche le pattern EPI{...} dans le contenu de la page à l'aide d'une expression régulière

**Ligne 99** : `if match:` - Si le pattern est trouvé

**Ligne 100** : `return match.group(0)` - Retourne le flag complet

**Ligne 101** : `return None` - Sinon retourne None

**Ligne 106** : `def main():` - Définit la fonction principale du programme

**Ligne 107-109** : Affiche le titre du POC avec des séparateurs

**Ligne 111** : `if not os.path.exists(PDF):` - Vérifie si le fichier PDF n'existe pas

**Ligne 112** : `print(f"[!] PDF introuvable : '{PDF}'")` - Affiche un message d'erreur

**Ligne 113** : `sys.exit(1)` - Quitte le programme avec un code d'erreur

**Ligne 116** : `print("\n[*] Identifiants CTFd requis :")` - Affiche un message demandant les identifiants

**Ligne 117** : `user = input("    Email/Username : ")` - Demande à l'utilisateur d'entrer son email ou username

**Ligne 118** : `password = getpass.getpass("    Password       : ")` - Demande à l'utilisateur d'entrer son mot de passe de façon sécurisée (ne s'affiche pas à l'écran)

**Ligne 120** : `analyse_pdf(PDF)` - Appelle la fonction d'analyse du PDF

**Ligne 121** : `extract_images(PDF, OUTPUT_DIR)` - Appelle la fonction d'extraction des images

**Ligne 122** : `path = find_hidden_url()` - Appelle la fonction pour trouver l'URL cachée et stocke le résultat

**Ligne 124** : `session = requests.Session()` - Crée une session HTTP persistante pour maintenir les cookies

**Ligne 125** : `login(session, BASE_URL, user, password)` - Appelle la fonction de connexion

**Ligne 127** : `body = fetch_page(session, BASE_URL, path)` - Appelle la fonction pour récupérer la page cachée

**Ligne 128** : `flag = extract_flag(body)` - Appelle la fonction pour extraire le flag du contenu

**Ligne 130** : `if flag:` - Si le flag a été trouvé

**Ligne 131-133** : Affiche le flag encadré par des lignes de séparation

**Ligne 135** : `else:` - Sinon (flag non trouvé)

**Ligne 135** : `print("[!] Flag non trouvé dans la réponse.")` - Affiche un message d'erreur

**Ligne 137** : `if __name__ == "__main__":` - Vérifie si le script est exécuté directement (pas importé)

**Ligne 138** : `main()` - Appelle la fonction principale

---

## Résumé du fonctionnement

Ce script automatise l'exploitation d'une vulnérabilité de divulgation d'informations par stéganographie dans un fichier PDF. Il :

1. Analyse le PDF avec exiftool et pdfinfo pour récupérer les métadonnées
2. Extrait toutes les images embarquées dans le PDF avec pdfimages
3. Identifie l'URL cachée dans l'image image-004.jpg
4. Se connecte au site CTFd en récupérant le nonce CSRF
5. Accède à la page cachée avec l'URL reconstruite
6. Extrait et affiche le flag EPI{...}
