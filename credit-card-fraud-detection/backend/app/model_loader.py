import os
import joblib

# Determine current directory anchors to handle cross-environment execution safely
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_DIR = os.path.join(CURRENT_DIR, "../models")
SECONDARY_MODEL_DIR = os.path.join(CURRENT_DIR, "models")  # Fallback for alternative docker/local directory bounds

class ModelLoader:
    def __init__(self):
        self.models = {}
        self.scaler = None
        self.active_dir = MODEL_DIR
        self.load_artifacts()

    def load_artifacts(self):
        """Loads the scaler and all trained models from the storage directory."""
        # Check primary directory, fall back to secondary directory if missing
        if not os.path.exists(self.active_dir) or not os.path.exists(os.path.join(self.active_dir, "scaler.pkl")):
            self.active_dir = SECONDARY_MODEL_DIR

        scaler_path = os.path.join(self.active_dir, "scaler.pkl")
        
        if not os.path.exists(scaler_path):
            print(f"⚠️ Model artifacts missing at '{scaler_path}'. Please run your training pipeline first.")
            return

        try:
            # Load standard scaler
            self.scaler = joblib.load(scaler_path)
            print(f"✅ Production Scaler loaded successfully from: {scaler_path}")
        except Exception as e:
            print(f"❌ Failed to load scaler artifact: {str(e)}")
            return

        # Expected model binaries matching your multi-engine architectural definitions
        expected_models = {
            "xgboost": "xgboost.pkl",
            "random_forest": "random_forest.pkl",
            "lightgbm": "lightgbm.pkl",
            "logistic": "logistic.pkl"
        }

        for model_key, filename in expected_models.items():
            path = os.path.join(self.active_dir, filename)
            if os.path.exists(path):
                try:
                    self.models[model_key] = joblib.load(path)
                    print(f"✅ Model '{model_key}' loaded successfully from cache.")
                except Exception as e:
                    print(f"❌ Critical error loading model matrix '{model_key}' from {filename}: {str(e)}")
            else:
                print(f"❌ Could not find model artifact file: {filename} in {self.active_dir}")

    def get_model(self, model_name: str):
        """ Returns the loaded machine learning model instance. """
        return self.models.get(model_name.lower())

    def get_scaler(self):
        """ Returns the initialized standard scaler instance for transformation pipelines. """
        return self.scaler

    def list_available_models(self):
        """ Lists string identifiers of models successfully pinned into active memory memory bounds. """
        return list(self.models.keys())

# Instantiate as a singleton to use across the app routing environments
model_registry = ModelLoader()