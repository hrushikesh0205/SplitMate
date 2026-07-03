/**
 * Groups service — ready to wire to Express /api/groups once those routes exist.
 * Pages import from here; swapping the backend later only requires updating this file.
 */
import api from './axios.jsx';

export async function fetchGroups() {
  const { data } = await api.get('/groups');
  return data || [];
}

export async function fetchGroup(groupId) {
  const { data } = await api.get(`/groups/${groupId}`);
  return data;
}

export async function createGroup(payload) {
  const { data } = await api.post('/groups', payload);
  return data;
}

export async function updateGroup(id, patch) {
  const { data } = await api.put(`/groups/${id}`, patch);
  return data;
}

export async function deleteGroup(id) {
  await api.delete(`/groups/${id}`);
}

export async function fetchMembers(groupId) {
  const { data } = await api.get(`/groups/${groupId}/members`);
  return data || [];
}

export async function addMember(groupId, userId) {
  const { data } = await api.post(`/groups/${groupId}/members`, { userId });
  return data;
}

export async function removeMember(groupId, userId) {
  await api.delete(`/groups/${groupId}/members/${userId}`);
}
