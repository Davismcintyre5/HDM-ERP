import api from '../axios';

export const getCompany = () => api.get('/tenant/company');
export const updateCompany = (data) => api.put('/tenant/company', data);
export const getModules = () => api.get('/tenant/company/modules');
export const toggleModules = (modules) => api.put('/tenant/company/modules/toggle', { modules });