/**
 * Settlements service — ready to wire to Express /api/settlements once those routes exist.
 */
import api from './axios.jsx';

function idOf(value) {
  return typeof value === 'object' && value !== null ? value._id || value.id : value;
}

export function normalizeSettlement(settlement) {
  if (!settlement) return settlement;
  const id = settlement._id || settlement.id;
  const groupId = idOf(settlement.group) || settlement.group_id;
  const payer = idOf(settlement.from) || settlement.payer;
  const payee = idOf(settlement.to) || settlement.payee;
  return {
    ...settlement,
    id,
    _id: id,
    group_id: groupId,
    payer,
    payee,
    created_at: settlement.createdAt || settlement.settledAt || settlement.created_at,
  };
}

export async function fetchSettlements(groupId) {
  const { data } = await api.get(`/settlements/history/${groupId}`);
  return (data || []).map(normalizeSettlement);
}

export async function fetchAllSettlements() {
  const { data } = await api.get('/settlements');
  return (data || []).map(normalizeSettlement);
}

export async function createSettlement(payload) {
  const { data } = await api.post('/settlements', {
    groupId: payload.groupId || payload.group_id,
    toUserId: payload.toUserId || payload.payee,
    amount: payload.amount,
    note: payload.note,
  });
  return normalizeSettlement(data);
}
