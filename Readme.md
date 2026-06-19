```markdown
# 💳 End-to-End Credit Card Fraud Detection System

A high-performance machine learning pipeline designed to predict, identify, and analyze fraudulent credit card transactions in real-time. This project features a completely decoupled microservice architecture, pairing a robust **XGBoost** classification model deployed over a **FastAPI backend** with an intuitive, interactive **Streamlit frontend analytics dashboard**.

---

## 🚀 Core Features

* **Real-Time Inference Interface:** Input specific individual transaction metrics to receive instant risk classifications along with precise mathematical probability metrics.
* **Bulk Ledger Batch Processing:** Drag and drop full financial files (`.csv`) to parse thousands of records asynchronously, display real-time batch metrics, and download flagged risk profiles.
* **Exploratory Data Analysis Hub:** Fully integrated interactive visualizations tracking correlation maps, transactional time densities, and transaction volume trends directly inside the interface.
* **Imbalance-Aware Engine:** Fine-tuned specifically to target and resolve severe class skew (Fraud accounts for just 0.17% of total records) without sacrificing performance on legitimate consumer logs.

---

## 📁 Repository Directory Structure

```text
Credit-card-fraud-detection/
├── credit-card-fraud-detection/
│   ├── backend/
│   │   ├── main.py                # FastAPI server entry point
│   │   ├── train_models.py        # ML training, evaluation, and serialization script
│   │   ├── requirements.txt       # Backend dependencies (FastAPI, uvicorn, xgboost, etc.)
│   │   └── models/
│   │       └── xgboost_model.pkl  # Saved production model weights
│   │
│   ├── frontend/
│   │   ├── app.py                 # Streamlit application main page
│   │   ├── requirements.txt       # Frontend dependencies (Streamlit, requests, seaborn)
│   │   └── pages/
│   │       ├── Batch_prediction.py # Bulk upload UI handler
│   │       └── Model_Insights.py   # Integrated EDA & metrics dashboards
│   │
│   └── Readme.md                  # System instruction handbook
└── README.md                      # Root project overview (This file)

```

---

## 🏗️ System Architecture

The application implements a decoupled backend/frontend system communicating via a secure REST API:

```
┌─────────────────────────────────┐               ┌─────────────────────────────────┐
│     Streamlit UI Frontend       │               │       FastAPI API Backend       │
│  • Single Manual Forms          │  ──(HTTP)───> │  • REST Inferences Handles      │
│  • Drag-and-Drop Batch Ingestion│               │  • Matrix Vectorization         │
│  • Seaborn Graphic Engines      │  <──(JSON)──  │  • Serialized XGBoost Model     │
└─────────────────────────────────┘               └─────────────────────────────────┘

```

1. **The Presentation Layer (Frontend):** Handles client-side browser logic, manages `.csv` file ingestion parsing, and compiles visual data charts.
2. **The Logic & Compute Layer (Backend):** Manages concurrent computational incoming matrices, handles feature feeding, and processes data frames directly through the loaded classification engine.

---

## 🧠 Machine Learning & Data Methodology

### The Extreme Imbalance Problem

The engine relies on historical, normalized transaction data containing **284,807 rows**. Out of these, only **492 records** are labeled as true fraud. This creates a severe class imbalance of **0.17% vs. 99.82%**. Standard metrics like "Accuracy" fail here, as a non-learning dummy model could achieve a 99.82% accuracy score by flagging every transaction as safe.

### Principal Component Analysis (PCA) Features

Columns labeled **`V1` through `V28**` represent transformed, compressed data matrices generated via Principal Component Analysis (PCA). The bank used this method to hide sensitive customer credentials (names, physical locations, card numbers) while preserving the underlying variances, shapes, and patterns necessary for pattern recognition models to differentiate true anomalies.

### Optimization Mechanics

To bypass class imbalance limitations, the system utilizes **XGBoost (Extreme Gradient Boosting)** optimized using:

* Asymmetric weight scaling parameters (`scale_pos_weight`) to penalize the objective function far more heavily when minority class items are missed.
* Evaluative optimization focused strictly on **PR-AUC (Precision-Recall Area Under Curve)** and **F1-Scores** rather than receiver operating characteristic scales.

---

## 🛠️ Local Installation & Environment Setup

Ensure you have Python 3.9+ and Git installed on your system.

First, clone this repository locally:

```bash
git clone [https://github.com/spectre0037/Credit-card-fraud-detection.git](https://github.com/spectre0037/Credit-card-fraud-detection.git)
cd Credit-card-fraud-detection

```

### 1. Run the FastAPI Backend

1. Open a terminal and navigate to the backend folder:
```bash
cd credit-card-fraud-detection/backend

```


2. Create a virtual environment and activate it:
```bash
python -m venv venv
# On Windows (CMD/PowerShell):
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

```


3. Install the required dependencies:
```bash
pip install -r requirements.txt

```


4. Start the backend development server using Uvicorn:
```bash
uvicorn main:app --reload --port 8000

```



The live documentation and test panel will be available at `http://127.0.0.1:8000/docs`.

### 2. Run the Streamlit Frontend

1. Open a separate terminal window and navigate to the frontend folder:
```bash
cd credit-card-fraud-detection/frontend

```


2. Create a virtual environment and activate it:
```bash
python -m venv venv
# On Windows (CMD/PowerShell):
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

```


3. Install the required UI and analysis packages:
```bash
pip install -r requirements.txt

```


4. Fire up the web application:
```bash
streamlit run app.py

```



Your browser should automatically launch the active app dashboard window at `http://localhost:8501`.

---

## 📊 Evaluation Metrics Followed

* **Recall (Sensitivity):** Assures the maximum number of true fraudulent events are intercepted.
* **Precision:** Minimizes false-positive alerts, ensuring legitimate account holders do not face unnecessary card rejections.
* **F1-Score:** The harmonic mean used to balance precision and recall boundaries effectively.

```

```