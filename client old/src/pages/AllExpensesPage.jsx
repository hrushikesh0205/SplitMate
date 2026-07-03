import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DashboardLayout from '../components/common/DashboardLayout.jsx';
import CategoryBadge from '../components/expenses/CategoryBadge.jsx';
import { getAllExpensesApi } from '../api/expenseApi.js';
import useAuth from '../hooks/useAuth.js';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';
import '../styles/expenses-modern.css';

const CATEGORIES = ['All', 'Food', 'Travel', 'Rent', 'Shopping', 'Entertainment', 'Other'];

const CATEGORY_ICONS = {
  Food: '🍕', Travel: '✈️', Rent: '🏠',
  Shopping: '🛒', Entertainment: '🎬', Other: '📦',
};

const AllExpensesPage = () => {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => {
    fetchExpenses();
  }, []);

  useEffect(() => {
    filterExpenses();
  }, [expenses, selectedCategory, searchQuery]);

  const fetchExpenses = async () => {
    try {
      const data = await getAllExpensesApi();
      setExpenses(data);
      const total = data.reduce((sum, e) => {
        const mySplit = e.splits?.find(s => s.user?._id === user?._id);
        return sum + (mySplit?.amount || 0);
      }, 0);
      setTotalSpent(total);
    } catch (err) {
      toast.error('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  const filterExpenses = () => {
    let result = [...expenses];
    if (selectedCategory !== 'All') {
      result = result.filter(e => e.category === selectedCategory);
    }
    if (searchQuery.trim()) {
      result = result.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    setFiltered(result);
  };

  return (
    <DashboardLayout>
      <div className='expenses-page'>

        <div className='expenses-header'>
          <h1>All Expenses</h1>
          <p>Every expense across all your groups</p>
        </div>

        {!loading && (
          <div className='expenses-stats'>
            <div className='stat-box'>
              <p className='stat-label'>Total Expenses</p>
              <p className='stat-value'>{expenses.length}</p>
            </div>
            <div className='stat-box'>
              <p className='stat-label'>Your Total Share</p>
              <p className='stat-value danger'>₹{totalSpent.toLocaleString()}</p>
            </div>
            <div className='stat-box'>
              <p className='stat-label'>Categories Used</p>
              <p className='stat-value'>{new Set(expenses.map(e => e.category)).size}</p>
            </div>
          </div>
        )}

        <div className='filter-section'>
          <input
            type='text'
            placeholder='🔍 Search expenses...'
            className='search-input'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <div className='category-filters'>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`category-btn ${selectedCategory === cat ? 'active' : ''}`}
              >
                {cat !== 'All' && CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        <div className='expenses-list'>
          {loading ? (
            <div className='expenses-loading'>
              <div className='loading-spinner'></div>
            </div>
          ) : filtered.length === 0 ? (
            <div className='expenses-empty'>
              <span className='expenses-empty-icon'>🧾</span>
              <h3>No expenses found</h3>
              <p>Try a different filter or add expenses in your groups</p>
            </div>
          ) : (
            filtered.map((expense) => {
              const mySplit = expense.splits?.find(s => s.user?._id === user?._id);
              const paidByMe = expense.paidBy?._id === user?._id;

              return (
                <Link
                  key={expense._id}
                  to={`/groups/${expense.group?._id}`}
                  className='expense-item'
                >
                  <div className='expense-icon'>
                    {CATEGORY_ICONS[expense.category] || '📦'}
                  </div>

                  <div className='expense-content'>
                    <div className='expense-title-row'>
                      <p className='expense-title'>{expense.title}</p>
                      <CategoryBadge category={expense.category} />
                    </div>
                    <div className='expense-meta'>
                      <p className='expense-date'>{format(new Date(expense.date), 'dd MMM yyyy')}</p>
                      <p className='expense-group'>{expense.group?.icon} {expense.group?.name}</p>
                    </div>
                    <p className='expense-paid-by'>
                      Paid by <strong>{paidByMe ? 'You' : expense.paidBy?.name}</strong>
                    </p>
                  </div>

                  <div className='expense-amount'>
                    <p className='expense-total'>₹{expense.amount.toLocaleString()}</p>
                    {mySplit && (
                      <p className={`expense-share ${paidByMe ? 'paid' : 'owed'}`}>
                        {paidByMe ? 'You paid' : `Your share: ₹${mySplit.amount.toLocaleString()}`}
                      </p>
                    )}
                  </div>
                </Link>
              );
            })
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default AllExpensesPage;