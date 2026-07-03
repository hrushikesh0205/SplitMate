import { classNames } from '../../lib/utils.jsx';

const TONES = {
  neutral: 'border-token bg-elev text-muted',
  primary: 'border-primary-200 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:border-primary-500/30 dark:text-primary-300',
  accent: 'border-accent-200 bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:border-accent-500/30 dark:text-accent-300',
  warn: 'border-warn-100 bg-warn-50 text-warn-600 dark:bg-warn-500/10 dark:border-warn-500/30 dark:text-warn-400',
  danger: 'border-danger-100 bg-danger-50 text-danger-600 dark:bg-danger-500/10 dark:border-danger-500/30 dark:text-danger-400',
};

export function Badge({ children, tone = 'neutral', className, dot }) {
  return (
    <span className={classNames('chip', TONES[tone], className)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
