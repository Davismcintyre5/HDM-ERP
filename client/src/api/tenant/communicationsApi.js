import api from '../axios';

export const getCommunications = (params) => api.get('/tenant/communications', { params });
export const createCommunication = (data) => api.post('/tenant/communications', data);
export const updateCommunication = (id, data) => api.put(`/tenant/communications/${id}`, data);
export const deleteCommunication = (id) => api.delete(`/tenant/communications/${id}`);
export const sendCommunication = (id, email) => api.post(`/tenant/communications/${id}/send`, { email });