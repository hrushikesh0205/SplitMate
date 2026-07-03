import axios from './axios.js';

export const getExpensesApi = async (groupId) => {
  const res = await axios.get(`/expenses?groupId=${groupId}`);
  return res.data;
};

export const getAllExpensesApi = async () => {
  const res = await axios.get('/expenses/all');
  return res.data;
};

export const addExpenseApi = async (data) => {
  const res = await axios.post('/expenses', data);
  return res.data;
};

export const deleteExpenseApi = async (id) => {
  const res = await axios.delete(`/expenses/${id}`);
  return res.data;
};