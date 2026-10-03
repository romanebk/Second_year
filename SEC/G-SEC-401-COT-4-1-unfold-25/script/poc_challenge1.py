#!/usr/bin/env python3
# ================================================
# POC - ECORP Bug Bounty : Challenge 1
# Vulnérabilité : Divulgation d'informations via
# stéganographie dans un fichier PDF
# ================================================

import subprocess
import os
import re
import requests
import sys
import getpass
from pathlib import Path

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
PDF        = "ECORP-Flyer.pdf"
OUTPUT_DIR = "extracted_images"
BASE_URL   = "https://ecorp.cyber.epitest.eu"
HIDDEN_PATH = "/challenge-draft-do-not-use"

# ─────────────────────────────────────────────
# ÉTAPE 1 : Analyse du PDF
# ─────────────────────────────────────────────
def analyse_pdf(pdf):
    print("\n[*] Étape 1 : Analyse du fichier PDF...")
    for tool in ["exiftool", "pdfinfo"]:
        result = subprocess.run([tool, pdf], capture_output=True, text=True)
        print(result.stdout)

# ─────────────────────────────────────────────
# ÉTAPE 2 : Extraction des images
# ─────────────────────────────────────────────
def extract_images(pdf, output_dir):
    print("\n[*] Étape 2 : Extraction des images embarquées...")
    os.makedirs(output_dir, exist_ok=True)
    subprocess.run(["pdfimages", "-all", pdf, f"{output_dir}/image"], check=True)
    images = sorted(Path(output_dir).glob("image-*"))
    print(f"[+] {len(images)} image(s) extraite(s) :")
    for img in images:
        print(f"    - {img}")
    return [str(img) for img in images]

# ─────────────────────────────────────────────
# ÉTAPE 3 : URL cachée (identifiée manuellement)
# ─────────────────────────────────────────────
def find_hidden_url():
    print(f"\n[*] Étape 3 : URL cachée identifiée dans image-004.jpg : {HIDDEN_PATH}")
    return HIDDEN_PATH

# ─────────────────────────────────────────────
# ÉTAPE 4 : Authentification CTFd
# ─────────────────────────────────────────────
def login(session, base_url, user, password):
    print(f"\n[*] Étape 4 : Authentification sur {base_url}...")

    r = session.get(f"{base_url}/login")
    nonce = re.search(r'<input[^>]+name="nonce"[^>]+value="([a-f0-9]+)"', r.text)

    if not nonce:
        print("[!] Nonce CSRF introuvable.")
        sys.exit(1)

    nonce = nonce.group(1)
    print(f"[+] Nonce récupéré : {nonce}")

    r = session.post(f"{base_url}/login", data={
        "name": user,
        "password": password,
        "nonce": nonce
    }, allow_redirects=True)

    # CTFd redirige vers / en cas de succès
    if r.url == f"{base_url}/" or "challenges" in r.text.lower():
        print(f"[+] Authentification réussie !")
    else:
        print(f"[!] Échec de l'authentification.")
        print(f"[!] Vérifie tes identifiants.")
        sys.exit(1)

# ─────────────────────────────────────────────
# ÉTAPE 5 : Accès à la page cachée
# ─────────────────────────────────────────────
def fetch_page(session, base_url, path):
    full_url = f"{base_url}{path}"
    print(f"\n[*] Étape 5 : Requête sur {full_url}...")
    r = session.get(full_url)
    print(f"[+] Status HTTP : {r.status_code}")
    return r.text

# ─────────────────────────────────────────────
# ÉTAPE 6 : Extraction du flag
# ─────────────────────────────────────────────
def extract_flag(body):
    print("\n[*] Étape 6 : Extraction du flag...")
    match = re.search(r'EPI\{[^}]+\}', body)
    if match:
        return match.group(0)
    return None

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def main():
    print("================================================")
    print("  POC - ECORP Challenge 1 : Starting Point")
    print("================================================")

    if not os.path.exists(PDF):
        print(f"[!] PDF introuvable : '{PDF}'")
        sys.exit(1)

    # Demande des credentials au lancement
    print("\n[*] Identifiants CTFd requis :")
    user     = input("    Email/Username : ")
    password = getpass.getpass("    Password       : ")

    analyse_pdf(PDF)
    extract_images(PDF, OUTPUT_DIR)
    path = find_hidden_url()

    session = requests.Session()
    login(session, BASE_URL, user, password)

    body = fetch_page(session, BASE_URL, path)
    flag = extract_flag(body)

    if flag:
        print(f"\n{'=' * 48}")
        print(f"   FLAG : {flag}")
        print(f"{'=' * 48}")
    else:
        print("[!] Flag non trouvé dans la réponse.")

if __name__ == "__main__":
    main()