import axios from './axios.js';

export const getGroupsApi = async () => {
  const res = await axios.get('/groups');
  return res.data;
};

export const createGroupApi = async (data) => {
  const res = await axios.post('/groups', data);
  return res.data;
};

export const getGroupByIdApi = async (id) => {
  const res = await axios.get(`/groups/${id}`);
  return res.data;
};

export const addMemberApi = async (groupId, email) => {
  const res = await axios.post(`/groups/${groupId}/members`, { email });
  return res.data;
};

export const removeMemberApi = async (groupId, userId) => {
  const res = await axios.delete(`/groups/${groupId}/members/${userId}`);
  return res.data;
};

export const deleteGroupApi = async (groupId) => {
  const res = await axios.delete(`/groups/${groupId}`);
  return res.data;
};