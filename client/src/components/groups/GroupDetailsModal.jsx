import { useState } from 'react';
import { GroupModal } from './GroupModal.jsx';
import { MemberCard } from './MemberCard.jsx';
import { AddMemberModal } from './AddMemberModal.jsx';
import { EditGroupModal } from './EditGroupModal.jsx';
import { DeleteGroupModal } from './DeleteGroupModal.jsx';
import { Avatar } from '../ui/Avatar.jsx';
import { Button } from '../ui/Button.jsx';
import { Badge } from '../ui/Badge.jsx';
import { EmptyState } from '../ui/EmptyState.jsx';
import { categoryMeta } from '../../lib/categories.jsx';
import { formatMoney, formatDate, relativeTime, classNames } from '../../lib/utils.jsx';
import {
  Users, Receipt, Wallet, CalendarDays, Plus, Pencil, Trash2,
  UserPlus, TrendingUp, TrendingDown, Minus, Crown,
} from 'lucide-react';

const COVER_COLORS = [
  { key: 'indigo',  cls: 'from-primary-500 to-violet-500' },
  { key: 'emerald', cls: 'from-accent-500 to-teal-500' },
  { key: 'rose',    cls: 'from-rose-500 to-pink-500' },
  { key: 'amber',   cls: 'from-amber-500 to-orange-500' },
  { key: 'sky',     cls: 'from-sky-500 to-blue-500' },
  { key: 'fuchsia', cls: 'from-fuchsia-500 to-purple-500' },
];

function coverCls(key) {
  return (COVER_COLORS.find((c) => c.key === key) || COVER_COLORS[0]).cls;
}

/* ─── Stat card used in the 2×2 grid ─── */
function StatTile({ icon: Icon, label, value, valueCls, sub }) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur-sm">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/15">
          <Icon size={14} className="text-white" />
        </span>
        <span className="text-[11px] font-medium text-white/70">{label}</span>
      </div>
      <p className={classNames('text-xl font-bold leading-none text-white', valueCls)}>{value}</p>
      {sub && <p className="text-[10px] text-white/60">{sub}</p>}
    </div>
  );
}

/* ─── Compact expense row ─── */
function ExpenseRow({ expense, payer, currency }) {
  const cat = categoryMeta(expense.category || 'general');
  return (
    <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-elev">
      <span className={classNames('flex h-9 w-9 shrink-0 items-center justify-center rounded-xl', cat.bg, cat.color)}>
        <cat.icon size={16} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-[var(--fg)]">{expense.title || expense.description}</p>
        <p className="mt-0.5 truncate text-[11px] text-muted">
          {payer ? `${payer} paid` : 'Shared'} · {formatDate(expense.date || expense.createdAt, 'short')}
        </p>
      </div>
      <p className="shrink-0 text-sm font-bold text-[var(--fg)]">{formatMoney(expense.amount, currency)}</p>
    </div>
  );
}

/**
 * Full-featured group details modal.
 *
 * Props
 *   group         – group object
 *   members       – array of { user_id, role, profile: { full_name, avatar_url } }
 *   expenses      – array of expense objects for this group
 *   net           – number (current user's net balance in this group)
 *   currency      – e.g. 'USD'
 *   currentUserId – auth user id
 *   isOwner       – boolean
 *   onClose       – () => void
 *   onRemoveMember – (group, member) => void
 *   onCreatedExpense – () => void   (called after add-expense succeeds)
 *   onGroupUpdated   – (updated) => void
 *   onGroupDeleted   – () => void
 *   onMemberAdded    – () => void
 */
