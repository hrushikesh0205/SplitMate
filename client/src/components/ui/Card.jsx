import { classNames } from '../../lib/utils.jsx';

export function Card({ className, children, hover, onClick, ...rest }) {
  return (
    <div
      onClick={onClick}
      className={classNames(
        'card-surface',
        hover && 'transition hover:shadow-lift hover:-translate-y-0.5 cursor-pointer',
        className
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action, className }) {
  return (
    <div className={classNames('flex items-start justify-between gap-4 p-5 pb-0', className)}>
      <div>
        {title && <h3 className="text-sm font-semibold text-[var(--fg)]">{title}</h3>}
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={classNames('p-5', className)}>{children}</div>;
}
