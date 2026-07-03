import { useEffect, useState, useCallback, useMemo } from 'react';
import { useRouter } from '../context/RouterContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { DashboardLayout } from '../components/layout/DashboardLayout.jsx';
import { Card } from '../components/ui/Card.jsx';
import { Button, IconButton } from '../components/ui/Button.jsx';
import { Field, Input, Textarea, Select } from '../components/ui/Input.jsx';
import { Avatar, AvatarStack } from '../components/ui/Avatar.jsx';
import { Badge } from '../components/ui/Badge.jsx';
import { Modal } from '../components/ui/Modal.jsx';
import { SkeletonCard } from '../components/ui/Skeleton.jsx';
import { EmptyState } from '../components/ui/EmptyState.jsx';
import { useToast } from '../components/ui/Toast.jsx';
import { CreateExpenseModal } from '../components/CreateExpenseModal.jsx';
import {
  fetchGroups, fetchExpenses, fetchSettlements,
  createGroup, deleteGroup, removeMember, computeBalances,
} from '../lib/api.jsx';
import { formatMoney, formatDate, classNames } from '../lib/utils.jsx';
import {
  Users, Plus, Search, Trash2, UserMinus, Crown, Receipt,
  ArrowRight, LayoutGrid, List, X, Sparkles,
} from 'lucide-react';
import { GroupDetailsModal } from '../components/groups/GroupDetailsModal.jsx';


const COVER_COLORS = [
  { key: 'indigo', cls: 'from-primary-500 to-violet-500' },
  { key: 'emerald', cls: 'from-accent-500 to-teal-500' },
  { key: 'rose', cls: 'from-rose-500 to-pink-500' },
  { key: 'amber', cls: 'from-amber-500 to-orange-500' },
  { key: 'sky', cls: 'from-sky-500 to-blue-500' },
  { key: 'fuchsia', cls: 'from-fuchsia-500 to-purple-500' },
];

function GroupCard({ group, members, net, currency, onOpen, onDelete, canDelete }) {
  const cover = COVER_COLORS.find((c) => c.key === group.cover_color) || COVER_COLORS[0];
  return (
    <Card hover className="overflow-hidden" onClick={() => onOpen(group)}>
      <div className={classNames('relative h-20 bg-gradient-to-br p-4', cover.cls)}>
        <div className="absolute inset-0 bg-grid-dark opacity-20" />
        <div className="relative flex items-center justify-between">
          <Badge tone="neutral" className="!bg-white/20 !text-white !border-white/20">{members.length} members</Badge>
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(group); }}
              className="rounded-lg bg-white/15 p-1.5 text-white backdrop-blur transition hover:bg-white/25"
              aria-label="Delete group"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-[var(--fg)]">{group.name}</h3>
            <p className="mt-0.5 line-clamp-1 text-xs text-muted">{group.description || 'No description'}</p>
          </div>
          <AvatarStack people={members.map((m) => m.profile).filter(Boolean)} size="xs" max={3} />
        </div>
        <div className="mt-4 flex items-center justify-between border-t border-token pt-4">
          <div>
            <p className="text-[11px] text-muted">Your balance</p>
            <p className={classNames('text-sm font-bold', net > 0 ? 'text-accent-600' : net < 0 ? 'text-danger-500' : 'text-muted')}>
              {net > 0 ? '+' : ''}{formatMoney(net, currency)}
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-primary-600 dark:text-primary-400">
            Open <ArrowRight size={14} />
          </span>
        </div>
      </div>
    </Card>
  );
}

function CreateGroupModal({ open, onClose, onCreated }) {
  const { user } = useAuth();
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('indigo');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Give your group a name');
    setLoading(true);
    try {
      const g = await createGroup({ name: name.trim(), description: description.trim(), cover_color: color });
      toast.success('Group created');
      onCreated?.(g);
      setName(''); setDescription(''); setColor('indigo');
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not create group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Create a group" subtitle="A shared space for expenses"
      footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={submit} loading={loading} leftIcon={<Plus size={15} />}>Create group</Button></>}>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Group name">
          <Input placeholder="e.g. Tokyo Trip 2026" value={name} onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="Description" hint="Optional">
          <Textarea rows={3} placeholder="What is this group for?" value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Cover color">
          <div className="flex flex-wrap gap-2">
            {COVER_COLORS.map((c) => (
              <button
                key={c.key} type="button" onClick={() => setColor(c.key)}
                className={classNames('h-9 w-9 rounded-xl bg-gradient-to-br transition', c.cls, color === c.key ? 'ring-2 ring-offset-2 ring-offset-[var(--card)] ring-primary-500 scale-110' : 'opacity-80 hover:opacity-100')}
                aria-label={c.key}
              />
            ))}
          </div>
        </Field>
      </form>
    </Modal>
  );
}

