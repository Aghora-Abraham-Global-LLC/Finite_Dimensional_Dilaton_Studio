import {
  Complex,
  ComplexMatrix,
  KMSStateResult,
  DaleckiiKreinResult,
  AlickiJumpOperator,
  DissipationResult,
  PetzRecoveryResult,
  MirrorDescentResult,
  MirrorDescentIteration,
  DimensionBenchmark,
} from '../types';
import {
  c,
  cAdd,
  cSub,
  cMul,
  cScale,
  cConj,
  createZeroMatrix,
  createIdentityMatrix,
  hermitianEigendecomposition,
  matAdd,
  matSub,
  matScale,
  matMul,
  matAdjoint,
  matTrace,
  matCommutator,
  matAntiCommutator,
  matFrobeniusNorm,
  matLogHermitian,
  matSqrtHermitian,
  matInv,
  spectralMap,
  uhlmannFidelity,
  traceDistance,
} from './complex';

// Precomputed 16-point Gauss-Legendre quadrature on [-1, 1]
const GAUSS_16_NODES = [
  -0.0950125098376374, 0.0950125098376374,
  -0.2816035507792589, 0.2816035507792589,
  -0.4580167776572274, 0.4580167776572274,
  -0.6178762444026438, 0.6178762444026438,
  -0.7554044083550030, 0.7554044083550030,
  -0.8656312023878318, 0.8656312023878318,
  -0.9445750230732326, 0.9445750230732326,
  -0.9894009349916499, 0.9894009349916499,
];

const GAUSS_16_WEIGHTS = [
  0.1894506104550685, 0.1894506104550685,
  0.1826034150449236, 0.1826034150449236,
  0.1691565193950025, 0.1691565193950025,
  0.1495959888165767, 0.1495959888165767,
  0.1246289712555339, 0.1246289712555339,
  0.0951585116824928, 0.0951585116824928,
  0.0622535239386479, 0.0622535239386479,
  0.0271524594117541, 0.0271524594117541,
];

// Helper to generate model Hamiltonians matching paper dimensions
export const generateModelHamiltonian = (
  d: number,
  coupling = 1.0,
  field = 0.5,
): ComplexMatrix => {
  const H = createZeroMatrix(d);
  if (d === 2) {
    // Single qubit in tilted magnetic field: H = (field)*sigma_z + (coupling)*sigma_x
    H[0][0] = c(field, 0);
    H[0][1] = c(coupling, 0);
    H[1][0] = c(coupling, 0);
    H[1][1] = c(-field, 0);
  } else if (d === 3) {
    // Spin-1 system with quadrupole splitting: H = S_z + 0.3 S_z^2 + coupling*S_x
    H[0][0] = c(1.3, 0);
    H[0][1] = c(coupling / Math.SQRT2, 0);
    H[1][0] = c(coupling / Math.SQRT2, 0);
    H[1][1] = c(0.0, 0);
    H[1][2] = c(coupling / Math.SQRT2, 0);
    H[2][1] = c(coupling / Math.SQRT2, 0);
    H[2][2] = c(-0.7, 0);
  } else if (d === 4) {
    // 2-qubit Heisenberg exchange coupling H = J (sigma_x1 sigma_x2 + sigma_y1 sigma_y2 + sigma_z1 sigma_z2) + h (z1 + z2)
    for (let i = 0; i < 4; i++) {
      H[i][i] = c((i === 0 ? 1 : i === 3 ? -1 : 0) * field, 0);
    }
    // Cross couplings
    H[1][2] = c(coupling, 0.2);
    H[2][1] = c(coupling, -0.2);
    H[0][3] = c(0.4 * coupling, 0);
    H[3][0] = c(0.4 * coupling, 0);
  } else {
    // d = 8: 3-qubit / multi-level JT dilaton horizon truncation
    for (let i = 0; i < d; i++) {
      const energy = (i - (d - 1) / 2) * field + 0.05 * i * i;
      H[i][i] = c(energy, 0);
      if (i + 1 < d) {
        const hop = coupling * Math.sqrt((i + 1) * (d - i - 1)) * 0.3;
        H[i][i + 1] = c(hop, 0.1 * hop);
        H[i + 1][i] = c(hop, -0.1 * hop);
      }
    }
  }
  return H;
};

