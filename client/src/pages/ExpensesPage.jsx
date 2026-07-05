import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from '../context/RouterContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';
import { Card, CardHeader, CardBody } from '../components/ui/Card.jsx';
import { Button, IconButton } from '../components/ui/Button.jsx';
import { Field, Input, Select } from '../components/ui/Input.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { CreateExpenseModal } from '../components/CreateExpenseModal.jsx';
import {
  fetchGroups, fetchAllExpenses, deleteExpense,
} from '../lib/api.jsx';
import { CATEGORIES, categoryMeta } from '../lib/categories.jsx';
import { formatMoney, formatDate, relativeTime, classNames } from '../lib/utils.jsx';
import {
  Receipt, Plus, Search, SlidersHorizontal, Trash2, Calendar,
  Users, ArrowDownUp, X, Check, Info,
} from 'lucide-react';

function ExpenseRow({ expense, groupName, payer, currentUser, currency, onOpen, onDelete, canDelete }) {
  const cat = categoryMeta(expense.category);
  const youPaid = expense.paid_by === currentUser?.id;
  const youInSplit = (expense.split_between || []).includes(currentUser?.id);
  // Use actual split amount if available, fall back to equal division
  const share = expense.split_amounts?.[currentUser?.id] ?? 
    (expense.split_between?.length ? Number(expense.amount) / expense.split_between.length : 0);
  return (
    <div onClick={() => onOpen(expense)} className="flex cursor-pointer items-center gap-3 rounded-xl p-3.5 transition hover:bg-elev">
      <span className={classNames('flex h-11 w-11 items-center justify-center rounded-xl', cat.bg, cat.color)}>
        <cat.icon size={18} />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-[var(--fg)]">{expense.description}</p>
          <Badge tone="neutral" className="hidden sm:inline-flex">{cat.label}</Badge>
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">
          {groupName} · paid by {payer?.full_name || 'someone'} · {formatDate(expense.date, 'short')}
        </p>
      </div>
      <div className="hidden sm:block text-right">
        <p className="text-sm font-bold text-[var(--fg)]">{formatMoney(expense.amount, currency)}</p>
        {youInSplit && <p className="text-[11px] text-muted">your share {formatMoney(share, currency)}</p>}
      </div>
      <div className="flex items-center gap-1">
        {youPaid && <Badge tone="accent" className="hidden md:inline-flex">you paid</Badge>}
        {canDelete && (
          <IconButton onClick={(e) => { e.stopPropagation(); onDelete(expense); }} aria-label="Delete expense" className="!h-8 !w-8">
            <Trash2 size={14} />
          </IconButton>
        )}
      </div>
    </div>
  );
}

