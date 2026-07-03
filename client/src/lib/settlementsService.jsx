/**
 * Settlements service — ready to wire to Express /api/settlements once those routes exist.
 */
import api from './axios.jsx';

export async function fetchSettlements(groupId) {
  const { data } = await api.get('/settlements', { params: { groupId } });
  return data || [];
}

export async function fetchAllSettlements() {
  const { data } = await api.get('/settlements');
  return data || [];
}

export async function createSettlement(payload) {
  const { data } = await api.post('/settlements', payload);
  return data;
}
