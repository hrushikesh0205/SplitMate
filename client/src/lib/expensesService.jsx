/**
 * Expenses service — connected to Express /api/expenses
 */
import api from './axios.jsx';

export async function fetchExpenses(groupId) {
  const { data } = await api.get('/expenses', {
    params: { groupId },
  });
  return data || [];
}

export async function fetchAllExpenses() {
  const { data } = await api.get('/expenses/all');
  return data || [];
}

export async function createExpense(payload) {
  const { data } = await api.post('/expenses', payload);
  return data;
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`);
}