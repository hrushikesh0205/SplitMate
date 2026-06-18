import axios from './axios.js';

export const getUserProfileApi = async () => {
  const res = await axios.get('/users/profile');
  return res.data;
};

export const updateUserProfileApi = async (data) => {
  const res = await axios.put('/users/profile', data);
  return res.data;
};

export const changePasswordApi = async (data) => {
  const res = await axios.put('/users/change-password', data);
  return res.data;
};