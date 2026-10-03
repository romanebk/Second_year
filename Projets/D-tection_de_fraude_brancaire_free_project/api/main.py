from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import joblib
import pandas as pd
import os

app = FastAPI(title="Fraud Detection API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "../models/best_fraud_model.pkl")

try:
    model = joblib.load(MODEL_PATH)
    print("Modèle chargé avec succès.")
except Exception as e:
    print(f"Erreur chargement modèle : {e}")
    model = None

class Transaction(BaseModel):
    features: list  # Liste des features dans l'ordre attendu par le modèle

@app.get("/")
def health():
    return {"status": "online", "model_loaded": model is not None}

@app.post("/predict")
def predict(transaction: Transaction):
    if model is None:
        raise HTTPException(status_code=500, detail="Modèle non chargé.")
    try:
        feature_names = model.feature_names_in_ if hasattr(model, 'feature_names_in_') else None
        if feature_names is not None:
            df = pd.DataFrame([transaction.features], columns=feature_names)
        else:
            df = pd.DataFrame([transaction.features])

        prediction = int(model.predict(df)[0])
        probability = float(model.predict_proba(df)[0][1])

        return {
            "prediction": prediction,
            "probability": probability,
            "is_fraud": prediction == 1,
            "risk_level": "HIGH" if probability > 0.7 else "MEDIUM" if probability > 0.3 else "LOW"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, reload=True)
