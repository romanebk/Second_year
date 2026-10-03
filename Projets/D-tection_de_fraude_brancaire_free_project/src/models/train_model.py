import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix, precision_recall_curve, auc
from imblearn.over_sampling import SMOTE
import joblib
import os

# Configuration des chemins
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "../../data/raw/creditcard.csv"))
MODEL_DIR = os.path.abspath(os.path.join(SCRIPT_DIR, "../../models/"))
os.makedirs(MODEL_DIR, exist_ok=True)

def preprocess_data(df):
    print("Pré-traitement des données...")
    scaler = StandardScaler()
    df = df.copy()
    df['std_amount'] = scaler.fit_transform(df['Amount'].values.reshape(-1, 1))
    df['std_time'] = scaler.fit_transform(df['Time'].values.reshape(-1, 1))
    df.drop(['Time', 'Amount'], axis=1, inplace=True)

    X = df.drop('Class', axis=1)
    y = df['Class']
    return train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)

def train_baseline(X_train, y_train):
    print("Entraînement de la Régression Logistique (modèle de base)...")
    lr = LogisticRegression(max_iter=1000)
    lr.fit(X_train, y_train)
    return lr

def train_with_smote(X_train, y_train):
    print("Application de SMOTE pour gérer le déséquilibre des classes...")
    sm = SMOTE(random_state=42)
    X_res, y_res = sm.fit_resample(X_train, y_train)
    print(f"  Après SMOTE — Normal: {sum(y_res==0)}, Fraude: {sum(y_res==1)}")

    print("Entraînement du Random Forest (cela peut prendre 2-3 min)...")
    rf = RandomForestClassifier(n_estimators=100, n_jobs=-1, random_state=42)
    rf.fit(X_res, y_res)
    return rf

def evaluate_model(model, X_test, y_test, name):
    print(f"\n{'='*50}")
    print(f"Évaluation : {name}")
    print('='*50)
    y_pred = model.predict(X_test)
    print(classification_report(y_test, y_pred))
    print("Matrice de confusion :")
    print(confusion_matrix(y_test, y_pred))
    y_score = model.predict_proba(X_test)[:, 1]
    precision, recall, _ = precision_recall_curve(y_test, y_score)
    auc_pr = auc(recall, precision)
    print(f"AUC-PR : {auc_pr:.4f}")

if __name__ == "__main__":
    if not os.path.exists(DATA_PATH):
        print(f"Erreur : dataset introuvable à {DATA_PATH}")
        print("Placez creditcard.csv dans le dossier data/raw/")
    else:
        df = pd.read_csv(DATA_PATH)
        X_train, X_test, y_train, y_test = preprocess_data(df)

        lr_model = train_baseline(X_train, y_train)
        evaluate_model(lr_model, X_test, y_test, "Régression Logistique (Simple)")

        rf_model = train_with_smote(X_train, y_train)
        evaluate_model(rf_model, X_test, y_test, "Random Forest + SMOTE")

        print("\nSauvegarde des modèles...")
        joblib.dump(rf_model, os.path.join(MODEL_DIR, "best_fraud_model.pkl"))
        print("Modèle sauvegardé dans models/best_fraud_model.pkl")
