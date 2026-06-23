import React, { useState, useEffect } from 'react';
import { TrendingUp, AlertOctagon, ShieldCheck, HelpCircle, RefreshCw, UploadCloud, FileSpreadsheet } from 'lucide-react';
import axios from 'axios';

export default function MetricsInsights() {
  const [selectedModel, setSelectedModel] = useState('xgboost');
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const modelRegistryList = [
    { id: 'xgboost', name: 'XGBoost Assembly' },
    { id: 'lightgbm', name: 'LightGBM Tree' },
    { id: 'random_forest', name: 'Random Forest Ensemble' },
    { id: 'logistic', name: 'Logistic Regression' }
  ];

  // Handle file drop/selection
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  // Run calculation dynamically by pushing the uploaded file to the server
  const runDynamicEvaluation = async (modelId = selectedModel, targetFile = file) => {
    if (!targetFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', targetFile);
    formData.append('model_name', modelId);

    try {
      // 🛠️ Switched to POST to safely stream your uploaded file content to Render
      const response = await axios.post(
        `https://credit-card-fraud-detection-4pck.onrender.com/analytics/evaluate-test-set`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setData(response.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Calculation stream broken. Please verify the CSV layout format matches.");
    } finally {
      setLoading(false);
    }
  };

  // Re-run evaluation instantly if the user keeps the file but toggles the model button
  useEffect(() => {
    if (file) {
      runDynamicEvaluation(selectedModel, file);
    }
  }, [selectedModel]);

  return (
    <div className="space-y-6 animate-fadeIn text-slate-100">
      
      {/* HEADER SECTION */}
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/60 shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-500" /> Live Out-Of-Sample Validation
          </h3>
          <p className="text-sm text-slate-400 mt-1">
            Upload your `creditcard_test_true.csv` file directly into the dashboard to calculate real-time benchmarks.
          </p>
        </div>

        {/* ALGORITHM TOGGLES */}
        {file && (
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
        )}
      </div>

      {/* ERROR HANDLER */}
      {error && (
        <div className="p-4 bg-red-950/40 border border-red-900/50 text-red-400 text-xs rounded-xl flex items-start gap-2">
          <AlertOctagon className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <div>
            <span className="font-bold block">Evaluation Interrupted:</span>
            <span className="opacity-80">{error}</span>
          </div>
        </div>
      )}

      {/* DYNAMIC VIEW CONDITIONALS */}
      {!file ? (
        /* DYNAMIC FILE PICKER INPUT DROPZONE */
        <div className="border-2 border-dashed border-slate-800 hover:border-blue-500/50 transition-all bg-slate-900/20 rounded-2xl p-12 text-center max-w-xl mx-auto flex flex-col items-center justify-center space-y-4">
          <div className="p-4 bg-slate-950 rounded-full border border-slate-800">
            <UploadCloud className="h-8 w-8 text-blue-500" />
          </div>
          <div>
            <h4 className="text-sm font-black text-white uppercase tracking-wider">Select Validation Dataset</h4>
            <p className="text-xs text-slate-500 mt-1">Upload a CSV containing both input dimensions and the target label column (`Class` column).</p>
          </div>
          <label className="cursor-pointer bg-blue-600 hover:bg-blue-500 px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all shadow-lg text-white">
            Browse Test File
            <input type="file" accept=".csv" onChange={handleFileChange} className="hidden" />
          </label>
        </div>
      ) : loading ? (
        /* LOADING STATE */
        <div className="bg-slate-900/40 border border-slate-800 p-12 rounded-2xl text-center flex flex-col items-center justify-center space-y-3">
          <RefreshCw className="h-8 w-8 text-blue-500 animate-spin" />
          <p className="text-xs font-mono text-slate-400">
            Uploading array binaries and mapping confusion matrix metrics...
          </p>
        </div>
      ) : data ? (
        /* REPORT VIEW GRAPHICS DISPLAY */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* STATS COLLATERAL */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Computed Scores</h4>
              <button 
                onClick={() => setFile(null)} 
                className="text-[10px] uppercase font-black tracking-widest text-red-400 hover:underline"
              >
                Clear File
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MetricBlock label="Global Accuracy" value={data.metrics.accuracy} sub="Matched prediction total" color="text-white" />
              <MetricBlock label="Precision Score" value={data.metrics.precision} sub="False alarm filter rate" color="text-emerald-400" />
              <MetricBlock label="Recall Catch Rate" value={data.metrics.recall} sub="True danger interception" color="text-amber-400" />
              <MetricBlock label="Balanced F1 Score" value={data.metrics.f1_score} sub="Harmonic feature vector mean" color="text-blue-400" />
            </div>

            <div className="bg-slate-900/30 border border-slate-850 p-4 rounded-xl text-xs text-slate-400 space-y-2">
              <div className="flex items-center gap-2 text-white font-bold mb-1 border-b border-slate-850 pb-1.5">
                <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                <span className="truncate max-w-[200px]">{file.name}</span>
              </div>
              <div className="flex justify-between"><span>Active Classifier Engine:</span><span className="font-mono text-white uppercase font-black">{data.model_evaluated}</span></div>
              <div className="flex justify-between"><span>Evaluated Row Dimensions:</span><span className="font-mono text-white">{data.total_test_samples.toLocaleString()} items</span></div>
            </div>
          </div>

          {/* CONFUSION MATRIX COMPONENT */}
          <div className="lg:col-span-7 space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 px-1">Dynamic Confusion Matrix</h4>
            
            <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-2xl space-y-4">
              <div className="grid grid-cols-2 text-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                <div>Predicted Legitimate (0)</div>
                <div>Predicted Fraud (1)</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-950 p-4 border border-slate-850 rounded-xl text-center flex flex-col justify-center min-h-[95px]">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-wider">True Negatives (TN)</span>
                  <span className="text-xl font-mono font-black text-slate-200 mt-1">{data.confusion_matrix.true_negatives.toLocaleString()}</span>
                  <span className="text-[9px] text-emerald-500 font-bold mt-1 flex items-center justify-center gap-1"><ShieldCheck className="h-3 w-3" /> Safe Clearances</span>
                </div>

                <div className="bg-amber-950/10 border border-amber-900/20 p-4 rounded-xl text-center flex flex-col justify-center min-h-[95px]">
                  <span className="text-[9px] font-black text-amber-500/80 uppercase tracking-wider">False Positives (FP)</span>
                  <span className="text-xl font-mono font-black text-amber-400 mt-1">{data.confusion_matrix.false_positives.toLocaleString()}</span>
                  <span className="text-[9px] text-amber-500/50 font-medium mt-1">False Alarms triggered</span>
                </div>

                <div className="bg-red-950/20 border border-red-900/30 p-4 rounded-xl text-center flex flex-col justify-center min-h-[95px]">
                  <span className="text-[9px] font-black text-red-500/80 uppercase tracking-wider">False Negatives (FN)</span>
                  <span className="text-xl font-mono font-black text-red-500 mt-1">{data.confusion_matrix.false_negatives.toLocaleString()}</span>
                  <span className="text-[9px] text-red-400/50 font-medium mt-1 flex items-center justify-center gap-1"><AlertOctagon className="h-3 w-3" /> Missed Breaches</span>
                </div>

                <div className="bg-blue-950/20 border border-blue-900/30 p-4 rounded-xl text-center flex flex-col justify-center min-h-[95px]">
                  <span className="text-[9px] font-black text-blue-400 uppercase tracking-wider">True Positives (TP)</span>
                  <span className="text-xl font-mono font-black text-blue-400 mt-1">{data.confusion_matrix.true_positives.toLocaleString()}</span>
                  <span className="text-[9px] text-blue-400/80 font-bold mt-1">Criminal Attacks Blocked</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex items-start gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-850">
                <HelpCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span>
                  <strong>Dynamic Assessment:</strong> These parameters recalculate instantly whenever you supply a raw target file dataset array split to the execution server blocks.
                </span>
              </div>
            </div>
          </div>

        </div>
      ) : null}
    </div>
  );
}

function MetricBlock({ label, value, sub, color }) {
  return (
    <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex flex-col justify-between min-h-[95px] hover:border-slate-700 transition-all">
      <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block">{label}</span>
      <span className={`text-2xl font-mono font-black mt-1 ${color}`}>{value}</span>
      <span className="text-[9px] text-slate-500 font-medium mt-1 block border-t border-slate-850/60 pt-1">{sub}</span>
    </div>
  );
}