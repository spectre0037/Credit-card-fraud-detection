from pydantic import BaseModel, Field
from typing import List, Dict

class TransactionInput(BaseModel):
    """
    Schema for a single credit card transaction inference request.
    Includes Time, V1-V28 PCA elements, and Amount.
    """
    Time: float = Field(..., description="Seconds elapsed since the first transaction")
    V1: float
    V2: float
    V3: float
    V4: float
    V5: float
    V6: float
    V7: float
    V8: float
    V9: float
    V10: float
    V11: float
    V12: float
    V13: float
    V14: float
    V15: float
    V16: float
    V17: float
    V18: float
    V19: float
    V20: float
    V21: float
    V22: float
    V23: float
    V24: float
    V25: float
    V26: float
    V27: float
    V28: float
    Amount: float = Field(..., description="Transaction transaction value", gt=0)

    class Config:
        json_schema_extra = {
            "example": {
                "Time": 0.0, "V1": -1.3598, "V2": -0.0727, "V3": 2.5363, "V4": 1.3781,
                "V5": -0.3383, "V6": 0.4623, "V7": 0.2396, "V8": 0.0987, "V9": 0.3637,
                "V10": 0.0907, "V11": -0.5516, "V12": -0.6178, "V13": -0.9913, "V14": -0.3111,
                "V15": 1.4681, "V16": -0.4704, "V17": 0.2079, "V18": 0.0257, "V19": 0.4039,
                "V20": 0.2514, "V21": -0.0183, "V22": 0.2778, "V23": -0.1104, "V24": 0.0669,
                "V25": 0.1285, "V26": -0.1891, "V27": 0.1335, "V28": -0.0211, "Amount": 149.62
            }
        }

class SinglePredictionResponse(BaseModel):
    model_used: str
    is_fraud: int # Changed to int (0 or 1) to match machine learning binary classifications perfectly
    fraud_probability: float
    status: str

# 🛠️ FIXED: Matches React frontend variables perfectly and eliminates the 0-results bug
class BatchPredictionResponse(BaseModel):
    model_used: str
    predictions: List[int]
    probabilities: List[float]
    total_processed: int # Added to map directly to frontend chart engines
    fraud_detected: int  # Fixed naming to match results.fraud_detected inside your UI page

class ModelMeta(BaseModel):
    status: str
    available_models: List[str]