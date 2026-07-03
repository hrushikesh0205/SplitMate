import { useEffect, useState, useCallback, useMemo } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';
import { Card, CardHeader, CardBody } from '../components/ui/Card.jsx';
import { Button, IconButton } from '../components/ui/Button.jsx';
import { Field, Input, Select, Textarea } from '../components/ui/Input.jsx';
import { Avatar } from '../components/ui/Avatar.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { StatCard } from '../components/ui/StatCard.jsx';
import { ProgressRing } from '../components/Charts.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import {
  fetchGroups, fetchAllExpenses, fetchAllSettlements, fetchMembers,
  computeBalances, computeGroupBalances, createSettlement,
} from '../lib/api.jsx';
import { formatMoney, formatDate, relativeTime, classNames } from '../lib/utils.jsx';
import {
  HandCoins, ArrowRight, ArrowLeftRight, Check, TrendingUp, TrendingDown,
  Wallet, Plus, Sparkles, Receipt, CircleDot, History,
} from 'lucide-react';

function SettleModal({ open, onClose, groups, members, edges, user, onSettled }) {
  const toast = useToast();
  const [groupId, setGroupId] = useState('');
  const [fromId, setFromId] = useState('');
  const [toId, setToId] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const groupEdges = edges[groupId] || [];
  const groupMembers = members[groupId] || [];

  const submit = async (e) => {
    e.preventDefault();
    const amt = parseFloat(amount);
    if (!groupId) return toast.error('Pick a group');
    if (!fromId || !toId) return toast.error('Select payer and payee');
    if (fromId === toId) return toast.error('Payer and payee must differ');
    if (fromId !== user?.id) return toast.error('You can only record payments you made');
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    setLoading(true);
    try {
      await createSettlement({ group_id: groupId, payer: fromId, payee: toId, amount: amt, note });
      toast.success('Settlement recorded');
      setAmount(''); setNote(''); setFromId(''); setToId('');
      onSettled?.();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not record settlement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Record a settlement" subtitle="Log a payment to clear a debt"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={loading} leftIcon={<Check size={15} />}>Record payment</Button></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Group">
          <Select value={groupId} onChange={(e) => { setGroupId(e.target.value); setFromId(user?.id || ''); setToId(''); }}>
            <option value="">Select a group…</option>
            {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
          </Select>
        </Field>
        {groupId && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Payer">
                <Select value={fromId} onChange={(e) => setFromId(e.target.value)}>
                  <option value="">Who paid…</option>
                  {groupMembers.map((m) => <option key={m.user_id} value={m.user_id}>{m.profile?.full_name || 'Someone'}</option>)}
                </Select>
              </Field>
              <Field label="Payee">
                <Select value={toId} onChange={(e) => setToId(e.target.value)}>
                  <option value="">Who received…</option>
                  {groupMembers.map((m) => <option key={m.user_id} value={m.user_id}>{m.profile?.full_name || 'Someone'}</option>)}
                </Select>
              </Field>
            </div>
            {groupEdges.length > 0 && (
              <div className="rounded-xl border border-primary-200 bg-primary-50/60 p-3 dark:border-primary-500/30 dark:bg-primary-500/10">
                <p className="text-[11px] font-semibold text-primary-700 dark:text-primary-300">Suggested settlements</p>
                <ul className="mt-2 space-y-1">
                  {groupEdges.map((ed, i) => {
                    const from = groupMembers.find((m) => m.user_id === ed.from)?.profile?.full_name || 'Someone';
                    const to = groupMembers.find((m) => m.user_id === ed.to)?.profile?.full_name || 'Someone';
                    return (
                      <li key={i}>
                        <button
                          type="button"
                          onClick={() => { setFromId(ed.from); setToId(ed.to); setAmount(ed.amount.toFixed(2)); }}
                          className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-xs hover:bg-white/60 dark:hover:bg-white/5"
                        >
                          <span className="text-[var(--fg)]">{from}</span>
                          <ArrowRight size={12} className="text-muted" />
                          <span className="text-[var(--fg)]">{to}</span>
                          <span className="ml-auto font-semibold text-primary-600 dark:text-primary-400">{formatMoney(ed.amount)}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}
            <Field label="Amount">
              <Input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </Field>
            <Field label="Note" hint="Optional">
              <Input placeholder="e.g. Venmo, cash, bank transfer" value={note} onChange={(e) => setNote(e.target.value)} />
            </Field>
          </>
        )}
      </form>
    </Modal>
  );
}

export function SettlementPage() {
  const { user, profile } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [settlements, setSettlements] = useState([]);
  const [memberMap, setMemberMap] = useState({});
  const [showSettle, setShowSettle] = useState(false);

  const currency = profile?.currency || 'USD';

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [g, e, s] = await Promise.all([fetchGroups(), fetchAllExpenses(), fetchAllSettlements()]);
      setGroups(g); setExpenses(e); setSettlements(s);
      const mMap = {};
      await Promise.all(g.map(async (grp) => { try { mMap[grp.id] = await fetchMembers(grp.id); } catch {} }));
      setMemberMap(mMap);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const myNet = useMemo(() => computeBalances({ expenses, settlements, userId: user?.id }), [expenses, settlements, user?.id]);
  const youAreOwed = Math.max(0, myNet);
  const youOwe = Math.max(0, -myNet);

  // per-group edges + net
  const groupSettlements = useMemo(() => {
    const edgesMap = {};
    const nets = {};
    for (const g of groups) {
      const gExp = expenses.filter((e) => e.group_id === g.id);
      const gSet = settlements.filter((s) => s.group_id === g.id);
      const members = memberMap[g.id] || [];
      const result = computeGroupBalances({ expenses: gExp, settlements: gSet, members });
      edgesMap[g.id] = result.edges;
      nets[g.id] = result.net[user?.id] || 0;
    }
    return { edgesMap, nets };
  }, [groups, expenses, settlements, memberMap, user?.id]);

  // all edges involving me
  const myEdges = useMemo(() => {
    const out = [];
    for (const g of groups) {
      for (const ed of groupSettlements.edgesMap[g.id] || []) {
        if (ed.from === user?.id || ed.to === user?.id) {
          out.push({ ...ed, groupId: g.id, groupName: g.name });
        }
      }
    }
    return out;
  }, [groups, groupSettlements, user?.id]);

  const totalSettled = settlements.reduce((s, x) => s + Number(x.amount || 0), 0);
  const settleProgress = youOwe + youAreOwed ? (totalSettled / (totalSettled + youOwe + youAreOwed)) * 100 : 100;

  const memberName = (gid, uid) => memberMap[gid]?.find((m) => m.user_id === uid)?.profile?.full_name || 'Someone';
  const memberAvatar = (gid, uid) => memberMap[gid]?.find((m) => m.user_id === uid)?.profile?.avatar_url;

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
          <SkeletonCard />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">Settlement</h2>
          <p className="text-sm text-muted">Track who owes whom and clear balances</p>
        </div>
        <Button onClick={() => setShowSettle(true)} leftIcon={<Plus size={15} />}>Record settlement</Button>
      </div>

      {/* Debt summary */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Net balance" value={formatMoney(myNet, currency)} icon={Wallet} accent="primary"
          delta={myNet >= 0 ? 'You are owed' : 'You owe'} deltaTone={myNet >= 0 ? 'up' : 'down'} />
        <StatCard label="You are owed" value={formatMoney(youAreOwed, currency)} icon={TrendingUp} accent="accent" />
        <StatCard label="You owe" value={formatMoney(youOwe, currency)} icon={TrendingDown} accent="danger" />
        <StatCard label="Total settled" value={formatMoney(totalSettled, currency)} icon={Check} accent="warn" />
      </div>

      {/* Balance visualization + outstanding */}
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader title="Outstanding balances" subtitle="Simplified payments across all groups" />
          <CardBody>
            {myEdges.length ? (
              <ul className="space-y-3">
                {myEdges.map((ed, i) => {
                  const youOweThis = ed.from === user?.id;
                  const otherId = youOweThis ? ed.to : ed.from;
                  return (
                    <li key={i} className="flex items-center gap-3 rounded-xl border border-token bg-elev p-3.5">
                      <Avatar name={memberName(ed.groupId, otherId)} src={memberAvatar(ed.groupId, otherId)} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-[var(--fg)]">
                          {youOweThis ? 'You owe' : 'Owes you'} · {memberName(ed.groupId, otherId)}
                        </p>
                        <p className="text-[11px] text-muted">{ed.groupName}</p>
                      </div>
                      <div className="text-right">
                        <p className={classNames('text-sm font-bold', youOweThis ? 'text-danger-500' : 'text-accent-600')}>
                          {formatMoney(ed.amount, currency)}
                        </p>
                        <Badge tone={youOweThis ? 'danger' : 'accent'}>{youOweThis ? 'Pay' : 'Collect'}</Badge>
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <EmptyState icon={Sparkles} title="All settled up!" description="You have no outstanding balances. Nicely done." className="border-0 py-8" />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader title="Settlement progress" subtitle="Debts cleared over time" />
          <CardBody>
            <div className="flex flex-col items-center gap-4">
              <ProgressRing value={settleProgress} size={120} thickness={10} tone="accent" />
              <div className="text-center">
                <p className="text-xs text-muted">{formatMoney(totalSettled, currency)} settled · {formatMoney(youOwe + youAreOwed, currency)} outstanding</p>
                <Button size="sm" className="mt-3" onClick={() => setShowSettle(true)} leftIcon={<Plus size={14} />}>Record payment</Button>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Per-group breakdown */}
      <Card className="mt-6">
        <CardHeader title="Balances by group" subtitle="Your net position in each group" />
        <CardBody>
          {groups.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {groups.map((g) => {
                const net = groupSettlements.nets[g.id] || 0;
                return (
                  <div key={g.id} className="rounded-xl border border-token bg-elev p-4">
                    <p className="truncate text-sm font-semibold text-[var(--fg)]">{g.name}</p>
                    <p className="mt-1 text-[11px] text-muted">{(memberMap[g.id] || []).length} members</p>
                    <div className="mt-3 flex items-center justify-between border-t border-token pt-3">
                      <span className="text-[11px] text-muted">Your net</span>
                      <span className={classNames('text-sm font-bold', net > 0 ? 'text-accent-600' : net < 0 ? 'text-danger-500' : 'text-muted')}>
                        {net > 0 ? '+' : ''}{formatMoney(net, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <EmptyState icon={HandCoins} title="No groups to settle" description="Create a group to start tracking balances." />
          )}
        </CardBody>
      </Card>

      {/* Payment history / timeline */}
      <Card className="mt-6">
        <CardHeader title="Payment history" subtitle="Recorded settlements over time" action={<History size={16} className="text-muted" />} />
        <CardBody className="pt-0">
          {settlements.length ? (
            <ol className="relative space-y-0">
              {settlements.slice(0, 12).map((s, i) => {
                const youPaid = s.payer === user?.id;
                const youReceived = s.payee === user?.id;
                const otherId = youPaid ? s.payee : s.payer;
                return (
                  <li key={s.id} className="relative flex gap-4 pb-6 last:pb-0">
                    {i !== settlements.length - 1 && <span className="absolute left-[15px] top-8 h-full w-px bg-token" />}
                    <span className={classNames('z-10 flex h-8 w-8 items-center justify-center rounded-full ring-4 ring-[var(--card)]',
                      youPaid ? 'bg-danger-500/15 text-danger-500' : youReceived ? 'bg-accent-500/15 text-accent-500' : 'bg-primary-500/15 text-primary-500')}>
                      <ArrowLeftRight size={14} />
                    </span>
                    <div className="flex-1 rounded-xl border border-token bg-elev p-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-semibold text-[var(--fg)]">
                          {youPaid ? 'You paid' : youReceived ? 'You received' : `${memberName(s.group_id, s.payer)} paid`}
                          {' '}{formatMoney(s.amount, currency)}
                        </p>
                        <span className="text-[11px] text-muted">{relativeTime(s.created_at)}</span>
                      </div>
                      <p className="mt-0.5 text-xs text-muted">
                        {memberName(s.group_id, s.payer)} → {memberName(s.group_id, s.payee)} · {groups.find((g) => g.id === s.group_id)?.name || 'Group'}
                      </p>
                      {s.note && <p className="mt-1 text-[11px] text-muted">"{s.note}"</p>}
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <EmptyState icon={History} title="No settlements yet" description="Record your first payment to clear a balance."
              action={<Button size="sm" onClick={() => setShowSettle(true)} leftIcon={<Plus size={14} />}>Record settlement</Button>} />
          )}
        </CardBody>
      </Card>

      <SettleModal
        open={showSettle}
        onClose={() => setShowSettle(false)}
        groups={groups}
        members={memberMap}
        edges={groupSettlements.edgesMap}
        user={user}
        onSettled={load}
      />
    </DashboardLayout>
  );
}
