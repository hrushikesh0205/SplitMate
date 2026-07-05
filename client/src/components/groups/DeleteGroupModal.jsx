import { useState } from 'react';
import { Modal } from '../ui/Modal.jsx';
import { Button } from '../ui/Button.jsx';
import { useToast } from '../ui/Toast.jsx';
import { deleteGroup } from '../../lib/api.jsx';
import { Trash2, AlertTriangle } from 'lucide-react';

/**
 * Dedicated confirmation modal for deleting a group.
 * Calls deleteGroup() from api.jsx — no routing or auth changes.
 */
export function DeleteGroupModal({ open, onClose, group, onDeleted }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const confirm = async () => {
    setLoading(true);
    try {
      await deleteGroup(group.id || group._id);
      toast.success(`"${group.name}" has been deleted`);
      onDeleted?.();
      onClose();
    } catch (err) {
      toast.error(err?.message || 'Could not delete group');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Delete group"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            onClick={confirm}
            loading={loading}
            leftIcon={<Trash2 size={15} />}
            className="!bg-danger-500 hover:!bg-danger-600 !shadow-none"
          >
            Yes, delete group
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Warning icon + message */}
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-danger-200 bg-danger-50/60 px-5 py-6 text-center dark:border-danger-500/20 dark:bg-danger-500/5">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-danger-100 text-danger-500 dark:bg-danger-500/15">
            <AlertTriangle size={26} />
          </span>
          <div>
            <p className="text-sm font-semibold text-[var(--fg)]">
              This action cannot be undone
            </p>
            <p className="mt-1 text-xs text-muted">
              All expenses, settlements, and member data inside{' '}
              <span className="font-semibold text-[var(--fg)]">"{group?.name}"</span>{' '}
              will be permanently removed.
            </p>
          </div>
        </div>

        <p className="text-center text-xs text-muted">
          Are you sure you want to delete this group?
        </p>
      </div>
    </Modal>
  );
}
