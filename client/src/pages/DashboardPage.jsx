import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/common/DashboardLayout.jsx';
import BalanceCard from '../components/dashboard/BalanceCard.jsx';
import SpendingPieChart from '../components/dashboard/SpendingPieChart.jsx';
import MonthlyBarChart from '../components/dashboard/MonthlyBarChart.jsx';
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx';
import useAuth from '../hooks/useAuth.js';
import {
  getDashboardStatsApi,
  getSpendingByCategoryApi,
  getMonthlyTrendApi,
} from '../api/statsApi.js';
import '../styles/dashboard.css';

const DashboardPage = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState(null);
  const [pieData, setPieData] = useState([]);
  const [barData, setBarData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    try {
      const [statsData, pieData, barData] = await Promise.all([
        getDashboardStatsApi(),
        getSpendingByCategoryApi(),
        getMonthlyTrendApi(),
      ]);
      setStats(statsData);
      setPieData(pieData);
      setBarData(barData);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className='dashboard'>

        <div className='dashboard-header'>
          <div>
            <h1>Hello, {user?.name?.split(' ')[0]} </h1>
            <p>Here's your expense summary</p>
          </div>
          <Link to='/Groups' className='btn btn-primary'>
            + Add Expense
          </Link>
        </div>

  
        {loading ? (
          <div className='balance-cards'>
            {[1, 2, 3].map((i) => (
              <div key={i} className='balance-card-skeleton' />
            ))}
          </div>
        ) : (
          <div className='balance-cards'>
            <BalanceCard
              title='Total You Are Owed'
              amount={stats?.totalOwed || 0}
              type='owed'
              icon='💰'
            />
            <BalanceCard
              title='Total You Owe'
              amount={stats?.totalOwe || 0}
              type='owe'
              icon='💸'
            />
            <BalanceCard
              title='Total Groups'
              amount={stats?.totalGroups || 0}
              type='settled'
              icon='👥'
              isCount={true}
            />
          </div>
        )}

  
        {!loading && (
          <div className='quick-stats'>
            <div className='quick-stat'>
              <span className='quick-stat-icon'>🧾</span>
              <div>
                <p className='quick-stat-value'>{stats?.totalExpenses || 0}</p>
                <p className='quick-stat-label'>Total Expenses</p>
              </div>
            </div>
            <div className='quick-stat'>
              <span className='quick-stat-icon'>📊</span>
              <div>
                <p className='quick-stat-value'>{pieData.length}</p>
                <p className='quick-stat-label'>Categories Used</p>
              </div>
            </div>
            <div className='quick-stat'>
              <span className='quick-stat-icon'>📅</span>
              <div>
                <p className='quick-stat-value'>
                  {barData.find(b => b.amount > 0) ? 
                    `₹${Math.max(...barData.map(b => b.amount)).toLocaleString()}` 
                    : '₹0'}
                </p>
                <p className='quick-stat-label'>Highest Month</p>
              </div>
            </div>
            <div className='quick-stat'>
              <span className='quick-stat-icon'>💵</span>
              <div>
                <p className='quick-stat-value'>
                  ₹{pieData.reduce((sum, d) => sum + d.value, 0).toLocaleString()}
                </p>
                <p className='quick-stat-label'>Total Spent</p>
              </div>
            </div>
          </div>
        )}


        <div className='dashboard-charts'>
          <div className='chart-card'>
            <h3>Spending by Category</h3>
            {loading ? (
              <div className='chart-skeleton' />
            ) : pieData.length === 0 ? (
              <div className='chart-empty'>
                <span>📊</span>
                <p>No spending data yet</p>
                <p>Add expenses to see your breakdown</p>
              </div>
            ) : (
              <SpendingPieChart data={pieData} />
            )}
          </div>

          <div className='chart-card'>
            <h3>Monthly Spending</h3>
            {loading ? (
              <div className='chart-skeleton' />
            ) : (
              <MonthlyBarChart data={barData} />
            )}
          </div>
        </div>

        <div className='dashboard-activity'>
          <div className='activity-header'>
            <h3>Recent Activity</h3>
            <Link to='/groups' className='activity-view-all'>
              View Groups →
            </Link>
          </div>
          {loading ? (
            <div className='activity-skeleton' />
          ) : (
            <ActivityFeed activities={stats?.activity || []} />
          )}
        </div>

      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;