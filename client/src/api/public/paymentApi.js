import api from '../axios';

export const submitPayment = (data) => api.post('/public/payments', data);