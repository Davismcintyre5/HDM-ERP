import api from '../axios';

export const getAISettings = () => api.get('/tenant/ai/settings');
export const updateAISettings = (data) => api.put('/tenant/ai/settings', data);
export const generateOutwardKey = (data) => api.post('/tenant/ai/keys', data);
export const getOutwardKeys = () => api.get('/tenant/ai/keys');
export const revokeOutwardKey = (id) => api.delete(`/tenant/ai/keys/${id}`);
export const uploadFile = (formData) => api.post('/tenant/ai/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });