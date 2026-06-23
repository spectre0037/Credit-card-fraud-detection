import React, { useState, useEffect } from 'react';
import { Award, Zap, TrendingUp, Info, ShieldCheck, AlertOctagon, HelpCircle, RefreshCw } from 'lucide-react';
import axios from 'axios';

export default function MetricsInsights() {
  const [selectedModel, setSelectedModel] = useState('xgboost');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Available models matching your backend loader keys perfectly
  const modelRegistryList = [
    { id: 'xgboost', name: 'XGBoost Assembly', desc: 'Sequential boosting tree optimization' },
    { id: 'lightgbm', name: 'LightGBM Tree', desc: 'Vertical leaf-wise high speed execution' },
    { id: 'random_forest', name: 'Random Forest Ensemble', desc: 'Parallel bagging decision structure' },
    { id: 'logistic', name: 'Logistic Regression', desc: 'Standard mathematical probability baseline' }
  ];

  // Dynamic fetch execution from backend router
  const fetchDynamicMetrics = async (modelId) => {
    setLoading(true);
    setError(null);
    try {
      // Points directly to our new FastAPI analytical route endpoint
      const response = await axios.get(`https://credit-card-fraud-detection-4pck.onrender.com/analytics/evaluate-test-set?model_name=${modelId}`);
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.detail || 
        "Failed to hit the verification stream. Please verify your FastAPI server is online and 'data/creditcard_test_true.csv' exists."
      );
    } finally {
      setLoading(false);
    }
  };

  // Run initial call and trigger reload on tab changes
  useEffect(() => {
    fetchDynamicMetrics(selectedModel);
  }, [selectedModel]);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      
      {/* HEADER CONTROLS SECTION */}
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/60 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" /> Live Out-Of-Sample Validation
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Dynamic metrics calculated in real-time against your extracted hidden test validation split data asset.
          </p>
        </div>

        {/* ALGORITHM SWITCH BUTTONS */}
        <div className="flex flex-wrap bg-slate-950/60 p-1.5 rounded-xl border border-slate-800">
          {modelRegistryList.map((m) => (
            <button
              key={m.id}
              onClick={() => setSelectedModel(m.id)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-lg transition-all ${
                selectedModel === m.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {m.id.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* ERROR HANDLER NOTIFICATION BOX */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-start gap-2">
          <AlertOctagon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold block">Execution Boundary Blocked:</span>
            <span className="opacity-80">{error}</span>
          </div>
        </div>
      )}

      {/* LOADING RUNTIME SPLASH STATE */}
      {loading ? (
        <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-xs font-mono text-slate-400">
            Streaming model layer parameters across 56,962 validation vectors...
          </p>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* CORE STATISTICAL METRICS SUMMARY (5 COLS GRID SPAN) */}
          <div className="lg:col-span-5 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Computed Validation Metrics</h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MetricBlock label="Global Accuracy" value={data.metrics.accuracy} sub="Total matched bounds" color="text-white" />
              <MetricBlock label="Precision Score" value={data.metrics.precision} sub="False positive filter" color="text-emerald-400" />
              <MetricBlock label="Recall / Catch Rate" value={data.metrics.recall} sub="True positive tracking" color="text-amber-400" />
              <MetricBlock label="Balanced F1-Score" value={data.metrics.f1_score} sub="Harmonic precision mean" color="text-blue-400" />
            </div>

            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl text-xs text-slate-400 space-y-1">
              <div className="flex justify-between"><span>Evaluated Engine:</span><span className="font-mono text-white uppercase font-black">{data.model_evaluated}</span></div>
              <div className="flex justify-between"><span>Validation Row Constraints:</span><span className="font-mono text-white">{data.total_test_samples.toLocaleString()} items</span></div>
            </div>
          </div>

          {/* DYNAMIC CONFUSION MATRIX DASHBOARD VIEW (7 COLS GRID SPAN) */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Dynamic Confusion Matrix</h4>
            
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
              
              {/* MATRIX HEADER LABELS */}
              <div className="grid grid-cols-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div>Predicted Legitimate (0)</div>
                <div>Predicted Fraud (1)</div>
              </div>

              {/* $2\times2$ GRID CELLS CONFIGURATION */}
              <div className="grid grid-cols-2 gap-3">
                
                {/* 1. TRUE NEGATIVES */}
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-center flex flex-col justify-center min-h-[95px]">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">True Negatives (TN)</span>
                  <span className="text-xl font-mono font-black text-slate-200 mt-1">{data.confusion_matrix.true_negatives.toLocaleString()}</span>
                  <span className="text-[9px] text-emerald-500 font-bold mt-1 flex items-center justify-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Safe Clearances
                  </span>
                </div>

                {/* 2. FALSE POSITIVES */}
                <div className="bg-amber-950/10 border border-amber-900/20 p-4 rounded-xl text-center flex flex-col justify-center min-h-[95px]">
                  <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-wider">False Positives (FP)</span>
                  <span className="text-xl font-mono font-black text-amber-400 mt-1">{data.confusion_matrix.false_positives.toLocaleString()}</span>
                  <span className="text-[9px] text-amber-500/50 font-medium mt-1">False Alarms Triggered</span>
                </div>

                {/* 3. FALSE NEGATIVES */}
                <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl text-center flex flex-col justify-center min-h-[95px]">
                  <span className="text-[9px] font-black text-red-500/80 uppercase tracking-wider">False Negatives (FN)</span>
                  <span className="text-xl font-mono font-black text-red-500 mt-1">{data.confusion_matrix.false_negatives.toLocaleString()}</span>
                  <span className="text-[9px] text-red-400/50 font-medium mt-1 flex items-center justify-center gap-1">
                    <AlertOctagon className="h-3 w-3" /> Breaches Missed
                  </span>
                </div>

                {/* 4. TRUE POSITIVES */}
                <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl text-center flex flex-col justify-center min-h-[95px]">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider">True Positives (TP)</span>
                  <span className="text-xl font-mono font-black text-blue-400 mt-1">{data.confusion_matrix.true_positives.toLocaleString()}</span>
                  <span className="text-[9px] text-blue-400/80 font-bold mt-1">Attacks Intercepted</span>
                </div>

              </div>

              {/* INTERACTIVE WARNING LEGEND CARD */}
              <div className="text-[11px] text-slate-500 flex items-start gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-850">
                <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Imbalance Analysis:</strong> Notice the wide margin variance between safe classifications (TN) and anomalies (TP). Because fraud accounts for less than 1% of total entries, tracking precision alongside catch counts provides a more comprehensive assessment than looking at global accuracy alone.
                </span>
              </div>

            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-xs text-slate-500">
          Select an engine configuration block to stream evaluation analytics.
        </div>
      )}
    </div>
  );
}

// Sub-Widget Component for Individual Scorecards
function MetricBlock({ label, value, sub, color }) {
  return (
    <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col justify-between min-h-[95px] hover:border-slate-700 transition-all">
      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">{label}</span>
      <span className={`text-2xl font-mono font-black mt-1 ${color}`}>{value}</span>
      <span className="text-[9px] text-slate-500 font-medium mt-1 block border-t border-slate-850/60 pt-1">{sub}</span>
    </div>
  );
}