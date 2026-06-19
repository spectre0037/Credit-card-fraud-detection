import os
import joblib

MODEL_DIR = os.path.join(os.path.dirname(__file__), "../models")

class ModelLoader:
    def __init__(self):
        self.models = {}
        self.scaler = None
        self.load_artifacts()

    def load_artifacts(self):
        """Loads the scaler and all trained models from the storage directory."""
        scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")
        
        if not os.path.exists(scaler_path):
            print("⚠️ Model artifacts missing. Please run 'python backend/train_models.py' first.")
            return

        # Load standard scaler
        self.scaler = joblib.load(scaler_path)
        print("✅ Scaler loaded successfully.")

        # Expected model files based on your directory layout
        expected_models = {
            "xgboost": "xgboost.pkl",
            "random_forest": "random_forest.pkl",
            "lightgbm": "lightgbm.pkl",
            "logistic": "logistic.pkl"
        }

        for model_key, filename in expected_models.items():
            path = os.path.join(MODEL_DIR, filename)
            if os.path.exists(path):
                self.models[model_key] = joblib.load(path)
                print(f"✅ Model '{model_key}' loaded successfully.")
            else:
                print(f"❌ Could not find model file: {filename}")

    def get_model(self, model_name: str):
        return self.models.get(model_name.lower())

    def get_scaler(self):
        return self.scaler

    def list_available_models(self):
        return list(self.models.keys())

# Instantiate as a singleton to use across the app
model_registry = ModelLoader()