import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

const COLORS = ['#6c63ff', '#ff6584', '#42ba96', '#f4a261', '#a855f7', '#06b6d4'];

const SpendingPieChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className='chart-empty'>
        <p>No spending data yet</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width='100%' height={280}>
      <PieChart>
        <Pie
          data={data}
          cx='50%'
          cy='50%'
          innerRadius={70}
          outerRadius={110}
          paddingAngle={4}
          dataKey='value'
        >
          {data.map((entry, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(value) => `₹${value}`} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

export default SpendingPieChart;