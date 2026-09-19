import React, { useState, useMemo } from 'react';
import { MathView } from '../MathView';
import { Layers, Orbit, Sparkles, Compass, AlertCircle } from 'lucide-react';

interface HolographicDilatonTabProps {
  beta: number;
}

export const HolographicDilatonTab: React.FC<HolographicDilatonTabProps> = ({ beta }) => {
  const [time, setTime] = useState<number>(1.2); // in units of Page time
  const [GN, setGN] = useState<number>(0.05); // Newton constant
  const [phi0, setPhi0] = useState<number>(2.0); // Ground value of dilaton
  const [cMatter, setCMatter] = useState<number>(12); // CFT central charge

  // Evaporation and Island thermodynamics
  const tPage = 1.0; // normalized Page time
  const hasIsland = time >= tPage;

  // Horizon dilaton Phi_h = Phi_0 + 2*pi / beta
  const phiHorizon = phi0 + (2.0 * Math.PI) / beta;
  const sBlackHole = phiHorizon / (4.0 * GN);

  // Hawking radiation entropy without island: S_Hawking = (c / 3) * (pi / beta) * time
  const sHawkingRate = (cMatter / 3.0) * (Math.PI / beta);
  const sNoIsland = sHawkingRate * time;

  // Island entropy: S_island = Phi(QES) / (4*G_N) + S_CFT
  // As black hole evaporates, area shrinks: Phi(QES)(t) = phiHorizon - decay * time
  const sWithIsland = Math.max(sBlackHole - 0.25 * sHawkingRate * (time - tPage), 0.1 * sBlackHole);

  // Page curve generalized entropy
  const sGen = Math.min(sNoIsland, sWithIsland);

  // SVG dimensions for Page curve
  const svgW = 600;
  const svgH = 220;
  const pL = 55;
  const pR = 25;
  const pT = 20;
  const pB = 35;

  const maxT = 2.5;
  const maxS = sBlackHole * 1.6;

  const getX = (t: number) => pL + (t / maxT) * (svgW - pL - pR);
  const getY = (s: number) => pB + (1 - s / maxS) * (svgH - pT - pB);

  // Generate Page curve points
  const pointsNoIsland: string[] = [];
  const pointsIsland: string[] = [];
  const pointsPage: string[] = [];

  for (let step = 0; step <= 50; step++) {
    const t = (step / 50) * maxT;
    const s1 = sHawkingRate * t;
    const s2 = sBlackHole - 0.25 * sHawkingRate * (t - tPage);
    const sMin = Math.min(s1, Math.max(s2, 0.1 * sBlackHole));

    pointsNoIsland.push(`${step === 0 ? 'M' : 'L'} ${getX(t)} ${getY(s1)}`);
    pointsIsland.push(`${step === 0 ? 'M' : 'L'} ${getX(t)} ${getY(Math.max(s2, 0.1 * sBlackHole))}`);
    pointsPage.push(`${step === 0 ? 'M' : 'L'} ${getX(t)} ${getY(sMin)}`);
  }

  return (
    <div className="space-y-6">
      {/* Top Holographic Parameters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Bekenstein–Hawking Area S_BH</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {sBlackHole.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">Φ(horizon) / (4 G_N)</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Current Entanglement Entropy</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {sGen.toFixed(2)}
          </div>
          <span className="text-[11px] text-slate-400">
            {hasIsland ? 'Island phase (Finite & decreasing)' : 'Early Hawking phase (Increasing)'}
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Horizon Dilaton Φ_h</span>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
            {phiHorizon.toFixed(3)}
          </div>
          <span className="text-[11px] text-slate-400">Φ_0 + 2π/β (JT 2D coupling)</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Quantum Extremal Island</span>
          <div className={`text-base font-bold font-mono mt-1 ${hasIsland ? 'text-emerald-400' : 'text-amber-400'}`}>
            {hasIsland ? 'Nucleated (t > t_Page)' : 'Absent (t < t_Page)'}
          </div>
          <span className="text-[11px] text-slate-400">
            {hasIsland ? 'Interior decodable via twirled Petz' : 'Information trapped in horizon'}
          </span>
        </div>
      </div>

      {/* Spacetime & Quantum Extremal Surface Diagram */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              2D Jackiw–Teitelboim (JT) Dilaton Geometry & Entanglement Wedge
            </h3>
            <p className="text-xs text-slate-400">
              Coupling AdS_2 dilaton gravity to asymptotically flat radiation reservoir <MathView math="\mathcal{R}" />
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-slate-400">Status:</span>
            {hasIsland ? (
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-semibold">
                Island Nucleated (Reconstruction Active)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Pre-Page Time (Radiation Mixed)
              </span>
            )}
          </div>
        </div>

        {/* Interactive Spacetime Canvas Representation */}
        <div className="relative w-full h-56 bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex items-center justify-center">
          {/* Black Hole Interior */}
          <div
            className={`absolute left-0 top-0 bottom-0 transition-all duration-300 ${
              hasIsland
                ? 'w-1/3 bg-gradient-to-r from-purple-950/60 to-cyan-950/40 border-r-2 border-cyan-400'
                : 'w-1/3 bg-gradient-to-r from-slate-950 to-slate-900 border-r-2 border-dashed border-rose-500/60'
            }`}
          >
            <div className="p-3 text-xs">
              <div className="font-semibold text-slate-200">Black Hole Interior</div>
              <div className="text-[11px] text-slate-400 mt-1">AdS_2 metric <MathView math="ds^2 = -(r^2 - r_h^2)dt^2 + \frac{dr^2}{r^2 - r_h^2}" /></div>

              {hasIsland && (
                <div className="mt-4 p-2 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[11px] animate-pulse">
                  <strong>Quantum Extremal Island I</strong>
                  <div className="text-[10px] text-slate-300">Reconstructed via JLMS relation & Twirled Petz</div>
                </div>
              )}
            </div>
          </div>

          {/* Event Horizon */}
          <div className="absolute left-1/3 top-0 bottom-0 flex flex-col items-center justify-center z-10">
            <div className="bg-slate-900/90 text-slate-300 border border-slate-700 px-2 py-1 rounded text-[11px] font-mono shadow-md -translate-x-1/2">
              Horizon r = r_h
            </div>
          </div>

          {/* Exterior Bath Region */}
          <div className="absolute left-1/3 right-0 top-0 bottom-0 bg-gradient-to-r from-slate-900/40 via-slate-900/20 to-slate-950 p-4 flex flex-col justify-between">
            <div className="text-right text-xs">
              <span className="font-semibold text-slate-200">External Radiation Bath R</span>
              <p className="text-[11px] text-slate-400">Asymptotically Flat Minkowski Bath (Hawking Quanta)</p>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-slate-400">
              <span>Boundary Interface</span>
              <span className="text-cyan-400">Hawking Flux: dS_CFT/dt = {sHawkingRate.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Time Slider */}
        <div className="mt-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-center gap-4 text-xs">
          <span className="text-slate-300 font-medium whitespace-nowrap">
            Normalized Evaporation Time: <span className="font-mono text-cyan-400">t / t_Page = {time.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min="0.1"
            max="2.4"
            step="0.05"
            value={time}
            onChange={(e) => setTime(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="font-mono text-slate-400 whitespace-nowrap">
            {hasIsland ? 'Page Transition Passed ✓' : 'Early Hawking Evaporation'}
          </span>
        </div>
      </div>

      {/* Page Curve Plot */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              The Unitary Page Curve Resolution
            </h3>
            <p className="text-xs text-slate-400">
              Hawking semiclassical growth (dashed rose) vs Island prescription (solid cyan)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 bg-cyan-400 inline-block" />
              <span className="text-slate-200">Page Curve S_gen</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-0.5 border-b border-dashed border-rose-400 inline-block" />
              <span className="text-slate-400">Hawking Unitarity Violation</span>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <svg
            viewBox={`0 0 ${svgW} ${svgH}`}
            className="w-full h-auto bg-slate-950/90 rounded-lg border border-slate-800/80 font-mono text-[10px]"
          >
            {/* Grid */}
            {[0.25, 0.5, 0.75, 1.0].map((ratio) => {
              const y = pB + (1 - ratio) * (svgH - pT - pB);
              return (
                <g key={ratio}>
                  <line
                    x1={pL}
                    y1={y}
                    x2={svgW - pR}
                    y2={y}
                    stroke="rgba(51, 65, 85, 0.3)"
                    strokeDasharray="3 3"
                  />
                  <text x={pL - 8} y={y + 3} fill="#64748b" textAnchor="end">
                    {(maxS * ratio).toFixed(1)}
                  </text>
                </g>
              );
            })}

            {/* Page time vertical line */}
            <line
              x1={getX(tPage)}
              y1={pT}
              x2={getX(tPage)}
              y2={svgH - pB}
              stroke="#fbbf24"
              strokeDasharray="4 2"
              strokeWidth="1.5"
            />
            <text x={getX(tPage)} y={pT - 5} fill="#fbbf24" textAnchor="middle" fontSize="10">
              Page Time t_Page
            </text>

            {/* Current time marker */}
            <circle cx={getX(time)} cy={getY(sGen)} r="5" fill="#06b6d4" stroke="#ffffff" strokeWidth="2" />

            {/* Semiclassical Hawking Path (dashed rose) */}
            <path d={pointsNoIsland.join(' ')} fill="none" stroke="#fb7185" strokeWidth="1.8" strokeDasharray="3 3" />

            {/* Unitary Page Curve (Solid Cyan) */}
            <path d={pointsPage.join(' ')} fill="none" stroke="#06b6d4" strokeWidth="2.5" />
          </svg>
        </div>

        {/* JLMS Identity Callout */}
        <div className="mt-4 p-4 bg-slate-950/90 border border-slate-800 rounded-xl">
          <h4 className="text-xs font-bold text-slate-200 mb-1 flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            The Jafferis–Lewkowycz–Maldacena–Suh (JLMS) Relation (Eq. 1.1)
          </h4>
          <div className="my-2 p-2.5 bg-slate-900 rounded-lg text-cyan-300 font-mono text-xs overflow-x-auto text-center">
            <MathView math="K_{\mathrm{boundary}} = \frac{\hat{\Phi}(\mathrm{QES})}{4 G_N} + K_{\mathrm{bulk}}(\Sigma_{\mathrm{island}})" />
          </div>
          <p className="text-xs text-slate-400">
            The boundary modular Hamiltonian <MathView math="K_{\mathrm{boundary}} = -\ln\rho_{\mathcal{R}}" /> equals the quantum extremal surface area operator plus the bulk modular Hamiltonian of the island. After the Page time, radiation degrees of freedom invert the horizon encoding channel <MathView math="\mathcal{E}" /> through the twirled Petz recovery map, allowing complete quantum reconstruction of infalling microstates.
          </p>
        </div>
      </div>
    </div>
  );
};
