import api from '../axios';

export const getChatbotConfig = () => api.get('/public/chatbot/config');
export const sendChatbotQuery = (question) => api.post('/public/chatbot', { question });