export function GroupDetailsModal({
  group,
  members = [],
  expenses = [],
  net = 0,
  currency = 'USD',
  currentUserId,
  isOwner,
  onClose,
  onRemoveMember,
  onAddExpense,
  onGroupUpdated,
  onGroupDeleted,
  onMemberAdded,
}) {
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [showDelete, setShowDelete] = useState(false);

  if (!group) return null;

  const totalExpenses = expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
  const createdById = typeof group.createdBy === 'object' ? group.createdBy?._id : group.createdBy;
  const ownerProfile = members.find((m) => m.user_id === createdById)?.profile;
  const ownerName = ownerProfile?.full_name || group.createdBy?.name || 'Unknown';
  const recentExpenses = expenses.slice(0, 5);

  /* balance colour + icon */
  const balanceCls = net > 0 ? 'text-emerald-300' : net < 0 ? 'text-rose-300' : 'text-white/70';
  const BalIcon = net > 0 ? TrendingUp : net < 0 ? TrendingDown : Minus;

  /* member helper */
  const payerName = (expense) => {
    const paidById = typeof expense.paidBy === 'object' ? expense.paidBy?._id : expense.paidBy || expense.paid_by;
    const m = members.find((m) => m.user_id === paidById);
    return m?.profile?.full_name || expense.paidBy?.name || null;
  };

  return (
    <>
      <GroupModal
        open={!!group}
        onClose={onClose}
        coverCls={coverCls(group.cover_color)}
        headerContent={
          <div className="space-y-3">
            {/* Group identity */}
            <div className="flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/20 backdrop-blur">
                <Users size={22} className="text-white" />
              </span>
              <div className="min-w-0 flex-1 pt-1">
                <h2 className="truncate text-xl font-bold text-white">{group.name}</h2>
                {group.description && (
                  <p className="mt-0.5 line-clamp-1 text-sm text-white/70">{group.description}</p>
                )}
              </div>
            </div>

            {/* 2 × 2 stat grid */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <StatTile
                icon={Users}
                label="Members"
                value={members.length}
                sub={`${members.length === 1 ? '1 person' : `${members.length} people`}`}
              />
              <StatTile
                icon={Receipt}
                label="Total expenses"
                value={formatMoney(totalExpenses, currency)}
                sub={`${expenses.length} transactions`}
              />
              <StatTile
                icon={BalIcon}
                label="Your balance"
                value={`${net > 0 ? '+' : ''}${formatMoney(net, currency)}`}
                valueCls={balanceCls}
                sub={net > 0 ? 'you are owed' : net < 0 ? 'you owe' : 'settled up'}
              />
              <StatTile
                icon={CalendarDays}
                label="Created by"
                value={ownerName.split(' ')[0]}
                sub={formatDate(group.createdAt, 'short')}
              />
            </div>
          </div>
        }
      >
        {/* ── Members section ── */}
        <section className="px-5 pt-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Members · {members.length}
            </h3>
            {isOwner && (
              <Button
                size="sm"
                variant="ghost"
                leftIcon={<UserPlus size={13} />}
                onClick={() => setShowAddMember(true)}
              >
                Add member
              </Button>
            )}
          </div>

          {members.length ? (
            <ul className="space-y-2">
              {members.map((m) => (
                <MemberCard
                  key={m.user_id}
                  member={m}
                  isOwner={m.user_id === createdById}
                  isSelf={m.user_id === currentUserId}
                  canRemove={isOwner && m.user_id !== createdById}
                  onRemove={() => onRemoveMember?.(group, m)}
                />
              ))}
            </ul>
          ) : (
            <EmptyState
              icon={Users}
              title="No members yet"
              description="Add members to start splitting expenses."
              className="border-0 py-6"
            />
          )}
        </section>

        {/* ── Recent expenses section ── */}
        <section className="mt-5 border-t border-token px-5 pt-5 pb-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-muted">
              Recent expenses
            </h3>
            <Button
              size="sm"
              variant="ghost"
              leftIcon={<Plus size={13} />}
              onClick={onAddExpense}
            >
              Add expense
            </Button>
          </div>

          {recentExpenses.length ? (
            <div className="-mx-4">
              {recentExpenses.map((e) => (
                <ExpenseRow
                  key={e.id || e._id}
                  expense={e}
                  payer={payerName(e)}
                  currency={currency}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              icon={Receipt}
              title="No expenses yet"
              description="Add the first expense and split it with your group."
              action={
                <Button size="sm" leftIcon={<Plus size={14} />} onClick={onAddExpense}>
                  Add expense
                </Button>
              }
              className="border-0 py-6"
            />
          )}
        </section>

        {/* ── Footer actions ── */}
        <div className="sticky bottom-0 border-t border-token bg-[var(--card)] px-5 py-4">
          <div className="flex items-center gap-2">
            {isOwner && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Pencil size={14} />}
                  onClick={() => setShowEdit(true)}
                  className="flex-1"
                >
                  Edit group
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  leftIcon={<Trash2 size={14} />}
                  onClick={() => setShowDelete(true)}
                  className="flex-1 !text-danger-500 !border-danger-200 dark:!border-danger-500/30 hover:!bg-danger-50 dark:hover:!bg-danger-500/10"
                >
                  Delete group
                </Button>
              </>
            )}
            {!isOwner && (
              <Button variant="ghost" size="sm" onClick={onClose} className="flex-1">
                Close
              </Button>
            )}
          </div>
        </div>
      </GroupModal>

      {/* Sub-modals */}
      <AddMemberModal
        open={showAddMember}
        onClose={() => setShowAddMember(false)}
        group={group}
        onAdded={() => { setShowAddMember(false); onMemberAdded?.(); }}
      />

      <EditGroupModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        group={group}
        onUpdated={(updated) => { setShowEdit(false); onGroupUpdated?.(updated); }}
      />

      <DeleteGroupModal
        open={showDelete}
        onClose={() => setShowDelete(false)}
        group={group}
        onDeleted={() => { setShowDelete(false); onGroupDeleted?.(); }}
      />
    </>
  );
}