// 1. Compute KMS Thermal State rho_KMS = e^(-beta H) / Z
export const computeKMSState = (H: ComplexMatrix, beta: number): KMSStateResult => {
  const d = H.length;
  const eig = hermitianEigendecomposition(H);

  // Compute unnormalized Boltzmann weights e^(-beta E_k)
  // Shift energies by E_min to prevent numerical overflow/underflow
  const minE = Math.min(...eig.values);
  const weights = eig.values.map((e) => Math.exp(-beta * (e - minE)));
  const Z = weights.reduce((acc, w) => acc + w, 0);

  const lambdas = weights.map((w) => w / Z);
  const rho = spectralMap(eig, (_, idx) => lambdas[idx]);

  // Clean numerical zero imaginary on diagonal
  for (let i = 0; i < d; i++) {
    rho[i][i] = c(Math.max(rho[i][i].re, 1e-18), 0);
  }

  const minEigenvalue = Math.min(...lambdas);
  const maxEigenvalue = Math.max(...lambdas);
  const conditionNumber = maxEigenvalue / minEigenvalue;

  return {
    rho,
    partitionFunction: Z,
    eigenvalues: lambdas,
    eigenvectors: eig.vectors,
    minEigenvalue,
    conditionNumber,
  };
};

// 2. Modular Automorphism Flow: sigma_t(X) = e^(-i t H) X e^(i t H)
export const modularAutomorphismFlow = (
  H: ComplexMatrix,
  X: ComplexMatrix,
  t: number,
): ComplexMatrix => {
  const eig = hermitianEigendecomposition(H);
  // e^(-i t H) = U diag(e^(-i t E_k)) U†
  const expMinusItH = spectralMap(eig, (e) => ({
    re: Math.cos(-t * e),
    im: Math.sin(-t * e),
  }));
  const expPlusItH = matAdjoint(expMinusItH);
  return matMul(matMul(expMinusItH, X), expPlusItH);
};

// 3. Kubo-Mori-Bogoliubov (KMB) Metric: <A, B>_KMB = int_0^1 Tr(rho^(1-u) A† rho^u B) du
export const computeKMBMetric = (
  rhoKms: ComplexMatrix,
  A: ComplexMatrix,
  B: ComplexMatrix,
): number => {
  const d = rhoKms.length;
  const eig = hermitianEigendecomposition(rhoKms);
  const AAdj = matAdjoint(A);

  // In the eigenbasis of rho:
  // <A, B>_KMB = sum_{j,k} ((lambda_j - lambda_k) / (ln lambda_j - ln lambda_k)) * (A†)_{jk} * B_{kj}
  // Transform AAdj and B to eigenbasis: U† AAdj U and U† B U
  const U = eig.vectors;
  const UAdj = matAdjoint(U);
  const A_basis = matMul(matMul(UAdj, AAdj), U);
  const B_basis = matMul(matMul(UAdj, B), U);

  let sum = 0;
  for (let j = 0; j < d; j++) {
    const lj = Math.max(eig.values[j], 1e-16);
    for (let k = 0; k < d; k++) {
      const lk = Math.max(eig.values[k], 1e-16);
      let logMean: number;
      if (Math.abs(lj - lk) < 1e-10) {
        logMean = lj;
      } else {
        logMean = (lj - lk) / (Math.log(lj) - Math.log(lk));
      }
      const prod = cMul(A_basis[j][k], B_basis[k][j]);
      sum += logMean * prod.re;
    }
  }
  return sum;
};

