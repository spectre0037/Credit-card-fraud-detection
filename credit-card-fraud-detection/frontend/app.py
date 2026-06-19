import streamlit as st
import requests

# App configurations
st.set_page_config(
    page_title="ShieldX - Fraud Detection Portal",
    page_icon="🛡️",
    layout="wide"
)

BACKEND_URL = "http://127.0.0.1:8000"

st.title("🛡️ ShieldX: Credit Card Fraud Detection Center")
st.markdown("---")

# Verify backend health status
try:
    response = requests.get(f"{BACKEND_URL}/")
    if response.status_code == 200:
        system_meta = response.json()
        available_models = system_meta.get("available_models", [])
        st.sidebar.success("● Core Engine: Connected")
    else:
        available_models = ["xgboost", "random_forest", "lightgbm", "logistic"]
        st.sidebar.warning("⚠️ Engine degraded response.")
except requests.exceptions.ConnectionError:
    st.error("🚨 Cannot connect to FastAPI backend! Please ensure your backend server is running on port 8000.")
    st.stop()

# Sidebar Configuration
st.sidebar.header("🕹️ Control Panel")
selected_model = st.sidebar.selectbox(
    "Select ML Model Engine", 
    options=[m.upper() for m in available_models]
).lower()

# Save selected model into session state so page routing modules can access it
st.session_state["selected_model"] = selected_model

st.sidebar.markdown("""
### Documentation
This portal acts as a pipeline to evaluate real-time credit card charges against specialized machine learning models trained on structural transaction anomalies.
""")

# Main Content Layout split into columns
col1, col2 = st.columns([2, 1])

with col1:
    st.subheader("📝 Manual Transaction Evaluation")
    st.caption("Input the specific metrics of a pending charge below to parse safety scoring indices.")
    
    with st.form("single_transaction_form"):
        # Key obvious features
        f_time = st.number_input("Time (Seconds elapsed from baseline)", min_value=0.0, value=0.0, step=1.0)
        f_amount = st.number_input("Transaction Amount ($)", min_value=0.01, value=100.00, step=5.0)
        
        st.markdown("**Anonymized Metric Subcomponents (V1-V28 PCA Features)**")
        # Split features into 4 neat nested form rows
        v_cols_1 = st.columns(7)
        v_cols_2 = st.columns(7)
        v_cols_3 = st.columns(7)
        v_cols_4 = st.columns(7)
        
        v_inputs = {}
        
        for i in range(1, 8):
            v_inputs[f"V{i}"] = v_cols_1[i-1].number_input(f"V{i}", value=0.0, step=0.1)
        for i in range(8, 15):
            v_inputs[f"V{i}"] = v_cols_2[i-8].number_input(f"V{i}", value=0.0, step=0.1)
        for i in range(15, 22):
            v_inputs[f"V{i}"] = v_cols_3[i-15].number_input(f"V{i}", value=0.0, step=0.1)
        for i in range(22, 29):
            v_inputs[f"V{i}"] = v_cols_4[i-22].number_input(f"V{i}", value=0.0, step=0.1)
            
        submit_button = st.form_submit_button(label="🛡️ Analyze Transaction Risk")

with col2:
    st.subheader("🔮 Security Analysis Feed")
    st.caption("Live monitoring inference logs appear here.")
    
    if submit_button:
        # Build payload mapping schema
        payload = {
            "Time": f_time,
            "Amount": f_amount,
            **v_inputs
        }
        
        with st.spinner("Analyzing transaction profiles..."):
            try:
                api_res = requests.post(
                    f"{BACKEND_URL}/predict", 
                    json=payload, 
                    params={"model": selected_model}
                )
                
                if api_res.status_code == 200:
                    result = api_res.json()
                    is_fraud = result["is_fraud"]
                    prob = result["fraud_probability"]
                    
                    if is_fraud:
                        st.error(f"🚨 HIGH RISK DETECTED\n\nThis transaction exhibits significant high-probability fraudulent behavior configurations.")
                        st.metric(label="Fraud Probability Score", value=f"{prob * 100:.2f}%", delta="CRITICAL RISK", delta_color="inverse")
                    else:
                        st.success(f"✅ TRANSACTION SECURE\n\nNo extreme risk vectors flag this transaction profile.")
                        st.metric(label="Fraud Probability Score", value=f"{prob * 100:.2f}%", delta="SAFE TRANSACTION")
                        
                    st.json(result)
                else:
                    st.error(f"Backend API Error: {api_res.text}")
                    
            except Exception as error:
                st.error(f"Could not connect to service endpoint: {error}")
    else:
        st.info("💡 Adjust values on the form layout and click **Analyze Transaction Risk** to evaluate real-time scoring data components.")