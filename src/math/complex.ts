import { Complex, ComplexMatrix, Eigendecomposition } from '../types';

export const c = (re = 0, im = 0): Complex => ({ re, im });

export const cAdd = (a: Complex, b: Complex): Complex => ({ re: a.re + b.re, im: a.im + b.im });
export const cSub = (a: Complex, b: Complex): Complex => ({ re: a.re - b.re, im: a.im - b.im });
export const cMul = (a: Complex, b: Complex): Complex => ({
  re: a.re * b.re - a.im * b.im,
  im: a.re * b.im + a.im * b.re,
});
export const cDiv = (a: Complex, b: Complex): Complex => {
  const denom = b.re * b.re + b.im * b.im;
  if (denom === 0) return c(0, 0);
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
};
export const cScale = (a: Complex, s: number): Complex => ({ re: a.re * s, im: a.im * s });
export const cConj = (a: Complex): Complex => ({ re: a.re, im: -a.im });
export const cAbsSq = (a: Complex): number => a.re * a.re + a.im * a.im;
export const cAbs = (a: Complex): number => Math.sqrt(cAbsSq(a));
export const cExp = (a: Complex): Complex => {
  const r = Math.exp(a.re);
  return { re: r * Math.cos(a.im), im: r * Math.sin(a.im) };
};

export const createZeroMatrix = (d: number): ComplexMatrix =>
  Array.from({ length: d }, () => Array.from({ length: d }, () => c(0, 0)));

export const createIdentityMatrix = (d: number): ComplexMatrix => {
  const m = createZeroMatrix(d);
  for (let i = 0; i < d; i++) m[i][i] = c(1, 0);
  return m;
};

export const createDiagonalMatrix = (diag: number[]): ComplexMatrix => {
  const d = diag.length;
  const m = createZeroMatrix(d);
  for (let i = 0; i < d; i++) m[i][i] = c(diag[i], 0);
  return m;
};

export const matAdd = (A: ComplexMatrix, B: ComplexMatrix): ComplexMatrix => {
  const d = A.length;
  const C = createZeroMatrix(d);
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      C[i][j] = cAdd(A[i][j], B[i][j]);
    }
  }
  return C;
};

export const matSub = (A: ComplexMatrix, B: ComplexMatrix): ComplexMatrix => {
  const d = A.length;
  const C = createZeroMatrix(d);
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      C[i][j] = cSub(A[i][j], B[i][j]);
    }
  }
  return C;
};

export const matScale = (A: ComplexMatrix, s: number | Complex): ComplexMatrix => {
  const d = A.length;
  const C = createZeroMatrix(d);
  const factor = typeof s === 'number' ? c(s, 0) : s;
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      C[i][j] = cMul(A[i][j], factor);
    }
  }
  return C;
};

export const matMul = (A: ComplexMatrix, B: ComplexMatrix): ComplexMatrix => {
  const d = A.length;
  const C = createZeroMatrix(d);
  for (let i = 0; i < d; i++) {
    for (let k = 0; k < d; k++) {
      const aik = A[i][k];
      if (aik.re === 0 && aik.im === 0) continue;
      for (let j = 0; j < d; j++) {
        C[i][j] = cAdd(C[i][j], cMul(aik, B[k][j]));
      }
    }
  }
  return C;
};

export const matAdjoint = (A: ComplexMatrix): ComplexMatrix => {
  const d = A.length;
  const C = createZeroMatrix(d);
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      C[j][i] = cConj(A[i][j]);
    }
  }
  return C;
};

export const matTrace = (A: ComplexMatrix): Complex => {
  let tr = c(0, 0);
  for (let i = 0; i < A.length; i++) {
    tr = cAdd(tr, A[i][i]);
  }
  return tr;
};

export const matCommutator = (A: ComplexMatrix, B: ComplexMatrix): ComplexMatrix =>
  matSub(matMul(A, B), matMul(B, A));

export const matAntiCommutator = (A: ComplexMatrix, B: ComplexMatrix): ComplexMatrix =>
  matAdd(matMul(A, B), matMul(B, A));

export const matFrobeniusNorm = (A: ComplexMatrix): number => {
  let sum = 0;
  for (let i = 0; i < A.length; i++) {
    for (let j = 0; j < A.length; j++) {
      sum += cAbsSq(A[i][j]);
    }
  }
  return Math.sqrt(sum);
};

export const matHilbertSchmidtInnerProduct = (A: ComplexMatrix, B: ComplexMatrix): Complex =>
  matTrace(matMul(matAdjoint(A), B));

