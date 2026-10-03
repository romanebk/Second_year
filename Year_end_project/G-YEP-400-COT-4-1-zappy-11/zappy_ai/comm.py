#!/usr/bin/env python3
# comm.py - chiffrement léger des broadcasts (coordination d'équipe protégée).
#
# Tous nos messages de coordination sont chiffrés par un XOR avec une clé dérivée
# du NOM D'ÉQUIPE (secret partagé par tous nos clients), puis encodés en
# hexadécimal pour rester du texte ASCII transmissible par la commande Broadcast.
#
# Conséquences :
#   - une équipe ADVERSE, qui n'a pas la clé, ne lit que du charabia : elle ne
#     peut pas espionner notre stratégie (broadcasts "encoded / protected") ;
#   - réciproquement, on RECONNAÎT ses broadcasts (indéchiffrables) comme
#     "ennemis", ce qui permet de les contrer (cf. l'Eject du cerveau).
#
# Un marqueur d'intégrité (MAGIC) placé DANS le message chiffré garantit qu'un
# message ne se déchiffre proprement qu'avec la bonne clé : c'est notre test
# ami/ennemi fiable.

MAGIC = "ZP1:"


def _key(team: str) -> bytes:
    kb = (team or "zappy").encode("utf-8")
    return kb if kb else b"zappy"


def _xor(data: bytes, kb: bytes) -> bytes:
    return bytes(b ^ kb[i % len(kb)] for i, b in enumerate(data))


def encode(message: str, team: str) -> str:
    """Chiffre un message clair en un blob hexadécimal sûr pour Broadcast."""
    payload = (MAGIC + message).encode("utf-8")
    return _xor(payload, _key(team)).hex()


def decode(blob: str, team: str):
    """Déchiffre un blob reçu.

    Retourne le message clair s'il provient de NOTRE équipe (marqueur correct),
    sinon None (broadcast d'une autre équipe, ou simple bruit)."""
    try:
        data = bytes.fromhex(blob.strip())
    except (ValueError, AttributeError):
        return None
    clair = _xor(data, _key(team)).decode("utf-8", errors="replace")
    if clair.startswith(MAGIC):
        return clair[len(MAGIC):]
    return None