// function GroupDetailModal({ group, members, net, currency, onClose, onRemoveMember, onDelete, isOwner }) {
//   if (!group) return null;
//   return (
//     <Modal open={!!group} onClose={onClose} title={group.name} subtitle={group.description || 'Group details'} size="lg">
//       <div className="space-y-5">
//         <div className="grid grid-cols-3 gap-3">
//           <div className="rounded-xl border border-token bg-elev p-3">
//             <p className="text-[11px] text-muted">Your balance</p>
//             <p className={classNames('text-base font-bold', net > 0 ? 'text-accent-600' : net < 0 ? 'text-danger-500' : 'text-muted')}>
//               {formatMoney(net, currency)}
//             </p>
//           </div>
//           <div className="rounded-xl border border-token bg-elev p-3">
//             <p className="text-[11px] text-muted">Members</p>
//             <p className="text-base font-bold text-[var(--fg)]">{members.length}</p>
//           </div>
//           <div className="rounded-xl border border-token bg-elev p-3">
//             <p className="text-[11px] text-muted">Created</p>
//             <p className="text-base font-bold text-[var(--fg)]">{formatDate(group.created_at, 'short')}</p>
//           </div>
//         </div>

//         <div>
//           <h4 className="mb-2 text-xs font-semibold text-muted">Members</h4>
//           <ul className="space-y-2">
//             {members.map((m) => (
//               <li key={m.user_id} className="flex items-center gap-3 rounded-xl border border-token bg-elev p-3">
//                 <Avatar name={m.profile?.full_name || 'User'} src={m.profile?.avatar_url} size="sm" />
//                 <div className="min-w-0 flex-1">
//                   <p className="truncate text-sm font-semibold text-[var(--fg)]">
//                     {m.profile?.full_name || 'Someone'}
//                     {m.user_id === group.created_by && <span className="ml-2 text-warn-500"><Crown size={12} className="inline" /></span>}
//                   </p>
//                   <p className="text-[11px] text-muted">{m.role}</p>
//                 </div>
//                 {isOwner && m.user_id !== group.created_by && (
//                   <IconButton onClick={() => onRemoveMember(group, m)} aria-label="Remove member"><UserMinus size={15} /></IconButton>
//                 )}
//               </li>
//             ))}
//           </ul>
//         </div>

//         {isOwner && (
//           <div className="rounded-xl border border-danger-200 bg-danger-50/50 p-4 dark:border-danger-500/20 dark:bg-danger-500/5">
//             <p className="text-xs font-semibold text-danger-600">Danger zone</p>
//             <p className="mt-1 text-[11px] text-muted">Deleting a group removes all its expenses and settlements.</p>
//             <Button variant="ghost" size="sm" className="mt-3 !text-danger-600 !border-danger-200" onClick={() => onDelete(group)} leftIcon={<Trash2 size={14} />}>
//               Delete group
//             </Button>
//           </div>
//         )}
//       </div>
//     </Modal>
//   );
// }