// 4. Daleckii-Krein Double Operator Integral (DOI)
// D ln(rho)[H] = sum_{j,k} ln^[1](lambda_j, lambda_k) |v_j><v_j| H |v_k><v_k|
export const computeDaleckiiKreinDOI = (
  rho: ComplexMatrix,
  H: ComplexMatrix,
): ComplexMatrix => {
  const d = rho.length;
  const eig = hermitianEigendecomposition(rho);
  const U = eig.vectors;
  const UAdj = matAdjoint(U);

  // H in eigenbasis
  const H_basis = matMul(matMul(UAdj, H), U);
  const res_basis = createZeroMatrix(d);

  for (let j = 0; j < d; j++) {
    const lj = Math.max(eig.values[j], 1e-16);
    for (let k = 0; k < d; k++) {
      const lk = Math.max(eig.values[k], 1e-16);
      let dividedDiff: number;
      if (Math.abs(lj - lk) < 1e-9) {
        dividedDiff = 1.0 / lj;
      } else {
        dividedDiff = (Math.log(lj) - Math.log(lk)) / (lj - lk);
      }
      res_basis[j][k] = cScale(H_basis[j][k], dividedDiff);
    }
  }

  // Transform back to original basis: U * res_basis * U†
  return matMul(matMul(U, res_basis), UAdj);
};

// 5. Continuous Cauchy Resolvent Quadrature:
// D ln(rho)[H] = int_0^1 (u rho + (1-u) I)^(-1) H (u rho + (1-u) I)^(-1) du
export const computeCauchyResolvent = (
  rho: ComplexMatrix,
  H: ComplexMatrix,
): ComplexMatrix => {
  const d = rho.length;
  const I = createIdentityMatrix(d);
  const result = createZeroMatrix(d);

  // Transform standard [-1, 1] Gauss nodes to [0, 1]: u = 0.5 * (x + 1), du = 0.5 dx
  for (let i = 0; i < GAUSS_16_NODES.length; i++) {
    const x = GAUSS_16_NODES[i];
    const w = GAUSS_16_WEIGHTS[i];
    const u = 0.5 * (x + 1.0);
    const weight = 0.5 * w;

    // R(u) = (u rho + (1-u) I)
    const R = matAdd(matScale(rho, u), matScale(I, 1.0 - u));
    const R_inv = matInv(R);

    // Integrand = R_inv * H * R_inv
    const integrand = matMul(matMul(R_inv, H), R_inv);
    const weighted = matScale(integrand, weight);

    for (let r = 0; r < d; r++) {
      for (let cIdx = 0; cIdx < d; cIdx++) {
        result[r][cIdx] = cAdd(result[r][cIdx], weighted[r][cIdx]);
      }
    }
  }

  return result;
};

// Compare DOI with Cauchy Resolvent
export const compareFrechetDifferentials = (
  rho: ComplexMatrix,
  H: ComplexMatrix,
): DaleckiiKreinResult => {
  const dLogDOI = computeDaleckiiKreinDOI(rho, H);
  const dLogCauchy = computeCauchyResolvent(rho, H);

  const diff = matSub(dLogDOI, dLogCauchy);
  const frobeniusError = matFrobeniusNorm(diff);

  let maxEntryError = 0;
  for (let i = 0; i < diff.length; i++) {
    for (let j = 0; j < diff.length; j++) {
      const err = Math.sqrt(diff[i][j].re * diff[i][j].re + diff[i][j].im * diff[i][j].im);
      if (err > maxEntryError) maxEntryError = err;
    }
  }

  return {
    dLogDOI,
    dLogCauchy,
    frobeniusError,
    maxEntryError,
  };
};

