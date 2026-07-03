import { useEffect, useMemo, useState } from 'react';
import { Modal } from './ui/Modal.jsx';
import { Button } from './ui/Button.jsx';
import { Field, Input, Select } from './ui/Input.jsx';
import { Avatar } from './ui/Avatar.jsx';
import { CATEGORIES, categoryMeta } from '../lib/categories.jsx';
import { createExpense, fetchGroups, fetchMembers } from '../lib/api.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from './ui/Toast.jsx';
import { formatMoney, classNames } from '../lib/utils.jsx';
import { Receipt, Check } from 'lucide-react';

export function CreateExpenseModal({ open, onClose, defaultGroupId, onCreated }) {
  const { user, profile } = useAuth();
  const toast = useToast();

  const [groups, setGroups] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [groupId, setGroupId] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('general');
  const [paidBy, setPaidBy] = useState('');
  const [splitType, setSplitType] = useState('equal');
  const [selected, setSelected] = useState([]);
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!open || !user) return;
    setGroups([]);
    fetchGroups().then(setGroups).catch(() => {});
  }, [open, user]);

  useEffect(() => {
    setGroupId(defaultGroupId || '');
  }, [defaultGroupId, open]);

  useEffect(() => {
    if (!groupId) { setMembers([]); return; }
    fetchMembers(groupId).then(setMembers).catch(() => {});
  }, [groupId]);

  useEffect(() => {
    if (members.length) {
      setPaidBy(user.id);
      setSelected(members.map((m) => m.user_id));
    }
  }, [members, user]);

  const share = useMemo(() => {
    const total = parseFloat(amount) || 0;
    if (!selected.length) return 0;
    return total / selected.length;
  }, [amount, selected]);

  const toggleMember = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const reset = () => {
    setDescription(''); setAmount(''); setCategory('general'); setSplitType('equal');
    setSelected([]); setDate(new Date().toISOString().slice(0, 10));
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!groupId) return toast.error('Pick a group first');
    if (!description.trim()) return toast.error('Add a description');
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return toast.error('Enter a valid amount');
    if (!selected.length) return toast.error('Select at least one person to split with');
    setLoading(true);
    try {
      await createExpense({
        group_id: groupId,
        paid_by: paidBy,
        description: description.trim(),
        amount: amt,
        category,
        split_type: splitType,
        split_between: selected,
        date,
      });
      toast.success('Expense added and split calculated');
      onCreated?.();
      reset();
      onClose();
    } catch (err) {
      toast.error(err.message || 'Could not add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add an expense"
      subtitle="Split a bill across your group members"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading} leftIcon={<Receipt size={15} />}>Save expense</Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Group">
            <Select value={groupId} onChange={(e) => setGroupId(e.target.value)}>
              <option value="">Select a group…</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </Select>
          </Field>
          <Field label="Date">
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </Field>
        </div>

        <Field label="Description">
          <Input
            placeholder="e.g. Dinner at Ramen House"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            icon={categoryMeta(category).icon}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Amount">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted">{profile?.currency || 'USD'}</span>
              <Input type="number" min="0" step="0.01" placeholder="0.00" className="pl-14" value={amount} onChange={(e) => setAmount(e.target.value)} />
            </div>
          </Field>
          <Field label="Category">
            <Select value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map((c) => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Paid by">
          <Select value={paidBy} onChange={(e) => setPaidBy(e.target.value)}>
            {members.map((m) => (
              <option key={m.user_id} value={m.user_id}>{m.profile?.full_name || 'Someone'}{m.user_id === user.id ? ' (you)' : ''}</option>
            ))}
          </Select>
        </Field>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-muted">Split between</label>
            <div className="flex gap-1">
              {['equal', 'exact', 'percent'].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setSplitType(t)}
                  className={classNames(
                    'rounded-lg px-2.5 py-1 text-[11px] font-semibold capitalize transition',
                    splitType === t ? 'bg-primary-500 text-white shadow-soft' : 'bg-elev text-muted hover:text-[var(--fg)]'
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {members.map((m) => {
              const on = selected.includes(m.user_id);
              return (
                <button
                  key={m.user_id}
                  type="button"
                  onClick={() => toggleMember(m.user_id)}
                  className={classNames(
                    'flex items-center gap-3 rounded-xl border p-2.5 text-left transition',
                    on ? 'border-primary-300 bg-primary-50/60 dark:bg-primary-500/10 dark:border-primary-500/40' : 'border-token bg-elev hover:border-token'
                  )}
                >
                  <Avatar name={m.profile?.full_name || 'User'} src={m.profile?.avatar_url} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-semibold text-[var(--fg)]">{m.profile?.full_name || 'Someone'}{m.user_id === user.id ? ' (you)' : ''}</p>
                    <p className="text-[11px] text-muted">{on ? formatMoney(share, profile?.currency) : 'not included'}</p>
                  </div>
                  <span className={classNames('flex h-5 w-5 items-center justify-center rounded-md border', on ? 'bg-primary-500 border-primary-500 text-white' : 'border-token text-transparent')}>
                    <Check size={13} />
                  </span>
                </button>
              );
            })}
            {members.length === 0 && (
              <p className="col-span-full text-xs text-muted">Select a group to see its members.</p>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
