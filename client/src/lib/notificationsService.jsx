/**
 * Notifications service — ready to wire to Express /api/notifications once those routes exist.
 */
import api from './axios.jsx';

export async function fetchNotifications() {
  const { data } = await api.get('/notifications');
  return data || [];
}

export async function markNotificationRead(id, read = true) {
  const { data } = await api.put(`/notifications/${id}`, { read });
  return data;
}

export async function markAllNotificationsRead() {
  await api.put('/notifications/read-all');
}

export async function deleteNotification(id) {
  await api.delete(`/notifications/${id}`);
}

export async function insertNotification(payload) {
  const { data } = await api.post('/notifications', payload);
  return data;
}
