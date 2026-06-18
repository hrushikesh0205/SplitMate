import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from 'recharts';

const MonthlyBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className='chart-empty'>
        <p>No monthly data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width='100%' height={280}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray='3 3' stroke='#e2e8f0' />
        <XAxis dataKey='month' tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip formatter={(value) => `₹${value}`} />
        <Bar dataKey='amount' fill='#6c63ff' radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MonthlyBarChart;