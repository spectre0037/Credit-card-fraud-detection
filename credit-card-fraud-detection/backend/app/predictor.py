import pandas as pd
import numpy as np
from app.model_loader import model_registry
from app.schemas import TransactionInput

# Explicitly ordered feature arrays matching model training parameters
FEATURE_COLS = ['Time'] + [f'V{i}' for i in range(1, 29)] + ['Amount']

def predict_single(data: TransactionInput, model_name: str) -> dict:
    """
    Validates, scales, and scores an individual transaction payload.
    """
    model = model_registry.get_model(model_name)
    scaler = model_registry.get_scaler()

    if not model or not scaler:
        raise ValueError(f"Model '{model_name}' or Scaler artifact is not loaded in memory.")

    # Convert incoming verified Pydantic object into an ordered dataframe row
    input_dict = data.model_dump()
    df = pd.DataFrame([input_dict])[FEATURE_COLS]
    
    # Scale inputs through production standard scaler parameters
    scaled_features = scaler.transform(df)
    
    # Run structural binary inference calculation
    prediction = int(model.predict(scaled_features)[0])
    
    # Extract confidence metric matrix probability distributions securely
    if hasattr(model, "predict_proba"):
        probability = float(model.predict_proba(scaled_features)[0][1])
    else:
        probability = 1.0 if prediction == 1 else 0.0

    return {
        "model_used": model_name,
        "is_fraud": prediction, 
        "fraud_probability": round(probability, 4),
        "status": "Fraudulent Anomaly Detected" if prediction == 1 else "Legitimate Transaction Verified"
    }

def predict_batch(df: pd.DataFrame, model_name: str) -> dict:
    """
    Validates, scales, and scores an uploaded batch transaction matrix.
    """
    model = model_registry.get_model(model_name)
    scaler = model_registry.get_scaler()

    if not model or not scaler:
        raise ValueError(f"Model '{model_name}' or Scaler artifact is not loaded in memory.")

    # Structural feature verification mapping checks
    missing_cols = [col for col in FEATURE_COLS if col not in df.columns]
    if missing_cols:
        raise ValueError(f"Uploaded CSV payload schema layout mismatch. Missing dimensions: {missing_cols}")

    # Enforce strict column order and transform data structure type alignments
    features_df = df[FEATURE_COLS].copy()
    
    try:
        # Convert columns to numerical representations to prevent string type parsing exceptions
        for col in FEATURE_COLS:
            features_df[col] = pd.to_numeric(features_df[col])
    except Exception:
        raise ValueError("Data normalization failure. The uploaded file contains invalid non-numeric values inside structural input blocks.")

    # Apply scaling transformation across batch elements
    scaled_features = scaler.transform(features_df)
    
    # Execute batch predictions
    predictions = model.predict(scaled_features).astype(int).tolist()
    
    # Calculate confidence scoring distributions
    if hasattr(model, "predict_proba"):
        probabilities = model.predict_proba(scaled_features)[:, 1].astype(float).tolist()
    else:
        probabilities = [1.0 if p == 1 else 0.0 for p in predictions]

    return {
        "model_used": model_name,
        "predictions": predictions,
        "probabilities": [round(p, 4) for p in probabilities],
        "total_processed": int(len(predictions)),
        "fraud_detected": int(sum(predictions))
    }