function ExpenseDetailModal({ expense, groupName, payer, members, currency, onClose, onDelete, canDelete }) {
  if (!expense) return null;
  const cat = categoryMeta(expense.category);
  const splitPeople = (expense.split_between || []).map((id) => members.find((m) => m.user_id === id)).filter(Boolean);
  // Use actual split amounts map, fall back to equal division
  const equalShare = splitPeople.length ? Number(expense.amount) / splitPeople.length : 0;
  const getShare = (userId) => expense.split_amounts?.[userId] ?? equalShare;

  return (
    <Modal open={!!expense} onClose={onClose} title="Expense details" subtitle={groupName} size="md">
      <div className="space-y-5">
        <div className="flex items-center gap-4">
          <span className={classNames('flex h-14 w-14 items-center justify-center rounded-2xl', cat.bg, cat.color)}>
            <cat.icon size={24} />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-semibold text-[var(--fg)]">{expense.description}</h3>
            <p className="text-xs text-muted">{cat.label} · {formatDate(expense.date, 'long')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-[var(--fg)]">{formatMoney(expense.amount, currency)}</p>
            <Badge tone="neutral" className="mt-1">{expense.split_type}</Badge>
          </div>
        </div>

        <div className="rounded-xl border border-token bg-elev p-4">
          <p className="text-xs font-semibold text-muted">Paid by</p>
          <div className="mt-2 flex items-center gap-3">
            <Avatar name={payer?.full_name || 'User'} src={payer?.avatar_url} size="sm" />
            <p className="text-sm font-semibold text-[var(--fg)]">{payer?.full_name || 'Someone'}</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold text-muted">Split between · {splitPeople.length} people</p>
          <ul className="space-y-2">
            {splitPeople.map((m) => (
              <li key={m.user_id} className="flex items-center gap-3 rounded-xl border border-token bg-elev p-2.5">
                <Avatar name={m.profile?.full_name || 'User'} src={m.profile?.avatar_url} size="xs" />
                <span className="text-sm text-[var(--fg)]">{m.profile?.full_name || 'Someone'}</span>
                <span className="ml-auto text-sm font-semibold text-[var(--fg)]">{formatMoney(getShare(m.user_id), currency)}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Split visualization */}
        <div>
          <p className="mb-2 text-xs font-semibold text-muted">Split visualization</p>
          <div className="flex h-3 w-full overflow-hidden rounded-full">
            {splitPeople.map((m, i) => (
              <div
                key={m.user_id}
                className="h-full transition-all"
                style={{
                  width: `${100 / splitPeople.length}%`,
                  background: ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9'][i % 6],
                }}
                title={`${m.profile?.full_name || 'Someone'}: ${formatMoney(share, currency)}`}
              />
            ))}
          </div>
        </div>

        {canDelete && (
          <Button variant="ghost" size="sm" className="!text-danger-600 !border-danger-200 w-full" onClick={() => onDelete(expense)} leftIcon={<Trash2 size={14} />}>
            Delete expense
          </Button>
        )}
      </div>
    </Modal>
  );
}

export function ExpensesPage() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [memberMap, setMemberMap] = useState({});
  const [showExpense, setShowExpense] = useState(false);
  const [active, setActive] = useState(null);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [groupId, setGroupId] = useState('all');
  const [sort, setSort] = useState('recent');

  const currency = profile?.currency || 'INR';

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [g, e] = await Promise.all([fetchGroups(), fetchAllExpenses()]);
      setGroups(g);
      setExpenses(e);
      // Build memberMap from groups response (already populated — no extra requests)
      const mMap = {};
      g.forEach((grp) => { mMap[grp.id] = grp.members || []; });
      setMemberMap(mMap);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = expenses.slice();
    if (query) list = list.filter((e) => e.description.toLowerCase().includes(query.toLowerCase()));
    if (category !== 'all') list = list.filter((e) => e.category === category);
    if (groupId !== 'all') list = list.filter((e) => e.group_id === groupId);
    if (sort === 'recent') list.sort((a, b) => new Date(b.date) - new Date(a.date) || new Date(b.created_at) - new Date(a.created_at));
    if (sort === 'amount-high') list.sort((a, b) => Number(b.amount) - Number(a.amount));
    if (sort === 'amount-low') list.sort((a, b) => Number(a.amount) - Number(b.amount));
    return list;
  }, [expenses, query, category, groupId, sort]);

  const groupName = (id) => groups.find((g) => g.id === id)?.name || 'Group';
  const payerOf = (e) => memberMap[e.group_id]?.find((m) => m.user_id === e.paid_by)?.profile;
  const membersOf = (e) => memberMap[e.group_id] || [];

  const totalFiltered = filtered.reduce((s, e) => s + Number(e.amount || 0), 0);
  const hasFilters = query || category !== 'all' || groupId !== 'all';

  const handleDelete = async (expense) => {
    if (!confirm('Delete this expense?')) return;
    try {
      await deleteExpense(expense.id);
      toast.success('Expense deleted');
      setActive(null);
      load();
    } catch (err) {
      toast.error(err.message || 'Could not delete expense');
    }
  };

  const clearFilters = () => { setQuery(''); setCategory('all'); setGroupId('all'); };

  return (
    <DashboardLayout onCreateExpense={() => setShowExpense(true)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">Expenses</h2>
          <p className="text-sm text-muted">{filtered.length} expenses · {formatMoney(totalFiltered, currency)} total</p>
        </div>
        <Button onClick={() => setShowExpense(true)} leftIcon={<Plus size={15} />}>Add expense</Button>
      </div>

      {/* Filters bar */}
      <Card className="mt-5 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <Input placeholder="Search expenses…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <Select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-40">
            <option value="all">All groups</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
          <Select value={category} onChange={(e) => setCategory(e.target.value)} className="w-44">
            <option value="all">All categories</option>
            {CATEGORIES.map((c) => <option key={c.key} value={c.key}>{c.label}</option>)}
          </Select>
          <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-40">
            <option value="recent">Most recent</option>
            <option value="amount-high">Amount: high → low</option>
            <option value="amount-low">Amount: low → high</option>
          </Select>
          {hasFilters && (
            <Button variant="ghost" size="sm" onClick={clearFilters} leftIcon={<X size={14} />}>Clear</Button>
          )}
        </div>
      </Card>

      {/* List */}
      <div className="mt-5">
        {loading ? (
          <div className="space-y-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        ) : filtered.length ? (
          <Card className="divide-y divide-token">
            {filtered.map((e) => (
              <ExpenseRow
                key={e.id}
                expense={e}
                groupName={groupName(e.group_id)}
                payer={payerOf(e)}
                members={membersOf(e)}
                currentUser={user}
                currency={currency}
                onOpen={setActive}
                onDelete={handleDelete}
                canDelete={e.created_by === user?.id || groups.find((g) => g.id === e.group_id)?.created_by === user?.id}
              />
            ))}
          </Card>
        ) : (
          <EmptyState
            icon={Receipt}
            title={hasFilters ? 'No expenses match your filters' : 'No expenses yet'}
            description={hasFilters ? 'Try clearing filters or adjusting your search.' : 'Add your first expense to start splitting costs.'}
            action={<Button onClick={() => setShowExpense(true)} leftIcon={<Plus size={15} />}>Add expense</Button>}
          />
        )}
      </div>

      <CreateExpenseModal open={showExpense} onClose={() => setShowExpense(false)} onCreated={load} />
      <ExpenseDetailModal
        expense={active}
        groupName={active ? groupName(active.group_id) : ''}
        payer={active ? payerOf(active) : null}
        members={active ? membersOf(active) : []}
        currency={currency}
        onClose={() => setActive(null)}
        onDelete={handleDelete}
        canDelete={active && (active.created_by === user?.id || groups.find((g) => g.id === active.group_id)?.created_by === user?.id)}
      />
    </DashboardLayout>
  );
}
