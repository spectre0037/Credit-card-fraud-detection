import io
import os
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from app.schemas import (
    TransactionInput, 
    SinglePredictionResponse, 
    BatchPredictionResponse, 
    ModelMeta
)
from app.model_loader import model_registry
from app.predictor import predict_single, predict_batch

app = FastAPI(
    title="Credit Card Fraud Detection API",
    description="FastAPI production backend tracking unauthorized and fraudulent credit card activity with real-time test analytics.",
    version="1.0.0"
)

# 🛠️ CORS MIDDLEWARE: Standardized and appended production Vercel + local framework ports
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

@app.get("/", tags=["System"])
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

# 🌟 NEW ENDPOINT: Dynamically computes metrics and confusion matrix from test file
@app.get("/analytics/evaluate-test-set", tags=["Analytics"])
def evaluate_test_set(model_name: str = Query("xgboost")):
    """
    Loads the extracted test dataset dynamically from 'data/creditcard_test_true.csv', 
    runs batch inference using the specified model, and returns real-time metrics along with a confusion matrix.
    """
    test_file_path = "data/creditcard_test_true.csv"
    
    # 1. Verify that the test data file exists
    if not os.path.exists(test_file_path):
        raise HTTPException(
            status_code=404, 
            detail="Test dataset file missing. Please make sure 'data/creditcard_test_true.csv' exists inside the backend directory."
        )
    
    try:
        # 2. Read the testing data rows
        df_test = pd.read_csv(test_file_path)
        
        if "Class" not in df_test.columns:
            raise HTTPException(
                status_code=400,
                detail="The test dataset must contain the true labels column named 'Class'."
            )
            
        X_test = df_test.drop(columns=["Class"])
        y_true = df_test["Class"]
        
        # 3. Retrieve model and scaler from the registry
        model = model_registry.get_model(model_name)
        scaler = model_registry.get_scaler()
        
        if not model:
            raise HTTPException(
                status_code=400, 
                detail=f"Model '{model_name}' is not loaded. Choose from: {model_registry.list_available_models()}"
            )
        if not scaler:
            raise HTTPException(status_code=500, detail="Production scaler artifact missing from registry.")
            
        # 4. Scale inputs using the production scaler
        X_test_scaled = scaler.transform(X_test)
        
        # 5. Run Live Bulk Predictions
        y_pred = model.predict(X_test_scaled)
        
        # 6. Calculate True Dynamic Metrics
        acc = accuracy_score(y_true, y_pred)
        prec = precision_score(y_true, y_pred, zero_division=0)
        rec = recall_score(y_true, y_pred, zero_division=0)
        f1 = f1_score(y_true, y_pred, zero_division=0)
        
        # 7. Generate Confusion Matrix Array
        cm = confusion_matrix(y_true, y_pred)
        tn, fp, fn, tp = cm.ravel().tolist()
        
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
                "true_negatives": tn,   # Clean flagged Clean
                "false_positives": fp,  # Clean flagged Fraud (False Alarm)
                "false_negatives": fn,  # Fraud flagged Clean (Missed Danger)
                "true_positives": tp    # Fraud flagged Fraud (Caught)
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analytics assessment failed: {str(e)}")