import io
import os
import pandas as pd
import numpy as np
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from app.schemas import (
    TransactionInput, 
    SinglePredictionResponse, 
    BatchPredictionResponse, 
    ModelMeta,
    TestSetEvaluationResponse
)
from app.model_loader import model_registry
from app.predictor import predict_single, predict_batch, FEATURE_COLS

app = FastAPI(
    title="Credit Card Fraud Detection API",
    description="FastAPI production backend tracking unauthorized and fraudulent credit card activity.",
    version="1.0.0"
)

# 🛠️ CORS MIDDLEWARE
origins = [
    "https://credit-card-fraud-detection-sable.vercel.app",  # Production live client
    "http://localhost:5173",                                 # Local Vite framework port
    "http://127.0.0.1:5173"                                  # Local IP loopback port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)



@app.get("/", response_model=ModelMeta, tags=["System"])
def get_status():
    """ Returns system metadata and lists which models are live in memory. """
    available = model_registry.list_available_models()
    status = "healthy" if available else "degraded (no models found)"
    return {
        "status": status,
        "available_models": available
    }

@app.post("/predict/single", response_model=SinglePredictionResponse, tags=["Inference"])
def predict_transaction(data: TransactionInput, model: str = "xgboost"):
    """
    Evaluates an individual manual credit card transaction profile for fraud.
    """
    if model not in model_registry.list_available_models():
        raise HTTPException(
            status_code=404, 
            detail=f"Model '{model}' not found. Choose from: {model_registry.list_available_models()}"
        )
    try:
        result = predict_single(data, model)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict/batch", response_model=BatchPredictionResponse, tags=["Inference"])
async def predict_csv_batch(
    file: UploadFile = File(...), 
    model: str = Form("xgboost")
):
    """
    Accepts an uploaded CSV data asset containing rows of transactions and analyzes them bulk-style.
    """
    if model not in model_registry.list_available_models():
        raise HTTPException(
            status_code=404, 
            detail=f"Model '{model}' not found. Choose from: {model_registry.list_available_models()}"
        )
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .csv file.")

    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        result = predict_batch(df, model)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 🌟 HIGH-SPEED PERFORMANCE OPTIMIZED ANALYTICS ENDPOINT
@app.post("/analytics/evaluate-test-set", response_model=TestSetEvaluationResponse, tags=["Analytics"])
async def evaluate_uploaded_test_set(
    file: UploadFile = File(...),
    model_name: str = Form("xgboost")
):
    """
    Accepts an uploaded test CSV file, parses columns conditionally using vectorized 
    numpy data streams, and computes accuracy metrics alongside a 2x2 confusion matrix.
    """
    if model_name not in model_registry.list_available_models():
        raise HTTPException(
            status_code=404, 
            detail=f"Model '{model_name}' not found. Choose from: {model_registry.list_available_models()}"
        )
    
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Invalid file type. Please upload a .csv file.")
    
    try:
        # Stream file contents directly from network memory block
        contents = await file.read()
        
        # Optimization 1: Drop file-read structural footprint by parsing only required feature slices
        required_load_cols = FEATURE_COLS + ["Class"]
        try:
            df_test = pd.read_csv(io.BytesIO(contents), usecols=required_load_cols)
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail="Uploaded file schema mismatch. Ensure all base V1-V28 inputs and ground-truth 'Class' columns exist."
            )
        
        if "Class" not in df_test.columns:
            raise HTTPException(
                status_code=400,
                detail="The uploaded test dataset must contain the true ground-truth labels column named 'Class'."
            )
            
        # Optimization 2: Vectorized type conversion avoiding iteration loops entirely
        y_true = df_test["Class"].to_numpy(dtype=int)
        X_test = df_test[FEATURE_COLS]
        
        # Extract straight to continuous C-ordered raw float32 array matrix for minimal execution latency
        X_test_mat = X_test.to_numpy(dtype='float32')
        X_test_mat = np.nan_to_num(X_test_mat, nan=0.0)
        
        # Fetch pipeline parameters
        model = model_registry.get_model(model_name)
        scaler = model_registry.get_scaler()
        
        if not model or not scaler:
            raise HTTPException(status_code=500, detail="Requested machine learning artifacts could not be read from system cache.")
            
        # Optimization 3: Scale and evaluate directly using numpy representation matrix structures
        X_test_scaled = scaler.transform(X_test_mat)
        y_pred = model.predict(X_test_scaled).astype(int)
        
        # Calculate dynamic analytics scores
        acc = accuracy_score(y_true, y_pred)
        prec = precision_score(y_true, y_pred, zero_division=0)
        rec = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        
        # Process and handle edge cases safely within the confusion matrix bounds
        cm = confusion_matrix(y_true, y_pred, labels=[0, 1])
        if cm.shape == (2, 2):
            tn, fp, fn, tp = cm.ravel().tolist()
        else:
            tn = int(cm[0][0]) if len(np.unique(y_true)) == 1 else 0
            fp, fn, tp = 0, 0, 0
        
        return {
            "model_evaluated": model_name,
            "total_test_samples": len(df_test),
            "metrics": {
                "accuracy": f"{acc * 100:.3f}%",
                "precision": f"{prec * 100:.2f}%",
                "recall": f"{rec * 100:.2f}%",
                "f1_score": f"{f1 * 100:.2f}%"
            },
            "confusion_matrix": {
                "true_negatives": tn,
                "false_positives": fp,
                "false_negatives": fn,
                "true_positives": tp
            }
        }
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dynamic analytics evaluation failed: {str(e)}")