import React from 'react';
import { Award, Zap, TrendingUp, Info } from 'lucide-react';

export default function MetricsInsights() {
  const models = [
    { name: 'XGBoost Assembly', precision: '93.20%', recall: '82.10%', f1: '87.30%', status: '🏆 Production Metric Active', color: 'from-blue-600 to-indigo-600' },
    { name: 'LightGBM Tree', precision: '88.50%', recall: '80.40%', f1: '84.25%', status: '⚡ Fast Processing Node', color: 'from-amber-600 to-orange-600' },
    { name: 'Random Forest Ensemble', precision: '94.10%', recall: '76.20%', f1: '84.21%', status: '🌲 Dense Footprint Baseline', color: 'from-emerald-600 to-teal-600' },
    { name: 'Linear Regression', precision: '5.40%', recall: '89.10%', f1: '10.18%', status: '📉 High Variance Profile', color: 'from-slate-600 to-slate-700' }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-slate-800/50 backdrop-blur-md p-6 rounded-2xl border border-slate-700/60 shadow-2xl">
        <h3 className="text-lg font-black text-white uppercase tracking-wider">Cross-Validation Cross-Sections</h3>
        <p className="text-sm text-slate-400 mt-1">Validation metrics verified against severe historical class data imbalance profiles (0.17% baseline presence constraint).</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
          {models.map((m) => (
            <div key={m.name} className="bg-slate-950/40 p-5 rounded-xl border border-slate-800 flex flex-col justify-between space-y-4">
              <div>
                <span className="text-md font-black text-white block">{m.name}</span>
                <span className="text-[10px] uppercase font-black tracking-widest text-blue-400 block mt-1">{m.status}</span>
              </div>
              <div className="space-y-2 text-xs font-bold text-slate-400 border-t border-slate-800/60 pt-3">
                <div className="flex justify-between"><span>Precision:</span><span className="font-mono text-white">{m.precision}</span></div>
                <div className="flex justify-between"><span>Recall:</span><span className="font-mono text-white">{m.recall}</span></div>
                <div className="flex justify-between items-center border-t border-slate-900 pt-2"><span className="text-slate-300">F1-Score:</span><span className="font-mono text-lg font-black text-emerald-400">{m.f1}</span></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}