// Exact Jacobi Eigendecomposition for Hermitian matrices A = A†
export const hermitianEigendecomposition = (
  H: ComplexMatrix,
  maxSweeps = 80,
  tol = 1e-15,
): Eigendecomposition => {
  const d = H.length;
  // Deep copy H to A
  const A = createZeroMatrix(d);
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      A[i][j] = { ...H[i][j] };
    }
  }
  // Enforce exact Hermitian symmetry on entry
  for (let i = 0; i < d; i++) {
    A[i][i] = c(A[i][i].re, 0);
    for (let j = i + 1; j < d; j++) {
      const avgRe = 0.5 * (A[i][j].re + A[j][i].re);
      const avgIm = 0.5 * (A[i][j].im - A[j][i].im);
      A[i][j] = c(avgRe, avgIm);
      A[j][i] = c(avgRe, -avgIm);
    }
  }

  // V tracks eigenvectors (columns of V)
  let V = createIdentityMatrix(d);

  for (let sweep = 0; sweep < maxSweeps; sweep++) {
    let maxOffDiag = 0;
    for (let p = 0; p < d; p++) {
      for (let q = p + 1; q < d; q++) {
        const off = cAbs(A[p][q]);
        if (off > maxOffDiag) maxOffDiag = off;
      }
    }
    if (maxOffDiag < tol) break;

    for (let p = 0; p < d; p++) {
      for (let q = p + 1; q < d; q++) {
        const apq = A[p][q];
        const off = cAbs(apq);
        if (off < 1e-16) continue;

        const app = A[p][p].re;
        const aqq = A[q][q].re;

        // Polar angle of A[p][q]
        const theta = Math.atan2(apq.im, apq.re);
        const b = off; // magnitude

        // Angle phi for Jacobi rotation
        const tau = (aqq - app) / (2 * b);
        let t = 0;
        if (tau >= 0) {
          t = 1 / (tau + Math.sqrt(1 + tau * tau));
        } else {
          t = -1 / (-tau + Math.sqrt(1 + tau * tau));
        }
        const cosPhi = 1 / Math.sqrt(1 + t * t);
        const sinPhi = t * cosPhi;

        // Phase factors: u1 = cosPhi, u2 = sinPhi * e^(i*theta)
        const expITheta = { re: Math.cos(theta), im: Math.sin(theta) };
        const expMinusITheta = { re: Math.cos(theta), im: -Math.sin(theta) };

        // Update A in (p, q) subspace
        // Transform columns p and q of A and V
        for (let k = 0; k < d; k++) {
          if (k !== p && k !== q) {
            const akp = A[k][p];
            const akq = A[k][q];
            // New Akp = cosPhi * akp - sinPhi * akq * e^(-i*theta)
            const akqRot = cMul(akq, expMinusITheta);
            const newAkp = cSub(cScale(akp, cosPhi), cScale(akqRot, sinPhi));

            // New Akq = sinPhi * akp * e^(i*theta) + cosPhi * akq
            const akpRot = cMul(akp, expITheta);
            const newAkq = cAdd(cScale(akpRot, sinPhi), cScale(akq, cosPhi));

            A[k][p] = newAkp;
            A[p][k] = cConj(newAkp);
            A[k][q] = newAkq;
            A[q][k] = cConj(newAkq);
          }

          // Accumulate in V
          const vkp = V[k][p];
          const vkq = V[k][q];
          const vkqRot = cMul(vkq, expMinusITheta);
          const newVkp = cSub(cScale(vkp, cosPhi), cScale(vkqRot, sinPhi));

          const vkpRot = cMul(vkp, expITheta);
          const newVkq = cAdd(cScale(vkpRot, sinPhi), cScale(vkq, cosPhi));

          V[k][p] = newVkp;
          V[k][q] = newVkq;
        }

        A[p][p] = c(app - t * b, 0);
        A[q][q] = c(aqq + t * b, 0);
        A[p][q] = c(0, 0);
        A[q][p] = c(0, 0);
      }
    }
  }

  // Extract eigenvalues and sort descending
  const eigenPairs: { val: number; vec: Complex[] }[] = [];
  for (let j = 0; j < d; j++) {
    const vec: Complex[] = [];
    for (let i = 0; i < d; i++) {
      vec.push(V[i][j]);
    }
    eigenPairs.push({ val: A[j][j].re, vec });
  }

  eigenPairs.sort((a, b) => b.val - a.val);

  const values = eigenPairs.map((p) => p.val);
  const vectors = createZeroMatrix(d);
  for (let j = 0; j < d; j++) {
    for (let i = 0; i < d; i++) {
      vectors[i][j] = eigenPairs[j].vec[i];
    }
  }

  return { values, vectors };
};

