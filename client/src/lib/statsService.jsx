/**
 * Stats service — ready to wire to Express /api/stats once that route exists.
 */
import api from './axios.jsx';

export async function fetchStats() {
  const { data } = await api.get('/stats/dashboard');
  return data;
}
