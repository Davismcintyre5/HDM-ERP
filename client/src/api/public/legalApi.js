import api from '../axios';

export const getLegalDocument = (type) => api.get(`/public/legal/${type}`);