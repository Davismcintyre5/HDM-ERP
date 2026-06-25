import { useState, useEffect } from 'react';
import { recordRevenue, recordExpense, getRevenueExpenses } from '../../api/tenant/financeApi';
import { getAccounts } from '../../api/tenant/financeApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import { Printer, Eye } from 'lucide-react';
import { printTable } from '../../utils/printUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const RevenueExpensesTab = () => {
  const [accounts, setAccounts] = useState([]);
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('revenue');
  const [showHistory, setShowHistory] = useState(false);
  const [form, setForm] = useState({ account: '', payerPayee: '', amount: 0, paymentMethod: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = () => {
    Promise.all([getAccounts(), getRevenueExpenses()]).then(([aRes, rRes]) => {
      setAccounts(aRes.data.data || []);
      setRecords(rRes.data.data || []);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.account || !form.amount) return;
    setSaving(true);
    try {
      if (type === 'revenue') await recordRevenue(form);
      else await recordExpense(form);
      setMessage({ type: 'success', text: `${type === 'revenue' ? 'Revenue' : 'Expense'} recorded.` });
      setForm({ account: '', payerPayee: '', amount: 0, paymentMethod: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });
      fetchData();
    } catch (err) { setMessage({ type: 'error', text: 'Failed.' }); }
    finally { setSaving(false); }
  };

  const handlePrint = () => {
    printTable(records.map(r => ({
      date: formatDate(r.date),
      type: r.type,
      account: r.account?.name || r.account || '',
      payerPayee: r.payerPayee || '—',
      amount: formatCurrency(r.amount),
      method: r.paymentMethod || '—',
    })), [
      { key: 'date', label: 'Date' },
      { key: 'type', label: 'Type' },
      { key: 'account', label: 'Account' },
      { key: 'payerPayee', label: 'Payer/Payee' },
      { key: 'amount', label: 'Amount' },
      { key: 'method', label: 'Method' },
    ], { title: 'Revenue & Expenses' });
  };

  if (loading) return <Spinner />;

  const filteredAccounts = accounts.filter(a => type === 'revenue' ? a.type === 'income' : a.type === 'expense');

  return (
    <div className="max-w-2xl">
      <div className="flex gap-2 mb-4">
        <Button size="sm" variant={type === 'revenue' ? 'primary' : 'ghost'} onClick={() => setType('revenue')}>Revenue</Button>
        <Button size="sm" variant={type === 'expense' ? 'danger' : 'ghost'} onClick={() => setType('expense')}>Expense</Button>
        <div className="flex-1" />
        <Button size="sm" variant="outline" onClick={() => setShowHistory(true)}><Eye size={14} className="mr-1" /> History</Button>
        <Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button>
      </div>

      <Card className="p-6">
        {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Account *</label><SearchableSelect options={filteredAccounts.map(a => ({ value: a._id, label: `${a.code} - ${a.name}` }))} value={form.account} onChange={val => setForm(prev => ({ ...prev, account: val }))} placeholder="Select account" /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">{type === 'revenue' ? 'Payer' : 'Payee'}</label><Input value={form.payerPayee} onChange={e => setForm(prev => ({ ...prev, payerPayee: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Amount *</label><Input type="number" step="0.01" value={form.amount} onChange={e => setForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))} /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Payment Method</label><Select value={form.paymentMethod} onChange={e => setForm(prev => ({ ...prev, paymentMethod: e.target.value }))}><option value="cash">Cash</option><option value="bank">Bank</option><option value="mpesa">M-Pesa</option></Select></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Date</label><Input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Notes</label><Input value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} /></div>
          <Button type="submit" disabled={saving} className="w-full">{saving ? 'Recording...' : `Record ${type === 'revenue' ? 'Revenue' : 'Expense'}`}</Button>
        </form>
      </Card>

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowHistory(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Revenue & Expense History</h3>
              <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">✕</button>
            </div>
            {records.length === 0 ? (
              <p className="text-center text-gray-400 py-8">No records yet</p>
            ) : (
              <table className="w-full text-sm">
                <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Account</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Payer/Payee</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Amount</th></tr></thead>
                <tbody>{records.map(r => (
                  <tr key={r._id} className="border-b border-gray-100 dark:border-gray-700/50">
                    <td className="py-2 text-xs text-gray-500">{formatDate(r.date)}</td>
                    <td className="py-2"><Badge variant={r.type === 'revenue' ? 'success' : 'danger'}>{r.type}</Badge></td>
                    <td className="py-2 text-gray-900 dark:text-white">{r.account?.name || r.account || ''}</td>
                    <td className="py-2 text-gray-600 dark:text-gray-400">{r.payerPayee || '—'}</td>
                    <td className="py-2 text-right font-medium text-gray-900 dark:text-white">{formatCurrency(r.amount)}</td>
                  </tr>
                ))}</tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RevenueExpensesTab;