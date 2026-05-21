import api from '../axios';

export const getEmployees = () => api.get('/tenant/hr/employees');
export const addEmployee = (data) => api.post('/tenant/hr/employees', data);
export const updateEmployee = (id, data) => api.put(`/tenant/hr/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/tenant/hr/employees/${id}`);

export const markAttendance = (data) => api.post('/tenant/hr/attendance', data);
export const getAttendance = () => api.get('/tenant/hr/attendance');

export const requestLeave = (data) => api.post('/tenant/hr/leave', data);
export const getLeave = () => api.get('/tenant/hr/leave');
export const updateLeaveStatus = (id, status, rejectionReason) => api.put(`/tenant/hr/leave/${id}/status`, { status, rejectionReason });

export const runPayroll = (data) => api.post('/tenant/hr/payroll', data);
export const getPayrollHistory = () => api.get('/tenant/hr/payroll');

export const postJob = (data) => api.post('/tenant/hr/recruitment', data);
export const getJobs = () => api.get('/tenant/hr/recruitment');

export const submitAppraisal = (data) => api.post('/tenant/hr/appraisals', data);
export const getAppraisals = () => api.get('/tenant/hr/appraisals');