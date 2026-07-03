import axios from './axios.js';

export const getDashboardStatsApi = async () => {
  const res = await axios.get('/stats/dashboard');
  return res.data;
};

export const getSpendingByCategoryApi = async () => {
  const res = await axios.get('/stats/spending-by-category');
  return res.data;
};

export const getMonthlyTrendApi = async () => {
  const res = await axios.get('/stats/monthly-trend');
  return res.data;
};