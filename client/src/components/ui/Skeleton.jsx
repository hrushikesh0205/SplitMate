import { classNames } from '../../lib/utils.jsx';

export function Skeleton({ className }) {
  return <div className={classNames('skeleton', className)} />;
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={classNames('space-y-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={classNames('h-3', i === lines - 1 && 'w-2/3')} />
      ))}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card-surface p-5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonText lines={2} />
    </div>
  );
}
