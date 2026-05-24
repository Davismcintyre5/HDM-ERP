import api from '../axios';

export const getStockOverview = () => api.get('/tenant/inventory/stock');
export const addProduct = (data) => api.post('/tenant/inventory/stock', data);
export const updateProduct = (id, data) => api.put(`/tenant/inventory/stock/${id}`, data);
export const deleteProduct = (id) => api.delete(`/tenant/inventory/stock/${id}`);

export const getMovements = () => api.get('/tenant/inventory/movements');
export const recordMovement = (data) => api.post('/tenant/inventory/movements', data);

export const getWarehouses = () => api.get('/tenant/inventory/warehouses');
export const addWarehouse = (data) => api.post('/tenant/inventory/warehouses', data);
export const deleteWarehouse = (id) => api.delete(`/tenant/inventory/warehouses/${id}`);

export const transferStock = (data) => api.post('/tenant/inventory/transfers', data);