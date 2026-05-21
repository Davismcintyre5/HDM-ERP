import api from '../axios';

export const getTrustedDevices = () => api.get('/tenant/security/devices');
export const removeTrustedDevice = (id) => api.delete(`/tenant/security/devices/${id}`);
export const changePassword = (data) => api.put('/tenant/security/password', data);