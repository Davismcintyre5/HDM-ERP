import api from '../axios';

export const getAccounts = () => api.get('/tenant/finance/accounts');
export const createAccount = (data) => api.post('/tenant/finance/accounts', data);
export const updateAccount = (id, data) => api.put(`/tenant/finance/accounts/${id}`, data);
export const deleteAccount = (id) => api.delete(`/tenant/finance/accounts/${id}`);

export const getJournals = () => api.get('/tenant/finance/journal');
export const createJournal = (data) => api.post('/tenant/finance/journal', data);

export const getInvoices = () => api.get('/tenant/finance/invoices');
export const createInvoice = (data) => api.post('/tenant/finance/invoices', data);
export const updateInvoiceStatus = (id, status) => api.put(`/tenant/finance/invoices/${id}/status`, { status });

export const getBills = () => api.get('/tenant/finance/bills');
export const createBill = (data) => api.post('/tenant/finance/bills', data);
export const updateBillStatus = (id, status) => api.put(`/tenant/finance/bills/${id}/status`, { status });

export const recordRevenue = (data) => api.post('/tenant/finance/revenue', data);
export const recordExpense = (data) => api.post('/tenant/finance/expenses', data);
export const reconcile = (data) => api.post('/tenant/finance/reconciliation', data);
export const getProfitLoss = () => api.get('/tenant/finance/reports/profit-loss');