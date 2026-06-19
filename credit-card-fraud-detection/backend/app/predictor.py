import pandas as pd
import numpy as np
from app.model_loader import model_registry
from app.schemas import TransactionInput

# Ordered list of features matching how the model was trained
FEATURE_COLS = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']

def predict_single(data: TransactionInput, model_name: str):
    """
    Validates, scales, and scores a single transaction payload.
    """
    model = model_registry.get_model(model_name)
    scaler = model_registry.get_scaler()

    if not model or not scaler:
        raise ValueError(f"Model '{model_name}' or Scaler is not loaded/available.")

    # Convert incoming Pydantic object into a dictionary, then to DataFrame
    input_dict = data.model_dump()
    df = pd.DataFrame([input_dict])[FEATURE_COLS]
    
    # Scale features
    scaled_features = scaler.transform(df)
    
    # Run Inference
    prediction = int(model.predict(scaled_features)[0])
    
    # Try to extract probabilities if supported by the model
    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(scaled_features)[0][1])
    else:
        probability = 1.0 if prediction == 1 else 0.0

    return {
        "model_used": model_name,
        "is_fraud": bool(prediction == 1),
        "fraud_probability": round(probability, 4)
    }

def predict_batch(df: pd.DataFrame, model_name: str):
    """
    Validates, scales, and scores an incoming batch (Pandas DataFrame).
    """
    model = model_registry.get_model(model_name)
    scaler = model_registry.get_scaler()

    if not model or not scaler:
        raise ValueError(f"Model '{model_name}' or Scaler is not initialized.")

    # Ensure all required features exist in the uploaded file
    missing_cols = [col for col in FEATURE_COLS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Uploaded data is missing required columns: {missing_cols}")

    # Isolate and order features
    features_df = df[FEATURE_COLS]
    scaled_features = scaler.transform(features_df)
    
    # Batch Predict
    predictions = model.predict(scaled_features).astype(int).tolist()
    
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(scaled_features)[:, 1].astype(float).tolist()
    else:
        probabilities = [1.0 if p == 1 else 0.0 for p in predictions]

    return {
        "model_used": model_name,
        "predictions": predictions,
        "probabilities": [round(p, 4) for p in probabilities],
        "fraud_count": sum(predictions)
    }