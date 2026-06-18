import { useState } from 'react';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';
import { addExpenseApi } from '../../api/expenseApi.js';
import useAuth from '../../hooks/useAuth.js';
import '../../styles/expenses.css';

const CATEGORIES = ['Food', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Other'];

const CATEGORY_ICONS = {
  Food: '🍕', Travel: '✈️', Rent: '🏠',
  Shopping: '🛒', Entertainment: '🎬', Other: '📦',
};

const ExpenseForm = ({ onClose, onExpenseAdded, group }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Food',
    paidBy: user?._id,
    splitType: 'equal',
    note: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [customSplits, setCustomSplits] = useState([]);

  const members = group?.members || [];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSplitTypeChange = (type) => {
    setFormData({ ...formData, splitType: type });
    if (type !== 'equal') {
      setCustomSplits(members.map(() => ''));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    setLoading(true);
    try {
      const expense = await addExpenseApi({
        ...formData,
        amount: parseFloat(formData.amount),
        groupId: group._id,
        customSplits,
      });
      toast.success('Expense added!');
      onExpenseAdded(expense);
      onClose();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='modal-overlay' onClick={onClose}>
      <div className='modal expense-modal' onClick={(e) => e.stopPropagation()}>
        <div className='modal-header'>
          <h2>Add Expense</h2>
          <button className='modal-close' onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>

          <div className='form-group'>
            <label>Title</label>
            <input
              type='text'
              name='title'
              placeholder='e.g. Hotel Booking, Dinner...'
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className='form-row'>
            <div className='form-group'>
              <label>Amount (₹)</label>
              <input
                type='number'
                name='amount'
                placeholder='0.00'
                value={formData.amount}
                onChange={handleChange}
                min='0'
                required
              />
            </div>
            <div className='form-group'>
              <label>Date</label>
              <input
                type='date'
                name='date'
                value={formData.date}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className='form-group'>
            <label>Category</label>
            <div className='category-selector'>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type='button'
                  className={`category-btn ${formData.category === cat ? 'category-btn-active' : ''}`}
                  onClick={() => setFormData({ ...formData, category: cat })}
                >
                  {CATEGORY_ICONS[cat]} {cat}
                </button>
              ))}
            </div>
          </div>

          <div className='form-group'>
            <label>Paid By</label>
            <select
              name='paidBy'
              value={formData.paidBy}
              onChange={handleChange}
              className='form-select'
            >
              {members.map((m) => (
                <option key={m.user._id} value={m.user._id}>
                  {m.user._id === user?._id ? 'You' : m.user.name}
                </option>
              ))}
            </select>
          </div>

          <div className='form-group'>
            <label>Split Type</label>
            <div className='split-type-selector'>
              {['equal', 'exact', 'percentage'].map((type) => (
                <button
                  key={type}
                  type='button'
                  className={`split-type-btn ${formData.splitType === type ? 'split-type-active' : ''}`}
                  onClick={() => handleSplitTypeChange(type)}
                >
                  {type === 'equal' && '⚖️ Equal'}
                  {type === 'exact' && '💰 Exact'}
                  {type === 'percentage' && '% Percent'}
                </button>
              ))}
            </div>
          </div>

          {formData.splitType !== 'equal' && (
            <div className='form-group'>
              <label>
                {formData.splitType === 'exact' ? 'Amount per person (₹)' : 'Percentage per person (%)'}
              </label>
              <div className='custom-splits'>
                {members.map((m, i) => (
                  <div key={m.user._id} className='custom-split-row'>
                    <span className='custom-split-name'>
                      {m.user._id === user?._id ? 'You' : m.user.name}
                    </span>
                    <input
                      type='number'
                      placeholder='0'
                      value={customSplits[i] || ''}
                      onChange={(e) => {
                        const updated = [...customSplits];
                        updated[i] = e.target.value;
                        setCustomSplits(updated);
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className='form-group'>
            <label>Note (optional)</label>
            <input
              type='text'
              name='note'
              placeholder='Add a note...'
              value={formData.note}
              onChange={handleChange}
            />
          </div>

          <div className='modal-footer'>
            <button type='button' className='btn btn-outline' onClick={onClose}>
              Cancel
            </button>
            <button type='submit' className='btn btn-primary' disabled={loading}>
              {loading ? 'Adding...' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;