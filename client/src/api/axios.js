import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: { 'Content-Type': 'application/json' }
});

// Request deduplication
const pendingRequests = new Map();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Deduplicate GET requests
  if (config.method === 'get') {
    const key = config.url + JSON.stringify(config.params || {});
    if (pendingRequests.has(key)) {
      return pendingRequests.get(key);
    }
    const promise = Promise.resolve(config);
    pendingRequests.set(key, promise);
    setTimeout(() => pendingRequests.delete(key), 10000);
  }

  return config;
});

// Refresh on 401
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          original.headers.Authorization = `Bearer ${token}`;
          return api(original);
        }).catch(err => Promise.reject(err));
      }

      original._retry = true;
      isRefreshing = true;

      try {
        const rt = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
        if (!rt) throw new Error('No refresh token');
        const { data } = await axios.post(`${api.defaults.baseURL}/public/auth/refresh`, { refreshToken: rt });
        const newToken = data.data.accessToken;
        const remember = !!localStorage.getItem('refreshToken');
        if (remember) localStorage.setItem('accessToken', newToken);
        else sessionStorage.setItem('accessToken', newToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
        processQueue(null, newToken);
        original.headers.Authorization = `Bearer ${newToken}`;
        return api(original);
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default api;