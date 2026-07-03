/**
 * Groups service — ready to wire to Express /api/groups once those routes exist.
 * Pages import from here; swapping the backend later only requires updating this file.
 */
import api from './axios.jsx';

export function normalizeMember(member) {
  const user = member?.user || member?.profile || member || {};
  const id = user._id || user.id || member?.user_id || member?.user;
  return {
    ...member,
    user_id: id,
    role: member?.role || 'member',
    profile: {
      ...member?.profile,
      id,
      full_name: user.name || user.full_name || member?.profile?.full_name || '',
      avatar_url: user.avatar || user.avatar_url || member?.profile?.avatar_url || '',
      email: user.email || member?.profile?.email || '',
    },
  };
}

export function normalizeGroup(group) {
  if (!group) return group;
  const id = group._id || group.id;
  const createdBy =
    typeof group.createdBy === 'object'
      ? group.createdBy?._id || group.createdBy?.id
      : group.createdBy || group.created_by;
  return {
    ...group,
    id,
    _id: id,
    created_by: createdBy,
    created_at: group.createdAt || group.created_at,
    updated_at: group.updatedAt || group.updated_at,
    members: (group.members || []).map(normalizeMember),
  };
}

export async function fetchGroups() {
  const { data } = await api.get('/groups');
  return (data || []).map(normalizeGroup);
}

export async function fetchGroup(groupId) {
  const { data } = await api.get(`/groups/${groupId}`);
  return normalizeGroup(data);
}

export async function createGroup(payload) {
  const { data } = await api.post('/groups', payload);
  return normalizeGroup(data);
}

export async function updateGroup(id, patch) {
  const { data } = await api.put(`/groups/${id}`, patch);
  return normalizeGroup(data);
}

export async function deleteGroup(id) {
  await api.delete(`/groups/${id}`);
}

export async function fetchMembers(groupId) {
  const { data } = await api.get(`/groups/${groupId}/members`);
  return (data || []).map(normalizeMember);
}

export async function addMember(groupId, email) {
  const { data } = await api.post(`/groups/${groupId}/members`, {
    email,
  });
  return normalizeGroup(data);
}

export async function removeMember(groupId, userId) {
  const { data } = await api.delete(`/groups/${groupId}/members/${userId}`);
  return normalizeGroup(data);
}
