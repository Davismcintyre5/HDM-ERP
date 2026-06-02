import api from '../axios';

export const getPurchaseOrders = () => api.get('/tenant/supply-chain/purchase-orders');
export const createPurchaseOrder = (data) => api.post('/tenant/supply-chain/purchase-orders', data);
export const receiveGoods = (data) => api.post('/tenant/supply-chain/receiving', data);

export const getSuppliers = () => api.get('/tenant/supply-chain/suppliers');
export const addSupplier = (data) => api.post('/tenant/supply-chain/suppliers', data);

export const getRequisitions = () => api.get('/tenant/supply-chain/requisitions');
export const createRequisition = (data) => api.post('/tenant/supply-chain/requisitions', data);