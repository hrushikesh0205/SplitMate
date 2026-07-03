import { Avatar } from '../ui/Avatar.jsx';
import { IconButton } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { classNames } from '../../lib/utils.jsx';
import { Crown, UserMinus, Shield } from 'lucide-react';

/**
 * Single member row used inside GroupDetailsModal's member list.
 * Owns its own hover / remove affordance so the parent stays thin.
 */
export function MemberCard({ member, isOwner, isSelf, canRemove, onRemove }) {
  const name = member.profile?.full_name || member.name || 'Someone';
  const avatarUrl = member.profile?.avatar_url || member.avatar || '';
  const role = member.role || 'member';
  const isGroupOwner = isOwner;

  return (
    <div className={classNames(
      'group flex items-center gap-3 rounded-2xl border border-token bg-elev px-4 py-3 transition',
      'hover:border-primary-300/50 dark:hover:border-primary-500/30 hover:shadow-soft',
    )}>
      <div className="relative">
        <Avatar name={name} src={avatarUrl} size="md" />
        {isGroupOwner && (
          <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-warn-400 ring-2 ring-[var(--card)]">
            <Crown size={9} className="text-white" />
          </span>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-[var(--fg)]">{name}</p>
          {isSelf && (
            <span className="hidden sm:inline rounded-full bg-primary-500/10 px-2 py-0.5 text-[10px] font-semibold text-primary-600 dark:text-primary-300">
              you
            </span>
          )}
        </div>
        <p className="mt-0.5 flex items-center gap-1 text-[11px] capitalize text-muted">
          {isGroupOwner ? <Crown size={10} className="text-warn-400" /> : <Shield size={10} />}
          {isGroupOwner ? 'Owner' : role}
        </p>
      </div>

      {canRemove && (
        <IconButton
          onClick={onRemove}
          aria-label={`Remove ${name}`}
          className="opacity-0 group-hover:opacity-100 !h-8 !w-8 hover:!text-danger-500 hover:!border-danger-200"
        >
          <UserMinus size={14} />
        </IconButton>
      )}
    </div>
  );
}
