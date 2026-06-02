import api from '../axios';

export const getContacts = () => api.get('/tenant/contacts');
export const createContact = (data) => api.post('/tenant/contacts', data);
export const updateContact = (id, data) => api.put(`/tenant/contacts/${id}`, data);
export const deleteContact = (id) => api.delete(`/tenant/contacts/${id}`);