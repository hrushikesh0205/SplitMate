import { classNames } from '../../lib/utils.jsx';

export function EmptyState({ icon: Icon, title, description, action, className }) {
  return (
    <div className={classNames('flex flex-col items-center justify-center rounded-2xl border border-dashed border-token p-10 text-center', className)}>
      {Icon && (
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-50 text-primary-500 dark:bg-primary-500/10">
          <Icon size={26} />
        </div>
      )}
      <h3 className="text-sm font-semibold text-[var(--fg)]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description, onRetry }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-danger-200 bg-danger-50/40 p-10 text-center dark:border-danger-500/20 dark:bg-danger-500/5">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-100 text-danger-500 dark:bg-danger-500/10">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6"><path d="M12 8v5m0 3h.01M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </div>
      <h3 className="text-sm font-semibold text-[var(--fg)]">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-xs text-muted">{description}</p>}
      {onRetry && <button onClick={onRetry} className="btn-ghost mt-5">Try again</button>}
    </div>
  );
}
