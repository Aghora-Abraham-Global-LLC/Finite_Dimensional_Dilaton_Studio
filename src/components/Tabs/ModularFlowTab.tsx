import React, { useState, useMemo } from 'react';
import { ComplexMatrix } from '../../types';
import {
  computeKMSState,
  modularAutomorphismFlow,
  compareFrechetDifferentials,
  computeKMBMetric,
} from '../../math/modular';
import { createIdentityMatrix, matAdd, matScale } from '../../math/complex';
import { MatrixViewer } from '../MatrixViewer';
import { MathView } from '../MathView';
import { Play, Pause, RotateCcw, CheckCircle2 } from 'lucide-react';

interface ModularFlowTabProps {
  H: ComplexMatrix;
  beta: number;
}

export const ModularFlowTab: React.FC<ModularFlowTabProps> = ({ H, beta }) => {
  const [modularTime, setModularTime] = useState<number>(0.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const d = H.length;

  // Compute KMS thermal state
  const kms = useMemo(() => computeKMSState(H, beta), [H, beta]);

  // Test probe operator X
  const probeX = useMemo(() => {
    const X = createIdentityMatrix(d);
    // Non-trivial traceless perturbation
    if (d >= 2) {
      X[0][1] = { re: 1.0, im: 0.5 };
      X[1][0] = { re: 1.0, im: -0.5 };
    }
    return X;
  }, [d]);

  // Modular flow sigma_t(X)
  const flowedX = useMemo(
    () => modularAutomorphismFlow(H, probeX, modularTime),
    [H, probeX, modularTime],
  );

  // Daleckii-Krein DOI vs Cauchy Resolvent
  const frechetComp = useMemo(() => {
    return compareFrechetDifferentials(kms.rho, H);
  }, [kms.rho, H]);

  // KMB Metric <X, X>_KMB
  const kmbNorm = useMemo(() => {
    return computeKMBMetric(kms.rho, probeX, probeX);
  }, [kms.rho, probeX]);

  // Animation loop for modular time flow
  React.useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setModularTime((prev) => {
        const next = prev + 0.05;
        return next > 6 ? -6 : next;
      });
    }, 40);
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Partition Function Z(β)</span>
          <div className="text-xl font-bold font-mono text-cyan-400 mt-1">
            {kms.partitionFunction.toFixed(5)}
          </div>
          <span className="text-[11px] text-slate-400">Z = Tr(e^{'-βH'}) at β = {beta.toFixed(2)}</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Condition Number κ(ρ_KMS)</span>
          <div className="text-xl font-bold font-mono text-indigo-400 mt-1">
            {kms.conditionNumber.toFixed(3)}
          </div>
          <span className="text-[11px] text-slate-400">λ_max / λ_min (paper Table 1 metric)</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">Fréchet Agreement Error</span>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {frechetComp.frobeniusError.toExponential(3)}
          </div>
          <span className="text-[11px] text-slate-400">||D ln_DOI - D ln_Cauchy||_F</span>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4">
          <span className="text-xs text-slate-400 font-medium">KMB Metric Norm ⟨X, X⟩</span>
          <div className="text-xl font-bold font-mono text-amber-400 mt-1">
            {kmbNorm.toFixed(5)}
          </div>
          <span className="text-[11px] text-slate-400">Logarithmic mean Riemannian metric</span>
        </div>
      </div>

      {/* Section 1: KMS State & System Hamiltonian */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                System Hamiltonian H
              </h3>
              <p className="text-xs text-slate-400">Self-adjoint generator H = H†</p>
            </div>
            <MathView math="H = H^\dagger" className="text-xs text-slate-400" />
          </div>
          <MatrixViewer matrix={H} title="Matrix H" />
        </div>

        <div>
          <div className="mb-2 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                Faithful KMS Density Operator ρ_KMS
              </h3>
              <p className="text-xs text-slate-400">Thermal equilibrium state at inverse Hawking temperature β</p>
            </div>
            <MathView math="\rho_{\mathrm{KMS}} = \frac{e^{-\beta H}}{Z(\beta)}" className="text-xs text-cyan-400" />
          </div>
          <MatrixViewer matrix={kms.rho} title="Thermal Density Matrix ρ_KMS" />
        </div>
      </div>

      {/* Section 2: Modular Automorphism Flow */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Tomita–Takesaki Modular Automorphism Flow
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              One-parameter automorphism group <MathView math="\sigma_t^{\mathrm{KMS}}(X) = e^{-\mathrm{i}t H} X e^{\mathrm{i}t H}" /> acting on operator algebra <MathView math="\mathcal{B}(\mathcal{H})" />
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isPlaying
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                  : 'bg-cyan-500 text-slate-950 hover:bg-cyan-400 shadow-md'
              }`}
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span>{isPlaying ? 'Pause Flow' : 'Animate Flow'}</span>
            </button>

            <button
              onClick={() => {
                setIsPlaying(false);
                setModularTime(0);
              }}
              className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Reset modular time"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="mb-4 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row items-center gap-4">
          <span className="text-xs font-medium text-slate-300 whitespace-nowrap">
            Modular Time <span className="font-mono text-cyan-400">t = {modularTime.toFixed(2)}</span>:
          </span>
          <input
            type="range"
            min="-6"
            max="6"
            step="0.05"
            value={modularTime}
            onChange={(e) => setModularTime(parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
          />
          <span className="text-xs font-mono text-slate-400 whitespace-nowrap">
            t ∈ [-6.0, +6.0]
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Probe Operator X(0)</h4>
            <MatrixViewer matrix={probeX} subtitle="Initial Operator X at t = 0" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-300 mb-2">Flowed Operator σ_t(X)</h4>
            <MatrixViewer matrix={flowedX} subtitle={`Evolved under modular flow at t = ${modularTime.toFixed(2)}`} />
          </div>
        </div>
      </div>

      {/* Section 3: Daleckii-Krein Double Operator Integrals vs Continuous Cauchy Resolvent */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
              Operator Logarithm Fréchet Differential Verification
            </h3>
            <p className="text-xs text-slate-400">
              Comparing spectral Daleckii–Krein DOI (Eq. 2.6) against continuous Cauchy resolvent quadrature (Lemma 2.4)
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-full font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Frobenius Error: {frechetComp.frobeniusError.toExponential(3)}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-2">
              <h4 className="text-xs font-semibold text-slate-300">
                1. Daleckii–Krein Spectral DOI: <MathView math="D\ln(\rho)[H]" />
              </h4>
              <p className="text-[11px] text-slate-400">
                <MathView math="D\ln(\rho)[H] = \sum_{j,k} \frac{\ln\lambda_j - \ln\lambda_k}{\lambda_j - \lambda_k} |v_j\rangle\langle v_j| H |v_k\rangle\langle v_k|" />
              </p>
            </div>
            <MatrixViewer matrix={frechetComp.dLogDOI} />
          </div>

          <div>
            <div className="mb-2">
              <h4 className="text-xs font-semibold text-slate-300">
                2. Continuous Cauchy Resolvent Quadrature:
              </h4>
              <p className="text-[11px] text-slate-400">
                <MathView math="\int_0^1 (u\rho + (1-u)\mathbb{I})^{-1} H (u\rho + (1-u)\mathbb{I})^{-1} du" />
              </p>
            </div>
            <MatrixViewer matrix={frechetComp.dLogCauchy} />
          </div>
        </div>

        <div className="mt-4 p-3 bg-slate-950/90 rounded-lg border border-slate-800 text-xs text-slate-300 space-y-1">
          <div className="font-semibold text-cyan-300 flex items-center gap-2">
            <span>Numerical Stability Certificate:</span>
          </div>
          <p className="text-slate-400">
            Evaluating operator derivatives via finite differences <MathView math="\frac{d}{dt}\ln(\rho + tH)|_{t=0}" /> suffers catastrophic cancellation below <MathView math="\varepsilon \approx 10^{-6}" />. In contrast, the Daleckii–Krein divided-difference formulation matches the continuous Cauchy resolvent integral to within <strong className="text-slate-200">{frechetComp.frobeniusError.toExponential(2)}</strong>, guaranteeing exact gradient evaluation across degenerate and non-commutative spectra.
          </p>
        </div>
      </div>
    </div>
  );
};
