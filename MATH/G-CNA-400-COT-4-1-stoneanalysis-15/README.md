# Stone Analysis

Analyse fréquentielle et stéganographie audio pour fichiers WAV 16-bit PCM mono.

## Description

Ce programme analyse des signaux audio WAV à l'aide de la Transformée de Fourier
Discrète (DFT). Il permet de :

- **Analyser** le spectre fréquentiel d'un fichier audio
- **Cacher** un message secret dans un fichier audio (stéganographie)
- **Extraire** un message caché depuis un fichier audio

## Compilation

```bash
make        # Compile le projet
make clean  # Supprime les fichiers objets
make fclean # Supprime les fichiers objets et le binaire
make re     # Recompile depuis zéro
```

## Utilisation

```
./stone_analysis --help

./stone_analysis --analyze IN_FILE N
    Affiche les N fréquences les plus puissantes du fichier audio

./stone_analysis --cypher IN_FILE OUT_FILE MESSAGE
    Cache MESSAGE dans IN_FILE et écrit le résultat dans OUT_FILE

./stone_analysis --decypher IN_FILE
    Extrait et affiche le message caché dans IN_FILE
```

## Exemples

```bash
# Analyse des 5 fréquences dominantes
./stone_analysis --analyze sample.wav 5

# Cacher un message
./stone_analysis --cypher input.wav output.wav "MESSAGE SECRET"

# Extraire un message
./stone_analysis --decypher output.wav
```

## Architecture

```
├── include/
│   ├── Complex.hpp        # Nombres complexes (partie réelle/imaginaire)
│   ├── WavFile.hpp        # Lecture/écriture de fichiers WAV
│   ├── DFT.hpp            # Transformée de Fourier
│   ├── Analyzer.hpp       # Analyse fréquentielle
│   ├── Steganography.hpp  # Stéganographie audio
│   └── StoneAnalysis.hpp  # Point d'entrée et CLI
├── src/
│   ├── Complex.cpp        # Opérations sur les complexes
│   ├── WavFile.cpp        # I/O WAV
│   ├── DFT.cpp            # DFT et IDFT
│   ├── Analyzer.cpp       # Top N fréquences
│   ├── Steganography.cpp  # Encodage/décodage des messages
│   ├── StoneAnalysis.cpp  # Parsing CLI et dispatch
│   └── main.cpp           # Point d'entrée
└── tests/
    ├── generate_wav.py    # Générateur de fichiers WAV de test
    └── run_tests.sh       # Suite de tests automatisée
```

## Algorithme de stéganographie

Le message est encodé en ajoutant des tonalités sinusoïdales à haute fréquence
(18.7 - 20.4 kHz) directement dans le domaine temporel. Chaque caractère est
mappé à une fréquence spécifique et ajouté à un chunk de 1024 échantillons.

Pour le décodage, une fenêtre de Hann est appliquée pour réduire les fuites
spectrales, puis la DFT est calculée pour identifier la fréquence la plus
énergétique dans la plage de fréquences attendue.

La longueur du message est stockée dans les 2 premiers chunks (encodage base-37).

## Format WAV supporté

- Format : PCM (Audio Format 1)
- Canaux : 1 (mono)
- Résolution : 16 bits
- Fréquence d'échantillonnage : 48000 Hz (ou autre)

## Licence

Projet pédagogique G-CNA-400.
