/**
 * Notifications service — ready to wire to Express /api/notifications once those routes exist.
 */
import api from './axios.jsx';

function normalizeNotification(notification) {
  if (!notification) return notification;
  const id = notification._id || notification.id;
  return {
    ...notification,
    id,
    _id: id,
    read: notification.read ?? notification.isRead ?? false,
    title: notification.title || notification.message || 'Notification',
    body: notification.body || notification.message || '',
    created_at: notification.createdAt || notification.created_at,
  };
}

export async function fetchNotifications() {
  const { data } = await api.get('/notifications');
  const list = Array.isArray(data) ? data : data?.notifications || [];
  return list.map(normalizeNotification);
}

export async function markNotificationRead(id, read = true) {
  const { data } = await api.put(`/notifications/${id}/read`, { read });
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
