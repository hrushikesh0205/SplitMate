import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout.jsx';
import { getGroupsApi } from '../api/groupApi.js';
import { getGroupBalancesApi } from '../api/settlementApi.js';
import useAuth from '../hooks/useAuth.js';
import toast from 'react-hot-toast';

const BalancesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [groupBalances, setGroupBalances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalOwed, setTotalOwed] = useState(0);
  const [totalOwe, setTotalOwe] = useState(0);

  useEffect(() => {
    fetchAllBalances();
  }, []);

  const fetchAllBalances = async () => {
    try {
      const groups = await getGroupsApi();
      const balanceResults = await Promise.all(
        groups.map(async (group) => {
          const data = await getGroupBalancesApi(group._id);
          return {
            group,
            balances: data.balances,
            totalExpenses: data.totalExpenses,
          };
        })
      );

      let owed = 0;
      let owe = 0;
      balanceResults.forEach(({ balances }) => {
        balances.forEach((b) => {
          if (b.to._id === user?._id) owed += b.amount;
          if (b.from._id === user?._id) owe += b.amount;
        });
      });

      setTotalOwed(owed);
      setTotalOwe(owe);
      setGroupBalances(balanceResults.filter(r => r.balances.length > 0 || r.totalExpenses > 0));
    } catch (err) {
      toast.error('Failed to load balances');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        <div className='page-header'>
          <div>
            <h1>Overall Balances</h1>
            <p>Your balances across all groups</p>
          </div>
        </div>

        {!loading && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginBottom: '28px',
          }}>
            <div className='card' style={{
              padding: '24px',
              borderLeft: '4px solid var(--success)',
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                💰 Total Owed to You
              </p>
              <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--success)' }}>
                ₹{totalOwed.toLocaleString()}
              </p>
            </div>
            <div className='card' style={{
              padding: '24px',
              borderLeft: '4px solid var(--danger)',
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                💸 Total You Owe
              </p>
              <p style={{ fontSize: '28px', fontWeight: '800', color: 'var(--danger)' }}>
                ₹{totalOwe.toLocaleString()}
              </p>
            </div>
            <div className='card' style={{
              padding: '24px',
              borderLeft: '4px solid var(--primary)',
            }}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                ⚖️ Net Balance
              </p>
              <p style={{
                fontSize: '28px', fontWeight: '800',
                color: totalOwed - totalOwe >= 0 ? 'var(--success)' : 'var(--danger)',
              }}>
                {totalOwed - totalOwe >= 0 ? '+' : ''}₹{Math.abs(totalOwed - totalOwe).toLocaleString()}
              </p>
            </div>
          </div>
        )}

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading...
          </div>
        ) : groupBalances.length === 0 ? (
          <div className='card' style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>✅</p>
            <p style={{ fontSize: '20px', fontWeight: '700', marginBottom: '8px' }}>
              All settled up!
            </p>
            <p style={{ color: 'var(--text-secondary)' }}>
              No pending balances across any of your groups
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {groupBalances.map(({ group, balances, totalExpenses }) => (
              <div key={group._id} className='card' style={{ padding: '24px' }}>

                <div style={{
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'space-between', marginBottom: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <span style={{ fontSize: '28px' }}>{group.icon}</span>
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '16px' }}>{group.name}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                        {group.members.length} members •
                        Total spent: ₹{totalExpenses.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <button
                    className='btn btn-outline'
                    style={{ fontSize: '13px', padding: '8px 16px' }}
                    onClick={() => navigate(`/groups/${group._id}`)}
                  >
                    View Group →
                  </button>
                </div>

                {balances.length === 0 ? (
                  <div style={{
                    padding: '16px',
                    background: 'rgba(66,186,150,0.08)',
                    borderRadius: 'var(--radius)',
                    textAlign: 'center',
                    color: 'var(--success)',
                    fontWeight: '600',
                    fontSize: '14px',
                  }}>
                    ✅ All settled up in this group!
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {balances.map((balance, i) => {
                      const isMyDebt = balance.from._id === user?._id;
                      const isOwedToMe = balance.to._id === user?._id;

                      return (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '14px 16px',
                          background: 'var(--bg)',
                          borderRadius: 'var(--radius)',
                          gap: '12px',
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--primary), #a855f7)',
                              color: 'white', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: '700', fontSize: '14px',
                            }}>
                              {balance.from?.name?.charAt(0).toUpperCase()}
                            </div>

                            <span style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>→</span>

                            <div style={{
                              width: '36px', height: '36px', borderRadius: '50%',
                              background: 'linear-gradient(135deg, var(--success), #06b6d4)',
                              color: 'white', display: 'flex', alignItems: 'center',
                              justifyContent: 'center', fontWeight: '700', fontSize: '14px',
                            }}>
                              {balance.to?.name?.charAt(0).toUpperCase()}
                            </div>

                            <p style={{ fontSize: '14px' }}>
                              <strong>{isMyDebt ? 'You' : balance.from?.name}</strong>
                              {' '}owe{isMyDebt ? '' : 's'}{' '}
                              <strong>{isOwedToMe ? 'you' : balance.to?.name}</strong>
                            </p>
                          </div>

                          <p style={{
                            fontSize: '18px', fontWeight: '800',
                            color: isMyDebt ? 'var(--danger)' : isOwedToMe ? 'var(--success)' : 'var(--text-primary)',
                          }}>
                            ₹{balance.amount.toLocaleString()}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
};

export default BalancesPage;