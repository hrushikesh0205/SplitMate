import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT on every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('sm_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Normalise error shape so callers always do `err.message`
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const message =
      err.response?.data?.message ||
      err.response?.data?.error ||
      err.message ||
      'Something went wrong';
    const wrapped = new Error(message);
    wrapped.status = err.response?.status;
    wrapped.data = err.response?.data;
    return Promise.reject(wrapped);
  }
);

export default api;
