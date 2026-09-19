import React, { useState } from 'react';
import { ComplexMatrix } from '../types';
import { cAbs, hermitianEigendecomposition, matTrace } from '../math/complex';
import { Copy, Check, Code } from 'lucide-react';

interface MatrixViewerProps {
  matrix: ComplexMatrix;
  title?: string;
  subtitle?: string;
  showEigens?: boolean;
}

export const MatrixViewer: React.FC<MatrixViewerProps> = ({
  matrix,
  title,
  subtitle,
  showEigens = true,
}) => {
  const [viewMode, setViewMode] = useState<'both' | 're' | 'im' | 'abs'>('both');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const d = matrix.length;

  const eigens = showEigens ? hermitianEigendecomposition(matrix) : null;
  const trace = matTrace(matrix);

  // Compute min and max for heatmap
  let maxAbs = 1e-12;
  for (let i = 0; i < d; i++) {
    for (let j = 0; j < d; j++) {
      const a = cAbs(matrix[i][j]);
      if (a > maxAbs) maxAbs = a;
    }
  }

  const formatNum = (n: number) => {
    if (Math.abs(n) < 1e-12) return '0.000';
    if (Math.abs(n) >= 1e4 || Math.abs(n) < 1e-3) {
      return n.toExponential(3);
    }
    return n.toFixed(4);
  };

  const getHeatmapColor = (re: number, im: number) => {
    const mag = Math.sqrt(re * re + im * im) / maxAbs;
    const alpha = Math.min(Math.max(mag * 0.45, 0.05), 0.55);
    if (re >= 0) {
      return `rgba(14, 165, 233, ${alpha})`; // sky blue
    }
    return `rgba(244, 63, 94, ${alpha})`; // rose red
  };

  const copyToClipboard = (type: 'numpy' | 'latex' | 'json') => {
    let text = '';
    if (type === 'latex') {
      const rows = matrix
        .map((row) =>
          row
            .map((c) => {
              if (Math.abs(c.im) < 1e-12) return c.re.toFixed(4);
              if (Math.abs(c.re) < 1e-12) return `${c.im.toFixed(4)}i`;
              return `${c.re.toFixed(4)} ${c.im >= 0 ? '+' : '-'} ${Math.abs(c.im).toFixed(4)}i`;
            })
            .join(' & ')
        )
        .join(' \\\\\n  ');
      text = `\\begin{pmatrix}\n  ${rows}\n\\end{pmatrix}`;
    } else if (type === 'numpy') {
      const rows = matrix
        .map(
          (row) =>
            `    [${row.map((c) => `${c.re} + ${c.im}j`).join(', ')}]`
        )
        .join(',\n');
      text = `import numpy as np\n\nA = np.array([\n${rows}\n], dtype=complex)`;
    } else {
      text = JSON.stringify(matrix, null, 2);
    }

    navigator.clipboard.writeText(text).then(() => {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    });
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg backdrop-blur-md">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div>
          {title && <h4 className="text-sm font-semibold text-slate-200">{title}</h4>}
          {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            {(['both', 're', 'im', 'abs'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-2 py-0.5 rounded capitalize transition-colors ${
                  viewMode === mode
                    ? 'bg-cyan-500/20 text-cyan-300 font-medium'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode === 'both' ? 'a + ib' : mode}
              </button>
            ))}
          </div>

          {/* Copy actions */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => copyToClipboard('latex')}
              title="Copy as LaTeX matrix"
              className="px-2 py-0.5 rounded text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              {copiedType === 'latex' ? <Check className="w-3 h-3 text-emerald-400" /> : <Code className="w-3 h-3" />}
              <span>{copiedType === 'latex' ? 'Copied' : 'LaTeX'}</span>
            </button>
            <button
              onClick={() => copyToClipboard('numpy')}
              title="Copy as NumPy complex array"
              className="px-2 py-0.5 rounded text-slate-400 hover:text-cyan-300 transition-colors flex items-center gap-1 font-mono text-[11px]"
            >
              {copiedType === 'numpy' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedType === 'numpy' ? 'Copied' : 'NumPy'}</span>
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="border-collapse w-full font-mono text-xs">
          <tbody>
            {matrix.map((row, r) => (
              <tr key={r}>
                {row.map((val, cIdx) => {
                  const isDiag = r === cIdx;
                  return (
                    <td
                      key={cIdx}
                      style={{ backgroundColor: getHeatmapColor(val.re, val.im) }}
                      className={`p-2 text-center border border-slate-800/80 transition-all duration-150 ${
                        isDiag ? 'font-semibold text-slate-100' : 'text-slate-300'
                      }`}
                    >
                      {viewMode === 'both' && (
                        <span>
                          {formatNum(val.re)}
                          {Math.abs(val.im) > 1e-12 && (
                            <span className="text-amber-400/90">
                              {val.im >= 0 ? ' +' : ' -'}{formatNum(Math.abs(val.im))}i
                            </span>
                          )}
                        </span>
                      )}
                      {viewMode === 're' && <span>{formatNum(val.re)}</span>}
                      {viewMode === 'im' && (
                        <span className="text-amber-400/90">{formatNum(val.im)}i</span>
                      )}
                      {viewMode === 'abs' && (
                        <span className="text-emerald-400/90">{formatNum(cAbs(val))}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
        <div className="flex items-center gap-2">
          <span>Dimension: <strong className="text-slate-200">{d} × {d}</strong></span>
          <span>•</span>
          <span>Tr: <strong className="text-slate-200">{formatNum(trace.re)}</strong></span>
        </div>

        {eigens && (
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-slate-400">Spec(A):</span>
            {eigens.values.map((v, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 bg-slate-950/80 border border-slate-800 rounded text-cyan-300 font-mono text-[11px]"
              >
                λ_{idx + 1} = {formatNum(v)}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
