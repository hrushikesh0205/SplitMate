import { useMemo } from 'react';
import { classNames, formatMoney } from '../lib/utils.jsx';

/** Lightweight dependency-free charts rendered as SVG. */

export function DonutChart({ data = [], size = 160, thickness = 18, currency = 'INR' }) {
  // data: [{ label, value, color }]
  const total = data.reduce((s, d) => s + Math.max(0, d.value), 0) || 1;
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={thickness} />
          {data.map((d, i) => {
            const len = (Math.max(0, d.value) / total) * circ;
            const seg = (
              <circle
                key={i}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                stroke={d.color}
                strokeWidth={thickness}
                strokeDasharray={`${len} ${circ - len}`}
                strokeDashoffset={-offset}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.6s ease' }}
              />
            );
            offset += len;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[10px] text-muted">Total</span>
          <span className="text-base font-bold text-[var(--fg)]">{formatMoney(total, currency)}</span>
        </div>
      </div>
      <ul className="space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 rounded-full" style={{ background: d.color }} />
            <span className="text-muted">{d.label}</span>
            <span className="ml-auto font-semibold text-[var(--fg)]">{formatMoney(d.value, currency)}</span>
          </li>
        ))}
        {data.length === 0 && <li className="text-xs text-muted">No data yet</li>}
      </ul>
    </div>
  );
}

export function BarChart({ data = [], height = 160, currency = 'INR' }) {
  // data: [{ label, value }]
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d, i) => {
        const h = (Math.max(0, d.value) / max) * (height - 28);
        return (
          <div key={i} className="flex flex-1 flex-col items-center justify-end gap-2">
            <span className="text-[10px] font-semibold text-muted">{d.value > 0 ? formatMoney(d.value, currency, { decimals: 0 }) : ''}</span>
            <div
              className="w-full max-w-[28px] rounded-t-lg bg-gradient-to-t from-primary-500/70 to-violet-500 transition-all hover:from-primary-500 hover:to-violet-400"
              style={{ height: Math.max(4, h) }}
              title={`${d.label}: ${formatMoney(d.value, currency)}`}
            />
            <span className="text-[10px] text-muted">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}

export function Sparkline({ values = [], width = 120, height = 36, color = 'var(--primary-500)' }) {
  const path = useMemo(() => {
    if (!values.length) return '';
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const step = width / (values.length - 1 || 1);
    return values
      .map((v, i) => `${i === 0 ? 'M' : 'L'} ${i * step} ${height - ((v - min) / range) * height}`)
      .join(' ');
  }, [values, width, height]);

  return (
    <svg width={width} height={height} className="overflow-visible">
      <path d={path} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ProgressRing({ value = 0, size = 56, thickness = 6, tone = 'primary' }) {
  const v = Math.min(100, Math.max(0, value));
  const radius = (size - thickness) / 2;
  const circ = 2 * Math.PI * radius;
  const colors = { primary: '#6366f1', accent: '#10b981', warn: '#f59e0b', danger: '#ef4444' };
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={thickness} />
        <circle
          cx={size / 2} cy={size / 2} r={radius} fill="none"
          stroke={colors[tone]} strokeWidth={thickness}
          strokeDasharray={`${(v / 100) * circ} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-[11px] font-bold text-[var(--fg)]">
        {Math.round(v)}%
      </div>
    </div>
  );
}
