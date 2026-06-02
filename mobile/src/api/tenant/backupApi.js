import api from '../axios';

export const getBackupSettings = () => api.get('/tenant/backups/settings');
export const updateBackupSettings = (data) => api.put('/tenant/backups/settings', data);
export const getBackupHistory = () => api.get('/tenant/backups/history');