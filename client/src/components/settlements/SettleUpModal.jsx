import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { settleUpApi } from '../../api/settlementApi.js';
import '../../styles/settlements.css';

const SettleUpModal = ({ balance, groupId, onClose, onSettled }) => {
  const [amount, setAmount] = useState(balance.amount);
  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await settleUpApi({
        toUserId: balance.to._id,
        amount: parseFloat(amount),
        groupId,
        note,
      });
      toast.success(`Settled ₹${amount} with ${balance.to.name}!`);
      onSettled();
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to settle up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>Settle Up 💸</h2>
          <button className='modal-close' onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className='settle-summary'>
          <div className='settle-avatar'>
            {balance.to?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className='settle-name'>{balance.to?.name}</p>
            <p className='settle-email'>{balance.to?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className='form-group'>
            <label>Amount (₹)</label>
            <input
              type='number'
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min='1'
              max={balance.amount}
              required
            />
            <small style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
              Full amount: ₹{balance.amount.toLocaleString()}
            </small>
          </div>

          <div className='form-group'>
            <label>Note (optional)</label>
            <input
              type='text'
              placeholder='e.g. Paid via UPI'
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>

          <div className='modal-footer'>
            <button type='button' className='btn btn-outline' onClick={onClose}>
              Cancel
            </button>
            <button type='submit' className='btn btn-primary' disabled={loading}>
              {loading ? 'Settling...' : `Settle ₹${amount}`}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SettleUpModal;