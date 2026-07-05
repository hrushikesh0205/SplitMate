import { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Field, Input, Textarea } from '../ui/Input.jsx';
import { useToast } from '../ui/Toast.jsx';
import { updateGroup } from '../../lib/api.jsx';
import { classNames } from '../../lib/utils.jsx';
import { Pencil } from 'lucide-react';

const COVER_COLORS = [
  { key: 'indigo',  cls: 'from-primary-500 to-violet-500' },
  { key: 'emerald', cls: 'from-accent-500 to-teal-500' },
  { key: 'rose',    cls: 'from-rose-500 to-pink-500' },
  { key: 'amber',   cls: 'from-amber-500 to-orange-500' },
  { key: 'sky',     cls: 'from-sky-500 to-blue-500' },
  { key: 'fuchsia', cls: 'from-fuchsia-500 to-purple-500' },
];

/**
 * Modal for editing an existing group's name, description and cover colour.
 * Calls updateGroup() from api.jsx — no routing or auth changes.
 */
export function EditGroupModal({ open, onClose, group, onUpdated }) {
  const toast = useToast();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('indigo');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (group) {
      setName(group.name || '');
      setDescription(group.description || '');
      setColor(group.cover_color || 'indigo');
    }
  }, [group]);

  const submit = async (e) => {
    e.preventDefault();
    if (!name.trim()) { toast.error('Group name cannot be empty'); return; }
    setLoading(true);
    try {
      const updated = await updateGroup(group.id || group._id, {
        name: name.trim(),
        description: description.trim(),
        cover_color: color,
      });
      toast.success('Group updated');
      onUpdated?.(updated);
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Could not update group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Edit group"
      subtitle="Update name, description, or cover colour"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submit} loading={loading} leftIcon={<Pencil size={15} />}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="Group name">
          <Input
            placeholder="e.g. Tokyo Trip 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
          />
        </Field>

        <Field label="Description" hint="Optional">
          <Textarea
            rows={3}
            placeholder="What is this group for?"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </Field>

        <Field label="Cover colour">
          <div className="flex flex-wrap gap-2 pt-1">
            {COVER_COLORS.map((c) => (
              <button
                key={c.key}
                type="button"
                onClick={() => setColor(c.key)}
                aria-label={c.key}
                className={classNames(
                  'h-9 w-9 rounded-xl bg-gradient-to-br transition',
                  c.cls,
                  color === c.key
                    ? 'ring-2 ring-offset-2 ring-offset-[var(--card)] ring-primary-500 scale-110'
                    : 'opacity-70 hover:opacity-100 hover:scale-105',
                )}
              />
            ))}
          </div>
        </Field>
      </form>
    </Modal>
  );
}
