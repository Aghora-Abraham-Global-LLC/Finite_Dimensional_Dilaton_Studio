# Dilaton Studio: Finite-Dimensional Modular Theory & Holographic Reconstruction

[![DOI](https://zenodo.org/badge/DOI/10.5281/zenodo.22831838.svg)](https://doi.org/10.5281/zenodo.22831838)
[![License: CC BY 4.0](https://img.shields.io/badge/License-CC%20BY%204.0-blue.svg)](https://creativecommons.org/licenses/by/4.0/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6+-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0+-646CFF?logo=vite&logoColor=white)](https://vitejs.dev/)
[![Cloudflare Pages](https://img.shields.io/badge/Deploy-Cloudflare%20Pages-F38020?logo=cloudflare&logoColor=white)](https://pages.cloudflare.com/)

An interactive, double-precision numerical simulation engine and research platform companion to the manuscript:

> **"Finite-Dimensional Modular Theory, Non-Commutative Relative-Entropy Geometry, and Resilient Quantum Mirror Descent for Holographic State Reconstruction"**  
> *Author:* Ghulam-e-Shah-e-Unmani (AryaArunachalaAnanda)  
> *Affiliation:* BhutaDamaraSena R&D Labs, Aghora Abraham Global LLC  
> *Permanent Identifier:* [Zenodo DOI: 10.5281/zenodo.22831838](https://doi.org/10.5281/zenodo.22831838)

---

## 🌟 Key Research Features & Mathematical Modules

1. **Modular Operator Theory & Derivative of the Matrix Logarithm**
   - Implements the Cauchy contour integral and Daleckii-Krein integral representations:
     $$\mathcal{D}\ln\rho[H] = \int_0^1 (\rho + s I)^{-1} H (\rho + s I)^{-1} \, ds$$
   - IEEE 754 double-precision numerical verification proving machine-precision agreement:
     $$\|\mathcal{D}\ln^{\text{DOI}}\rho - \mathcal{D}\ln^{\text{Cauchy}}\rho\|_F \le 10^{-14}$$

2. **Paired Alicki Detailed Balance & Generator Stationarity (Theorem 3.2)**
   - Computes Lindbladian jump operators $\mathcal{L}(X)$ satisfying quantum detailed balance with respect to the Kubo-Mori-Bogoliubov (KMB) inner product:
     $$\langle A, \mathcal{L}(B) \rangle_{\rho_{\text{KMS}}} = \langle \mathcal{L}^\dagger(A), B \rangle_{\rho_{\text{KMS}}}$$
   - Direct verification of stationary state preservation: $\|\mathcal{L}(\rho_{\text{KMS}})\|_F \le 10^{-14}$.

3. **Modified Log-Sobolev Inequality (mLSI) & Exponential Quantum Contraction (Theorem 4.3)**
   - Dynamic evaluation of the spectral gap $\lambda_{\text{gap}}(\mathcal{L})$, KMS condition number $\kappa(\rho_{\text{KMS}})$, and the universal lower bound:
     $$\alpha_1(\mathcal{L}) \ge \frac{2 \lambda_{\text{gap}}(\mathcal{L})}{\kappa(\rho_{\text{KMS}})}$$

4. **Universal Twirled Petz Recovery Map & DPI Remainder Verification (Theorem 5.2)**
   - Numerical integration of the modular twirled Petz map over the distribution $\beta_0(t) = \frac{\pi}{2}(\cosh(\pi t) + 1)^{-1}$:
     $$\widetilde{\mathcal{R}}_{\sigma,\mathcal{N}}(Y) = \int_{-\infty}^{\infty} \beta_0(t) \, \sigma^{it/2} \mathcal{R}_{\sigma,\mathcal{N}}\!\left(\mathcal{N}(\sigma)^{-it/2} Y \mathcal{N}(\sigma)^{it/2}\right) \sigma^{-it/2} \, dt$$
   - Quantitative validation of the Data Processing Inequality (DPI) remainder theorem:
     $$-\ln F\left(\rho, \widetilde{\mathcal{R}}_{\sigma,\mathcal{N}}(\mathcal{N}(\rho))\right) \le D(\rho\|\sigma) - D(\mathcal{N}(\rho)\|\mathcal{N}(\sigma))$$

5. **Resilient Quantum Mirror Descent (Algorithm 1)**
   - Holographic state reconstruction with noisy operator evaluations, von Neumann entropy regularizer, quantum gradient steps, and adaptive threshold projection:
     $$\rho^{(k+1)} = \arg\min_{\rho \in \mathcal{D}(\mathcal{H})} \left\{ \langle \nabla f(\rho^{(k)}), \rho \rangle + \frac{1}{\eta_k} D(\rho \,\|\, \rho^{(k)}) \right\}$$

6. **2D Jackiw-Teitelboim (JT) Dilaton Gravity & Quantum Extremal Surface (QES) Phase Transitions**
   - Generalized entropy curves reproducing the Page curve and transition from empty island to non-trivial interior island:
     $$S_{\text{gen}}(x) = \frac{\Phi(x)}{4 G_N} + S_{\text{semi-cl}}(\text{Rad} \cup \text{Island}(x))$$

---

## 📊 Table 1 Benchmark Reproduction

The engine provides live, client-side re-computation of the paper's benchmarks across dimensions $d \in \{2, 3, 4, 8\}$ at inverse temperature $\beta = 1.00$ and damping $\gamma_{\text{damp}} = 0.15$:

| Dimension $d$ | $\kappa(\rho_{\text{KMS}})$ | $\lambda_{\text{gap}}(\mathcal{L})$ | $\alpha_1$ (mLSI bound) | $\|\mathcal{L}(\rho_{\text{KMS}})\|_F$ | $\|\mathcal{D}\ln^{\text{DOI}} - \mathcal{D}\ln^{\text{Cauchy}}\|_F$ | $F_{\text{Petz}}$ | $\Delta_{\text{DPI}}$ | $-\ln F_{\text{twirled}}$ | DPI Validated |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **$d = 2$** | 2.718 | 0.300 | 0.221 | $4.2 \times 10^{-16}$ | $1.8 \times 10^{-15}$ | 0.982 | 0.042 | 0.018 | **True** ($\le \Delta$) |
| **$d = 3$** | 4.112 | 0.274 | 0.133 | $7.8 \times 10^{-16}$ | $3.4 \times 10^{-15}$ | 0.954 | 0.089 | 0.047 | **True** ($\le \Delta$) |
| **$d = 4$** | 7.389 | 0.245 | 0.066 | $1.2 \times 10^{-15}$ | $6.1 \times 10^{-15}$ | 0.931 | 0.141 | 0.071 | **True** ($\le \Delta$) |
| **$d = 8$** | 20.085 | 0.188 | 0.019 | $3.5 \times 10^{-15}$ | $1.4 \times 10^{-14}$ | 0.912 | 0.185 | 0.091 | **True** ($\le \Delta$) |

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18.0 or higher
- npm, yarn, or pnpm

### Setup
```bash
# 1. Clone the repository
git clone https://github.com/YOUR_USERNAME/dilaton-studio.git
cd dilaton-studio

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) (or the port output in your terminal) in your web browser.

### Building for Production
```bash
npm run build
```
This builds static client assets into the `dist/` directory, optimized with minification, tree-shaking, and sourcemaps.

---

## 🌐 How to Make the Site Live

You have two free, production-ready hosting options:

### Option A: 100% GitHub Pages (Hosted directly by GitHub — No external services!)

The repository includes a pre-configured GitHub Actions deployment workflow (`.github/workflows/deploy.yml`).

1. **Push this repository to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: initial release of Dilaton Studio v4.0.0"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/dilaton-studio.git
   git push -u origin main
   ```

2. **Enable GitHub Pages in your repository settings**:
   - Go to your GitHub repository in your browser.
   - Click **Settings** (gear icon) > **Pages** (in the left sidebar).
   - Under **Build and deployment** > **Source**, select:  
     **GitHub Actions**
   - That's it! GitHub will automatically trigger the deployment action, compile the app, and host it live at:  
     `https://YOUR_USERNAME.github.io/dilaton-studio/`

---

### Option B: Cloudflare Pages (Instant Global Edge CDN)

If you prefer Cloudflare Pages:

1. Visit the [Cloudflare Dashboard](https://dash.cloudflare.com/) and navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Select your `dilaton-studio` GitHub repository.
3. Set build configuration:
   - **Framework preset**: `Vite`
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
4. Click **Save and Deploy**. Your site will be live at `https://dilaton-studio.pages.dev` with free SSL and custom domain support.

---

## 📄 Manuscript Source & Downloads

The full LaTeX manuscript source is included in this repository at:
- `Finite_dim_v4.tex`
- Also accessible directly from the live web UI under the **"Paper Reader"** tab, where you can download the `.tex` file or copy BibTeX citations.

---

## 📑 Citation

If you utilize this simulation suite, numerical routines, or mathematical formulation in your academic research, please cite:

```bibtex
@article{unmani2026finitedimensional,
  title={Finite-Dimensional Modular Theory, Non-Commutative Relative-Entropy Geometry, and Resilient Quantum Mirror Descent for Holographic State Reconstruction},
  author={Ghulam-e-Shah-e-Unmani, AryaArunachalaAnanda},
  journal={BhutaDamaraSena R\&D Labs Technical Report},
  volume={4},
  number={0},
  year={2026},
  publisher={Zenodo},
  doi={10.5281/zenodo.22831838},
  url={https://doi.org/10.5281/zenodo.22831838}
}
```

---

## 📜 License & Open Access

This project is licensed under the **Zenodo Open Research Software License — Creative Commons Attribution 4.0 International (CC BY 4.0)**:
- Permanent Zenodo Record: [https://doi.org/10.5281/zenodo.22831838](https://doi.org/10.5281/zenodo.22831838)
- See the full terms in the [LICENSE](LICENSE) file.
- Anyone is free to share, adapt, and build upon this software and research suite with author attribution to **Ghulam-e-Shah-e-Unmani (AryaArunachalaAnanda), BhutaDamaraSena R&D Labs**.
