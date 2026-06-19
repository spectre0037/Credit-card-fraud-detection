import React, { useState } from 'react';

function App() {
  const [activeTab, setActiveTab] = useState('single'); // 'single' | 'batch' | 'metrics'
  const BACKEND_URL = 'http://127.0.0.1:8000'; // Make sure this matches your FastAPI port

  // --- STATE FOR SINGLE PREDICTION ---
  const [formData, setFormData] = useState({
    Time: 0, Amount: 100,
    V1: 0.0, V2: 0.0, V3: 0.0, V4: 0.0, V5: 0.0, V6: 0.0, V7: 0.0, V8: 0.0, V9: 0.0, V10: 0.0,
    V11: 0.0, V12: 0.0, V13: 0.0, V14: 0.0, V15: 0.0, V16: 0.0, V17: 0.0, V18: 0.0, V19: 0.0, V20: 0.0,
    V21: 0.0, V22: 0.0, V23: 0.0, V24: 0.0, V25: 0.0, V26: 0.0, V27: 0.0, V28: 0.0
  });
  const [singleResult, setSingleResult] = useState(null);
  const [singleLoading, setSingleLoading] = useState(false);
  const [singleError, setSingleError] = useState(null);

  // --- STATE FOR BATCH PREDICTION ---
  const [csvFile, setCsvFile] = useState(null);
  const [batchResults, setBatchResults] = useState(null);
  const [batchLoading, setBatchLoading] = useState(false);
  const [batchError, setBatchError] = useState(null);

  // Handle single input slider shifts
  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  // Submit Single Evaluation to FastAPI
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setSingleLoading(true);
    setSingleError(null);
    setSingleResult(null);

    try {
      const response = await fetch(`${BACKEND_URL}/predict/single`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to compute matrix response from API.');
      const data = await response.json();
      setSingleResult(data);
    } catch (err) {
      setSingleError(err.message);
    } finally {
      setSingleLoading(false);
    }
  };

  // Submit Bulk CSV File to FastAPI
  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setBatchLoading(true);
    setBatchError(null);
    setBatchResults(null);

    const dataPayload = new FormData();
    dataPayload.append('file', csvFile);

    try {
      const response = await fetch(`${BACKEND_URL}/predict/batch`, {
        method: 'POST',
        body: dataPayload, // Multi-part form payload structure for files
      });
      if (!response.ok) throw new Error('Error processing CSV batch schema file.');
      const data = await response.json();
      setBatchResults(data); // Expects an array or list summary
    } catch (err) {
      setBatchError(err.message);
    } finally {
      setBatchLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* GLOBAL NAVBAR */}
      <nav className="bg-slate-950 border-b border-slate-800 px-8 py-4 flex flex-col md:flex-row items-center justify-between shadow-md">
        <div className="mb-4 md:mb-0">
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            🕵️‍♂️ Credit Card Fraud Engine
          </h1>
          <p className="text-xs text-slate-400 font-medium">Production Decoupled Stack // React & FastAPI</p>
        </div>
        
        {/* TAB NAVIGATION MODULE */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button onClick={() => setActiveTab('single')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'single' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
            Single Scoring
          </button>
          <button onClick={() => setActiveTab('batch')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'batch' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
            Batch CSV Processing
          </button>
          <button onClick={() => setActiveTab('metrics')} className={`px-4 py-2 text-sm font-bold rounded-md transition ${activeTab === 'metrics' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'}`}>
            System Insights
          </button>
        </div>
      </nav>

      {/* WORKSPACE AREA */}
      <main className="flex-1 p-8 max-w-7xl w-full mx-auto">
        
        {/* ================= TAB 1: SINGLE PREDICTION ================= */}
        {activeTab === 'single' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <form onSubmit={handleSingleSubmit} className="lg:col-span-2 bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl space-y-6">
              <h3 className="text-lg font-bold border-b border-slate-700 pb-2 text-white">Transaction Vector Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Time Dimension: {formData.Time}s</label>
                  <input type="range" min="0" max="172800" name="Time" value={formData.Time} onChange={handleSliderChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">Transaction Amount ($)</label>
                  <input type="number" name="Amount" value={formData.Amount} onChange={handleSliderChange} className="w-full bg-slate-700 border border-slate-600 rounded p-1.5 focus:outline-none focus:border-blue-500 text-white font-bold" />
                </div>
              </div>

              <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 pt-2 border-b border-slate-700 pb-1">PCA Scalar Array Components (V1 - V28)</h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[22rem] overflow-y-auto pr-2">
                {Object.keys(formData).filter(k => k.startsWith('V')).map(key => (
                  <div key={key} className="bg-slate-900/50 p-2.5 rounded border border-slate-700/60">
                    <label className="block text-xs font-medium text-slate-400 mb-1">{key}: <span className="text-slate-200 font-mono">{formData[key].toFixed(2)}</span></label>
                    <input type="range" min="-5" max="5" step="0.1" name={key} value={formData[key]} onChange={handleSliderChange} className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-emerald-500" />
                  </div>
                ))}
              </div>

              <button type="submit" disabled={singleLoading} className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg transition shadow-md disabled:bg-slate-700 disabled:cursor-not-allowed">
                {singleLoading ? 'Computing Network Weights...' : 'Execute Fraud Assessment'}
              </button>
            </form>

            {/* SINGLE RESULT CARD */}
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl h-fit">
              <h3 className="text-lg font-bold border-b border-slate-700 pb-2 text-white mb-4">Inference Diagnostics</h3>
              {singleError && <div className="p-4 bg-red-950/50 border border-red-500 rounded text-red-200 text-xs">❌ {singleError}</div>}
              {!singleResult && !singleLoading && !singleError && <div className="text-center text-slate-400 py-12 border-2 border-dashed border-slate-700 rounded">Submit values to trigger neural tree arrays.</div>}
              {singleLoading && <div className="text-center py-12"><div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div><span className="text-xs text-slate-400">Processing...</span></div>}
              {singleResult && (
                <div className={`p-6 rounded-lg text-center border ${singleResult.is_fraud === 1 ? 'bg-red-950/60 border-red-500 text-red-200' : 'bg-emerald-950/60 border-emerald-500 text-emerald-200'}`}>
                  <div className="text-4xl mb-2">{singleResult.is_fraud === 1 ? '🚨' : '✅'}</div>
                  <h4 className="text-xl font-black uppercase tracking-widest">{singleResult.status}</h4>
                  <div className="mt-4 pt-4 border-t border-slate-700/60">
                    <span className="text-xs text-slate-400 uppercase tracking-widest block font-semibold">Anomalous Score Risk</span>
                    <span className="text-3xl font-black text-white block mt-1">{(singleResult.fraud_probability * 100).toFixed(2)}%</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= TAB 2: BATCH PREDICTION ================= */}
        {activeTab === 'batch' && (
          <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl max-w-3xl mx-auto space-y-6">
            <div>
              <h3 className="text-xl font-bold text-white">Bulk File Processing Engine</h3>
              <p className="text-sm text-slate-400 mt-1">Drop comprehensive transactional ledger tables here to batch score thousands of entries simultaneously using optimized XGBoost parallel workers.</p>
            </div>

            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-8 text-center bg-slate-900/40 hover:border-blue-500 transition cursor-pointer relative">
                <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <div className="space-y-1">
                  <span className="block text-2xl">📥</span>
                  <span className="block text-sm font-medium text-slate-300">{csvFile ? `Selected: ${csvFile.name}` : 'Click to browse or drag .csv file here'}</span>
                  <span className="block text-xs text-slate-500">File schema must contain columns matching Time, V1-V28, and Amount</span>
                </div>
              </div>

              <button type="submit" disabled={!csvFile || batchLoading} className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition shadow-md disabled:bg-slate-700 disabled:cursor-not-allowed">
                {batchLoading ? 'Parsing Bulk Record Sets...' : 'Begin Batch Pipeline Processing'}
              </button>
            </form>

            {batchError && <div className="p-4 bg-red-950/50 border border-red-500 rounded text-red-200 text-xs">❌ {batchError}</div>}
            {batchResults && (
              <div className="p-4 bg-slate-900 rounded-lg border border-slate-700 space-y-3">
                <h4 className="text-sm font-bold text-white uppercase tracking-wider">Pipeline Output Analytics Summary</h4>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="bg-slate-800 p-3 rounded border border-slate-700">
                    <span className="text-xs text-slate-400 block">Total Records Evaluated</span>
                    <span className="text-2xl font-bold text-white">{batchResults.total_processed || 0}</span>
                  </div>
                  <div className="bg-red-950/40 p-3 rounded border border-red-900/60">
                    <span className="text-xs text-red-400 block">Anomalous Risk Alerts Flagged</span>
                    <span className="text-2xl font-bold text-red-400">{batchResults.fraud_detected || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: SYSTEM INSIGHTS ================= */}
        {activeTab === 'metrics' && (
          <div className="space-y-6">
            <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-xl">
              <h3 className="text-xl font-bold text-white">Cross-Validation Ensemble Benchmarks</h3>
              <p className="text-sm text-slate-400 mt-1">Production validation metrics scored against severe minority class imbalance splits (0.17% Base Rate).</p>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {[
                  { name: 'XGBoost Engine', precision: '93.20%', recall: '82.10%', f1: '87.30%', status: '🏆 Production Choice' },
                  { name: 'LightGBM Classifier', precision: '88.50%', recall: '80.40%', f1: '84.25%', status: '⚡ High Performance' },
                  { name: 'Random Forest Assembly', precision: '94.10%', recall: '76.20%', f1: '84.21%', status: '🌲 Heavy Footprint' },
                  { name: 'Logistic Regression', precision: '5.40%', recall: '89.10%', f1: '10.18%', status: '📉 High False Alarms' }
                ].map((m) => (
                  <div key={m.name} className="bg-slate-900/60 p-4 rounded-lg border border-slate-700/60 space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="text-sm font-black text-white block">{m.name}</span>
                      <span className="text-[10px] uppercase font-bold text-blue-400 tracking-wider block mt-0.5">{m.status}</span>
                    </div>
                    <div className="space-y-1 text-xs text-slate-300 font-medium">
                      <div className="flex justify-between"><span>Precision:</span><span className="font-mono text-white">{m.precision}</span></div>
                      <div className="flex justify-between"><span>Recall:</span><span className="font-mono text-white">{m.recall}</span></div>
                      <div className="flex justify-between"><span className="font-bold text-slate-400">F1-Score:</span><span className="font-mono font-bold text-emerald-400">{m.f1}</span></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;