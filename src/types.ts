export interface Complex {
  re: number;
  im: number;
}

export type ComplexMatrix = Complex[][];

export interface Eigendecomposition {
  values: number[];
  vectors: ComplexMatrix; // column vectors
}

export interface KMSStateResult {
  rho: ComplexMatrix;
  partitionFunction: number;
  eigenvalues: number[];
  eigenvectors: ComplexMatrix;
  minEigenvalue: number;
  conditionNumber: number; // kappa(rho_KMS)
}

export interface DaleckiiKreinResult {
  dLogDOI: ComplexMatrix;
  dLogCauchy: ComplexMatrix;
  frobeniusError: number;
  maxEntryError: number;
}

export interface AlickiJumpOperator {
  name: string;
  matrix: ComplexMatrix;
  bohrFrequency: number;
  gammaForward: number;
  gammaBackward: number;
}

export interface DissipationResult {
  L_rhoKms: ComplexMatrix;
  stationarityResidual: number; // ||L(rho_KMS)||_F
  spectralGap: number;
  mLSIConstant: number;
  entropyProduction: number;
  decayTrajectory: { time: number; relativeEntropy: number; bound: number }[];
}

export interface PetzRecoveryResult {
  rhoOriginal: ComplexMatrix;
  rhoTransmitted: ComplexMatrix;
  rhoStandardPetz: ComplexMatrix;
  rhoTwirledPetz: ComplexMatrix;
  fidelityStandard: number;
  fidelityTwirled: number;
  relativeEntropyBefore: number;
  relativeEntropyAfter: number;
  deltaDPI: number; // D(rho || sigma) - D(E(rho) || E(sigma))
  dpiLowerBound: number; // -ln F(rho, R_twirled(E(rho)))
  dpiDeficitSatisfied: boolean;
}

export interface MirrorDescentIteration {
  step: number;
  traceDistance: number;
  gradientNorm: number;
  relativeEntropy: number;
  fidelity: number;
  minEigenvalue: number;
}

export interface MirrorDescentResult {
  convergedState: ComplexMatrix;
  targetState: ComplexMatrix;
  iterations: MirrorDescentIteration[];
  totalSteps: number;
  converged: boolean;
  finalTraceDistance: number;
  finalFidelity: number;
}

export interface DimensionBenchmark {
  dim: number;
  kappa: number;
  lambdaGap: number;
  alpha1: number;
  stationarityRes: number;
  frechetError: number;
  fidelityPetz: number;
  deltaDPI: number;
  minusLnF: number;
}
