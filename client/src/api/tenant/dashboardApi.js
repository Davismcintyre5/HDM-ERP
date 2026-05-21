import api from '../axios';

export const getMetrics = () => api.get('/tenant/dashboard');