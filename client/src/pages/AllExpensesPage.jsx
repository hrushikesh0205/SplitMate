import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import DashboardLayout from '../components/common/DashboardLayout.jsx';
import CategoryBadge from '../components/expenses/CategoryBadge.jsx';
import { getAllExpensesApi } from '../api/expenseApi.js';
import useAuth from '../hooks/useAuth.js';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

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
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div className='page-header'>
          <div>
            <h1>All Expenses</h1>
            <p>Every expense across all your groups</p>
          </div>
        </div>

        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '24px'
          }}>
            <div className='card' style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                Total Expenses
              </p>
              <p style={{ fontSize: '28px', fontWeight: '800' }}>{expenses.length}</p>
            </div>
            <div className='card' style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                Your Total Share
              </p>
              <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--danger)' }}>
                ₹{totalSpent.toLocaleString()}
              </p>
            </div>
            <div className='card' style={{ padding: '20px', textAlign: 'center' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '13px', marginBottom: '6px' }}>
                Categories Used
              </p>
              <p style={{ fontSize: '28px', fontWeight: '800' }}>
                {new Set(expenses.map(e => e.category)).size}
              </p>
            </div>
          </div>
        )}

        <div className='card' style={{ padding: '16px', marginBottom: '20px' }}>
      
          <input
            type='text'
            placeholder='🔍 Search expenses...'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 16px',
              border: '2px solid var(--border)',
              borderRadius: 'var(--radius)',
              fontSize: '14px',
              marginBottom: '12px',
              background: 'var(--bg)',
              color: 'var(--text-primary)',
              outline: 'none',
            }}
          />

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '2px solid',
                  borderColor: selectedCategory === cat ? 'var(--primary)' : 'var(--border)',
                  background: selectedCategory === cat ? 'var(--primary)' : 'transparent',
                  color: selectedCategory === cat ? 'white' : 'var(--text-secondary)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat !== 'All' && CATEGORY_ICONS[cat]} {cat}
              </button>
            ))}
          </div>
        </div>

        <div className='card' style={{ padding: '8px' }}>
          {loading ? (
            <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Loading...
            </div>
          ) : filtered.length === 0 ? (
            <div style={{
              padding: '60px 20px',
              textAlign: 'center',
              color: 'var(--text-secondary)'
            }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>🧾</p>
              <p style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>
                No expenses found
              </p>
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
                  style={{ textDecoration: 'none', color: 'inherit' }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '16px',
                    borderBottom: '1px solid var(--border)',
                    transition: 'background 0.2s',
                    borderRadius: 'var(--radius)',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '48px', height: '48px',
                      background: 'var(--bg)',
                      borderRadius: '12px',
                      display: 'flex', alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px', flexShrink: 0,
                    }}>
                      {CATEGORY_ICONS[expense.category] || '📦'}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <p style={{ fontWeight: '700', fontSize: '15px' }}>{expense.title}</p>
                        <CategoryBadge category={expense.category} />
                      </div>
                      <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                        <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                          {format(new Date(expense.date), 'dd MMM yyyy')}
                        </p>
                        <p style={{ fontSize: '12px', color: 'var(--primary)', fontWeight: '600' }}>
                          {expense.group?.icon} {expense.group?.name}
                        </p>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        Paid by <strong>{paidByMe ? 'You' : expense.paidBy?.name}</strong>
                      </p>
                    </div>

                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <p style={{ fontSize: '18px', fontWeight: '800' }}>
                        ₹{expense.amount.toLocaleString()}
                      </p>
                      {mySplit && (
                        <p style={{
                          fontSize: '13px', fontWeight: '600',
                          color: paidByMe ? 'var(--success)' : 'var(--danger)',
                        }}>
                          {paidByMe ? 'You paid' : `Your share: ₹${mySplit.amount.toLocaleString()}`}
                        </p>
                      )}
                    </div>
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