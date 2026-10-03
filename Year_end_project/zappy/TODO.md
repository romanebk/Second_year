# TODO — Configurations et tests

## Tests

- [ ] Test manuel avec telnet / netcat :
  ```
  telnet 127.0.0.1 4242
  WELCOME
  GRAPHIC
  msz
  mct
  tna
  ```
- [ ] Test avec le GUI existant (branche `Graphical/Render_Map`)
- [ ] Valider le protocole AI complet (envoi/réception de chaque commande)
- [ ] Valider le protocole GUI complet (toutes les requêtes + push)
- [ ] Valgrind (fuites mémoire)
- [ ] Test de montée en charge (plusieurs clients AI simultanés)
- [ ] Vérifier le comportement de la faim (délai 126/f avant mort)

## Propreté

- [ ] Supprimer le fichier `zappy_server` du suivi git (déjà dans .gitignore)
- [ ] Nettoyer les fichiers `.o` résiduels
