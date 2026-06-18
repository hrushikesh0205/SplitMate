import axios from './axios.js';

export const getGroupBalancesApi = async (groupId) => {
  const res = await axios.get(`/settlements/balances/${groupId}`);
  return res.data;
};

export const settleUpApi = async (data) => {
  const res = await axios.post('/settlements', data);
  return res.data;
};

export const getSettlementHistoryApi = async (groupId) => {
  const res = await axios.get(`/settlements/history/${groupId}`);
  return res.data;
};