// Reconstruct matrix from spectral decomposition: U * diag(f(vals)) * U†
export const spectralMap = (
  eig: Eigendecomposition,
  fn: (val: number, idx: number) => number | Complex,
): ComplexMatrix => {
  const d = eig.values.length;
  const res = createZeroMatrix(d);
  for (let k = 0; k < d; k++) {
    const fVal = fn(eig.values[k], k);
    const complexVal = typeof fVal === 'number' ? c(fVal, 0) : fVal;
    for (let i = 0; i < d; i++) {
      const uik = eig.vectors[i][k];
      for (let j = 0; j < d; j++) {
        const uConjJk = cConj(eig.vectors[j][k]);
        const term = cMul(cMul(uik, complexVal), uConjJk);
        res[i][j] = cAdd(res[i][j], term);
      }
    }
  }
  return res;
};

// Matrix exponential of Hermitian matrix
export const matExpHermitian = (H: ComplexMatrix): ComplexMatrix => {
  const eig = hermitianEigendecomposition(H);
  return spectralMap(eig, (v) => Math.exp(v));
};

// Matrix logarithm of positive definite Hermitian matrix
export const matLogHermitian = (rho: ComplexMatrix, minClamp = 1e-15): ComplexMatrix => {
  const eig = hermitianEigendecomposition(rho);
  return spectralMap(eig, (v) => Math.log(Math.max(v, minClamp)));
};

// Matrix square root of positive semi-definite Hermitian matrix
export const matSqrtHermitian = (rho: ComplexMatrix): ComplexMatrix => {
  const eig = hermitianEigendecomposition(rho);
  return spectralMap(eig, (v) => Math.sqrt(Math.max(v, 0)));
};

// Matrix inverse via Gauss-Jordan elimination with partial pivoting
export const matInv = (A: ComplexMatrix): ComplexMatrix => {
  const n = A.length;
  // Augment A with identity
  const aug: Complex[][] = Array.from({ length: n }, (_, i) => [
    ...A[i].map((val) => ({ ...val })),
    ...Array.from({ length: n }, (__, j) => c(i === j ? 1 : 0, 0)),
  ]);

  for (let i = 0; i < n; i++) {
    // Pivot
    let maxRow = i;
    let maxVal = cAbs(aug[i][i]);
    for (let r = i + 1; r < n; r++) {
      const val = cAbs(aug[r][i]);
      if (val > maxVal) {
        maxVal = val;
        maxRow = r;
      }
    }
    if (maxVal < 1e-16) throw new Error('Singular matrix in matInv');
    if (maxRow !== i) {
      const temp = aug[i];
      aug[i] = aug[maxRow];
      aug[maxRow] = temp;
    }

    const pivot = aug[i][i];
    for (let cIdx = 0; cIdx < 2 * n; cIdx++) {
      aug[i][cIdx] = cDiv(aug[i][cIdx], pivot);
    }

    for (let r = 0; r < n; r++) {
      if (r !== i) {
        const factor = aug[r][i];
        if (factor.re === 0 && factor.im === 0) continue;
        for (let cIdx = 0; cIdx < 2 * n; cIdx++) {
          aug[r][cIdx] = cSub(aug[r][cIdx], cMul(factor, aug[i][cIdx]));
        }
      }
    }
  }

  const inv = createZeroMatrix(n);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      inv[i][j] = aug[i][j + n];
    }
  }
  return inv;
};

// Uhlmann Fidelity F(rho, sigma) = (Tr sqrt(sqrt(rho) * sigma * sqrt(rho)))^2
export const uhlmannFidelity = (rho: ComplexMatrix, sigma: ComplexMatrix): number => {
  const sqrtRho = matSqrtHermitian(rho);
  const inner = matMul(matMul(sqrtRho, sigma), sqrtRho);
  const sqrtInner = matSqrtHermitian(inner);
  const tr = matTrace(sqrtInner).re;
  const fid = tr * tr;
  return Math.min(Math.max(fid, 0), 1.0);
};

// Trace distance = 0.5 * Tr |rho - sigma|
export const traceDistance = (rho: ComplexMatrix, sigma: ComplexMatrix): number => {
  const diff = matSub(rho, sigma);
  const eig = hermitianEigendecomposition(diff);
  let sum = 0;
  for (const v of eig.values) {
    sum += Math.abs(v);
  }
  return 0.5 * sum;
};
