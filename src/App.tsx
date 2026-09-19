import React, { useState, useMemo } from 'react';
import { Header, ActiveTab } from './components/Header';
import { ModularFlowTab } from './components/Tabs/ModularFlowTab';
import { DissipationTab } from './components/Tabs/DissipationTab';
import { PetzRecoveryTab } from './components/Tabs/PetzRecoveryTab';
import { MirrorDescentTab } from './components/Tabs/MirrorDescentTab';
import { HolographicDilatonTab } from './components/Tabs/HolographicDilatonTab';
import { BenchmarksTab } from './components/Tabs/BenchmarksTab';
import { PaperReaderTab } from './components/Tabs/PaperReaderTab';
import { generateModelHamiltonian } from './math/modular';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('modular');
  const [dimension, setDimension] = useState<number>(4);
  const [beta, setBeta] = useState<number>(1.0);
  const [gammaDamp, setGammaDamp] = useState<number>(0.15);
  const [errorRate, setErrorRate] = useState<number>(0.25);

  // Generate model Hamiltonian based on dimension
  const H = useMemo(() => {
    return generateModelHamiltonian(dimension, 1.0, 0.5);
  }, [dimension]);

  const handleReset = () => {
    setDimension(4);
    setBeta(1.0);
    setGammaDamp(0.15);
    setErrorRate(0.25);
  };

  const handlePresetSelect = (preset: {
    d: number;
    b: number;
    g: number;
    p: number;
    tab?: ActiveTab;
  }) => {
    setDimension(preset.d);
    setBeta(preset.b);
    setGammaDamp(preset.g);
    setErrorRate(preset.p);
    if (preset.tab) setActiveTab(preset.tab);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        dimension={dimension}
        setDimension={setDimension}
        beta={beta}
        setBeta={setBeta}
        gammaDamp={gammaDamp}
        setGammaDamp={setGammaDamp}
        errorRate={errorRate}
        setErrorRate={setErrorRate}
        onReset={handleReset}
      />

      {/* Preset Quick Actions Bar */}
      <div className="border-b border-slate-900 bg-slate-950/40 py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 overflow-x-auto no-scrollbar text-xs">
          <span className="text-slate-400 font-medium whitespace-nowrap">
            Paper Presets:
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                handlePresetSelect({ d: 4, b: 1.0, g: 0.15, p: 0.25, tab: 'benchmarks' })
              }
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
            >
              Table 1 Benchmark Default (d=4, β=1.0)
            </button>
            <button
              onClick={() =>
                handlePresetSelect({ d: 2, b: 1.0, g: 0.15, p: 0.2, tab: 'modular' })
              }
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
            >
              Spin-1/2 Qubit Horizon (d=2)
            </button>
            <button
              onClick={() =>
                handlePresetSelect({ d: 3, b: 1.2, g: 0.15, p: 0.25, tab: 'dissipation' })
              }
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
            >
              Spin-1 Quadrupole (d=3)
            </button>
            <button
              onClick={() =>
                handlePresetSelect({ d: 8, b: 1.0, g: 0.15, p: 0.3, tab: 'petz' })
              }
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
            >
              Dilaton Horizon Truncation (d=8)
            </button>
            <button
              onClick={() =>
                handlePresetSelect({ d: 4, b: 2.5, g: 0.1, p: 0.25, tab: 'dilaton' })
              }
              className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 whitespace-nowrap transition-colors"
            >
              Near-Extremal Cold Horizon (β=2.5)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-6">
        {activeTab === 'modular' && <ModularFlowTab H={H} beta={beta} />}
        {activeTab === 'dissipation' && (
          <DissipationTab H={H} beta={beta} gammaDamp={gammaDamp} />
        )}
        {activeTab === 'petz' && (
          <PetzRecoveryTab H={H} beta={beta} errorRate={errorRate} />
        )}
        {activeTab === 'mirror' && (
          <MirrorDescentTab H={H} beta={beta} errorRate={errorRate} />
        )}
        {activeTab === 'dilaton' && <HolographicDilatonTab beta={beta} />}
        {activeTab === 'benchmarks' && <BenchmarksTab />}
        {activeTab === 'paper' && <PaperReaderTab />}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 px-4 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <div>
            <div className="text-slate-300 font-semibold">
              Dilaton Studio — Finite-Dimensional Modular Theory Simulation Engine (v4.0.0)
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5 flex flex-wrap items-center gap-1.5 justify-center md:justify-start">
              <span>BhutaDamaraSena R&D Labs • Aghora Abraham Global LLC</span>
              <span>•</span>
              <a
                href="https://doi.org/10.5281/zenodo.22831838"
                target="_blank"
                rel="noreferrer"
                className="text-cyan-400 hover:text-cyan-300 underline font-mono"
              >
                DOI: 10.5281/zenodo.22831838
              </a>
              <span>•</span>
              <a
                href="https://creativecommons.org/licenses/by/4.0/"
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:text-amber-300 font-medium"
              >
                Zenodo Open Software (CC BY 4.0)
              </a>
              <span>•</span>
              <a
                href="https://github.com/Aghora-Abraham-Global-LLC/Finite_Dimensional_Dilaton_Studio"
                target="_blank"
                rel="noreferrer"
                className="text-slate-300 hover:text-white underline font-mono"
              >
                GitHub: Aghora-Abraham-Global-LLC
              </a>
            </p>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-slate-400">IEEE 754 Double Precision Engine</span>
            <span>•</span>
            <span className="text-cyan-400">Tomita–Takesaki Modular Group</span>
            <span>•</span>
            <span className="text-emerald-400">Junge–Kraft–Renner–Sutter Twirled Petz Map</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
