import os
import pandas as pd
import numpy as np
import joblib
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from xgboost import XGBClassifier
from lightgbm import LGBMClassifier

# Define paths
DATA_PATH = os.path.join(os.path.dirname(__file__), "../data/creditcard.csv")
MODEL_DIR = os.path.join(os.path.dirname(__file__), "models")
os.makedirs(MODEL_DIR, exist_ok=True)

def train_and_save_models():
    print("🚀 Loading dataset...")
    if not os.path.exists(DATA_PATH):
        raise FileNotFoundError(f"Dataset not found at {DATA_PATH}. Please run download_data.py first.")
        
    df = pd.read_csv(DATA_PATH)
    
    # Features and Target
    X = df.drop(columns=['Class'])
    y = df['Class']
    
    print(f"📊 Dataset shape: {df.shape} | Fraud cases: {y.sum()} ({y.mean()*100:.2f}%)")
    
    # Split data (Stratified due to intense class imbalance)
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    print("⚖️ Scaling features (Time and Amount)...")
    scaler = StandardScaler()
    # Fit scaler on training data and transform both sets
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Save the scaler artifact
    scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
    joblib.dump(scaler, scaler_path)
    print(f"✅ Scaler saved to {scaler_path}")
    
    # Dictionary of models to train
    models = {
        "logistic.pkl": LogisticRegression(max_iter=1000, random_state=42, class_weight='balanced'),
        "random_forest.pkl": RandomForestClassifier(n_estimators=100, random_state=42, max_depth=10, n_jobs=-1, class_weight='balanced'),
        "xgboost.pkl": XGBClassifier(n_estimators=100, max_depth=6, random_state=42, eval_metric='logloss', scale_pos_weight=500),
        "lightgbm.pkl": LGBMClassifier(n_estimators=100, random_state=42, class_weight='balanced', verbose=-1)
    }
    
    # Train and serialize each model
    for filename, model in models.items():
        print(f"🏋️ Training {filename.split('.')[0]}...")
        model.fit(X_train_scaled, y_train)
        
        # Save model
        model_path = os.path.join(MODEL_DIR, filename)
        joblib.dump(model, model_path)
        print(f"💾 Saved {filename}")
        
    print("\n🎉 All models trained and artifacts secured successfully!")

if __name__ == "__main__":
    train_and_save_models()