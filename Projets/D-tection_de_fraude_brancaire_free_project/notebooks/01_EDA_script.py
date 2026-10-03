import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import os

# Set style for plots
sns.set_theme(style="whitegrid")

# Get the directory where the script is located
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
# Data path relative to the script
DATA_PATH = os.path.abspath(os.path.join(SCRIPT_DIR, "..", "data", "raw", "creditcard.csv"))

def load_data():
    if not os.path.exists(DATA_PATH):
        print(f"Error: Dataset not found at {DATA_PATH}.")
        print("Please run src/data/download_data.py first.")
        return None
    
    print("Loading dataset...")
    df = pd.read_csv(DATA_PATH)
    return df

def basic_exploration(df):
    print("--- Basic Information ---")
    print(df.info())
    
    print("\n--- First 5 rows ---")
    print(df.head())
    
    print("\n--- Summary Statistics ---")
    print(df.describe())
    
    print("\n--- Missing Values ---")
    print(df.isnull().sum().max())

def analyze_class_imbalance(df):
    print("\n--- Class Distribution ---")
    class_counts = df['Class'].value_counts()
    print(class_counts)
    print(f"Fraudulent transactions: {round(class_counts[1]/len(df) * 100, 3)}%")
    
    plt.figure(figsize=(6, 4))
    sns.countplot(x='Class', data=df)
    plt.title('Class Distribution (0: No Fraud, 1: Fraud)')
    plt.show()

def explore_time_amount(df):
    plt.figure(figsize=(12, 5))
    
    plt.subplot(1, 2, 1)
    sns.histplot(df[df['Class'] == 0]['Amount'], bins=50, color='blue', alpha=0.5, label='Normal')
    sns.histplot(df[df['Class'] == 1]['Amount'], bins=50, color='red', alpha=0.5, label='Fraud')
    plt.title('Transaction Amount Distribution')
    plt.xlim(0, 2000) # Zoom in for better visibility
    plt.legend()
    
    plt.subplot(1, 2, 2)
    sns.histplot(df[df['Class'] == 0]['Time'], bins=50, color='blue', alpha=0.5, label='Normal')
    sns.histplot(df[df['Class'] == 1]['Time'], bins=50, color='red', alpha=0.5, label='Fraud')
    plt.title('Transaction Time Distribution')
    plt.legend()
    
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    df = load_data()
    if df is not None:
        basic_exploration(df)
        analyze_class_imbalance(df)
        explore_time_amount(df)
