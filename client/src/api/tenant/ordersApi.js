import api from '../axios';

export const getUnifiedOrders = (type) => api.get('/tenant/orders', { params: { type } });