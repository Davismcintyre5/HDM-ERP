import api from '../axios';

export const getCompany = () => api.get('/tenant/company');
export const getModules = () => api.get('/tenant/company/modules');