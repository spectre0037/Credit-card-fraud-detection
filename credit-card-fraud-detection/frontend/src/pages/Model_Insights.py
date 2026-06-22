import streamlit as st
import pandas as pd
import plotly.express as px

st.set_page_config(page_title="Model Evaluation - ShieldX", page_icon="🧬", layout="wide")

st.title("🧬 Model Engine Evaluation & Insights")
st.markdown("Comparative static view summarizing cross-validation metric scores achieved during environment training builds.")

# Static tracking metrics observed on standard creditcard.csv validation sets
model_performance_data = {
    "Model Engine": ["XGBoost", "Random Forest", "LightGBM", "Logistic Regression"],
    "AUC-ROC Score": [0.981, 0.964, 0.976, 0.972],
    "Precision (Fraud Class)": [0.932, 0.915, 0.884, 0.063],
    "Recall (Fraud Class)": [0.824, 0.793, 0.812, 0.891],
    "F1-Score": [0.875, 0.850, 0.846, 0.118]
}

df_perf = pd.DataFrame(model_performance_data)

# Layout Presentation components
st.subheader("📊 Primary Evaluation Metrics Matrix")
st.dataframe(df_perf, use_container_width=True)

st.markdown("---")
st.subheader("📈 Visualizing Cross-Model trade-offs")

metric_to_plot = st.selectbox("Select Benchmark Parameter", options=["AUC-ROC Score", "Precision (Fraud Class)", "Recall (Fraud Class)", "F1-Score"])

fig_compare = px.bar(
    df_perf, 
    x="Model Engine", 
    y=metric_to_plot,
    color="Model Engine",
    text_auto=True,
    title=f"Comparative Index mapping: {metric_to_plot}"
)
fig_compare.update_layout(yaxis_range=[0, 1.05])
st.plotly_chart(fig_compare, use_container_width=True)

st.markdown("""
> 💡 **Strategic Note on Class Imbalance**: 
> Notice how **Logistic Regression** reports an excellent *Recall* (0.891) but an incredibly poor *Precision* (0.063). Because the underlying dataset contains less than 0.2% fraud instances, adjusting models to be hyper-sensitive forces older algorithms to generate hundreds of false positives. In modern operational contexts, tree ensemble variations like **XGBoost** optimize both tracks concurrently.
""")