import api from '../axios';

export const getOrders = () => api.get('/tenant/sales/orders');
export const createOrder = (data) => api.post('/tenant/sales/orders', data);
export const updateOrderStatus = (id, status) => api.put(`/tenant/sales/orders/${id}/status`, { status });

export const getQuotations = () => api.get('/tenant/sales/quotations');
export const createQuotation = (data) => api.post('/tenant/sales/quotations', data);

export const getPricing = () => api.get('/tenant/sales/pricing');
export const updatePrice = (id, sellingPrice) => api.put(`/tenant/sales/pricing/${id}`, { sellingPrice });