import api from '../axios';

export const activateAccount = (token, password) => api.post('/public/activation', { token, password });