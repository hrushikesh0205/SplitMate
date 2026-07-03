import { useEffect, useMemo, useState, useCallback } from 'react';
import { useRouter, Link } from '../context/RouterContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';
import { Card, CardHeader, CardBody } from '../components/ui/Card.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { Avatar, AvatarStack } from '../components/ui/Avatar.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Button } from '../components/ui/Button.jsx';
import { Skeleton, SkeletonCard } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { CreateExpenseModal } from '../components/CreateExpenseModal.jsx';
import { DonutChart, BarChart, ProgressRing } from '../components/Charts.jsx';
import {
  fetchGroups, fetchAllExpenses, fetchAllSettlements, fetchMembers,
  fetchNotifications, computeBalances,
} from '../lib/api.jsx';
import { CATEGORIES, categoryMeta } from '../lib/categories.jsx';
import { formatMoney, formatCompact, formatDate, relativeTime, classNames } from '../lib/utils.jsx';
import {
  Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight,
  Receipt, HandCoins, Plus, Users, Bell, Activity, PiggyBank,
} from 'lucide-react';

export function DashboardPage() {
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [memberCache, setMemberCache] = useState({});
  const [showExpense, setShowExpense] = useState(false);

  const currency = profile?.currency || 'USD';

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [g, e, s, n] = await Promise.all([
        fetchGroups(),
        fetchAllExpenses(),
        fetchAllSettlements(),
        fetchNotifications(),
      ]);
      setGroups(g); setExpenses(e); setSettlements(s); setNotifications(n);
      // prefetch members for groups
      const cache = {};
      await Promise.all((g || []).slice(0, 8).map(async (grp) => {
        try { cache[grp.id] = await fetchMembers(grp.id); } catch {}
      }));
      setMemberCache(cache);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  // Derive balances across all expenses+settlements for the user
  const myNet = useMemo(() => {
    return computeBalances({ expenses, settlements, userId: user?.id });
  }, [expenses, settlements, user?.id]);

  const youAreOwed = Math.max(0, myNet);
  const youOwe = Math.max(0, -myNet);
  const totalSettled = settlements.reduce((s, x) => s + Number(x.amount || 0), 0);

  // Per-group balances for the group summary
  const groupSummaries = useMemo(() => {
    return groups.map((g) => {
      const gExp = expenses.filter((e) => e.group_id === g.id);
      const gSet = settlements.filter((s) => s.group_id === g.id);
      const members = memberCache[g.id] || [];
      const net = computeBalances({ expenses: gExp, settlements: gSet, members, userId: user?.id });
      return { ...g, net, memberCount: members.length, members };
    });
  }, [groups, expenses, settlements, memberCache, user?.id]);

  // Monthly spend (last 6 months)
  const monthly = useMemo(() => {
    const months = [];
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({ key: d.toISOString().slice(0, 7), label: d.toLocaleDateString('en-US', { month: 'short' }), value: 0 });
    }
    for (const e of expenses) {
      const key = (e.date || '').slice(0, 7);
      const m = months.find((x) => x.key === key);
      if (m) m.value += Number(e.amount || 0);
    }
    return months;
  }, [expenses]);

  const monthTotal = monthly[monthly.length - 1]?.value || 0;
  const prevMonthTotal = monthly[monthly.length - 2]?.value || 0;
  const monthDelta = prevMonthTotal ? ((monthTotal - prevMonthTotal) / prevMonthTotal) * 100 : 0;

  // Category breakdown (this month)
  const categoryData = useMemo(() => {
    const map = new Map();
    const thisMonth = new Date().toISOString().slice(0, 7);
    for (const e of expenses) {
      if ((e.date || '').slice(0, 7) !== thisMonth) continue;
      map.set(e.category, (map.get(e.category) || 0) + Number(e.amount || 0));
    }
    const palette = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ec4899', '#0ea5e9', '#14b8a6', '#f43f5e', '#a855f7', '#84cc16', '#64748b', '#eab308'];
    return Array.from(map.entries()).map(([key, value], i) => ({
      label: categoryMeta(key).label,
      value,
      color: palette[i % palette.length],
    })).sort((a, b) => b.value - a.value).slice(0, 6);
  }, [expenses]);

  const recentActivity = useMemo(() => {
    const acts = [
      ...expenses.map((e) => ({ kind: 'expense', id: e.id, date: e.created_at, ref: e, group_id: e.group_id })),
      ...settlements.map((s) => ({ kind: 'settlement', id: s.id, date: s.created_at, ref: s, group_id: s.group_id })),
    ];
    return acts.sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);
  }, [expenses, settlements]);

  const groupName = (id) => groups.find((g) => g.id === id)?.name || 'a group';

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <Skeleton className="h-24 w-full" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          <div className="grid gap-4 lg:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout onCreateExpense={() => setShowExpense(true)}>
      {/* Welcome header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary-600 via-violet-600 to-accent-600 p-6 text-white shadow-lift sm:p-7">
        <div className="absolute inset-0 bg-grid-dark opacity-25" />
        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-white/80">{formatDate(new Date(), 'long')}</p>
            <h2 className="mt-1 text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {profile?.full_name?.split(' ')[0] || 'friend'} 👋
            </h2>
            <p className="mt-1 text-sm text-white/80">
              {groups.length ? `You have ${groups.length} active ${groups.length === 1 ? 'group' : 'groups'}.` : 'Create your first group to start splitting.'}
            </p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/groups')} className="inline-flex items-center gap-2 rounded-xl bg-white/15 px-3.5 py-2.5 text-xs font-semibold backdrop-blur transition hover:bg-white/25">
              <Users size={15} /> New group
            </button>
            <button onClick={() => setShowExpense(true)} className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2.5 text-xs font-semibold text-primary-700 transition hover:-translate-y-0.5">
              <Plus size={15} /> Add expense
            </button>
          </div>
        </div>
      </div>

      {/* Balance cards */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total balance" value={formatMoney(myNet, currency)} icon={Wallet} accent="primary"
          delta={myNet >= 0 ? `+${formatMoney(youAreOwed, currency)}` : `-${formatMoney(youOwe, currency)}`}
          deltaTone={myNet >= 0 ? 'up' : 'down'} />
        <StatCard label="You are owed" value={formatMoney(youAreOwed, currency)} icon={TrendingUp} accent="accent" delta="Incoming" deltaTone="up" />
        <StatCard label="You owe" value={formatMoney(youOwe, currency)} icon={TrendingDown} accent="danger" delta="Outgoing" deltaTone="down" />
        <StatCard label="Settled this month" value={formatMoney(totalSettled, currency)} icon={PiggyBank} accent="warn" delta="Cleared" deltaTone="neutral" />
      </div>

      {/* Main grid */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Monthly expense */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Monthly expenses"
            subtitle="Your share across all groups"
            action={
              <Badge tone={monthDelta >= 0 ? 'danger' : 'accent'} dot>
                {monthDelta >= 0 ? '+' : ''}{monthDelta.toFixed(1)}% vs last month
              </Badge>
            }
          />
          <CardBody>
            <div className="mb-4 flex items-baseline gap-2">
              <span className="text-3xl font-bold text-[var(--fg)]">{formatMoney(monthTotal, currency)}</span>
              <span className="text-xs text-muted">this month</span>
            </div>
            <BarChart data={monthly} currency={currency} height={180} />
          </CardBody>
        </Card>

        {/* Category donut */}
        <Card>
          <CardHeader title="Spending by category" subtitle="This month" />
          <CardBody>
            {categoryData.length ? (
              <DonutChart data={categoryData} currency={currency} />
            ) : (
              <EmptyState icon={Activity} title="No spend yet" description="Add an expense to see your category breakdown." className="border-0 py-6" />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Second row */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {/* Recent activity */}
        <Card className="lg:col-span-2">
          <CardHeader
            title="Recent activity"
            subtitle="Latest expenses and settlements"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/expenses')}>View all</Button>}
          />
          <CardBody className="pt-0">
            {recentActivity.length ? (
              <ul className="divide-y divide-token">
                {recentActivity.map((a) => {
                  const cat = categoryMeta(a.ref.category);
                  const Icon = a.kind === 'expense' ? cat.icon : HandCoins;
                  const youPaid = a.ref.paid_by === user?.id || a.ref.payer === user?.id;
                  const amount = Number(a.ref.amount || 0);
                  return (
                    <li key={a.id} className="flex items-center gap-3 py-3">
                      <span className={classNames('flex h-10 w-10 items-center justify-center rounded-xl', cat.bg, cat.color)}>
                        <Icon size={18} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--fg)]">
                          {a.kind === 'expense' ? a.ref.description : `Settlement: ${formatMoney(amount, currency)}`}
                        </p>
                        <p className="text-xs text-muted">{groupName(a.group_id)} · {relativeTime(a.date)}</p>
                      </div>
                      <div className="text-right">
                        <p className={classNames('text-sm font-bold', youPaid ? 'text-accent-600' : 'text-[var(--fg)]')}>
                          {youPaid ? '+' : ''}{formatMoney(amount, currency)}
                        </p>
                        <p className="text-[11px] text-muted">{youPaid ? 'you paid' : a.kind === 'expense' ? 'shared' : 'settled'}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon={Receipt} title="No activity yet" description="Your recent expenses and settlements will appear here."
                action={<Button size="sm" onClick={() => setShowExpense(true)} leftIcon={<Plus size={15} />}>Add expense</Button>} />
            )}
          </CardBody>
        </Card>

        {/* Group summary */}
        <Card>
          <CardHeader title="Your groups" subtitle="Balances at a glance"
            action={<Button variant="ghost" size="sm" onClick={() => navigate('/groups')}>All</Button>} />
          <CardBody className="pt-0">
            {groupSummaries.length ? (
              <ul className="space-y-2">
                {groupSummaries.slice(0, 5).map((g) => (
                  <li key={g.id}>
                    <Link to={`/groups`} className="flex items-center gap-3 rounded-xl p-2.5 transition hover:bg-elev">
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-500/10 text-primary-500">
                        <Users size={16} />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--fg)]">{g.name}</p>
                        <p className="text-[11px] text-muted">{g.memberCount} members</p>
                      </div>
                      <span className={classNames('text-sm font-bold', g.net > 0 ? 'text-accent-600' : g.net < 0 ? 'text-danger-500' : 'text-muted')}>
                        {g.net > 0 ? '+' : ''}{formatMoney(g.net, currency)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Users} title="No groups yet" description="Create a group to start splitting expenses."
                action={<Button size="sm" onClick={() => navigate('/groups')} leftIcon={<Plus size={15} />}>New group</Button>} />
            )}
          </CardBody>
        </Card>
      </div>

      {/* Third row: notifications + progress */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader title="Notifications" action={<Button variant="ghost" size="sm" onClick={() => navigate('/notifications')}>All</Button>} />
          <CardBody className="pt-0">
            {notifications.length ? (
              <ul className="space-y-2">
                {notifications.slice(0, 4).map((n) => (
                  <li key={n.id} className="flex items-start gap-3 rounded-xl p-2.5 transition hover:bg-elev">
                    <span className={classNames('mt-0.5 flex h-8 w-8 items-center justify-center rounded-lg', n.read ? 'bg-elev text-muted' : 'bg-primary-500/10 text-primary-500')}>
                      <Bell size={15} />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-semibold text-[var(--fg)]">{n.title}</p>
                      <p className="truncate text-[11px] text-muted">{n.body || relativeTime(n.created_at)}</p>
                    </div>
                    {!n.read && <span className="mt-1 h-2 w-2 rounded-full bg-primary-500" />}
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon={Bell} title="All caught up" description="No notifications right now." className="border-0 py-6" />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Settlement progress" subtitle="Debts cleared this month" />
          <CardBody>
            <div className="flex items-center gap-5">
              <ProgressRing value={totalSettled && youOwe ? Math.min(100, (totalSettled / (youOwe + totalSettled)) * 100) : 0} size={72} tone="accent" />
              <div>
                <p className="text-2xl font-bold text-[var(--fg)]">{formatMoney(totalSettled, currency)}</p>
                <p className="text-xs text-muted">settled this month</p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={() => navigate('/settlement')} rightIcon={<ArrowUpRight size={14} />}>
                  View settlements
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Quick actions" />
          <CardBody className="space-y-2">
            {[
              { icon: Plus, label: 'Add an expense', to: () => setShowExpense(true) },
              { icon: Users, label: 'Create a group', to: () => navigate('/groups') },
              { icon: HandCoins, label: 'Settle up', to: () => navigate('/settlement') },
              { icon: Receipt, label: 'View expenses', to: () => navigate('/expenses') },
            ].map((a) => (
              <button key={a.label} onClick={a.to} className="flex w-full items-center gap-3 rounded-xl border border-token bg-elev p-3 text-left transition hover:border-primary-300 hover:shadow-soft">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500/10 text-primary-500"><a.icon size={15} /></span>
                <span className="text-xs font-semibold text-[var(--fg)]">{a.label}</span>
                <ArrowUpRight size={15} className="ml-auto text-muted" />
              </button>
            ))}
          </CardBody>
        </Card>
      </div>

      <CreateExpenseModal open={showExpense} onClose={() => setShowExpense(false)} onCreated={load} />
    </DashboardLayout>
  );
}
