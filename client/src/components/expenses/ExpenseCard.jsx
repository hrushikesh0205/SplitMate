import { Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import CategoryBadge from './CategoryBadge.jsx';
import useAuth from '../../hooks/useAuth.js';
import '../../styles/expenses.css';

const ExpenseCard = ({ expense, onDelete }) => {
  const { user } = useAuth();
  const mySplit = expense.splits?.find(
    (s) => s.user?._id === user?._id
  );
  const paidByMe = expense.paidBy?._id === user?._id;

  return (
    <div className='expense-card'>
      <div className='expense-card-left'>
        <div className='expense-category-icon'>
          {expense.category === 'Food' && '🍕'}
          {expense.category === 'Travel' && '✈️'}
          {expense.category === 'Rent' && '🏠'}
          {expense.category === 'Shopping' && '🛒'}
          {expense.category === 'Entertainment' && '🎬'}
          {expense.category === 'Other' && '📦'}
        </div>
        <div className='expense-card-info'>
          <h4 className='expense-card-title'>{expense.title}</h4>
          <div className='expense-card-meta'>
            <CategoryBadge category={expense.category} />
            <span className='expense-card-date'>
              {format(new Date(expense.date), 'dd MMM yyyy')}
            </span>
          </div>
          <p className='expense-card-paidby'>
            Paid by{' '}
            <strong>
              {paidByMe ? 'You' : expense.paidBy?.name}
            </strong>
          </p>
          {expense.note && (
            <p className='expense-card-note'>📝 {expense.note}</p>
          )}
        </div>
      </div>

      <div className='expense-card-right'>
        <p className='expense-total-amount'>
          ₹{expense.amount.toLocaleString()}
        </p>
        {mySplit && (
          <p className={`expense-my-share ${paidByMe ? 'share-positive' : 'share-negative'}`}>
            {paidByMe
              ? 'You paid'
              : `Your share: ₹${mySplit?.amount?.toLocaleString()}`}
          </p>
        )}
        {paidByMe && (
          <button
            className='expense-delete-btn'
            onClick={() => onDelete(expense._id)}
            title='Delete expense'
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  );
};

export default ExpenseCard;