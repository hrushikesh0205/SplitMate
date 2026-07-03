/**
 * Profile service — ready to wire to Express /api/profile once those routes exist.
 */
import api from './axios.jsx';

export async function fetchProfile() {
  const { data } = await api.get('/profile');
  return data;
}

export async function updateProfile(patch) {
  const { data } = await api.put('/profile', patch);
  return data;
}
