import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import SinglePrediction from './pages/SinglePrediction';
import BatchPrediction from './pages/BatchPrediction';
import MetricsInsights from './pages/MetricsInsights';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans antialiased">
        {/* Persistent Navigation Dock */}
        <Sidebar />

        {/* Dynamic Display Layout View */}
        <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
          <header className="bg-slate-900/40 border-b border-slate-800/80 px-8 py-5 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-white tracking-tight uppercase">Inference Command Core</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mt-0.5">Distributed Machine Learning Interface Layer</p>
            </div>
          </header>

          <main className="flex-1 p-8 overflow-y-auto">
            <Routes>
              <Route path="/" element={<SinglePrediction />} />
              <Route path="/batch" element={<BatchPrediction />} />
              <Route path="/metrics" element={<MetricsInsights />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;