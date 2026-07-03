import { createContext, useCallback, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { CheckCircle2, AlertTriangle, Info, XCircle, X } from 'lucide-react';
import { classNames, uid } from '../../lib/utils.jsx';

const ToastCtx = createContext(null);

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};
const TONES = {
  success: 'text-accent-500',
  error: 'text-danger-500',
  warning: 'text-warn-500',
  info: 'text-primary-500',
};

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback((toast) => {
    const id = uid();
    setToasts((t) => [...t, { id, type: 'info', ...toast }]);
    setTimeout(() => remove(id), toast.duration || 3800);
  }, [remove]);

  const api = {
    success: (msg, opts = {}) => push({ type: 'success', message: msg, ...opts }),
    error: (msg, opts = {}) => push({ type: 'error', message: msg, ...opts }),
    warning: (msg, opts = {}) => push({ type: 'warning', message: msg, ...opts }),
    info: (msg, opts = {}) => push({ type: 'info', message: msg, ...opts }),
  };

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {createPortal(
        <div className="fixed bottom-4 right-4 z-[60] flex w-full max-w-xs flex-col gap-2">
          {toasts.map((t) => {
            const Icon = ICONS[t.type] || Info;
            return (
              <div key={t.id} className="card-surface flex items-start gap-3 p-3.5 shadow-lift animate-slide-in-right">
                <Icon size={18} className={classNames('mt-0.5 shrink-0', TONES[t.type])} />
                <div className="flex-1">
                  {t.title && <p className="text-xs font-semibold text-[var(--fg)]">{t.title}</p>}
                  <p className="text-xs text-muted">{t.message}</p>
                </div>
                <button onClick={() => remove(t.id)} className="text-muted hover:text-[var(--fg)] transition">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>,
        document.body
      )}
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
}
