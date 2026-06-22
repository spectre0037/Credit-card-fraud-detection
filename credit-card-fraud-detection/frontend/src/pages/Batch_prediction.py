import streamlit as st
import pandas as pd
import requests
import plotly.express as px
import io

st.set_page_config(page_title="Batch Engine - ShieldX", page_icon="📊", layout="wide")
BACKEND_URL = "http://127.0.0.1:8000"

st.title("📊 Bulk Batch Prediction Dashboard")
st.markdown("Upload structural credit card ledger profiles to run bulk parallel model scoring queries.")

# Access model config dynamically from parent layout context
# Pull securely from Streamlit global session state with a fallback default
selected_model = st.session_state.get("selected_model", "xgboost").lower()

uploaded_file = st.file_uploader("Upload Transaction Records (CSV Format Only)", type=["csv"])

if uploaded_file is not None:
    # Preview data to the user
    df_preview = pd.read_csv(uploaded_file)
    st.subheader("📋 Raw Upload Preview")
    st.dataframe(df_preview.head(5), use_container_width=True)
    
    # Send file to backend
    if st.button("🚀 Execute Fleet Analytics Pipeline"):
        # Reset pointer position to read bytes sequentially
        uploaded_file.seek(0)
        
        files = {"file": (uploaded_file.name, uploaded_file.getvalue(), "text/csv")}
        payload = {"model": selected_model}
        
        with st.spinner("Processing batch arrays through the machine learning registry..."):
            try:
                res = requests.post(f"{BACKEND_URL}/predict-batch", files=files, data=payload)
                
                if res.status_code == 200:
                    metrics = res.json()
                    
                    # Merge outputs back onto structural view arrays
                    df_preview["Fraud_Prediction"] = metrics["predictions"]
                    df_preview["Fraud_Probability"] = metrics["probabilities"]
                    
                    st.success("🎉 Batch execution run finished successfully!")
                    
                    # Highlight Metrics
                    m_col1, m_col2, m_col3 = st.columns(3)
                    m_col1.metric("Total Records Swept", len(df_preview))
                    m_col2.metric("Anomalous Incidents Flagged", metrics["fraud_count"])
                    m_col3.metric("Overall Safety Ratio", f"{((len(df_preview)-metrics['fraud_count'])/len(df_preview))*100:.2f}%")
                    
                    # Visualization Matrix Split
                    v_col1, v_col2 = st.columns(2)
                    
                    with v_col1:
                        st.subheader("⚠️ Class Balance Metrics")
                        fig_pie = px.pie(
                            names=["Authorized", "Flagged Fraud"],
                            values=[len(df_preview) - metrics["fraud_count"], metrics["fraud_count"]],
                            color_discrete_sequence=["#2ecc71", "#e74c3c"],
                            hole=0.4
                        )
                        st.plotly_chart(fig_pie, use_container_width=True)
                        
                    with v_col2:
                        st.subheader("📈 Risk Density Profile")
                        fig_hist = px.histogram(
                            df_preview, 
                            x="Fraud_Probability", 
                            color="Fraud_Prediction",
                            color_discrete_map={0: "#2ecc71", 1: "#e74c3c"},
                            labels={"Fraud_Probability": "Computed Suspicion Probability"},
                            title="Distribution of Transaction Risk Confidences"
                        )
                        st.plotly_chart(fig_hist, use_container_width=True)
                        
                    st.subheader("📂 Comprehensive Scoring Ledger")
                    st.dataframe(df_preview, use_container_width=True)
                    
                else:
                    st.error(f"Execution Error context returned: {res.json().get('detail')}")
            except Exception as ex:
                st.error(f"Failed to bridge secure communications pipe to proxy engine: {ex}")