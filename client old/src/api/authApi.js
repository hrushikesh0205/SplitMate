import axios from './axios.js';

export const registerApi = async (data) => {
  const res = await axios.post('/auth/register', data);
  return res.data;
};

export const loginApi = async (data) => {
  const res = await axios.post('/auth/login', data);
  return res.data;
};

export const getMeApi = async () => {
  const res = await axios.get('/auth/me');
  return res.data;
};