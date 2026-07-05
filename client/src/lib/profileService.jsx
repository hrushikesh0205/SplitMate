/**
 * Profile service — wired to Express /api/users/profile
 */
import api from './axios.jsx';

export async function fetchProfile() {
  const { data } = await api.get('/users/profile');
  return data;
}

export async function updateProfile(patch) {
  // Map frontend field names to backend expected names
  const payload = {};
  if (patch.full_name !== undefined) payload.name = patch.full_name;
  if (patch.avatar_url !== undefined) payload.avatar = patch.avatar_url;
  // currency is a frontend-only preference stored in localStorage, not sent to backend

  const { data } = await api.put('/users/profile', payload);
  return data;
}
