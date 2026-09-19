import React from 'react';
import { Sparkles, BookOpen, Layers, Activity, Cpu, RotateCcw, ShieldCheck, Compass, Github } from 'lucide-react';

export type ActiveTab =
  | 'modular'
  | 'dissipation'
  | 'petz'
  | 'mirror'
  | 'dilaton'
  | 'benchmarks'
  | 'paper';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  dimension: number;
  setDimension: (d: number) => void;
  beta: number;
  setBeta: (b: number) => void;
  gammaDamp: number;
  setGammaDamp: (g: number) => void;
  errorRate: number;
  setErrorRate: (e: number) => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  dimension,
  setDimension,
  beta,
  setBeta,
  gammaDamp,
  setGammaDamp,
  errorRate,
  setErrorRate,
  onReset,
}) => {
  const tabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'modular', label: 'Modular Flow & DOI', icon: <Compass className="w-4 h-4" /> },
    { id: 'dissipation', label: 'Dissipation & mLSI', icon: <Activity className="w-4 h-4" /> },
    { id: 'petz', label: 'Petz Recovery & DPI', icon: <ShieldCheck className="w-4 h-4" /> },
    { id: 'mirror', label: 'Mirror Descent', icon: <Cpu className="w-4 h-4" />, badge: 'Alg 1' },
    { id: 'dilaton', label: 'JT Dilaton & QES', icon: <Layers className="w-4 h-4" /> },
    { id: 'benchmarks', label: 'Table 1 Benchmarks', icon: <Sparkles className="w-4 h-4" />, badge: 'Live' },
    { id: 'paper', label: 'Paper & Proofs', icon: <BookOpen className="w-4 h-4" /> },
  ];

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 p-0.5 shadow-lg shadow-cyan-500/20">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <span className="font-serif italic font-bold text-cyan-400 text-xl">D</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-slate-100 flex items-center gap-2">
                Dilaton Studio <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">v4.0</span>
              </h1>
              <span className="hidden sm:inline text-xs text-slate-400">|</span>
              <span className="hidden sm:inline text-xs text-slate-400 font-medium">
                Modular Theory & Holographic Reconstruction
              </span>
            </div>
            <p className="text-[11px] text-slate-400 flex flex-wrap items-center gap-x-2">
              <span>Ghulam-e-Shah-e-Unmani</span>
              <span>•</span>
              <span>BhutaDamaraSena R&D Labs</span>
              <span>•</span>
              <a
                href="https://doi.org/10.5281/zenodo.22831838"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors font-mono"
              >
                DOI: 10.5281/zenodo.22831838
              </a>
            </p>
          </div>
        </div>

        {/* Global Simulation Parameters */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-xl text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Dim d:</span>
            <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
              {[2, 3, 4, 8].map((d) => (
                <button
                  key={d}
                  onClick={() => setDimension(d)}
                  className={`px-2 py-0.5 rounded font-mono transition-all ${
                    dimension === d
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">β:</span>
            <input
              type="number"
              min="0.1"
              max="5.0"
              step="0.1"
              value={beta}
              onChange={(e) => setBeta(parseFloat(e.target.value) || 1.0)}
              className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 font-mono text-cyan-300 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">γ:</span>
            <input
              type="number"
              min="0.01"
              max="1.0"
              step="0.05"
              value={gammaDamp}
              onChange={(e) => setGammaDamp(parseFloat(e.target.value) || 0.15)}
              className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 font-mono text-cyan-300 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">p:</span>
            <input
              type="number"
              min="0.0"
              max="0.8"
              step="0.05"
              value={errorRate}
              onChange={(e) => setErrorRate(parseFloat(e.target.value) || 0.25)}
              className="w-14 bg-slate-950 border border-slate-800 rounded px-1.5 py-0.5 font-mono text-cyan-300 text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            onClick={onReset}
            title="Reset parameters to paper defaults"
            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <a
            href="https://github.com/Aghora-Abraham-Global-LLC/Finite_Dimensional_Dilaton_Studio"
            target="_blank"
            rel="noreferrer"
            title="View GitHub Repository"
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-300 hover:text-cyan-300 transition-colors text-[11px] font-medium"
          >
            <Github className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Repo</span>
          </a>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-slate-900/60 pt-1 pb-1.5">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.badge && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-semibold'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
