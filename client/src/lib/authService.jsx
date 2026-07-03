import api from './axios.jsx';

const TOKEN_KEY = 'sm_token';

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function saveToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export async function register(name, email, password) {
  const { data } = await api.post('/auth/register', { name, email, password });
  if (data.token) saveToken(data.token);
  return data;
}

export async function login(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  if (data.token) saveToken(data.token);
  return data;
}

export async function getMe() {
  const { data } = await api.get('/auth/me');
  return data;
}

export function logout() {
  clearToken();
}
