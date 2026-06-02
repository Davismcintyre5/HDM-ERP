import api from '../axios';

export const getProducts = () => api.get('/tenant/products');
export const createProduct = (data) => api.post('/tenant/products', data);
export const updateProduct = (id, data) => api.put(`/tenant/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/tenant/products/${id}`);