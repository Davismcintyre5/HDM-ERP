import api from '../axios';

export const getBilling = () => api.get('/tenant/billing');
export const upgradePlan = (data) => api.post('/tenant/billing/upgrade', data);