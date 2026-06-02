import api from '../axios';

export const login = (email, password) => api.post('/public/auth/login', { email, password });
export const refreshToken = (refreshToken) => api.post('/public/auth/refresh', { refreshToken });
export const verifyDevice = (email, code) => api.post('/public/auth/verify-device', { email, code });