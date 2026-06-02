import api from '../axios';

export const getStockOverview = () => api.get('/tenant/inventory/stock');
export const addProduct = (data) => api.post('/tenant/inventory/stock', data);

export const getMovements = () => api.get('/tenant/inventory/movements');
export const recordMovement = (data) => api.post('/tenant/inventory/movements', data);

export const getWarehouses = () => api.get('/tenant/inventory/warehouses');
export const addWarehouse = (data) => api.post('/tenant/inventory/warehouses', data);

export const transferStock = (data) => api.post('/tenant/inventory/transfers', data);