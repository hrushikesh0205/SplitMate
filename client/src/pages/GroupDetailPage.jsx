import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { UserPlus, Trash2, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardLayout from '../components/common/DashboardLayout.jsx';
import ExpenseCard from '../components/expenses/ExpenseCard.jsx';
import ExpenseForm from '../components/expenses/ExpenseForm.jsx';
import BalanceSummary from '../components/settlements/BalanceSummary.jsx';
import SettleUpModal from '../components/settlements/SettleUpModal.jsx';
import { getGroupByIdApi, addMemberApi, deleteGroupApi } from '../api/groupApi.js';
import { getExpensesApi, deleteExpenseApi } from '../api/expenseApi.js';
import { getGroupBalancesApi } from '../api/settlementApi.js';
import useAuth from '../hooks/useAuth.js';
import '../styles/groups.css';
import '../styles/groupDetail.css';
import '../styles/expenses.css';
import '../styles/settlements.css';

const GroupDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [group, setGroup] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [balances, setBalances] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('expenses');
  const [showAddMember, setShowAddMember] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [settleBalance, setSettleBalance] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');
  const [addingMember, setAddingMember] = useState(false);

  useEffect(() => { fetchAll(); }, [id]);

  const fetchAll = async () => {
    try {
      const [groupData, expenseData, balanceData] = await Promise.all([
        getGroupByIdApi(id),
        getExpensesApi(id),
        getGroupBalancesApi(id),
      ]);
      setGroup(groupData);
      setExpenses(expenseData);
      setBalances(balanceData.balances);
      setTotalExpenses(balanceData.totalExpenses);
    } catch (err) {
      toast.error('Failed to load group');
      navigate('/groups');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    setAddingMember(true);
    try {
      const updated = await addMemberApi(id, memberEmail);
      setGroup(updated);
      setMemberEmail('');
      setShowAddMember(false);
      toast.success('Member added!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add member');
    } finally {
      setAddingMember(false);
    }
  };

  const handleExpenseAdded = (newExpense) => {
    setExpenses([newExpense, ...expenses]);
    setGroup((prev) => ({ ...prev, totalExpenses: prev.totalExpenses + 1 }));
    fetchAll(); 
  };

  const handleDeleteExpense = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    try {
      await deleteExpenseApi(expenseId);
      setExpenses(expenses.filter((e) => e._id !== expenseId));
      fetchAll();
      toast.success('Expense deleted');
    } catch (err) {
      toast.error('Failed to delete expense');
    }
  };

  const handleDeleteGroup = async () => {
    if (!window.confirm('Delete this group?')) return;
    try {
      await deleteGroupApi(id);
      toast.success('Group deleted');
      navigate('/groups');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  const isAdmin = group?.createdBy?._id === user?._id ||
    group?.createdBy === user?._id;

  if (loading) return (
    <DashboardLayout>
      <div className='loading-screen'><div className='spinner' /></div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout>
      <div className='group-detail'>

        <div className='group-detail-header'>
          <button className='back-btn' onClick={() => navigate('/groups')}>
            <ArrowLeft size={20} /> Back
          </button>
          <div className='group-detail-title'>
            <span className='group-detail-icon'>{group?.icon}</span>
            <div>
              <h1>{group?.name}</h1>
              <p>{group?.type} • {group?.members?.length} members</p>
            </div>
          </div>
          {isAdmin && (
            <button className='btn-danger-outline' onClick={handleDeleteGroup}>
              <Trash2 size={16} /> Delete Group
            </button>
          )}
        </div>

        <div className='group-stats-row'>
          <div className='group-stat-card'>
            <p className='group-stat-label'>Total Spent</p>
            <p className='group-stat-value'>₹{totalExpenses.toLocaleString()}</p>
          </div>
          <div className='group-stat-card'>
            <p className='group-stat-label'>Expenses</p>
            <p className='group-stat-value'>{expenses.length}</p>
          </div>
          <div className='group-stat-card'>
            <p className='group-stat-label'>Members</p>
            <p className='group-stat-value'>{group?.members?.length}</p>
          </div>
          <div className='group-stat-card'>
            <p className='group-stat-label'>Pending Balances</p>
            <p className='group-stat-value'>{balances.length}</p>
          </div>
        </div>

        <div className='group-detail-body'>

          <div className='group-detail-members card'>
            <div className='card-header'>
              <h3>Members ({group?.members?.length})</h3>
              {isAdmin && (
                <button
                  className='btn btn-outline'
                  onClick={() => setShowAddMember(!showAddMember)}
                >
                  <UserPlus size={16} /> Add
                </button>
              )}
            </div>

            {showAddMember && (
              <form onSubmit={handleAddMember} className='add-member-form'>
                <input
                  type='email'
                  placeholder='Enter email'
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  required
                />
                <button
                  type='submit'
                  className='btn btn-primary'
                  disabled={addingMember}
                >
                  {addingMember ? '...' : 'Add'}
                </button>
              </form>
            )}

            <div className='member-list'>
              {group?.members?.map((m) => (
                <div key={m.user._id} className='member-item'>
                  <div className='member-avatar'>
                    {m.user?.avatar
                      ? <img src={m.user.avatar} alt={m.user.name} />
                      : m.user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className='member-info'>
                    <p className='member-name'>
                      {m.user?.name}
                      {m.user?._id === user?._id && (
                        <span className='member-you'> (You)</span>
                      )}
                    </p>
                    <p className='member-email'>{m.user?.email}</p>
                  </div>
                  <span className={`member-role member-role-${m.role}`}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className='group-detail-main'>

            <div className='group-tabs'>
              <button
                className={`group-tab ${activeTab === 'expenses' ? 'group-tab-active' : ''}`}
                onClick={() => setActiveTab('expenses')}
              >
                🧾 Expenses ({expenses.length})
              </button>
              <button
                className={`group-tab ${activeTab === 'balances' ? 'group-tab-active' : ''}`}
                onClick={() => setActiveTab('balances')}
              >
                ⚖️ Balances ({balances.length})
              </button>
            </div>

            {activeTab === 'expenses' && (
              <div className='card'>
                <div className='card-header'>
                  <h3>All Expenses</h3>
                  <button
                    className='btn btn-primary'
                    onClick={() => setShowExpenseForm(true)}
                  >
                    + Add Expense
                  </button>
                </div>
                {expenses.length === 0 ? (
                  <div className='expenses-empty'>
                    <span>🧾</span>
                    <p>No expenses yet</p>
                    <p>Add the first expense!</p>
                  </div>
                ) : (
                  <div className='expenses-list'>
                    {expenses.map((expense) => (
                      <ExpenseCard
                        key={expense._id}
                        expense={expense}
                        onDelete={handleDeleteExpense}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'balances' && (
              <div className='card'>
                <div className='card-header'>
                  <h3>Who Owes What</h3>
                </div>
                <BalanceSummary
                  balances={balances}
                  onSettleUp={(balance) => setSettleBalance(balance)}
                />
              </div>
            )}
          </div>

        </div>
      </div>

      {showExpenseForm && (
        <ExpenseForm
          onClose={() => setShowExpenseForm(false)}
          onExpenseAdded={handleExpenseAdded}
          group={group}
        />
      )}

      {settleBalance && (
        <SettleUpModal
          balance={settleBalance}
          groupId={id}
          onClose={() => setSettleBalance(null)}
          onSettled={fetchAll}
        />
      )}

    </DashboardLayout>
  );
};

export default GroupDetailPage;