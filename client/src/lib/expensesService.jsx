/**
 * Expenses service — connected to Express /api/expenses
 */
import api from './axios.jsx';

function idOf(value) {
  return typeof value === 'object' && value !== null ? value._id || value.id : value;
}

export function normalizeExpense(expense) {
  if (!expense) return expense;
  const id = expense._id || expense.id;
  const groupId = idOf(expense.group) || expense.group_id;
  const paidById = idOf(expense.paidBy) || expense.paid_by;
  const splits = expense.splits || [];
  return {
    ...expense,
    id,
    _id: id,
    group_id: groupId,
    paid_by: paidById,
    description: expense.description || expense.title || '',
    title: expense.title || expense.description || '',
    split_type: expense.split_type || expense.splitType || 'equal',
    split_between: expense.split_between || splits.map((split) => idOf(split.user)).filter(Boolean),
    split_amounts: Object.fromEntries(
      splits.map((split) => [idOf(split.user), Number(split.amount || 0)]).filter(([userId]) => Boolean(userId))
    ),
    created_by: paidById,
    created_at: expense.createdAt || expense.created_at,
    updated_at: expense.updatedAt || expense.updated_at,
  };
}

export async function fetchExpenses(groupId) {
  const { data } = await api.get('/expenses', {
    params: { groupId },
  });
  return (data || []).map(normalizeExpense);
}

export async function fetchAllExpenses() {
  const { data } = await api.get('/expenses/all');
  return (data || []).map(normalizeExpense);
}

export async function createExpense(payload) {
  const splitType = payload.splitType || payload.split_type || 'equal';
  const normalized = {
    title: payload.title || payload.description,
    amount: payload.amount,
    category: payload.category,
    paidBy: payload.paidBy || payload.paid_by,
    groupId: payload.groupId || payload.group_id,
    splitType: splitType === 'percent' ? 'percentage' : splitType,
    splitBetween: payload.splitBetween || payload.split_between,
    customSplits: payload.customSplits || payload.custom_splits,
    note: payload.note,
    date: payload.date,
  };
  const { data } = await api.post('/expenses', normalized);
  return normalizeExpense(data);
}

export async function deleteExpense(id) {
  await api.delete(`/expenses/${id}`);
}
