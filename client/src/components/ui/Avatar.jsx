import { classNames, initials, avatarGradient } from '../../lib/utils.jsx';

const SIZES = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-14 w-14 text-base',
  xl: 'h-20 w-20 text-xl',
};

export function Avatar({ name = '', src, size = 'md', className, ring }) {
  const text = initials(name);
  return (
    <span
      className={classNames(
        'relative inline-flex shrink-0 items-center justify-center rounded-full font-semibold text-white overflow-hidden',
        SIZES[size],
        ring && 'ring-2 ring-white dark:ring-ink-900',
        className
      )}
    >
      {src ? (
        <img src={src} alt={name} className="h-full w-full object-cover" referrerPolicy="no-referrer" />
      ) : (
        <span className={classNames('h-full w-full bg-gradient-to-br flex items-center justify-center', avatarGradient(name || text))}>
          {text}
        </span>
      )}
    </span>
  );
}

export function AvatarStack({ people = [], size = 'sm', max = 4 }) {
  const shown = people.slice(0, max);
  const extra = people.length - shown.length;
  return (
    <div className="flex items-center -space-x-2">
      {shown.map((p, i) => (
        <Avatar key={p.id || i} name={p.full_name || p.name} src={p.avatar_url} size={size} ring />
      ))}
      {extra > 0 && (
        <span className={classNames(
          'relative inline-flex items-center justify-center rounded-full font-semibold text-muted ring-2 ring-white dark:ring-ink-900 bg-elev border-token border',
          SIZES[size]
        )}>
          +{extra}
        </span>
      )}
    </div>
  );
}
