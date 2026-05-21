import api from '../axios';

export const register = (data) => api.post('/public/register', data);