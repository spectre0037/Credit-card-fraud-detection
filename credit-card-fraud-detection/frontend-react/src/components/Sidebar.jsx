import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldAlert, Sliders, FileSpreadsheet, BarChart3 } from 'lucide-react';

export default function Sidebar() {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const links = [
    { path: '/', label: 'Single Scoring', icon: Sliders },
    { path: '/batch', label: 'Batch Processing', icon: FileSpreadsheet },
    { path: '/metrics', label: 'System Metrics', icon: BarChart3 },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between">
      <div className="p-6">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-6">
          <ShieldAlert className="text-red-500 h-8 w-8" />
          <div>
            <h1 className="text-md font-black tracking-wider text-white uppercase">FraudGuard</h1>
            <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">v1.0.0 Stable</span>
          </div>
        </div>
        
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link key={link.path} to={link.path} className={`flex items-center gap-3 px-4 py-3 rounded-lg font-bold text-sm transition-all ${
                isActive(link.path) ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}>
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800 text-center text-[10px] font-mono text-slate-600 font-bold uppercase tracking-wider">
        FastAPI Connected
      </div>
    </aside>
  );
}