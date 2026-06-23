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
    # 🛠️ REMOVED gt=0 constraint because actual data benchmarks contain valid 0.0 value baseline rows
    Amount: float = Field(..., description="Transaction transaction value")

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
    is_fraud: int  # 0 or 1 matching machine learning binary classifications
    fraud_probability: float
    status: str

class BatchPredictionResponse(BaseModel):
    model_used: str
    predictions: List[int]
    probabilities: List[float]
    total_processed: int  # Maps directly to frontend chart engines
    fraud_detected: int   # Matches results.fraud_detected inside your UI page

class ModelMeta(BaseModel):
    status: str
    available_models: List[str]

# 🌟 NEW VALIDATION SCHEMAS FOR LIVE METRICS & CONFUSION MATRIX

class AnalyticsMetrics(BaseModel):
    accuracy: str = Field(..., description="Calculated global classification accuracy percentage")
    precision: str = Field(..., description="Calculated true model precision rate percentage")
    recall: str = Field(..., description="Calculated true model recall catch percentage")
    f1_score: str = Field(..., description="Calculated balance harmonic mean score percentage")

class ConfusionMatrixData(BaseModel):
    true_negatives: int = Field(..., description="Clean transactions correctly classified as clean")
    false_positives: int = Field(..., description="Clean transactions incorrectly flagged as fraud")
    false_negatives: int = Field(..., description="Fraudulent actions missed by the model classifier")
    true_positives: int = Field(..., description="Fraudulent transactions successfully caught by the model")

class TestSetEvaluationResponse(BaseModel):
    """ Validation contract response for live out-of-sample test files evaluation """
    model_evaluated: str
    total_test_samples: int
    metrics: AnalyticsMetrics
    confusion_matrix: ConfusionMatrixData