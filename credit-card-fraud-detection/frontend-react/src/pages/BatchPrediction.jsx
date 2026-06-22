import React, { useState } from 'react';
import { UploadCloud, FileCheck, PieChart as PieIcon, AlertTriangle, Eye } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const API_BASE_URL = 'https://credit-card-fraud-detection-4pck.onrender.com';

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
      const response = await fetch(`${API_BASE_URL}/predict/batch`, {
        method: 'POST',
        body: dataPayload,
      });
      if (!response.ok) throw new Error('Error processing CSV batch schema layout.');
      const data = await response.json();
      
      console.log("Raw Backend Response Data:", data); 
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🔍 UNIVERSAL KEY SCANNER: Dynamically matches common Python dictionary keys
  const getMetricValues = () => {
    if (!results) return { total: 0, fraud: 0, legitimate: 0 };

    const total = results.total_processed ?? 
                  results.total_records ?? 
                  results.total ?? 
                  results.total_rows ?? 
                  results.count ?? 0;

    const fraud = results.fraud_detected ?? 
                  results.anomalies ?? 
                  results.fraud_cases ?? 
                  results.fraudulent ?? 
                  results.fraud_count ?? 0;

    const legitimate = total - fraud;
    return { total, fraud, legitimate };
  };

  const { total, fraud, legitimate } = getMetricValues();

  // 🔍 UNIVERSAL ROW EXTRACTOR: Isolates individual fraudulent entries from your API response array
  const getFraudulentRows = () => {
    if (!results) return [];
    
    // Look for common array keys that hold individual transaction predictions
    const targetArray = results.predictions ?? 
                        results.results ?? 
                        results.detailed_predictions ?? 
                        results.data ?? 
                        (Array.isArray(results) ? results : []);

    if (!Array.isArray(targetArray)) return [];

    return targetArray
      .map((item, index) => {
        // Handle if backend returns objects or simple integers/booleans
        const isFraud = typeof item === 'object' 
          ? !!(item.is_fraud || item.prediction === 1 || item.label === 1 || item.fraudulent)
          : (item === 1 || item === true);

        return {
          rowNumber: index + 1,
          transactionId: item.transaction_id ?? `TX-ID-${1000 + index}`,
          amount: item.amount ?? (item.features?.Amount) ?? 'Vector Profile',
          confidence: item.fraud_probability ?? item.confidence ?? 0.95,
          isFraud
        };
      })
      .filter(row => row.isFraud); // Isolate fraud profiles only
  };

  const fraudulentRows = getFraudulentRows();

  // Dynamic layout data injection for Recharts
  const chartData = [
    { name: 'Legitimate', value: legitimate },
    { name: 'Fraudulent Anomaly', value: fraud }
  ];

  const COLORS = ['#10b981', '#ef4444']; 

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn text-slate-100">
      
      {/* INPUT CONTROLLER */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl space-y-6">
        <div>
          <h3 className="text-xl font-black uppercase tracking-wider text-white">Parallel Batch Evaluation</h3>
          <p className="text-sm text-slate-400 mt-1">Upload transactional ledger tables to execute distributed bulk parsing.</p>
        </div>

        <form onSubmit={handleBatchSubmit} className="space-y-4">
          <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl p-8 text-center bg-slate-950/40 transition relative group cursor-pointer">
            <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
            <div className="space-y-2 flex flex-col items-center">
              <UploadCloud className="h-10 w-10 text-slate-500 group-hover:text-emerald-400 transition" />
              <span className="text-sm font-bold text-slate-300">{csvFile ? `Attached: ${csvFile.name}` : 'Drag & drop transactional dataset (.csv)'}</span>
              <span className="text-xs text-slate-500">Required columns: Time, V1-V28, and Amount.</span>
            </div>
          </div>

          <button type="submit" disabled={!csvFile || loading} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed">
            {loading ? 'Processing Backend Calculations...' : 'Launch Execution Pipelines'}
          </button>
        </form>

        {error && <div className="p-4 bg-red-950/40 border border-red-500/40 rounded-xl text-red-200 text-xs font-mono">❌ {error}</div>}
      </div>

      {/* RENDER ANALYTICS PANEL */}
      {results && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* RECHARTS PLOT CARD */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex flex-col justify-between">
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                <PieIcon className="h-4 w-4 text-emerald-400" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Anomaly Class Distribution</h4>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                {total === 0 ? (
                  <div className="text-center space-y-2">
                    <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
                    <p className="text-xs font-mono text-slate-400">Data key mismatch detected. Check the raw payload below.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={chartData} cx="50%" cy="45%" innerRadius={65} outerRadius={85} paddingAngle={4} dataKey="value">
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', borderRadius: '12px', borderColor: '#1e293b', color: '#fff' }} />
                      <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs font-bold text-slate-400 px-1">{value}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* STATS RENDER COLUMN */}
            <div className="space-y-4 flex flex-col justify-between">
              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex-1 flex flex-col justify-center">
                <span className="text-[10px] text-slate-400 block font-black uppercase tracking-widest">Total Audited Rows</span>
                <span className="text-4xl font-black text-white block mt-1 font-mono">{total.toLocaleString()}</span>
              </div>

              <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl flex-1 flex flex-col justify-center">
                <span className="text-[10px] text-red-400 block font-black uppercase tracking-widest">Unauthorized Alerts</span>
                <span className="text-4xl font-black text-red-500 block mt-1 font-mono">{fraud.toLocaleString()}</span>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Rate: {total > 0 ? ((fraud / total) * 100).toFixed(3) : 0}%
                </span>
              </div>
            </div>
          </div>

          {/* 🎯 TARGETED FRAUD DETAILS VIEWPORT */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="border-b border-slate-800 px-6 py-4 bg-slate-950/40 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h4 className="text-xs font-black uppercase tracking-widest text-red-400">High-Risk Fraud Interceptions ({fraudulentRows.length})</h4>
            </div>

            <div className="max-h-80 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-slate-950 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 w-20">CSV Row</th>
                    <th className="px-6 py-3">Vector Token ID</th>
                    <th className="px-6 py-3 text-right">Transaction Amount</th>
                    <th className="px-6 py-3 text-center">Threat Risk</th>
                    <th className="px-6 py-3 text-right">Status Flag</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300 bg-slate-900/30">
                  {fraudulentRows.length > 0 ? (
                    fraudulentRows.map((row) => (
                      <tr key={row.rowNumber} className="hover:bg-red-950/20 bg-red-950/5 transition-colors">
                        <td className="px-6 py-3.5 text-slate-500 font-bold">#{row.rowNumber}</td>
                        <td className="px-6 py-3.5 font-sans tracking-tight text-slate-400">{row.transactionId}</td>
                        <td className="px-6 py-3.5 text-right font-medium text-red-200">
                          {typeof row.amount === 'number' ? `$${row.amount.toFixed(2)}` : row.amount}
                        </td>
                        <td className="px-6 py-3.5 text-center">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-black bg-red-950 border border-red-800 text-red-400">
                            {(row.confidence * 100).toFixed(1)}% Match
                          </span>
                        </td>
                        <td className="px-6 py-3.5 text-right font-sans font-black text-red-500 tracking-wide text-[10px] uppercase">
                          ⚠️ MALICIOUS
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center text-slate-500 font-sans italic">
                        {total === 0 
                          ? 'Awaiting pipeline data visualization execution...' 
                          : '🎉 System Audit Cleared: No high-risk anomalies isolated in this batch matrix.'
                        }
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* DEBUG TRACE */}
          {total === 0 && (
            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-slate-500 overflow-x-auto">
              <p className="text-amber-500 font-bold mb-1">🔧 Debugging Trace Layer (Backend Payload keys received):</p>
              {JSON.stringify(results)}
            </div>
          )}

        </div>
      )}

    </div>
  );
}