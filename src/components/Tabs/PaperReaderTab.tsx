import React, { useState } from 'react';
import { MathView } from '../MathView';
import { BookOpen, ExternalLink, Bookmark, Hash, Download, Copy, Check, FileCode } from 'lucide-react';

const BIBTEX_CITATION = `@article{unmani2026finitedimensional,
  title={Finite-Dimensional Modular Theory, Non-Commutative Relative-Entropy Geometry, and Resilient Quantum Mirror Descent for Holographic State Reconstruction},
  author={Ghulam-e-Shah-e-Unmani, AryaArunachalaAnanda},
  journal={BhutaDamaraSena R\\&D Labs Technical Report},
  volume={4},
  number={0},
  year={2026},
  publisher={Zenodo},
  doi={10.5281/zenodo.22831838},
  url={https://doi.org/10.5281/zenodo.22831838}
}`;

export const PaperReaderTab: React.FC = () => {
  const [activeSection, setActiveSection] = useState<string>('sec1');
  const [copiedBibtex, setCopiedBibtex] = useState<boolean>(false);

  const handleCopyBibtex = () => {
    navigator.clipboard.writeText(BIBTEX_CITATION).then(() => {
      setCopiedBibtex(true);
      setTimeout(() => setCopiedBibtex(false), 2000);
    });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* Sidebar Navigation */}
      <div className="lg:col-span-1 space-y-2">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 sticky top-20">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            Table of Contents
          </h4>
          <nav className="space-y-1 text-xs">
            {[
              { id: 'sec1', label: '1. Introduction & Holography' },
              { id: 'sec2', label: '2. Modular Theory & DOI' },
              { id: 'sec3', label: '3. Alicki Detailed Balance' },
              { id: 'sec4', label: '4. Non-Commutative Geometry & mLSI' },
              { id: 'sec5', label: '5. Universal Twirled Petz Recovery' },
              { id: 'sec6', label: '6. Quantum Mirror Descent' },
              { id: 'sec7', label: '7. Dilaton Studio Benchmarks' },
              { id: 'sec8', label: '8. Conclusion & References' },
            ].map((sec) => (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full text-left px-2.5 py-1.5 rounded-lg transition-colors flex items-center justify-between ${
                  activeSection === sec.id
                    ? 'bg-cyan-500/20 text-cyan-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <span>{sec.label}</span>
                <Hash className="w-3 h-3 opacity-40" />
              </button>
            ))}
          </nav>

          {/* Quick Actions in Sidebar */}
          <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-xs">
            <a
              href="/Finite_dim_v4.tex"
              download="Finite_dim_v4.tex"
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .tex Source</span>
            </a>

            <button
              onClick={handleCopyBibtex}
              className="w-full flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 text-slate-300 transition-colors"
            >
              {copiedBibtex ? (
                <Check className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-cyan-400" />
              )}
              <span>{copiedBibtex ? 'BibTeX Copied!' : 'Copy BibTeX Citation'}</span>
            </button>

            <a
              href="https://doi.org/10.5281/zenodo.22831838"
              target="_blank"
              rel="noreferrer"
              className="text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-1 font-mono text-[11px] pt-1"
            >
              <span>Zenodo DOI: 22831838</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Paper Content */}
      <div className="lg:col-span-3 space-y-6">
        {/* Title Header Card */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider font-semibold">
            Mathematical Physics & Quantum Information (Version 4.0)
          </span>
          <h2 className="text-xl font-bold text-slate-100 mt-2 leading-snug">
            Finite-Dimensional Modular Theory, Non-Commutative Relative-Entropy Geometry, and Resilient Quantum Mirror Descent for Holographic State Reconstruction
          </h2>
          <p className="text-xs text-slate-400 mt-2">
            <strong>Ghulam-e-Shah-e-Unmani (AryaArunachalaAnanda)</strong> • BhutaDamaraSena R&D Labs, Aghora Abraham Global LLC
          </p>

          <div className="mt-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs text-slate-300">
            <strong className="text-slate-200 font-semibold block mb-1">Abstract:</strong>
            We establish an exact mathematical and numerical framework connecting finite-dimensional Tomita–Takesaki modular theory, Kubo–Mori–Bogoliubov (KMB) non-commutative Riemannian geometry, and entropic optimization for holographic quantum state reconstruction across black hole horizons. First, we prove Petz's operator monotone metric classification theorem for the Hessian of the Umegaki relative entropy at a faithful KMS thermal state <MathView math="\rho_{\mathrm{KMS}}" />. Second, we establish an analytical, strictly positive lower bound for the modified logarithmic Sobolev inequality (mLSI) constant <MathView math="\alpha_1 \ge \frac{2\lambda_{\mathrm{gap}}(\mathcal{L})}{\ln(1/\lambda_{\min}(\rho_{\mathrm{KMS}})) + 2}" /> for Lindblad generators satisfying paired Alicki detailed balance. Third, we establish the holographic connection between boundary modular Hamiltonians <MathView math="K_{\mathrm{rad}}" /> and bulk 2D Jackiw–Teitelboim (JT) dilaton gravity via the JLMS relation and the QES island formula.
          </div>
        </div>

        {/* Section 1 */}
        {activeSection === 'sec1' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-slate-100">1. Introduction and Holographic Foundations</h3>
            <p>
              In non-commutative quantum statistical mechanics and algebraic quantum field theory (AQFT), the modular theory of Tomita and Takesaki provides the mathematical infrastructure of thermal equilibrium, characterized by the Kubo–Martin–Schwinger (KMS) condition. In semiclassical quantum gravity and the anti-de Sitter / conformal field theory (AdS/CFT) correspondence, modular Hamiltonians <MathView math="K = -\ln\rho" /> play a defining operational role in entanglement wedge reconstruction through the Jafferis–Lewkowycz–Maldacena–Suh (JLMS) relation:
            </p>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center font-mono text-cyan-300">
              <MathView math="K_{\mathrm{boundary}} = \frac{\hat{\Phi}(\mathrm{QES})}{4 G_N} + K_{\mathrm{bulk}}(\Sigma_{\mathrm{island}})" />
            </div>

            <p>
              In two-dimensional dilaton gravity theories (such as Jackiw–Teitelboim (JT), Almheiri–Polchinski (AP), Callan–Giddings–Harvey–Strominger (CGHS), and Russo–Susskind–Thorlacius (RST)), the semiclassical action for metric <MathView math="g_{ab}" />, dilaton field <MathView math="\Phi" />, and <MathView math="N" /> conformal matter fields <MathView math="f_i" /> is:
            </p>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center font-mono text-cyan-300">
              <MathView math="I_{\mathrm{bulk}} = \frac{1}{16\pi G_N} \int_{\mathcal{M}} d^2x \sqrt{-g} \left[ \Phi \left(R + \frac{2}{\ell^2}\right) + 2\Phi_0 R \right] + I_{\mathrm{CFT}}[g_{ab}, \{f_i\}_{i=1}^N]" />
            </div>

            <p>
              After the Page time <MathView math="t_{\mathrm{Page}}" />, the generalized entropy functional <MathView math="S_{\mathrm{gen}}(\mathcal{R} \cup \mathcal{I}) = \frac{\Phi(\partial\mathcal{I})}{4 G_N} + S_{\mathrm{CFT}}(\mathcal{R} \cup \mathcal{I})" /> is dominated by a non-trivial quantum extremal island <MathView math="\mathcal{I}" /> nucleating inside the black hole horizon. Reconstructing quantum microstates localized in <MathView math="\mathcal{I}" /> from the radiation bath <MathView math="\mathcal{R}" /> requires the inversion of non-unitary quantum encoding channels through Petz recovery maps.
            </p>
          </div>
        )}

        {/* Section 2 */}
        {activeSection === 'sec2' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-slate-100">2. Finite-Dimensional Modular Theory and Operator Differentials</h3>
            
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-cyan-300">Definition 2.1 (Finite-Dimensional KMS State):</span>
              <p className="mt-1">
                Given self-adjoint Hamiltonian <MathView math="H = H^\dagger" /> and inverse temperature <MathView math="\beta > 0" />, the thermal density operator is <MathView math="\rho_{\mathrm{KMS}} = \frac{e^{-\beta H}}{Z(\beta)}" />, where <MathView math="Z(\beta) = \Tr(e^{-\beta H})" />.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-cyan-300">Definition 2.2 (Modular Flow Group):</span>
              <p className="mt-1">
                The one-parameter modular automorphism group <MathView math="\sigma_t^{\mathrm{KMS}} \in \mathrm{Aut}(\mathcal{B}(\mathcal{H}))" /> generated by <MathView math="\rho_{\mathrm{KMS}}" /> acts as <MathView math="\sigma_t^{\mathrm{KMS}}(X) = \rho_{\mathrm{KMS}}^{\mathrm{i}t/\beta} X \rho_{\mathrm{KMS}}^{-\mathrm{i}t/\beta} = e^{-\mathrm{i}t H} X e^{\mathrm{i}t H}" />.
              </p>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-cyan-300">Lemma 2.4 (Cauchy Resolvent Integral Equivalence):</span>
              <p className="mt-1">
                For any <MathView math="\rho \in \mathcal{S}_{++}(\mathcal{H})" /> and <MathView math="H = H^\dagger" />, the spectral Daleckii–Krein formula is identically equivalent to the Cauchy resolvent integral:
              </p>
              <div className="my-2 p-2 bg-slate-900 rounded font-mono text-cyan-300 text-center">
                <MathView math="D\ln(\rho)[H] = \int_0^1 \left(u\rho + (1-u)\mathbb{I}\right)^{-1} H \left(u\rho + (1-u)\mathbb{I}\right)^{-1} du" />
              </div>
            </div>
          </div>
        )}

        {/* Section 3 */}
        {activeSection === 'sec3' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-slate-100">3. Paired Alicki Detailed Balance and Invariant Gibbs Semigroups</h3>
            
            <p>
              We model dissipative interactions with the thermal reservoir using Lindbladians <MathView math="\mathcal{L}: \mathcal{B}(\mathcal{H}) \to \mathcal{B}(\mathcal{H})" /> in GKSL form:
            </p>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center font-mono text-cyan-300">
              <MathView math="\mathcal{L}(\rho) = -\mathrm{i}[H, \rho] + \sum_{k} \left( \gamma_k \mathcal{D}[V_k](\rho) + \gamma_{-k} \mathcal{D}[V_k^\dagger](\rho) \right)" />
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-emerald-300">Theorem 3.2 (Exact Gibbs State Stationarity):</span>
              <p className="mt-1">
                Let <MathView math="\mathcal{L}" /> satisfy paired Alicki detailed balance (<MathView math="\gamma_{-k} = e^{-\beta \omega_k}\gamma_k" />). Then the thermal state <MathView math="\rho_{\mathrm{KMS}}" /> is an exact stationary fixed point:
              </p>
              <div className="my-2 p-2 bg-slate-900 rounded font-mono text-emerald-300 text-center">
                <MathView math="\mathcal{L}(\rho_{\mathrm{KMS}}) = 0" />
              </div>
              <p className="text-[11px] text-slate-400">
                In double-precision numerical benchmarks within Dilaton Studio, <MathView math="\|\mathcal{L}(\rho_{\mathrm{KMS}})\|_F \le 4.46 \times 10^{-16}" />, confirming stationarity to machine zero.
              </p>
            </div>
          </div>
        )}

        {/* Section 4 */}
        {activeSection === 'sec4' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-slate-100">4. Non-Commutative Relative-Entropy Geometry and the mLSI Bound</h3>
            
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-cyan-300">Theorem 4.1 (Petz Monotone Metric Classification and Relative-Entropy Hessian):</span>
              <p className="mt-1">
                The second Fréchet directional derivative of relative entropy coincides identically with the Kubo–Mori–Bogoliubov (KMB) metric:
              </p>
              <div className="my-2 p-2 bg-slate-900 rounded font-mono text-cyan-300 text-center">
                <MathView math="\left.\frac{d^2}{dt^2} D(\rho + tA \parallel \rho)\right|_{t=0} = \Tr(A \, D\ln(\rho)[A]) = \int_0^1 \Tr(\rho^{1-u} A \rho^u A) du = \langle A, A \rangle_{\mathrm{KMB}}" />
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-cyan-300">Theorem 4.3 (Analytical Constructive Bound for mLSI Constant):</span>
              <p className="mt-1">
                The entropy production rate <MathView math="\mathcal{I}_{\mathcal{L}}(\rho) \ge 2\alpha_1 D(\rho \parallel \rho_{\mathrm{KMS}})" /> satisfies the strictly positive lower bound:
              </p>
              <div className="my-2 p-2 bg-slate-900 rounded font-mono text-cyan-300 text-center">
                <MathView math="\alpha_1 \ge \frac{2\lambda_{\mathrm{gap}}(\mathcal{L})}{\ln(1/\lambda_{\min}(\rho_{\mathrm{KMS}})) + 2} > 0" />
              </div>
              <p className="text-[11px] text-slate-400">
                Consequently, relative entropy contracts exponentially: <MathView math="D(\rho_t \parallel \rho_{\mathrm{KMS}}) \le e^{-2\alpha_1 t} D(\rho_0 \parallel \rho_{\mathrm{KMS}})" />.
              </p>
            </div>
          </div>
        )}

        {/* Section 5 */}
        {activeSection === 'sec5' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-slate-100">5. Universal Twirled Petz Recovery and Strengthened DPI Deficit</h3>
            
            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-cyan-300">Definition 5.1 (Universal Twirled Petz Recovery Map):</span>
              <p className="mt-1">
                The rotated (twirled) Petz recovery map <MathView math="\widetilde{\mathcal{R}}_{\sigma, \mathcal{E}}" /> integrates the standard Petz map over modular time with the hyperbolic distribution <MathView math="\beta_0(t) = \frac{\pi/2}{\cosh(\pi t) + 1}" />:
              </p>
              <div className="my-2 p-2 bg-slate-900 rounded font-mono text-cyan-300 text-center overflow-x-auto">
                <MathView math="\widetilde{\mathcal{R}}_{\sigma, \mathcal{E}}(X) = \int_{-\infty}^\infty \beta_0(t) \, \sigma^{\mathrm{i}t/2} \mathcal{R}_{\sigma, \mathcal{E}}\left( (\mathcal{E}(\sigma))^{-\mathrm{i}t/2} X (\mathcal{E}(\sigma))^{\mathrm{i}t/2} \right) \sigma^{-\mathrm{i}t/2} \, dt" />
              </div>
            </div>

            <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800">
              <span className="font-semibold text-emerald-300">Theorem 5.2 (Strengthened Data Processing Inequality):</span>
              <p className="mt-1">
                For any states <MathView math="\rho, \sigma" /> and channel <MathView math="\mathcal{E}" />, the twirled Petz recovery map satisfies:
              </p>
              <div className="my-2 p-2 bg-slate-900 rounded font-mono text-emerald-300 text-center">
                <MathView math="\Delta_{\mathrm{DPI}} \equiv D(\rho \parallel \sigma) - D(\mathcal{E}(\rho) \parallel \mathcal{E}(\sigma)) \ge -\ln F\left( \rho, \, \widetilde{\mathcal{R}}_{\sigma, \mathcal{E}}(\mathcal{E}(\rho)) \right) \ge 0" />
              </div>
            </div>
          </div>
        )}

        {/* Section 6 */}
        {activeSection === 'sec6' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-slate-100">6. Resilient Quantum Mirror Descent with Faithful-State Regularization</h3>
            
            <p>
              We formulate state reconstruction as relative-entropy optimization: <MathView math="\min_{\rho} \mathcal{J}(\rho) \equiv D(\rho \parallel \widetilde{\mathcal{R}}_{\sigma, \mathcal{E}}(\rho_{\mathrm{out}}))" />. To prevent gradient divergence when eigenvalues vanish, we introduce the faithful regularization <MathView math="\Pi_\varepsilon(\rho) = (1-\varepsilon)\rho + \varepsilon \frac{\mathbb{I}}{d}" />.
            </p>

            <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2 font-mono text-[11px]">
              <div className="font-bold text-cyan-300">Algorithm 1: Faithful Quantum Mirror Descent</div>
              <div>1. Compute target: <MathView math="\rho_{\mathrm{target}} = \widetilde{\mathcal{R}}_{\sigma, \mathcal{E}}(\rho_{\mathrm{out}})" /></div>
              <div>2. Modular gradient: <MathView math="G_k = \ln\rho_k - \ln\rho_{\mathrm{target}} + \mathbb{I}" /></div>
              <div>3. Exponential step: <MathView math="\tilde{\rho}_{k+1} = \exp(\ln\rho_k - \eta G_k)" /></div>
              <div>4. Normalize trace: <MathView math="\hat{\rho}_{k+1} = \tilde{\rho}_{k+1} / \Tr(\tilde{\rho}_{k+1})" /></div>
              <div>5. Faithful conditioning: <MathView math="\rho_{k+1} = (1-\varepsilon)\hat{\rho}_{k+1} + \varepsilon \frac{\mathbb{I}}{d}" /></div>
            </div>
          </div>
        )}

        {/* Section 7 */}
        {activeSection === 'sec7' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-slate-100">7. Multi-Dimensional Empirical Benchmarks in Dilaton Studio</h3>
            <p>
              The complete theoretical framework was validated in Dilaton Studio across Hilbert space dimensions <MathView math="d \in \{2, 3, 4, 8\}" /> at inverse temperature <MathView math="\beta = 1.00" /> and damping <MathView math="\gamma_{\mathrm{damp}} = 0.15" />.
            </p>
            <p>
              All key numerical invariants hold to double-precision machine limits:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
              <li><strong className="text-slate-200">Stationarity:</strong> Residual <MathView math="\|\mathcal{L}(\rho_{\mathrm{KMS}})\|_F \le 4.46 \times 10^{-16}" />.</li>
              <li><strong className="text-slate-200">Fréchet Agreement:</strong> Daleckii–Krein DOI matches Cauchy resolvent to <MathView math="< 2.55 \times 10^{-7}" />.</li>
              <li><strong className="text-slate-200">DPI Satisfaction:</strong> <MathView math="\Delta_{\mathrm{DPI}} \ge -\ln F" /> holds across all dimensions.</li>
              <li><strong className="text-slate-200">Reconstruction:</strong> Twirled Petz achieves <MathView math="F \ge 94.95\%" /> fidelity.</li>
            </ul>
          </div>
        )}

        {/* Section 8 */}
        {activeSection === 'sec8' && (
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-6 space-y-4 text-xs text-slate-300 leading-relaxed">
            <h3 className="text-base font-bold text-slate-100">8. Conclusion and Selected References</h3>
            <p>
              We have established an exact mathematical bridge connecting Tomita–Takesaki modular theory, Kubo–Mori–Bogoliubov metric geometry, and resilient quantum mirror descent for black hole state reconstruction.
            </p>

            <div className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-[11px] text-slate-400 font-mono">
              <div>[1] Ghulam-e-Shah-e-Unmani, <em>Finite-Dimensional Modular Theory, Non-Commutative Relative-Entropy Geometry...</em>, Zenodo (2026), DOI: 10.5281/zenodo.22831838.</div>
              <div>[2] D. L. Jafferis, A. Lewkowycz, J. Maldacena, S. J. Suh, <em>Relative entropy equals bulk relative entropy</em>, JHEP 06 (2016) 004.</div>
              <div>[3] M. Junge, D. Kraft, R. Renner, D. Sutter, <em>Universal recovery from a relative entropy difference</em>, Phys. Rev. Lett. 120 (2018) 050502.</div>
              <div>[4] E. A. Carlen, J. Maas, <em>Gradient flow and entropy inequalities for quantum Markov semigroups</em>, J. Funct. Anal. 273 (2017) 1814.</div>
              <div>[5] G. Penington, <em>Entanglement wedge reconstruction and the information paradox</em>, JHEP 09 (2020) 002.</div>
              <div>[6] A. Almheiri, N. Engelhardt, D. Marolf, H. Maxfield, <em>The entropy of bulk quantum fields...</em>, JHEP 12 (2019) 063.</div>
            </div>

            {/* BibTeX Box */}
            <div className="mt-5 p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-slate-400">
                <span className="font-semibold text-slate-200">BibTeX Citation Entry</span>
                <button
                  onClick={handleCopyBibtex}
                  className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300 transition-colors"
                >
                  {copiedBibtex ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedBibtex ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="text-[11px] text-slate-300 overflow-x-auto whitespace-pre leading-relaxed selection:bg-cyan-500/30">
                {BIBTEX_CITATION}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
