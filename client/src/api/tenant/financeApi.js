import api from '../axios';

// Accounts
export const getAccounts = () => api.get('/tenant/finance/accounts');
export const createAccount = (data) => api.post('/tenant/finance/accounts', data);
export const updateAccount = (id, data) => api.put(`/tenant/finance/accounts/${id}`, data);
export const deleteAccount = (id) => api.delete(`/tenant/finance/accounts/${id}`);

// Journal
export const getJournals = () => api.get('/tenant/finance/journal');
export const createJournal = (data) => api.post('/tenant/finance/journal', data);
export const updateJournal = (id, data) => api.put(`/tenant/finance/journal/${id}`, data);
export const deleteJournal = (id) => api.delete(`/tenant/finance/journal/${id}`);

// Invoices
export const getInvoices = () => api.get('/tenant/finance/invoices');
export const createInvoice = (data) => api.post('/tenant/finance/invoices', data);
export const updateInvoice = (id, data) => api.put(`/tenant/finance/invoices/${id}`, data);
export const deleteInvoice = (id) => api.delete(`/tenant/finance/invoices/${id}`);
export const updateInvoiceStatus = (id, status) => api.put(`/tenant/finance/invoices/${id}/status`, { status });

// Bills
export const getBills = () => api.get('/tenant/finance/bills');
export const createBill = (data) => api.post('/tenant/finance/bills', data);
export const updateBill = (id, data) => api.put(`/tenant/finance/bills/${id}`, data);
export const deleteBill = (id) => api.delete(`/tenant/finance/bills/${id}`);
export const updateBillStatus = (id, status) => api.put(`/tenant/finance/bills/${id}/status`, { status });

// Revenue & Expenses
export const recordRevenue = (data) => api.post('/tenant/finance/revenue', data);
export const recordExpense = (data) => api.post('/tenant/finance/expenses', data);
export const getRevenueExpenses = () => api.get('/tenant/finance/revenue-expenses');

// Reports
export const getProfitLoss = () => api.get('/tenant/finance/reports/profit-loss');
export const getBalanceSheet = () => api.get('/tenant/finance/reports/balance-sheet');
export const getTrialBalance = () => api.get('/tenant/finance/reports/trial-balance');