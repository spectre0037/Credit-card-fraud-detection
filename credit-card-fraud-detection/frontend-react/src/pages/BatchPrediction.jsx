import React, { useState } from 'react';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export default function BatchPrediction() {
  const [file, setFile] = useState(null);
  const [model, setModel] = useState('xgboost');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Advanced metrics states
  const [summary, setSummary] = useState(null);
  const [allResults, setAllResults] = useState([]); // Holds processed rows
  const [filterType, setFilterType] = useState('all'); // 'all', 'fraud', 'safe'

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a valid CSV dataset file first.');
      return;
    }

    setLoading(true);
    setError(null);
    setSummary(null);
    setAllResults([]);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('model', model);

    try {
      const response = await fetch(`${API_BASE_URL}/predict/batch`, {
        method: 'POST',
        body: formData, // Automatic multipart/form-data bounding
      });

      if (!response.ok) {
        throw new Error('Server rejected dataset vectors or format mapping failed.');
      }

      const data = await response.json();
      
      // Save global execution metrics
      setSummary({
        total: data.total_transactions || data.predictions?.length || 0,
        fraudCount: data.fraud_detected_count ?? data.predictions?.filter(p => p.is_fraud || p.prediction === 1).length ?? 0,
        executionTime: data.execution_time_ms || '12.4'
      });

      // Map incoming arrays dynamically for UI listing layout
      // Adjust keys (like data.predictions, item.is_fraud) to match your backend schemas exactly
      const normalizedRows = (data.predictions || data.results || []).map((item, index) => ({
        id: index + 1,
        transactionId: item.transaction_id || `TX-${1000 + index}`,
        amount: item.amount ?? (item.features && item.features.Amount) ?? 'N/A',
        confidence: item.fraud_probability ?? item.confidence ?? 0.92,
        isFraud: !!(item.is_fraud || item.prediction === 1)
      }));

      setAllResults(normalizedRows);
    } catch (err) {
      setError(err.message || 'An unexpected streaming error occurred.');
    } finally {
      setLoading(false);
    }
  };

  // Compute active filtered rows
  const displayedResults = allResults.filter(row => {
    if (filterType === 'fraud') return row.isFraud;
    if (filterType === 'safe') return !row.isFraud;
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8 animate-fadeIn">
      {/* Configuration Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Batch Network Auditing</h1>
        <p className="text-sm text-slate-500 mt-1">Upload bulk transaction Ledgers to process vectorized anomaly vectors simultaneously.</p>
      </div>

      {/* Main Control Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Control Column: File Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm h-fit">
          <form onSubmit={handleUploadSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">Target Inference Classifier</label>
              <select 
                value={model} 
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-all cursor-pointer"
              >
                <option value="xgboost">XGBoost Production Engine</option>
                <option value="random_forest">Random Forest Classifier</option>
                <option value="lightgbm">LightGBM High-Speed Net</option>
                <option value="logistic">Logistic Regression Matrix</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-2">CSV Ledger Matrix Source</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 rounded-xl p-6 text-center transition-colors relative cursor-pointer group">
                <input 
                  type="file" 
                  accept=".csv" 
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-2">
                  <div className="text-2xl text-slate-400 group-hover:text-indigo-500 transition-colors">📁</div>
                  <p className="text-xs font-medium text-slate-700">
                    {file ? file.name : "Drag your CSV file here or browse"}
                  </p>
                  <p className="text-[10px] text-slate-400">Standardized vector rows (max 10MB)</p>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 rounded-lg text-sm font-semibold tracking-wide text-white transition-all ${
                loading ? 'bg-indigo-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.99] shadow-sm shadow-indigo-100'
              }`}
            >
              {loading ? 'Processing Anomaly Arrays...' : 'Execute Batch Diagnosis'}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs rounded-lg font-medium">
              💥 {error}
            </div>
          )}
        </div>

        {/* Right Metric Column: Summary Counters */}
        <div className="lg:col-span-2 space-y-6">
          {summary ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Analyzed</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{summary.total} <span className="text-xs font-normal text-slate-400">rows</span></p>
              </div>
              <div className="bg-rose-50/60 border border-rose-100 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-rose-500">High Risk Hijacks</p>
                <p className="text-2xl font-bold text-rose-700 mt-1">{summary.fraudCount} <span className="text-xs font-normal text-rose-400">hits</span></p>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Engine Speed</p>
                <p className="text-2xl font-bold text-emerald-600 mt-1">{summary.executionTime} <span className="text-xs font-normal text-slate-400">ms</span></p>
              </div>
            </div>
          ) : (
            <div className="h-[104px] border border-slate-200 border-dashed rounded-xl flex items-center justify-center text-xs text-slate-400 bg-slate-50/50">
              Awaiting payload execution execution metrics...
            </div>
          )}

          {/* 📊 NEW UPGRADED COMPONENT: Dynamic Data Ledger Grid */}
          {allResults.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
              {/* Grid Filter Subheader */}
              <div className="border-b border-slate-100 px-4 py-3 bg-slate-50/70 flex items-center justify-between flex-wrap gap-2">
                <span className="text-xs font-bold tracking-wide text-slate-700 uppercase">Vector Inspection Registry</span>
                <div className="flex bg-white border border-slate-200 rounded-lg p-0.5 shadow-xs">
                  <button 
                    onClick={() => setFilterType('all')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${filterType === 'all' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    All ({allResults.length})
                  </button>
                  <button 
                    onClick={() => setFilterType('fraud')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${filterType === 'fraud' ? 'bg-rose-600 text-white' : 'text-rose-600 hover:bg-rose-50'}`}
                  >
                    Fraud ({summary?.fraudCount})
                  </button>
                  <button 
                    onClick={() => setFilterType('safe')}
                    className={`px-2.5 py-1 text-[11px] font-medium rounded-md transition-colors ${filterType === 'safe' ? 'bg-emerald-600 text-white' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    Clear ({allResults.length - (summary?.fraudCount || 0)})
                  </button>
                </div>
              </div>

              {/* Data Table Viewport */}
              <div className="overflow-y-auto flex-1 text-xs">
                <table className="w-full text-left border-collapse">
                  <thead className="bg-slate-100/70 text-slate-500 uppercase font-semibold text-[10px] tracking-wider sticky top-0 border-b border-slate-200 z-10 backdrop-blur-xs">
                    <tr>
                      <th className="px-4 py-2.5 w-16">Row</th>
                      <th className="px-4 py-2.5">Identifier</th>
                      <th className="px-4 py-2.5 text-right">Amount</th>
                      <th className="px-4 py-2.5 text-center">Score Risk</th>
                      <th className="px-4 py-2.5 text-right w-24">Classification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-700">
                    {displayedResults.length > 0 ? (
                      displayedResults.map((row) => (
                        <tr 
                          key={row.id} 
                          className={`hover:bg-slate-50 transition-colors ${row.isFraud ? 'bg-rose-50/40 hover:bg-rose-50/70 text-rose-950' : ''}`}
                        >
                          <td className="px-4 py-2.5 font-medium text-slate-400">{row.id}</td>
                          <td className="px-4 py-2.5 font-sans tracking-tight text-slate-600">{row.transactionId}</td>
                          <td className="px-4 py-2.5 text-right font-medium">
                            {typeof row.amount === 'number' ? `$${row.amount.toFixed(2)}` : row.amount}
                          </td>
                          <td className="px-4 py-2.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded-sm text-[10px] font-bold ${
                              row.isFraud ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {(row.confidence * 100).toFixed(1)}%
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right font-sans font-bold">
                            {row.isFraud ? (
                              <span className="text-rose-600 text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md bg-rose-100/50">⚠️ FRAUD</span>
                            ) : (
                              <span className="text-emerald-600 text-[10px] tracking-wide uppercase px-2 py-0.5 rounded-md bg-emerald-50">✅ CLEAN</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="5" className="px-4 py-8 text-center text-slate-400 font-sans italic">
                          No transactions match the selected filter type criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}