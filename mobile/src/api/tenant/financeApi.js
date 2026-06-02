import api from '../axios';

export const getAccounts = () => api.get('/tenant/finance/accounts');
export const getInvoices = () => api.get('/tenant/finance/invoices');
export const createInvoice = (data) => api.post('/tenant/finance/invoices', data);
export const updateInvoiceStatus = (id, status) => api.put(`/tenant/finance/invoices/${id}/status`, { status });
export const getBills = () => api.get('/tenant/finance/bills');
export const createBill = (data) => api.post('/tenant/finance/bills', data);
export const updateBillStatus = (id, status) => api.put(`/tenant/finance/bills/${id}/status`, { status });
export const recordRevenue = (data) => api.post('/tenant/finance/revenue', data);
export const recordExpense = (data) => api.post('/tenant/finance/expenses', data);
export const getProfitLoss = () => api.get('/tenant/finance/reports/profit-loss');
export const getBalanceSheet = () => api.get('/tenant/finance/reports/balance-sheet');