export function GroupsPage() {
  const { user, profile } = useAuth();
  const { navigate } = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([]);
  const [memberMap, setMemberMap] = useState({});
  const [expenseMap, setExpenseMap] = useState({});
  const [settlementMap, setSettlementMap] = useState({});
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('recent');
  const [showCreate, setShowCreate] = useState(false);
  const [showExpense, setShowExpense] = useState(false);
  const [activeGroup, setActiveGroup] = useState(null);

  const currency = profile?.currency || 'USD';
const load = useCallback(async () => {
  if (!user) return;

  setLoading(true);

  try {
    const g = await fetchGroups();
    setGroups(g);

    const mMap = {};
    const eMap = {};
    const sMap = {};

    for (const grp of g) {
      mMap[grp._id] = grp.members || [];
    }

    await Promise.all(
      g.map(async (grp) => {
        const [exp, set] = await Promise.all([
          fetchExpenses(grp._id).catch(() => []),
          fetchSettlements(grp._id).catch(() => []),
        ]);

        eMap[grp._id] = exp;
        sMap[grp._id] = set;
      })
    );

    setMemberMap(mMap);
    setExpenseMap(eMap);
    setSettlementMap(sMap);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
}, [user]);
  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    let list = groups.filter((g) =>
      g.name.toLowerCase().includes(query.toLowerCase()) ||
      (g.description || '').toLowerCase().includes(query.toLowerCase())
    );
    if (sort === 'recent') list = list.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sort === 'name') list = list.slice().sort((a, b) => a.name.localeCompare(b.name));
    if (sort === 'balance') {
      list = list.slice().sort((a, b) => {
        const an = computeBalances({ expenses: expenseMap[a._id] || [], settlements: settlementMap[a._id] || [], members: memberMap[a._id] || [], userId: user._id });
        const bn = computeBalances({ expenses: expenseMap[b._id] || [], settlements: settlementMap[b._id] || [], members: memberMap[b._id] || [], userId: user._id });
        return Math.abs(bn) - Math.abs(an);
      });
    }
    return list;
  }, [groups, query, sort, expenseMap, settlementMap, memberMap, user]);

  const groupNet = (id) => computeBalances({
    expenses: expenseMap[id] || [], settlements: settlementMap[id] || [],
    members: memberMap[id] || [], userId: user?._id,
  });

  const handleDelete = async (group) => {
    if (!confirm(`Delete "${group.name}"? This cannot be undone.`)) return;
    try {
      await deleteGroup(group._id);
      toast.success('Group deleted');
      setActiveGroup(null);
      await load();
    } catch (err) {
      toast.error(err.message || 'Could not delete group');
    }
  };

  const handleRemoveMember = async (group, member) => {
    try {
      await removeMember(group._id, member.user_id);
      toast.success('Member removed');
      const updatedGroups = await fetchGroups();
      const updated = updatedGroups.find((g) => g._id === group._id);
      if (updated) setActiveGroup(updated);
      await load();
    } catch (err) {
      toast.error(err.message || 'Could not remove member');
    }
  };

  return (
    <DashboardLayout onCreateExpense={() => setShowExpense(true)}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--fg)]">Groups</h2>
          <p className="text-sm text-muted">{groups.length} {groups.length === 1 ? 'group' : 'groups'} · manage your shared spaces</p>
        </div>
        <Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={15} />}>New group</Button>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <Input placeholder="Search groups…" className="pl-9" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <Select value={sort} onChange={(e) => setSort(e.target.value)} className="w-40">
          <option value="recent">Most recent</option>
          <option value="name">Name (A–Z)</option>
          <option value="balance">Balance</option>
        </Select>
      </div>

      {/* Grid */}
      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"><SkeletonCard /><SkeletonCard /><SkeletonCard /></div>
        ) : filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((g) => (
              <GroupCard
                key={g._id}
                group={g}
                members={memberMap[g._id] || []}
                net={groupNet(g._id)}
                currency={currency}
                onOpen={setActiveGroup}
                onDelete={handleDelete}
                canDelete={g.createdBy?._id === user?._id || (typeof g.createdBy === 'string' && g.createdBy === user?._id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Users}
            title={query ? 'No groups match your search' : 'No groups yet'}
            description={query ? 'Try a different search term.' : 'Create your first group to start splitting expenses with friends.'}
            action={<Button onClick={() => setShowCreate(true)} leftIcon={<Plus size={15} />}>Create group</Button>}
          />
        )}
      </div>

      <CreateGroupModal open={showCreate} onClose={() => setShowCreate(false)} onCreated={load} />
      <CreateExpenseModal open={showExpense} onClose={() => setShowExpense(false)} onCreated={load} />
      <GroupDetailsModal
        group={activeGroup}
        members={activeGroup ? (memberMap[activeGroup._id] || []) : []}
        expenses={activeGroup ? (expenseMap[activeGroup._id] || []) : []}
        settlements={activeGroup ? (settlementMap[activeGroup._id] || []) : []}
        net={activeGroup ? groupNet(activeGroup._id) : 0}
        currency={currency}
        currentUserId={user?._id}
        onClose={() => setActiveGroup(null)}
        onRemoveMember={handleRemoveMember}
        onDelete={(g) => { setActiveGroup(null); handleDelete(g); }}
        isOwner={activeGroup?.createdBy?._id === user?._id || (typeof activeGroup?.createdBy === 'string' && activeGroup?.createdBy === user?._id)}
        onMemberAdded={async () => {
          const updatedGroups = await fetchGroups();
          const updated = updatedGroups.find((g) => g._id === activeGroup?._id);
          if (updated) setActiveGroup(updated);
          await load();
        }}
        onGroupUpdated={(updated) => { setActiveGroup(updated); load(); }}
        onGroupDeleted={() => { setActiveGroup(null); load(); }}
        onAddExpense={() => setShowExpense(true)}
      />
    </DashboardLayout>
  );
}
