import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { classNames } from '../../lib/utils.jsx';

export function Modal({ open, onClose, title, subtitle, children, footer, size = 'md' }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-ink-950/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        className={classNames(
          'relative w-full card-surface rounded-t-2xl sm:rounded-2xl shadow-lift animate-scale-in',
          sizes[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 p-5 pb-3 border-b border-token">
          <div>
            {title && <h2 className="text-base font-semibold text-[var(--fg)]">{title}</h2>}
            {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted hover:text-[var(--fg)] hover:bg-elev transition"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
        {footer && <div className="flex items-center justify-end gap-2 border-t border-token p-4 bg-elev/40 rounded-b-2xl">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
