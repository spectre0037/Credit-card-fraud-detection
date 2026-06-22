import React, { useState } from 'react';
import { UploadCloud, FileCheck, HelpCircle } from 'lucide-react';

export default function BatchPrediction() {
  const [csvFile, setCsvFile] = useState(null);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!csvFile) return;
    setLoading(true);
    setError(null);
    setResults(null);

    const dataPayload = new FormData();
    dataPayload.append('file', csvFile);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict/batch', {
        method: 'POST',
        body: dataPayload,
      });
      if (!response.ok) throw new Error('Error processing CSV batch schema layout.');
      const data = await response.json();
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-slate-800/50 backdrop-blur-md p-8 rounded-2xl border border-slate-700/60 shadow-2xl space-y-6 animate-fadeIn">
      <div>
        <h3 className="text-xl font-black text-white uppercase tracking-wider">Parallel Batch Evaluation</h3>
        <p className="text-sm text-slate-400 mt-1">Upload complete log arrays below to execute bulk calculations across multiple validation structures simultaneously.</p>
      </div>

      <form onSubmit={handleBatchSubmit} className="space-y-4">
        <div className="border-2 border-dashed border-slate-600 hover:border-blue-500/80 rounded-xl p-10 text-center bg-slate-950/40 transition relative group">
          <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
          <div className="space-y-2 flex flex-col items-center">
            <UploadCloud className="h-10 w-10 text-slate-500 group-hover:text-blue-400 transition" />
            <span className="text-sm font-bold text-slate-300">{csvFile ? `Attached: ${csvFile.name}` : 'Drag & drop ledger array (.csv)'}</span>
            <span className="text-xs text-slate-500 max-w-xs">Data grid rows must correspond exactly to features: Time, V1-V28, and Amount.</span>
          </div>
        </div>

        <button type="submit" disabled={!csvFile || loading} className="w-full py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg disabled:from-slate-800 disabled:to-slate-800 disabled:cursor-not-allowed">
          {loading ? 'Crunching Batch Nodes...' : 'Launch Parallel Predictors'}
        </button>
      </form>

      {error && <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-200 text-xs font-semibold">❌ {error}</div>}
      
      {results && (
        <div className="p-6 bg-slate-950/50 rounded-xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><FileCheck className="h-4 w-4 text-emerald-400" /> Matrix Output Distribution</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/40 text-center">
              <span className="text-xs text-slate-400 block font-bold uppercase tracking-wider">Total Evaluated</span>
              <span className="text-3xl font-black text-white block mt-1">{results.total_processed || 0}</span>
            </div>
            <div className="bg-red-950/20 p-4 rounded-xl border border-red-900/40 text-center">
              <span className="text-xs text-red-400 block font-bold uppercase tracking-wider">Anomalies Detected</span>
              <span className="text-3xl font-black text-red-400 block mt-1">{results.fraud_detected || 0}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}