// 6. Paired Alicki Jump Operators for Detailed Balance
export const generateAlickiJumpOperators = (
  H: ComplexMatrix,
  beta: number,
  gammaBase = 0.15,
): AlickiJumpOperator[] => {
  const d = H.length;
  const eig = hermitianEigendecomposition(H);
  const jumps: AlickiJumpOperator[] = [];

  for (let j = 0; j < d; j++) {
    for (let k = j + 1; k < d; k++) {
      const Ej = eig.values[j];
      const Ek = eig.values[k];
      const omega = Ek - Ej; // Bohr frequency

      // Jump operator |v_j><v_k|
      const V = createZeroMatrix(d);
      for (let r = 0; r < d; r++) {
        const vjr = eig.vectors[r][j];
        for (let cIdx = 0; cIdx < d; cIdx++) {
          const vkc = cConj(eig.vectors[cIdx][k]);
          V[r][cIdx] = cAdd(V[r][cIdx], cMul(vjr, vkc));
        }
      }

      // Alicki detailed balance condition: gamma_minus = e^(-beta * omega) * gamma_plus
      const gammaForward = gammaBase;
      const gammaBackward = gammaBase * Math.exp(-beta * omega);

      jumps.push({
        name: `|${j}⟩⟨${k}| (ω = ${omega.toFixed(3)})`,
        matrix: V,
        bohrFrequency: omega,
        gammaForward,
        gammaBackward,
      });
    }
  }

  return jumps;
};

// Lindblad dissipator D[V](rho) = V rho V† - 0.5 {V† V, rho}
export const lindbladDissipator = (
  V: ComplexMatrix,
  rho: ComplexMatrix,
): ComplexMatrix => {
  const VAdj = matAdjoint(V);
  const V_rho_VAdj = matMul(matMul(V, rho), VAdj);
  const VAdj_V = matMul(VAdj, V);
  const antiComm = matAntiCommutator(VAdj_V, rho);
  const halfAntiComm = matScale(antiComm, 0.5);
  return matSub(V_rho_VAdj, halfAntiComm);
};

// Apply thermal Lindbladian generator L(rho)
export const applyLindbladian = (
  H: ComplexMatrix,
  jumps: AlickiJumpOperator[],
  rho: ComplexMatrix,
): ComplexMatrix => {
  const d = H.length;
  // Unitary commutator: -i [H, rho]
  const comm = matCommutator(H, rho);
  let L_rho = matScale(comm, c(0, -1));

  // Dissipative paired Alicki terms
  for (const jump of jumps) {
    const V = jump.matrix;
    const VAdj = matAdjoint(V);

    const D_V = lindbladDissipator(V, rho);
    const D_VAdj = lindbladDissipator(VAdj, rho);

    const termForward = matScale(D_V, jump.gammaForward);
    const termBackward = matScale(D_VAdj, jump.gammaBackward);

    L_rho = matAdd(L_rho, matAdd(termForward, termBackward));
  }

  // Ensure exact zero trace
  const tr = matTrace(L_rho);
  const trPerDiag = tr.re / d;
  for (let i = 0; i < d; i++) {
    L_rho[i][i] = c(L_rho[i][i].re - trPerDiag, 0);
  }

  return L_rho;
};

// Umegaki Relative Entropy: D(rho || sigma) = Tr(rho (ln rho - ln sigma))
export const computeUmegakiRelativeEntropy = (
  rho: ComplexMatrix,
  sigma: ComplexMatrix,
): number => {
  const logRho = matLogHermitian(rho);
  const logSigma = matLogHermitian(sigma);
  const diff = matSub(logRho, logSigma);
  const prod = matMul(rho, diff);
  return Math.max(matTrace(prod).re, 0);
};

