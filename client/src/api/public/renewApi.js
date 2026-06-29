import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const getRenewInfo = (token) =>
  axios.get(`${API_URL}/public/renew/info`, {
    headers: { Authorization: `Bearer ${token}` }
  });

export const submitRenew = (token, plan, cycle) =>
  axios.post(`${API_URL}/public/renew/pay`, { plan, cycle }, {
    headers: { Authorization: `Bearer ${token}` }
  });