import React, { useState } from 'react';
import axios from 'axios';

export default function MetricsInsights() {
  const [selectedModel, setSelectedModel] = useState('xgboost');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [results, setResults] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleEvaluate = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please provide a ground-truth CSV test dataset.');
      return;
    }

    setLoading(true);
    setError('');
    setResults(null);

    // Using standard Multi-part Form Data matching your Form(...) parameters in FastAPI
    const formData = new FormData();
    formData.append('file', file);
    formData.append('model_name', selectedModel);

    try {
      // Connects directly to your high-speed performance optimized endpoint
      const response = await axios.post('/analytics/evaluate-test-set', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResults(response.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Execution failed while calculating engine metrics.');
    } finally {
      setLoading(false);
    }
  };

  // Maps professional component accent color variations dynamically based on model selection
  const getThemeColor = () => {
    const colors = {
      xgboost: 'bg-blue-600 hover:bg-blue-700 text-blue-600 border-blue-100 bg-blue-50/50 fill-blue-600',
      lightgbm: 'bg-green-600 hover:bg-green-700 text-green-600 border-green-100 bg-green-50/50 fill-green-600',
      random_forest: 'bg-orange-600 hover:bg-orange-700 text-orange-600 border-orange-100 bg-orange-50/50 fill-orange-600',
      logistic_regression: 'bg-purple-600 hover:bg-purple-700 text-purple-600 border-purple-100 bg-purple-50/50 fill-purple-600',
    };
    return colors[selectedModel] || colors.xgboost;
  };

  const themeClass = getThemeColor().split(' ');

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">System Metrics & Insights</h1>
        <p className="text-gray-600 mt-1">Accepts runtime validation batches to compute evaluation vectors across memory models.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Input Configuration Column */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Pipeline Controller</h2>
          
          <form onSubmit={handleEvaluate} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Target Class Estimator</label>
              <select
                value={selectedModel}
                onChange={(e) => { setSelectedModel(e.target.value); setResults(null); }}
                className="w-full p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none capitalize text-sm font-medium"
              >
                <option value="xgboost">XGBoost Engine</option>
                <option value="lightgbm">LightGBM Classifier</option>
                <option value="random_forest">Random Forest</option>
                <option value="logistic_regression">Logistic Regression</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-600 mb-2">Test File Dataset (CSV)</label>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200 cursor-pointer"
              />
            </div>

            {error && <div className="text-sm text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-100">{error}</div>}

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm ${themeClass[0]} ${themeClass[1]} disabled:bg-gray-400 disabled:cursor-not-allowed`}
            >
              {loading ? 'Processing Vector Streams...' : 'Evaluate Test Dataset'}
            </button>
          </form>
        </div>

        {/* Right Dashboard Analytics Graphics Column */}
        <div className="lg:col-span-2">
          {loading && (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[420px]">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-800 mb-4"></div>
              <p className="text-gray-500 text-sm font-medium">Running predictions across linear matrices...</p>
            </div>
          )}

          {!loading && !results && (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center min-h-[420px] text-center">
              <div className="text-gray-300 text-5xl mb-3">📊</div>
              <p className="text-gray-500 font-medium">Evaluation Interface Idle</p>
              <p className="text-xs text-gray-400 max-w-xs mt-1">Upload your validation payload on the left to display classification tracking scores.</p>
            </div>
          )}

          {!loading && results && (
            <div className="space-y-6">
              {/* Statistical Value Indicator Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {Object.entries(results.metrics).map(([key, value]) => (
                  <div key={key} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{key.replace('_', ' ')}</p>
                    <p className={`text-2xl font-black mt-1 ${themeClass[2]}`}>{value}</p>
                  </div>
                ))}
              </div>

              {/* Native HTML/Tailwind Styled Confusion Matrix Grid */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-6 capitalize">
                  {results.model_evaluated.replace('_', ' ')} Error Distribution Grid
                </h3>
                
                <div className="flex flex-col items-center">
                  <div className="grid grid-cols-3 gap-2 w-full max-w-md">
                    {/* Corner Space Spacer */}
                    <div></div>
                    <div className="text-center font-bold text-xs uppercase text-gray-400 tracking-wider">Predicted Legit</div>
                    <div className="text-center font-bold text-xs uppercase text-gray-400 tracking-wider">Predicted Fraud</div>

                    {/* Actual Legit Row */}
                    <div className="flex items-center font-bold text-xs uppercase text-gray-400 tracking-wider pr-2 justify-end">Actual Legit</div>
                    <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center shadow-inner">
                      <span className="block text-xl font-extrabold">{results.confusion_matrix.true_negatives.toLocaleString()}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">True Neg (TN)</span>
                    </div>
                    <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-lg text-center">
                      <span className="block text-xl font-extrabold">{results.confusion_matrix.false_positives.toLocaleString()}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">False Pos (FP)</span>
                    </div>

                    {/* Actual Fraud Row */}
                    <div className="flex items-center font-bold text-xs uppercase text-gray-400 tracking-wider pr-2 justify-end">Actual Fraud</div>
                    <div className="bg-red-50 border border-red-100 text-red-700 p-6 rounded-lg text-center">
                      <span className="block text-xl font-extrabold">{results.confusion_matrix.false_negatives.toLocaleString()}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">False Neg (FN)</span>
                    </div>
                    <div className="bg-green-50 border border-green-200 text-green-800 p-6 rounded-lg text-center shadow-inner">
                      <span className="block text-xl font-extrabold">{results.confusion_matrix.true_positives.toLocaleString()}</span>
                      <span className="text-[10px] uppercase font-bold tracking-wider opacity-70">True Pos (TP)</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-3 rounded-lg text-xs text-gray-500 bg-gray-50 border border-gray-100">
                  <strong>Evaluation Footprint:</strong> Processed <strong>{results.total_test_samples.toLocaleString()}</strong> distinct sample records. Green panels show secure hits. Red panels track system blind spots or false consumer friction.
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}