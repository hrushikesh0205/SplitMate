import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { classNames } from '../../lib/utils.jsx';

/**
 * Full-screen group-details modal with a gradient hero header.
 * Replaces the generic Modal for the group detail view only.
 * All sizing, scrolling, backdrop, and keyboard behaviour are self-contained.
 */
export function GroupModal({ open, onClose, children, coverCls = 'from-primary-500 to-violet-500', headerContent }) {
  const contentRef = useRef(null);

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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="relative w-full max-w-2xl card-surface rounded-t-3xl sm:rounded-3xl shadow-lift animate-scale-in overflow-hidden">
        {/* Gradient hero */}
        <div className={classNames('relative bg-gradient-to-br px-6 pt-6 pb-5', coverCls)}>
          <div className="absolute inset-0 bg-grid-dark opacity-20" />
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-xl bg-white/15 text-white backdrop-blur transition hover:bg-white/25"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <div className="relative pr-10">{headerContent}</div>
        </div>

        {/* Scrollable body */}
        <div ref={contentRef} className="max-h-[60vh] overflow-y-auto scrollbar-none">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
