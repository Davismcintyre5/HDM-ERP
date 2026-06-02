import axios from 'axios';
import { getStorage, setStorage, clearAll } from '../utils/storage';

const API_BASE = 'https://hdmerpserver.pxxl.click/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

api.interceptors.request.use(async (config) => {
  const token = await getStorage('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const rt = await getStorage('refreshToken');
        if (!rt) throw new Error('No refresh token');
        const { data } = await axios.post(`${API_BASE}/public/auth/refresh`, { refreshToken: rt });
        const newToken = data.data.accessToken;
        await setStorage('accessToken', newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch {
        await clearAll();
        throw error;
      }
    }
    return Promise.reject(error);
  }
);

export default api;