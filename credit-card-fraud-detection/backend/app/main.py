import io
import pandas as pd
from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware

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
    description="FastAPI production backend tracking unauthorized and fraudulent credit card activity.",
    version="1.0.0"
)

# 🛠️ UPDATED CORS MIDDLEWARE: Appended production Vercel origins
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

# FIXED ROUTE: Matches React fetch destination url perfectly
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

# FIXED ROUTE: Matches React batch file upload endpoint mapping perfectly
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
        # Read the file directly out of memory contents
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))
        
        result = predict_batch(df, model)
        return result
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))