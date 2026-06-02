import api from '../axios';

export const activateAccount = (licenseKey) => api.post('/public/activation', { licenseKey });