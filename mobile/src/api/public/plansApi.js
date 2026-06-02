import api from '../axios';

export const getPlans = () => api.get('/public/plans');