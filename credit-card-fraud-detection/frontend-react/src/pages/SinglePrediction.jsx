import React, { useState } from "react";
import {
  ShieldCheck,
  Skull,
  Cpu,
  DollarSign,
  RefreshCw,
  Zap,
  Sliders,
  CheckCircle,
  Info,
} from "lucide-react";

export default function SinglePrediction() {
  // Pre-configured real-world testing vectors from the creditcard dataset
  const testProfiles = [
    {
      name: "Standard Retail Transaction",
      desc: "Low-risk organic grocery store vector signatures.",
      amount: "45.20",
      vectors: {
        Time: 406,
        V1: -1.22,
        V2: 0.23,
        V3: 1.04,
        V4: -0.81,
        V5: 0.65,
        V6: -0.12,
        V7: 0.44,
        V8: 0.11,
        V9: -0.21,
        V10: -0.15,
        V11: 0.88,
        V12: 0.43,
        V13: -0.62,
        V14: 0.12,
        V15: -0.91,
        V16: 0.28,
        V17: -0.34,
        V18: -0.11,
        V19: 0.15,
        V20: -0.08,
        V21: -0.15,
        V22: -0.32,
        V23: -0.05,
        V24: 0.49,
        V25: 0.18,
        V26: -0.25,
        V27: 0.02,
        V28: -0.06,
      },
    },
    {
      name: "Suspicious Behavior Node",
      desc: "Moderate tracking shift. Simulates roughly a 33.56% anomaly likelihood.",
      amount: "184.50",
      vectors: {
        Time: 1540,
        V1: -0.85,
        V2: 1.12,
        V3: -0.45,
        V4: 2.1,
        V5: -0.32,
        V6: -0.75,
        V7: -0.18,
        V8: 0.42,
        V9: -1.05,
        V10: -1.2,
        V11: 1.85,
        V12: -2.1,
        V13: 0.55,
        V14: -2.4,
        V15: 0.35,
        V16: -1.15,
        V17: -2.1,
        V18: -0.85,
        V19: 0.65,
        V20: 0.18,
        V21: 0.32,
        V22: -0.12,
        V23: -0.15,
        V24: 0.05,
        V25: 0.12,
        V26: 0.22,
        V27: 0.25,
        V28: 0.09,
      },
    },
    {
      name: "Critical Risk Warning",
      desc: "Severe spatial variance layout. Simulates roughly a 77.34% anomaly likelihood.",
      amount: "840.00",
      vectors: {
        Time: 2105,
        V1: -2.15,
        V2: 2.45,
        V3: -3.4,
        V4: 3.85,
        V5: -1.45,
        V6: -1.2,
        V7: -2.65,
        V8: 0.95,
        V9: -2.1,
        V10: -4.05,
        V11: 3.15,
        V12: -4.8,
        V13: 0.22,
        V14: -5.3,
        V15: -0.05,
        V16: -3.1,
        V17: -5.8,
        V18: -1.95,
        V19: 0.95,
        V20: 0.32,
        V21: 0.65,
        V22: -0.15,
        V23: -0.3,
        V24: -0.05,
        V25: 0.25,
        V26: 0.42,
        V27: 0.55,
        V28: 0.22,
      },
    },
  ];

  const [amount, setAmount] = useState(testProfiles[0].amount);
  const [vectors, setVectors] = useState(testProfiles[0].vectors);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const applyPresetProfile = (profile) => {
    setAmount(profile.amount);
    setVectors(profile.vectors);
    setResult(null);
    setError(null);
  };

  const handleVectorChange = (key, val) => {
    setVectors((prev) => ({
      ...prev,
      [key]: val === "" ? "" : parseFloat(val) || 0,
    }));
  };

  const handleEvaluation = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    // 🌟 FIX 1: Robust payload composition with clean key exclusions
    const fullPayload = {
      Time: parseFloat(vectors.Time ?? vectors.time) || 0.0,
      Amount: parseFloat(amount) || 0.0,
    };

    // Add V1 through V28 cleanly without tracking key mutations
    Object.keys(vectors).forEach((key) => {
      if (key.toLowerCase() !== "time" && key.toLowerCase() !== "amount") {
        fullPayload[key] = parseFloat(vectors[key]) || 0.0;
      }
    });

    try {
      const response = await fetch("https://credit-card-fraud-detection-4pck.onrender.com/predict/single", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fullPayload),
      });

      if (!response.ok)
        throw new Error("Model worker pipeline rejected the dataset vectors.");
      
      const data = await response.json();
      console.log("Single Evaluation Response Data:", data);
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🌟 FIX 2: Universal Scanner variables for the response object
  const isFraudResult = result ? !!(result.is_fraud === 1 || result.is_fraud === true || result.prediction === 1 || result.label === 1) : false;
  const confidenceScore = result ? (result.fraud_probability ?? result.confidence ?? result.probability ?? (isFraudResult ? 0.95 : 0.05)) : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6 text-slate-100 animate-fadeIn">
      {/* SECTION 1: INTERACTIVE QUICK TEST DATA PRESETS */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" /> Interactive Quick-Load Test Profiles
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testProfiles.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => applyPresetProfile(p)}
              className="bg-slate-950 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 p-4 rounded-xl text-left transition relative flex flex-col justify-between group"
            >
              <div>
                <div className="text-xs font-bold text-white group-hover:text-blue-400 transition">
                  {p.name}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 leading-relaxed">
                  {p.desc}
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 mt-3 pt-2 border-t border-slate-900 flex justify-between">
                <span>Amt: ${p.amount}</span>
                <span className="text-blue-500 font-bold group-hover:underline">
                  Load Preset →
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* MAIN SYSTEM CONTAINER SPLITGRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL LEFT: INPUT MATRIX GRID */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleEvaluation} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl space-y-6">
            {/* RAW BASICS BAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-b border-slate-800 pb-5">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1">
                  <DollarSign className="h-3 w-3 text-blue-500" /> Transaction Value (Amount)
                </label>
                <input
                  type="number"
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/80 text-white font-mono rounded-xl p-3 text-sm focus:outline-none transition shadow-inner"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-400 mb-1.5">
                  ⏱️ Timeline Offset (Seconds)
                </label>
                <input
                  type="number"
                  value={vectors.Time ?? vectors.time ?? ""}
                  onChange={(e) => handleVectorChange("Time", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500/80 text-white font-mono rounded-xl p-3 text-sm focus:outline-none transition shadow-inner"
                  required
                />
              </div>
            </div>

            {/* PCA COLS MATRIX FORM */}
            <div>
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
                <Sliders className="h-3.5 w-3.5 text-blue-500" /> Mathematical Vector Grid (V1 - V28)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.keys(vectors).map((key) => {
                  if (key.toLowerCase() === "time") return null;
                  return (
                    <div key={key} className="bg-slate-950 p-2 rounded-xl border border-slate-850 flex items-center gap-2">
                      <span className="text-[10px] font-black text-slate-500 min-w-[24px] text-right font-mono">
                        {key}
                      </span>
                      <input
                        type="number"
                        step="any"
                        value={vectors[key]}
                        onChange={(e) => handleVectorChange(key, e.target.value)}
                        className="w-full bg-transparent text-white font-mono text-xs focus:outline-none text-right pr-1"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:from-slate-800 disabled:to-slate-800 disabled:cursor-not-allowed"
            >
              {loading && <RefreshCw className="h-4 w-4 animate-spin" />}
              {loading ? "Processing Weights..." : "Execute Fraud Model Assessment"}
            </button>
          </form>
        </div>

        {/* PANEL RIGHT: OPERATIONAL SUMMARY */}
        <div className="space-y-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl h-full flex flex-col justify-between min-h-[400px]">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-800 pb-3 mb-4 flex items-center gap-2">
                <Cpu className="h-4 w-4 text-indigo-400" /> Operational Model Response
              </h3>

              {error && (
                <div className="p-4 bg-red-950/20 border border-red-500/30 rounded-xl text-red-200 text-xs font-mono">
                  💥 API Error: {error}
                </div>
              )}

              {!result && !loading && !error && (
                <div className="text-center text-slate-500 py-24 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center p-4">
                  <Info className="h-8 w-8 text-slate-700 mb-2" />
                  <span className="text-xs font-bold uppercase tracking-wider">Awaiting Vector Submissions</span>
                  <span className="text-[11px] text-slate-600 mt-1 max-w-xs text-center">
                    Load a testing preset from the top block or change weights to score transaction nodes.
                  </span>
                </div>
              )}

              {loading && (
                <div className="text-center py-24">
                  <Cpu className="h-8 w-8 text-blue-500 animate-spin mx-auto mb-3" />
                  <span className="text-xs text-slate-400 font-mono animate-pulse uppercase tracking-widest font-black">
                    Running Model Inference...
                  </span>
                </div>
              )}

              {result && (
                <div className={`p-6 rounded-xl border transition-all ${isFraudResult ? "bg-red-950/10 border-red-500/30 text-red-200" : "bg-emerald-950/10 border-emerald-500/30 text-emerald-200"}`}>
                  <div className="flex justify-center mb-3">
                    {isFraudResult ? <Skull className="h-12 w-12 text-red-500" /> : <ShieldCheck className="h-12 w-12 text-emerald-400" />}
                  </div>

                  <h4 className="text-center font-black text-sm uppercase tracking-widest text-white">
                    {result.status ?? (isFraudResult ? "Fraud Alert Triggered" : "Transaction Authenticated")}
                  </h4>

                  <div className="mt-6 pt-5 border-t border-slate-800 space-y-4">
                    <div className="text-center">
                      <span className="text-[9px] text-slate-400 uppercase tracking-widest font-black block">Model Confidence Density</span>
                      <span className="text-4xl font-black text-white block mt-1 font-mono">
                        {(confidenceScore * 100).toFixed(2)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isFraudResult ? "bg-red-500" : "bg-emerald-500"}`}
                        style={{ width: `${confidenceScore * 100}%` }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {result && (
              <div className="text-[10px] font-mono text-slate-500 bg-slate-950 p-3 rounded-xl border border-slate-850 mt-4">
                <span className="text-slate-400 font-bold block mb-1">📟 Meta Router Headers:</span>
                Model engine: <span className="text-indigo-400 font-bold">{result.model_used ?? "Active Classifier"}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}