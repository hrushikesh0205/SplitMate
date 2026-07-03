import { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { Field, Input } from '../ui/Input.jsx';
import { useToast } from '../ui/Toast.jsx';
import { addMember } from '../../lib/api.jsx';
import { UserPlus, Mail } from 'lucide-react';

/**
 * Modal for adding a member to a group by user ID or email.
 * The actual lookup strategy (by id vs by email) depends on the backend.
 * Currently sends whatever the user types as `userId` so it is easy to swap.
 */
export function AddMemberModal({ open, onClose, group, onAdded }) {
  const toast = useToast();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const reset = () => { setValue(''); setError(''); };

  const handleClose = () => { reset(); onClose(); };

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) { setError('Enter email'); return; }
    setError('');
    setLoading(true);
    try {
      await addMember(group._id, trimmed);
      toast.success('Member added to group');
      reset();
      onAdded?.();
      onClose();
    } catch (err) {
      const msg = err?.message || 'Could not add member';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Add a member"
      subtitle={`Invite someone to "${group?.name || 'this group'}"`}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={handleClose}>Cancel</Button>
          <Button onClick={submit} loading={loading} leftIcon={<UserPlus size={15} />}>
            Add member
          </Button>
        </>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        <Field label="User ID or email" error={error} hint="Enter the registered email address.">
          <Input
            icon={Mail}
            placeholder="Enter member email"
            value={value}
            onChange={(e) => { setValue(e.target.value); setError(''); }}
            autoFocus
            autoComplete="off"
          />
        </Field>
      </form>
    </Modal>
  );
}
