import api from '../axios';

export const getReports = () => api.get('/tenant/reports');
export const saveReport = (data) => api.post('/tenant/reports', data);
export const runReport = (id) => api.get(`/tenant/reports/engine/${id}`);
export const deleteReport = (id) => api.delete(`/tenant/reports/${id}`);