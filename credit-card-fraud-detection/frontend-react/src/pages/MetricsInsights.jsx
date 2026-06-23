import React, { useState } from 'react';
import staticMetrics from '../assets/metrics.json';

export default function MetricsInsights() {
  const [selectedModel, setSelectedModel] = useState('xgboost');

  const currentModelData = staticMetrics[selectedModel];

  // Accent styling rules tailored to complement individual model architectures
  const getThemeColor = () => {
    const colors = {
      xgboost: 'text-blue-600 border-blue-500 bg-blue-50',
      lightgbm: 'text-green-600 border-green-500 bg-green-50',
      random_forest: 'text-orange-600 border-orange-500 bg-orange-50',
      logistic_regression: 'text-purple-600 border-purple-500 bg-purple-50',
    };
    return colors[selectedModel] || colors.xgboost;
  };

  const themeClass = getThemeColor().split(' ');

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Performance Profiles</h1>
        <p className="text-gray-600 mt-1">
          Review historical baseline validation benchmarks extracted directly from initial pipeline model training.
        </p>
      </div>

      {/* Model Navigation Selection Ribbon */}
      <div className="flex flex-wrap gap-2 mb-8 border-b border-gray-200 pb-3">
        {Object.keys(staticMetrics).map((modelKey) => (
          <button
            key={modelKey}
            onClick={() => setSelectedModel(modelKey)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg capitalize transition-all ${
              selectedModel === modelKey
                ? `${themeClass[2]} ${themeClass[0]} border border-current shadow-sm`
                : 'text-gray-500 hover:bg-gray-100'
            }`}
          >
            {modelKey.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="space-y-6">
        {/* Core Statistical Metric Grid Scorecards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {['accuracy', 'precision', 'recall', 'f1_score'].map((metricKey) => (
            <div key={metricKey} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{metricKey.replace('_', ' ')}</p>
              <p className={`text-2xl font-black mt-1 ${themeClass[0]}`}>{currentModelData[metricKey]}</p>
            </div>
          ))}
        </div>

        {/* CSS/Tailwind Powered Analytical Grid Map */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-6 capitalize">
            {selectedModel.replace('_', ' ')} Baseline Error Distribution Matrix
          </h3>
          
          <div className="flex flex-col items-center">
            <div className="grid grid-cols-3 gap-3 w-full max-w-md">
              {/* Layout Alignment Buffer */}
              <div></div>
              <div className="text-center font-bold text-xs uppercase text-gray-400 tracking-wider">Predicted Legit</div>
              <div className="text-center font-bold text-xs uppercase text-gray-400 tracking-wider">Predicted Fraud</div>

              {/* Row 1: Actual Legit */}
              <div className="flex items-center font-bold text-xs uppercase text-gray-400 tracking-wider pr-2 justify-end">Actual Legit</div>
              <div className="bg-green-50/70 border border-green-200 text-green-800 p-6 rounded-xl text-center shadow-sm">
                <span className="block text-2xl font-black">{currentModelData.true_negatives.toLocaleString()}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">True Neg (TN)</span>
              </div>
              <div className="bg-red-50/70 border border-red-100 text-red-700 p-6 rounded-xl text-center">
                <span className="block text-2xl font-black">{currentModelData.false_positives.toLocaleString()}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">False Pos (FP)</span>
              </div>

              {/* Row 2: Actual Fraud */}
              <div className="flex items-center font-bold text-xs uppercase text-gray-400 tracking-wider pr-2 justify-end">Actual Fraud</div>
              <div className="bg-red-50/70 border border-red-100 text-red-700 p-6 rounded-xl text-center">
                <span className="block text-2xl font-black">{currentModelData.false_negatives.toLocaleString()}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">False Neg (FN)</span>
              </div>
              <div className="bg-green-50/70 border border-green-200 text-green-800 p-6 rounded-xl text-center shadow-sm">
                <span className="block text-2xl font-black">{currentModelData.true_positives.toLocaleString()}</span>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">True Pos (TP)</span>
              </div>
            </div>
          </div>

          <div className="mt-8 p-3 rounded-lg text-xs text-gray-500 bg-gray-50 border border-gray-100">
            <strong>Baseline Dataset Size:</strong> Evaluated against a fixed holdout partition of <strong>56,962</strong> transaction entries. Green areas illustrate secure accurate predictions, while red areas track classification error trends.
          </div>
        </div>
      </div>
    </div>
  );
}