// Bounded analytical mLSI calculation
export const runDissipationAnalysis = (
  H: ComplexMatrix,
  beta: number,
  gammaBase = 0.15,
): DissipationResult => {
  const kms = computeKMSState(H, beta);
  const jumps = generateAlickiJumpOperators(H, beta, gammaBase);

  // Stationarity check: L(rho_KMS)
  const L_rhoKms = applyLindbladian(H, jumps, kms.rho);
  const stationarityResidual = matFrobeniusNorm(L_rhoKms);

  // Spectral gap estimation: smallest non-zero relaxation rate
  // For paired Alicki dissipator with jump rates gamma:
  let minGap = Infinity;
  for (const j of jumps) {
    const rate = j.gammaForward + j.gammaBackward;
    if (rate > 0 && rate < minGap) minGap = rate;
  }
  const spectralGap = Number.isFinite(minGap) ? minGap * 0.5 : 0.15;

  // mLSI bound: alpha_1 >= 2 * lambda_gap / (ln(1 / lambda_min) + 2)
  const denom = Math.log(1.0 / Math.max(kms.minEigenvalue, 1e-16)) + 2.0;
  const mLSIConstant = (2.0 * spectralGap) / denom;

  // Perturbed initial state for decay trajectory
  const d = H.length;
  const I = createIdentityMatrix(d);
  const rho0 = matAdd(matScale(kms.rho, 0.7), matScale(I, 0.3 / d));
  const D0 = computeUmegakiRelativeEntropy(rho0, kms.rho);

  // Simulate trajectory
  const steps = 40;
  const dt = 0.15;
  const decayTrajectory: { time: number; relativeEntropy: number; bound: number }[] = [];
  let currentRho = rho0;

  for (let s = 0; s <= steps; s++) {
    const t = s * dt;
    const D_t = computeUmegakiRelativeEntropy(currentRho, kms.rho);
    const bound = D0 * Math.exp(-2.0 * mLSIConstant * t);
    decayTrajectory.push({ time: t, relativeEntropy: D_t, bound });

    if (s < steps) {
      // Euler step with projection to density matrices
      const L_curr = applyLindbladian(H, jumps, currentRho);
      const nextRho = matAdd(currentRho, matScale(L_curr, dt));
      // Re-eigen-decompose to enforce positivity and trace 1
      const eig = hermitianEigendecomposition(nextRho);
      const nonNegVals = eig.values.map((v) => Math.max(v, 1e-12));
      const sumVals = nonNegVals.reduce((a, b) => a + b, 0);
      currentRho = spectralMap(eig, (_, idx) => nonNegVals[idx] / sumVals);
    }
  }

  // Entropy production rate at initial state
  const L_init = applyLindbladian(H, jumps, rho0);
  const logRho0 = matLogHermitian(rho0);
  const logKms = matLogHermitian(kms.rho);
  const diffLog = matSub(logRho0, logKms);
  const entropyProduction = -matTrace(matMul(L_init, diffLog)).re;

  return {
    L_rhoKms,
    stationarityResidual,
    spectralGap,
    mLSIConstant,
    entropyProduction,
    decayTrajectory,
  };
};

// 7. Quantum Horizon Transmission Channel E(rho)
export interface QuantumChannel {
  kraus: ComplexMatrix[];
  adjointKraus: ComplexMatrix[];
  apply: (rho: ComplexMatrix) => ComplexMatrix;
  applyAdjoint: (X: ComplexMatrix) => ComplexMatrix;
}

export const createHorizonTransmissionChannel = (
  d: number,
  errorRate = 0.25,
): QuantumChannel => {
  // Horizon transmission channel with dephasing and amplitude loss into radiation
  const K0 = createIdentityMatrix(d);
  const K1 = createZeroMatrix(d);
  const p = errorRate;

  for (let i = 0; i < d; i++) {
    K0[i][i] = c(Math.sqrt(1.0 - p * 0.5), 0);
    if (i + 1 < d) {
      K1[i][i + 1] = c(Math.sqrt(p * 0.5), 0);
    }
  }

  // Ensure sum K_i† K_i <= I by normalizing K0
  const K1Adj = matAdjoint(K1);
  const K1AdjK1 = matMul(K1Adj, K1);
  for (let i = 0; i < d; i++) {
    const rem = 1.0 - K1AdjK1[i][i].re;
    K0[i][i] = c(Math.sqrt(Math.max(rem, 1e-12)), 0);
  }

  const kraus = [K0, K1];
  const adjointKraus = kraus.map((K) => matAdjoint(K));

  const apply = (rho: ComplexMatrix): ComplexMatrix => {
    let out = createZeroMatrix(d);
    for (const K of kraus) {
      const KAdj = matAdjoint(K);
      out = matAdd(out, matMul(matMul(K, rho), KAdj));
    }
    return out;
  };

  const applyAdjoint = (X: ComplexMatrix): ComplexMatrix => {
    let out = createZeroMatrix(d);
    for (const K of kraus) {
      const KAdj = matAdjoint(K);
      out = matAdd(out, matMul(matMul(KAdj, X), K));
    }
    return out;
  };

  return { kraus, adjointKraus, apply, applyAdjoint };
};

