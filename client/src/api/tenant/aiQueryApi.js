import api from '../axios';

export const queryAI = (question) => api.post('/tenant/ai/query', { question });