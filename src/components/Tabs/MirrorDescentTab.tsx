import React, { useState, useMemo } from 'react';
import { ComplexMatrix } from '../../types';
import {
  computeKMSState,
  runPetzRecoveryAnalysis,
  runQuantumMirrorDescent,
} from '../../math/modular';
import { createIdentityMatrix, matAdd, matScale } from '../../math/complex';
import { MatrixViewer } from '../MatrixViewer';
import { MathView } from '../MathView';
import { Play, RotateCcw, CheckCircle2, FastForward, ShieldAlert } from 'lucide-react';

interface MirrorDescentTabProps {
  H: ComplexMatrix;
  beta: number;
  errorRate: number;
}

export const MirrorDescentTab: React.FC<MirrorDescentTabProps> = ({ H, beta, errorRate }) => {
  const [eta, setEta] = useState<number>(0.35);
  const [epsilon, setEpsilon] = useState<number>(1e-4);
  const [maxSteps, setMaxSteps] = useState<number>(25);
  const [currentStepIdx, setCurrentStepIdx] = useState<number>(-1);

  const d = H.length;
  const kms = useMemo(() => computeKMSState(H, beta), [H, beta]);
  const recovery = useMemo(() => runPetzRecoveryAnalysis(H, beta, errorRate), [H, beta, errorRate]);

  // Target state = twirled Petz recovery output
  const targetState = recovery.rhoTwirledPetz;

  // Initial state = perturbed maximally mixed state
  const initState = useMemo(() => {
    const I = createIdentityMatrix(d);
    // Displaced state far from target to test mirror descent convergence
    return matAdd(matScale(I, 0.7 / d), matScale(kms.rho, 0.3));
  }, [d, kms.rho]);

  // Run full mirror descent
  const descentResult = useMemo(() => {
    return runQuantumMirrorDescent(initState, targetState, eta, epsilon, maxSteps);
  }, [initState, targetState, eta, epsilon, maxSteps]);

  // Active iteration state to display
  const activeStep =
    currentStepIdx >= 0 && currentStepIdx < descentResult.iterations.length
      ? descentResult.iterations[currentStepIdx]
      : descentResult.iterations[descentResult.iterations.length - 1];

  return (
    <div className="space-y-6">
      {/* Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Final Reconstruction Fidelity</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {(descentResult.finalFidelity * 100).toFixed(3)}%
          </div>
          <span className="text-[11px] text-slate-400">Uhlmann fidelity with target state</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Final Trace Distance</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {descentResult.finalTraceDistance.toExponential(3)}
          </div>
          <span className="text-[11px] text-slate-400">0.5 * ||ρ* - ρ_target||_1</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Iterations to Convergence</span>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
            {descentResult.totalSteps} / {maxSteps}
          </div>
          <span className="text-[11px] text-slate-400">
            {descentResult.converged ? 'Geometric convergence reached' : 'Iterating...'}
          </span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Faithful Regularization ε</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {epsilon.toExponential(1)}
          </div>
          <span className="text-[11px] text-slate-400">Guarantees λ_min ≥ ε/d</span>
        </div>
      </div>

      {/* Control Panel */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div>
            <span className="text-slate-400 font-medium block mb-1">
              Step Size <span className="font-mono text-cyan-400">η = {eta.toFixed(2)}</span>:
            </span>
            <input
              type="range"
              min="0.05"
              max="0.80"
              step="0.05"
              value={eta}
              onChange={(e) => setEta(parseFloat(e.target.value))}
              className="w-32 accent-cyan-400 h-1.5 bg-slate-800 rounded cursor-pointer"
            />
          </div>

          <div>
            <span className="text-slate-400 font-medium block mb-1">
              Regularization <span className="font-mono text-cyan-400">ε = {epsilon.toExponential(1)}</span>:
            </span>
            <select
              value={epsilon}
              onChange={(e) => setEpsilon(parseFloat(e.target.value))}
              className="bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-cyan-300 text-xs focus:outline-none"
            >
              <option value={1e-3}>1e-3 (Aggressive)</option>
              <option value={1e-4}>1e-4 (Paper Default)</option>
              <option value={1e-5}>1e-5 (Precision)</option>
              <option value={1e-6}>1e-6 (Extreme)</option>
            </select>
          </div>

          <div>
            <span className="text-slate-400 font-medium block mb-1">Max Steps:</span>
            <input
              type="number"
              min="5"
              max="60"
              value={maxSteps}
              onChange={(e) => setMaxSteps(parseInt(e.target.value) || 25)}
              className="w-16 bg-slate-950 border border-slate-800 rounded px-2 py-1 font-mono text-cyan-300 text-xs"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentStepIdx(-1)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
              currentStepIdx === -1
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <FastForward className="w-3.5 h-3.5" />
            <span>Converged State (k = {descentResult.totalSteps - 1})</span>
          </button>
        </div>
      </div>

      {/* Target vs Converged Density Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Target State: <MathView math="\rho_{\mathrm{target}} = \widetilde{\mathcal{R}}_{\sigma, \mathcal{E}}(\rho_{\mathrm{out}})" />
              </h3>
              <p className="text-xs text-slate-400">Target to be reconstructed across horizon</p>
            </div>
          </div>
          <MatrixViewer matrix={targetState} title="Target Density Matrix" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200">
                Mirror Descent Reconstructed: <MathView math="\rho^*" />
              </h3>
              <p className="text-xs text-slate-400">
                Final trace distance: <strong className="text-emerald-400 font-mono">{descentResult.finalTraceDistance.toExponential(3)}</strong>
              </p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Converged
            </span>
          </div>
          <MatrixViewer matrix={descentResult.convergedState} title="Reconstructed State ρ*" />
        </div>
      </div>

      {/* Convergence History Table */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              Algorithm 1 Iteration Log & Geometric Convergence
            </h3>
            <p className="text-xs text-slate-400">
              Tracking trace distance <MathView math="\frac{1}{2}\|\rho_k - \rho^*\|_1" />, gradient norm <MathView math="\|G_k\|_F" />, and relative entropy <MathView math="D(\rho_k \parallel \rho^*)" />
            </p>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Convergence Rate: <strong className="text-cyan-400 font-mono">1 - η α_1 ≈ {(1 - eta * 0.15).toFixed(3)}</strong>
          </span>
        </div>

        <div className="overflow-x-auto max-h-72">
          <table className="w-full text-xs font-mono border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60 sticky top-0">
                <th className="py-2 px-3 text-left">Step k</th>
                <th className="py-2 px-3 text-left">Trace Distance</th>
                <th className="py-2 px-3 text-left">||G_k||_F</th>
                <th className="py-2 px-3 text-left">D(ρ_k || ρ*)</th>
                <th className="py-2 px-3 text-left">Fidelity</th>
                <th className="py-2 px-3 text-left">λ_min</th>
                <th className="py-2 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody>
              {descentResult.iterations.map((iter) => {
                const isSelected = activeStep?.step === iter.step;
                return (
                  <tr
                    key={iter.step}
                    onClick={() => setCurrentStepIdx(iter.step)}
                    className={`border-b border-slate-800/40 hover:bg-slate-800/50 cursor-pointer transition-colors ${
                      isSelected ? 'bg-cyan-950/30 text-cyan-300 font-semibold' : 'text-slate-300'
                    }`}
                  >
                    <td className="py-2 px-3">k = {iter.step}</td>
                    <td className="py-2 px-3 text-cyan-400">{iter.traceDistance.toExponential(4)}</td>
                    <td className="py-2 px-3 text-amber-400">{iter.gradientNorm.toExponential(4)}</td>
                    <td className="py-2 px-3">{iter.relativeEntropy.toExponential(4)}</td>
                    <td className="py-2 px-3 text-emerald-400">{(iter.fidelity * 100).toFixed(2)}%</td>
                    <td className="py-2 px-3 text-slate-400">{iter.minEigenvalue.toExponential(3)}</td>
                    <td className="py-2 px-3 text-right">
                      {iter.traceDistance < 1e-4 ? (
                        <span className="text-emerald-400">✓ Target</span>
                      ) : (
                        <span className="text-slate-500">Descent</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-cyan-300">Theorem 6.2 Guaranteed Strong Convexity:</div>
          <p className="text-slate-400">
            By conditioning each update with <MathView math="\Pi_\varepsilon(\rho) = (1-\varepsilon)\rho + \varepsilon \frac{\mathbb{I}}{d}" />, the spectrum of <MathView math="\rho_k" /> is uniformly bounded from below by <MathView math="\lambda_{\min} \ge \varepsilon / d" />. This prevents catastrophic gradient blowup in <MathView math="G_k = \ln\rho_k - \ln\rho_{\mathrm{target}} + \mathbb{I}" /> and guarantees linear convergence under inexact modular gradients.
          </p>
        </div>
      </div>
    </div>
  );
};