// 8. Standard Petz Recovery Map:
// R_{sigma, E}(X) = sigma^(1/2) E†( (E(sigma))^(-1/2) X (E(sigma))^(-1/2) ) sigma^(1/2)
export const standardPetzRecovery = (
  sigma: ComplexMatrix,
  channel: QuantumChannel,
  X: ComplexMatrix,
): ComplexMatrix => {
  const sqrtSigma = matSqrtHermitian(sigma);
  const E_sigma = channel.apply(sigma);
  const sqrtE_sigma = matSqrtHermitian(E_sigma);
  const invSqrtE_sigma = matInv(sqrtE_sigma);

  const sandwiched = matMul(matMul(invSqrtE_sigma, X), invSqrtE_sigma);
  const adjointApplied = channel.applyAdjoint(sandwiched);
  const recovered = matMul(matMul(sqrtSigma, adjointApplied), sqrtSigma);

  // Normalize trace to 1
  const tr = matTrace(recovered).re;
  return tr > 0 ? matScale(recovered, 1.0 / tr) : recovered;
};

// 9. Universal Junge-Kraft-Renner-Sutter Twirled Petz Recovery:
// R_twirled(X) = int_{-6}^6 beta_0(t) sigma^(i t / 2) R( (E(sigma))^(-i t / 2) X (E(sigma))^(i t / 2) ) sigma^(-i t / 2) dt
// with beta_0(t) = (pi / 2) / (cosh(pi t) + 1)
export const twirledPetzRecovery = (
  sigma: ComplexMatrix,
  channel: QuantumChannel,
  X: ComplexMatrix,
): ComplexMatrix => {
  const d = sigma.length;
  const eigSigma = hermitianEigendecomposition(sigma);
  const E_sigma = channel.apply(sigma);
  const eigE_sigma = hermitianEigendecomposition(E_sigma);

  const tMin = -5.0;
  const tMax = 5.0;
  const totalIntegral = createZeroMatrix(d);
  let totalWeight = 0;

  for (let i = 0; i < GAUSS_16_NODES.length; i++) {
    const node = GAUSS_16_NODES[i];
    const weight = GAUSS_16_WEIGHTS[i];
    // Scale node to [tMin, tMax]
    const t = 0.5 * (tMax - tMin) * node + 0.5 * (tMax + tMin);
    const dtWeight = 0.5 * (tMax - tMin) * weight;

    // Kernel beta_0(t) = (pi / 2) / (cosh(pi t) + 1)
    const coshVal = Math.cosh(Math.PI * t);
    const beta0 = (0.5 * Math.PI) / (coshVal + 1.0);
    const w = beta0 * dtWeight;
    totalWeight += w;

    // (E(sigma))^(-i t / 2) X (E(sigma))^(i t / 2)
    const expMinusItE = spectralMap(eigE_sigma, (v) => {
      const phase = -0.5 * t * Math.log(Math.max(v, 1e-16));
      return { re: Math.cos(phase), im: Math.sin(phase) };
    });
    const expPlusItE = matAdjoint(expMinusItE);
    const X_rotated = matMul(matMul(expMinusItE, X), expPlusItE);

    // Standard Petz on rotated X
    const R_rot = standardPetzRecovery(sigma, channel, X_rotated);

    // Outer rotation: sigma^(i t / 2) R_rot sigma^(-i t / 2)
    const expPlusItSigma = spectralMap(eigSigma, (v) => {
      const phase = 0.5 * t * Math.log(Math.max(v, 1e-16));
      return { re: Math.cos(phase), im: Math.sin(phase) };
    });
    const expMinusItSigma = matAdjoint(expPlusItSigma);

    const term = matMul(matMul(expPlusItSigma, R_rot), expMinusItSigma);
    const weightedTerm = matScale(term, w);

    for (let r = 0; r < d; r++) {
      for (let cIdx = 0; cIdx < d; cIdx++) {
        totalIntegral[r][cIdx] = cAdd(totalIntegral[r][cIdx], weightedTerm[r][cIdx]);
      }
    }
  }

  // Normalize by total weight and enforce trace 1
  const scaled = matScale(totalIntegral, 1.0 / (totalWeight || 1.0));
  const tr = matTrace(scaled).re;
  return tr > 0 ? matScale(scaled, 1.0 / tr) : scaled;
};

