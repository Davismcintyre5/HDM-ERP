import api from '../axios';

export const getLandingConfig = () => api.get('/public/landing');