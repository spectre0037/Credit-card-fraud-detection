import React, { useState } from 'react';
import { ShieldCheck, Skull, Cpu } from 'lucide-react';

export default function SinglePrediction() {
  const [formData, setFormData] = useState({
    Time: 0, Amount: 100,
    V1: 0.0, V2: 0.0, V3: 0.0, V4: 0.0, V5: 0.0, V6: 0.0, V7: 0.0, V8: 0.0, V9: 0.0, V10: 0.0,
    V11: 0.0, V12: 0.0, V13: 0.0, V14: 0.0, V15: 0.0, V16: 0.0, V17: 0.0, V18: 0.0, V19: 0.0, V20: 0.0,
    V21: 0.0, V22: 0.0, V23: 0.0, V24: 0.0, V25: 0.0, V26: 0.0, V27: 0.0, V28: 0.0
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSliderChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: parseFloat(value) }));
  };

  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('http://127.0.0.1:8000/predict/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!response.ok) throw new Error('Failed to compute matrix response from API.');
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fadeIn">
      <form onSubmit={handleSingleSubmit} className="lg:col-span-2 bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/60 shadow-2xl space-y-6">
        <h3 className="text-lg font-black text-white uppercase tracking-wider border-b border-slate-700 pb-2">Vector Profile Injection</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/40">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Temporal Window: {formData.Time}s</label>
            <input type="range" min="0" max="172800" name="Time" value={formData.Time} onChange={handleSliderChange} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
          </div>
          <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-700/40">
            <label className="block text-xs font-black uppercase tracking-widest text-slate-400 mb-1">Financial Scale Amount ($)</label>
            <input type="number" name="Amount" value={formData.Amount} onChange={handleSliderChange} className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 focus:outline-none focus:border-blue-500 text-white font-mono font-bold" />
          </div>
        </div>

        <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 pt-2 border-b border-slate-700 pb-1">PCA Sub-space Coordinates (V1 - V28)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 max-h-80 overflow-y-auto pr-2">
          {Object.keys(formData).filter(k => k.startsWith('V')).map(key => (
            <div key={key} className="bg-slate-900/30 p-3 rounded-xl border border-slate-800 flex flex-col justify-between">
              <label className="block text-[11px] font-bold text-slate-400 mb-1">{key}: <span className="text-blue-400 font-mono font-bold">{formData[key].toFixed(2)}</span></label>
              <input type="range" min="-5" max="5" step="0.1" name={key} value={formData[key]} onChange={handleSliderChange} className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-indigo-500" />
            </div>
          ))}
        </div>

        <button type="submit" disabled={loading} className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg disabled:from-slate-800 disabled:to-slate-800 disabled:cursor-not-allowed">
          {loading ? 'Evaluating Matrix Fields...' : 'Infect Target Metrics'}
        </button>
      </form>

      {/* ANALYSIS SIDEBAR */}
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/60 shadow-2xl h-fit">
        <h3 className="text-lg font-black text-white uppercase tracking-wider border-b border-slate-700 pb-2 mb-4">Neural Diagnostics</h3>
        {error && <div className="p-4 bg-red-950/40 border border-red-500/50 rounded-xl text-red-200 text-xs font-medium">❌ {error}</div>}
        {!result && !loading && !error && <div className="text-center text-slate-500 py-16 border-2 border-dashed border-slate-700/60 rounded-xl text-sm font-medium">Inject spatial vector data to calculate classification boundaries.</div>}
        {loading && <div className="text-center py-16"><Cpu className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" /><span className="text-xs text-slate-400 font-medium">Querying models...</span></div>}
        {result && (
          <div className={`p-6 rounded-xl border-2 text-center shadow-inner ${result.is_fraud === 1 ? 'bg-red-950/30 border-red-500 text-red-200' : 'bg-emerald-950/30 border-emerald-500 text-emerald-200'}`}>
            <div className="flex justify-center mb-3">
              {result.is_fraud === 1 ? <Skull className="h-12 w-12 text-red-500 animate-pulse" /> : <ShieldCheck className="h-12 w-12 text-emerald-500" />}
            </div>
            <h4 className="text-2xl font-black uppercase tracking-widest">{result.status}</h4>
            <div className="mt-6 pt-6 border-t border-slate-700/60">
              <span className="text-xs text-slate-400 uppercase tracking-widest font-bold block">Anomaly Risk Index</span>
              <span className="text-4xl font-black text-white block mt-2">{(result.fraud_probability * 100).toFixed(2)}%</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}