// Full Petz Recovery Analysis & DPI Verification
export const runPetzRecoveryAnalysis = (
  H: ComplexMatrix,
  beta: number,
  errorRate = 0.25,
): PetzRecoveryResult => {
  const d = H.length;
  const kms = computeKMSState(H, beta);
  const channel = createHorizonTransmissionChannel(d, errorRate);

  // Infalling quantum state rhoOriginal (displaced from KMS)
  const I = createIdentityMatrix(d);
  const eig = hermitianEigendecomposition(H);
  // Pure or high-purity wavepacket localized in code subspace
  const probe = createZeroMatrix(d);
  probe[0][0] = c(0.85, 0);
  probe[1][1] = c(0.15, 0);
  const rhoOriginal = matAdd(matScale(probe, 0.9), matScale(I, 0.1 / d));

  // Transmit through horizon
  const rhoTransmitted = channel.apply(rhoOriginal);

  // Recovery maps
  const rhoStandardPetz = standardPetzRecovery(kms.rho, channel, rhoTransmitted);
  const rhoTwirledPetz = twirledPetzRecovery(kms.rho, channel, rhoTransmitted);

  // Uhlmann fidelities
  const fidelityStandard = uhlmannFidelity(rhoOriginal, rhoStandardPetz);
  const fidelityTwirled = uhlmannFidelity(rhoOriginal, rhoTwirledPetz);

  // Relative entropies
  const E_sigma = channel.apply(kms.rho);
  const relativeEntropyBefore = computeUmegakiRelativeEntropy(rhoOriginal, kms.rho);
  const relativeEntropyAfter = computeUmegakiRelativeEntropy(rhoTransmitted, E_sigma);

  // DPI deficit Delta_DPI = D(rho || sigma) - D(E(rho) || E(sigma))
  const deltaDPI = Math.max(relativeEntropyBefore - relativeEntropyAfter, 0);
  // Strengthened DPI lower bound: -ln F(rho, R_twirled(E(rho)))
  const safeFidelity = Math.min(Math.max(fidelityTwirled, 1e-12), 1.0);
  const dpiLowerBound = -Math.log(safeFidelity);

  return {
    rhoOriginal,
    rhoTransmitted,
    rhoStandardPetz,
    rhoTwirledPetz,
    fidelityStandard,
    fidelityTwirled,
    relativeEntropyBefore,
    relativeEntropyAfter,
    deltaDPI,
    dpiLowerBound,
    dpiDeficitSatisfied: deltaDPI >= dpiLowerBound - 1e-6,
  };
};

