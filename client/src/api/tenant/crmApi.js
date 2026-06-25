import api from '../axios';

// Leads
export const getLeads = (params) => api.get('/tenant/crm/leads', { params });
export const getLead = (id) => api.get(`/tenant/crm/leads/${id}`);
export const createLead = (data) => api.post('/tenant/crm/leads', data);
export const updateLead = (id, data) => api.put(`/tenant/crm/leads/${id}`, data);
export const deleteLead = (id) => api.delete(`/tenant/crm/leads/${id}`);
export const updateLeadStage = (id, stage) => api.put(`/tenant/crm/leads/${id}/stage`, { stage });
export const convertLead = (id) => api.post(`/tenant/crm/leads/${id}/convert`);

// Activities
export const getActivities = (params) => api.get('/tenant/crm/activities', { params });
export const createActivity = (data) => api.post('/tenant/crm/activities', data);
export const updateActivity = (id, data) => api.put(`/tenant/crm/activities/${id}`, data);
export const deleteActivity = (id) => api.delete(`/tenant/crm/activities/${id}`);

// Stats
export const getCRMStats = () => api.get('/tenant/crm/stats');