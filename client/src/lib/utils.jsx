export function classNames(...args) {
  return args.filter(Boolean).join(' ');
}

export function formatMoney(amount, currency = 'INR', opts = {}) {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      maximumFractionDigits: opts.decimals ?? 2,
      minimumFractionDigits: opts.decimals ?? 2,
    }).format(value);
  } catch {
    return `₹${value.toFixed(2)}`;
  }
}

export function formatCompact(amount, currency = 'INR') {
  const value = Number(amount || 0);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency,
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  } catch {
    return `₹${value.toFixed(0)}`;
  }
}

export function formatDate(input, style = 'medium') {
  if (!input) return '';
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  if (Number.isNaN(d.getTime())) return '';
  if (style === 'short') return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (style === 'time') return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  if (style === 'long') return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function relativeTime(input) {
  if (!input) return '';
  const d = typeof input === 'string' || typeof input === 'number' ? new Date(input) : input;
  const diff = (Date.now() - d.getTime()) / 1000;
  const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' });
  if (diff < 60) return rtf.format(-Math.round(diff), 'second');
  if (diff < 3600) return rtf.format(-Math.round(diff / 60), 'minute');
  if (diff < 86400) return rtf.format(-Math.round(diff / 3600), 'hour');
  if (diff < 2592000) return rtf.format(-Math.round(diff / 86400), 'day');
  if (diff < 31536000) return rtf.format(-Math.round(diff / 2592000), 'month');
  return rtf.format(-Math.round(diff / 31536000), 'year');
}

export function initials(name = '') {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() || '')
    .join('') || '?';
}

const AVATAR_COLORS = [
  'from-indigo-500 to-violet-500',
  'from-emerald-500 to-teal-500',
  'from-rose-500 to-pink-500',
  'from-amber-500 to-orange-500',
  'from-sky-500 to-blue-500',
  'from-fuchsia-500 to-purple-500',
];

export function avatarGradient(seed = '') {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

export function groupSortDateKey(item) {
  const d = item.created_at || item.date;
  return d ? new Date(d).toISOString().slice(0, 10) : 'unknown';
}

export function debounce(fn, wait = 250) {
  let t;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), wait);
  };
}

export function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