// 10. Algorithm 1: Faithful-State Regularized Quantum Mirror Descent
export const runQuantumMirrorDescent = (
  rhoInit: ComplexMatrix,
  rhoTarget: ComplexMatrix,
  eta = 0.35,
  epsilon = 1e-4,
  maxSteps = 30,
  tol = 1e-7,
): MirrorDescentResult => {
  const d = rhoInit.length;
  const I = createIdentityMatrix(d);
  const logTarget = matLogHermitian(rhoTarget);

  let currentRho = rhoInit;
  const iterations: MirrorDescentIteration[] = [];
  let converged = false;

  for (let k = 0; k < maxSteps; k++) {
    // 1. Exact modular gradient G_k = ln(rho_k) - ln(rho_target) + I
    const logRho_k = matLogHermitian(currentRho);
    const grad = matAdd(matSub(logRho_k, logTarget), I);
    const gradNorm = matFrobeniusNorm(grad);

    // Compute metrics
    const tDist = traceDistance(currentRho, rhoTarget);
    const relEnt = computeUmegakiRelativeEntropy(currentRho, rhoTarget);
    const fid = uhlmannFidelity(currentRho, rhoTarget);
    const eig = hermitianEigendecomposition(currentRho);
    const minEig = Math.min(...eig.values);

    iterations.push({
      step: k,
      traceDistance: tDist,
      gradientNorm: gradNorm,
      relativeEntropy: relEnt,
      fidelity: fid,
      minEigenvalue: minEig,
    });

    if (tDist < tol || gradNorm < tol) {
      converged = true;
      break;
    }

    // 2. Unnormalized exponential update: rho_tilde = exp(ln(rho_k) - eta * G_k)
    // ln(rho_k) - eta * G_k = (1 - eta) ln(rho_k) + eta * ln(rho_target) - eta * I
    const exponent = matSub(logRho_k, matScale(grad, eta));
    const eigExp = hermitianEigendecomposition(exponent);
    // Shift by max eigenvalue for exponential stability
    const maxVal = Math.max(...eigExp.values);
    const expVals = eigExp.values.map((v) => Math.exp(v - maxVal));
    const sumExp = expVals.reduce((a, b) => a + b, 0);

    // 3. Trace normalization
    const hatRho = spectralMap(eigExp, (_, idx) => expVals[idx] / sumExp);

    // 4. Faithful-state conditioning: rho_{k+1} = (1 - eps) * hatRho + eps * (I / d)
    const conditioned = matAdd(matScale(hatRho, 1.0 - epsilon), matScale(I, epsilon / d));
    currentRho = conditioned;
  }

  const finalTraceDistance = traceDistance(currentRho, rhoTarget);
  const finalFidelity = uhlmannFidelity(currentRho, rhoTarget);

  return {
    convergedState: currentRho,
    targetState: rhoTarget,
    iterations,
    totalSteps: iterations.length,
    converged,
    finalTraceDistance,
    finalFidelity,
  };
};

// 11. Multi-Dimensional Benchmarks (Exact reproduction and live verification of Table 1)
export const runTable1Benchmarks = (): DimensionBenchmark[] => {
  const dimensions = [2, 3, 4, 8];
  const beta = 1.0;
  const gammaDamp = 0.15;

  return dimensions.map((d) => {
    const H = generateModelHamiltonian(d, 1.0, 0.5);
    const kms = computeKMSState(H, beta);
    const dissipation = runDissipationAnalysis(H, beta, gammaDamp);
    const diffComparison = compareFrechetDifferentials(kms.rho, H);
    const recovery = runPetzRecoveryAnalysis(H, beta, 0.25);

    return {
      dim: d,
      kappa: Number(kms.conditionNumber.toFixed(3)),
      lambdaGap: Number(dissipation.spectralGap.toFixed(4)),
      alpha1: Number(dissipation.mLSIConstant.toFixed(4)),
      stationarityRes: dissipation.stationarityResidual,
      frechetError: diffComparison.frobeniusError,
      fidelityPetz: Number((recovery.fidelityTwirled * 100).toFixed(2)),
      deltaDPI: Number(recovery.deltaDPI.toFixed(4)),
      minusLnF: Number(recovery.dpiLowerBound.toFixed(4)),
    };
  });
};
