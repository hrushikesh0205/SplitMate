import { useId, useState } from 'react';
import { classNames } from '../../lib/utils.jsx';
import { Eye, EyeOff } from 'lucide-react';

export function Field({ label, error, hint, children, htmlFor }) {
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={htmlFor} className="block text-xs font-semibold text-muted">
          {label}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-xs font-medium text-danger-500 animate-fade-in">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted/80">{hint}</p>
      ) : null}
    </div>
  );
}

export function Input({ icon: Icon, error, className, type = 'text', ...rest }) {
  const [show, setShow] = useState(false);
  const id = useId();
  const isPassword = type === 'password';
  const actualType = isPassword && show ? 'text' : type;
  return (
    <div className="relative">
      {Icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted">
          <Icon size={16} />
        </span>
      )}
      <input
        id={id}
        type={actualType}
        className={classNames('input-field', Icon && 'pl-9', isPassword && 'pr-10', error && '!border-danger-400 !shadow-[0_0_0_4px_rgba(239,68,68,0.18)]', className)}
        {...rest}
      />
      {isPassword && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-[var(--fg)] transition"
          tabIndex={-1}
          aria-label={show ? 'Hide password' : 'Show password'}
        >
          {show ? <EyeOff size={16} /> : <Eye size={16} />}
        </button>
      )}
    </div>
  );
}

export function Textarea({ className, ...rest }) {
  return <textarea className={classNames('input-field resize-none', className)} {...rest} />;
}

export function Select({ className, children, ...rest }) {
  return (
    <select className={classNames('input-field appearance-none pr-9', className)} {...rest}>
      {children}
    </select>
  );
}
