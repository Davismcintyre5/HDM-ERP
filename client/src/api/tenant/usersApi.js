import api from '../axios';

export const getUsers = () => api.get('/tenant/users');
export const inviteUser = (data) => api.post('/tenant/users', data);
export const updateUser = (id, data) => api.put(`/tenant/users/${id}`, data);
export const deleteUser = (id) => api.delete(`/tenant/users/${id}`);