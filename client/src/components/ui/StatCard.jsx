import { Card } from './Card.jsx';
import { classNames } from '../../lib/utils.jsx';

export function StatCard({ label, value, delta, deltaTone = 'neutral', icon: Icon, accent = 'primary', className }) {
  const accents = {
    primary: 'from-primary-500/15 to-violet-500/10 text-primary-500',
    accent: 'from-accent-500/15 to-emerald-500/10 text-accent-500',
    warn: 'from-warn-500/15 to-orange-500/10 text-warn-500',
    danger: 'from-danger-500/15 to-rose-500/10 text-danger-500',
  };
  const deltaTones = {
    up: 'text-accent-600 bg-accent-50 dark:bg-accent-500/10',
    down: 'text-danger-600 bg-danger-50 dark:bg-danger-500/10',
    neutral: 'text-muted bg-elev',
  };
  return (
    <Card className={classNames('p-5', className)}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-muted">{label}</span>
        {Icon && (
          <span className={classNames('flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br', accents[accent])}>
            <Icon size={18} />
          </span>
        )}
      </div>
      <div className="mt-3 flex items-end justify-between gap-3">
        <span className="text-2xl font-bold tracking-tight text-[var(--fg)]">{value}</span>
        {delta != null && (
          <span className={classNames('rounded-full px-2 py-0.5 text-[11px] font-semibold', deltaTones[deltaTone])}>
            {delta}
          </span>
        )}
      </div>
    </Card>
  );
}
