import api from '../axios';

export const getBOMs = () => api.get('/tenant/manufacturing/boms');
export const createBOM = (data) => api.post('/tenant/manufacturing/boms', data);
export const getWorkOrders = () => api.get('/tenant/manufacturing/work-orders');
export const createWorkOrder = (data) => api.post('/tenant/manufacturing/work-orders', data);
export const updateWorkOrderStatus = (id, status) => api.put(`/tenant/manufacturing/work-orders/${id}/status`, { status });
export const logProduction = (data) => api.post('/tenant/manufacturing/shop-floor', data);
export const recordQC = (data) => api.post('/tenant/manufacturing/quality-control', data);