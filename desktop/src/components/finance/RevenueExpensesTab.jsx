import { useState, useEffect } from 'react';
import { recordRevenue, recordExpense } from '../../api/tenant/financeApi';
import { getAccounts } from '../../api/tenant/financeApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';

const RevenueExpensesTab = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('revenue');
  const [form, setForm] = useState({ account: '', payerPayee: '', amount: 0, paymentMethod: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { getAccounts().then(res => setAccounts(res.data.data || [])).finally(() => setLoading(false)); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.account || !form.amount) return;
    setSaving(true);
    try {
      if (type === 'revenue') await recordRevenue(form);
      else await recordExpense(form);
      setMessage({ type: 'success', text: `${type === 'revenue' ? 'Revenue' : 'Expense'} recorded.` });
      setForm({ account: '', payerPayee: '', amount: 0, paymentMethod: 'cash', date: new Date().toISOString().split('T')[0], notes: '' });
    } catch (err) { setMessage({ type: 'error', text: 'Failed.' }); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  const filteredAccounts = accounts.filter(a => type === 'revenue' ? a.type === 'income' : a.type === 'expense');

  return (
    <div className="max-w-lg">
      <Card className="p-6">
        <div className="flex gap-2 mb-4">
          <Button size="sm" variant={type === 'revenue' ? 'primary' : 'ghost'} onClick={() => setType('revenue')}>Revenue</Button>
          <Button size="sm" variant={type === 'expense' ? 'danger' : 'ghost'} onClick={() => setType('expense')}>Expense</Button>
        </div>
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
    </div>
  );
};

export default RevenueExpensesTab;