import axios from './axios.js';

export const getNotificationsApi = async () => {
  const res = await axios.get('/notifications');
  return res.data;
};

export const markAsReadApi = async (id) => {
  const res = await axios.put(`/notifications/${id}/read`);
  return res.data;
};

export const markAllAsReadApi = async () => {
  const res = await axios.put('/notifications/read-all');
  return res.data;
};

export const deleteNotificationApi = async (id) => {
  const res = await axios.delete(`/notifications/${id}`);
  return res.data;
};