import { classNames } from '../../lib/utils.jsx';

const VARIANTS = {
  primary: 'btn-primary',
  ghost: 'btn-ghost',
};
const SIZES = {
  sm: 'text-xs px-3 py-1.5 rounded-lg',
  md: '',
  lg: 'text-base px-5 py-3 rounded-xl',
};

export function Button({ children, variant = 'primary', size = 'md', loading, className, leftIcon, rightIcon, ...rest }) {
  return (
    <button
      className={classNames(VARIANTS[variant] || VARIANTS.primary, SIZES[size], className)}
      disabled={loading || rest.disabled}
      {...rest}
    >
      {loading ? (
        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="3" opacity="0.25" />
          <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
        </svg>
      ) : leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </button>
  );
}

export function IconButton({ children, className, ...rest }) {
  return (
    <button
      className={classNames(
        'inline-flex h-9 w-9 items-center justify-center rounded-xl border-token border bg-surface text-muted transition hover:text-[var(--fg)] hover:shadow-soft active:scale-95',
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
