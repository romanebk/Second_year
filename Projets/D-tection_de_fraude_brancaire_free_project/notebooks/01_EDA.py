import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import os

sns.set_theme(style="whitegrid")

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "../data/raw/creditcard.csv"))

def load_data():
    if not os.path.exists(DATA_PATH):
        print(f"Erreur : dataset introuvable à {DATA_PATH}")
        return None
    print("Chargement du dataset...")
    return pd.read_csv(DATA_PATH)

def basic_exploration(df):
    print("\n--- Informations générales ---")
    print(df.shape)
    print(df.dtypes)
    print("\n--- Valeurs manquantes ---")
    print(df.isnull().sum().sum(), "valeurs manquantes au total")
    print("\n--- Statistiques descriptives ---")
    print(df.describe())

def analyze_class_imbalance(df):
    counts = df['Class'].value_counts()
    print("\n--- Distribution des classes ---")
    print(counts)
    print(f"Taux de fraude : {counts[1]/len(df)*100:.3f}%")

    plt.figure(figsize=(6, 4))
    sns.countplot(x='Class', data=df, palette=['#3b82f6', '#ef4444'])
    plt.title('Distribution des classes (0 = Légitime, 1 = Fraude)')
    plt.savefig("reports/class_distribution.png", dpi=120, bbox_inches='tight')
    plt.show()

def explore_amount_time(df):
    fig, axes = plt.subplots(1, 2, figsize=(12, 4))

    axes[0].set_title("Distribution du montant des transactions")
    df[df['Class'] == 0]['Amount'].clip(upper=500).hist(bins=50, ax=axes[0], color='#3b82f6', alpha=0.6, label='Normal')
    df[df['Class'] == 1]['Amount'].clip(upper=500).hist(bins=50, ax=axes[0], color='#ef4444', alpha=0.7, label='Fraude')
    axes[0].legend()

    axes[1].set_title("Distribution temporelle")
    df[df['Class'] == 0]['Time'].hist(bins=50, ax=axes[1], color='#3b82f6', alpha=0.6, label='Normal')
    df[df['Class'] == 1]['Time'].hist(bins=50, ax=axes[1], color='#ef4444', alpha=0.7, label='Fraude')
    axes[1].legend()

    plt.tight_layout()
    plt.savefig("reports/amount_time_distribution.png", dpi=120, bbox_inches='tight')
    plt.show()

if __name__ == "__main__":
    os.makedirs("reports", exist_ok=True)
    df = load_data()
    if df is not None:
        basic_exploration(df)
        analyze_class_imbalance(df)
        explore_amount_time(df)
        print("\nVisualisations sauvegardées dans reports/")
