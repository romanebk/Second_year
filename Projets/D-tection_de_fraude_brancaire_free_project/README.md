# Détection de Fraude Bancaire par IA

Système de détection de transactions frauduleuses basé sur un modèle **Random Forest** entraîné sur le dataset [Credit Card Fraud Detection (Kaggle)](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud).

Projet EPITECH Free Project — Data Science & IA 2026.

---

## Stack technique

| Couche | Technologie |
|---|---|
| Machine Learning | Python, Scikit-learn, SMOTE |
| API Backend | FastAPI + Uvicorn |
| Interface Web | React 18 + Vite + Tailwind CSS |

---

## Prérequis

- Python 3.10+
- Node.js 18+
- Le fichier `creditcard.csv` (voir section Dataset)

---

## Installation

### 1. Cloner le projet

```bash
git clone <url-du-repo>
cd D-tection_de_fraude_brancaire_free_project
```

### 2. Créer l'environnement Python

```bash
python3 -m venv venv
source venv/bin/activate      # Linux / macOS
# ou : venv\Scripts\activate  # Windows
```

### 3. Installer les dépendances Python

```bash
pip install -r requirements.txt
```

### 4. Installer les dépendances Node.js

```bash
cd web
npm install
cd ..
```

---

## Dataset

Télécharger le fichier `creditcard.csv` sur [Kaggle](https://www.kaggle.com/datasets/mlg-ulb/creditcardfraud) et le placer dans :

```
data/raw/creditcard.csv
```

---

## Lancement

Le projet se lance en **3 étapes**, dans 3 terminaux séparés.

### Étape 1 — Entraîner le modèle (à faire une seule fois)

```bash
# Depuis la racine du projet, avec le venv activé
python3 src/models/train_model.py
```

Cette commande génère le fichier `models/best_fraud_model.pkl` utilisé par l'API.

> Durée estimée : 2 à 3 minutes.

### Étape 2 — Lancer l'API backend

```bash
# Terminal 1 — depuis la racine du projet, avec le venv activé
python3 api/main.py
```

L'API est accessible sur : **http://localhost:8000**

### Étape 3 — Lancer l'interface web

```bash
# Terminal 2 — depuis le dossier web/
cd web
npm run dev
```

L'application est accessible sur : **http://localhost:5173**

---

## Structure du projet

```
.
├── api/                    # Serveur FastAPI
│   └── main.py
├── data/
│   └── raw/
│       └── creditcard.csv  # Dataset (non versionné)
├── models/                 # Modèles entraînés (.pkl)
├── notebooks/              # Scripts d'analyse exploratoire (EDA)
├── src/
│   ├── data/               # Script de téléchargement des données
│   └── models/             # Script d'entraînement
├── web/                    # Frontend React
│   └── src/
│       └── App.jsx
├── requirements.txt        # Dépendances Python
└── README.md
```

---

## Résultats du modèle

| Modèle | Précision | Rappel | F1-Score | AUC-PR |
|---|---|---|---|---|
| Régression Logistique | 83% | 64% | 72% | 0.743 |
| **Random Forest + SMOTE** | **82%** | **82%** | **82%** | **0.870** |

> Le modèle Random Forest entraîné avec SMOTE est retenu comme modèle de production.