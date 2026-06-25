import api from '../axios';

// Projects
export const getProjects = (params) => api.get('/tenant/projects', { params });
export const getProject = (id) => api.get(`/tenant/projects/${id}`);
export const createProject = (data) => api.post('/tenant/projects', data);
export const updateProject = (id, data) => api.put(`/tenant/projects/${id}`, data);
export const deleteProject = (id) => api.delete(`/tenant/projects/${id}`);

// Tasks
export const getTasks = (projectId) => api.get(`/tenant/projects/${projectId}/tasks`);
export const createTask = (projectId, data) => api.post(`/tenant/projects/${projectId}/tasks`, data);
export const updateTask = (taskId, data) => api.put(`/tenant/projects/tasks/${taskId}`, data);
export const deleteTask = (taskId) => api.delete(`/tenant/projects/tasks/${taskId}`);
export const updateTaskStatus = (taskId, status) => api.put(`/tenant/projects/tasks/${taskId}/status`, { status });
export const reorderTasks = (tasks) => api.put('/tenant/projects/tasks/reorder', { tasks });

// Stats
export const getProjectStats = () => api.get('/tenant/projects/stats');