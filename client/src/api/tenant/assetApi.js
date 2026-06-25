import api from '../axios';

// Assets
export const getAssets = (params) => api.get('/tenant/assets', { params });
export const getAsset = (id) => api.get(`/tenant/assets/${id}`);
export const createAsset = (data) => api.post('/tenant/assets', data);
export const updateAsset = (id, data) => api.put(`/tenant/assets/${id}`, data);
export const deleteAsset = (id) => api.delete(`/tenant/assets/${id}`);
export const depreciateAsset = (id) => api.post(`/tenant/assets/${id}/depreciate`);

// Maintenance
export const getMaintenances = (assetId) => api.get(`/tenant/assets/${assetId}/maintenance`);
export const createMaintenance = (assetId, data) => api.post(`/tenant/assets/${assetId}/maintenance`, data);
export const updateMaintenance = (maintId, data) => api.put(`/tenant/assets/maintenance/${maintId}`, data);
export const deleteMaintenance = (maintId) => api.delete(`/tenant/assets/maintenance/${maintId}`);

// Stats
export const getAssetStats = () => api.get('/tenant/assets/stats');