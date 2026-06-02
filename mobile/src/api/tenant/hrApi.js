import api from '../axios';

export const getEmployees = () => api.get('/tenant/hr/employees');
export const addEmployee = (data) => api.post('/tenant/hr/employees', data);
export const updateEmployee = (id, data) => api.put(`/tenant/hr/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/tenant/hr/employees/${id}`);

export const getAttendance = () => api.get('/tenant/hr/attendance');
export const markAttendance = (data) => api.post('/tenant/hr/attendance', data);

export const getLeave = () => api.get('/tenant/hr/leave');
export const requestLeave = (data) => api.post('/tenant/hr/leave', data);
export const updateLeaveStatus = (id, status) => api.put(`/tenant/hr/leave/${id}/status`, { status });

export const getPayrollHistory = () => api.get('/tenant/hr/payroll');
export const runPayroll = (data) => api.post('/tenant/hr/payroll', data);

export const getJobs = () => api.get('/tenant/hr/recruitment');
export const postJob = (data) => api.post('/tenant/hr/recruitment', data);