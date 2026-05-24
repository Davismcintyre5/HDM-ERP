import { useState, useEffect } from 'react';
import { getAccounts, createAccount, updateAccount, deleteAccount } from '../../api/tenant/financeApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Edit3, Trash2 } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';

const types = ['asset', 'liability', 'equity', 'income', 'expense', 'cost_of_sales'];
const typeColors = { asset: 'info', liability: 'warning', equity: 'success', income: 'success', expense: 'danger', cost_of_sales: 'danger' };

const AccountsTab = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', type: 'asset', description: '', openingBalance: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { getAccounts().then(res => setAccounts(res.data.data || [])).finally(() => setLoading(false)); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name || !form.code) return;
    setSaving(true);
    try {
      if (editId) await updateAccount(editId, form);
      else await createAccount(form);
      setShowForm(false); setEditId(null); setForm({ code: '', name: '', type: 'asset', description: '', openingBalance: 0 });
      getAccounts().then(res => setAccounts(res.data.data || []));
      setMessage({ type: 'success', text: 'Account saved.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => { try { await deleteAccount(deleteId); setDeleteId(null); getAccounts().then(res => setAccounts(res.data.data || [])); } catch {} };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{accounts.length} accounts</p>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ code: '', name: '', type: 'asset', description: '', openingBalance: 0 }); setShowForm(true); }}><Plus size={14} className="mr-1" /> Add Account</Button>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Code</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Name</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Balance</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
          <tbody>
            {accounts.map(a => (
              <tr key={a._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-mono text-xs text-gray-500">{a.code}</td>
                <td className="py-2 font-medium text-gray-900 dark:text-white">{a.name}</td>
                <td className="py-2"><Badge variant={typeColors[a.type] || 'default'}>{a.type}</Badge></td>
                <td className="py-2 text-right text-primary-500 font-medium">{formatCurrency(a.currentBalance || 0)}</td>
                <td className="py-2 text-right">
                  <Button size="sm" variant="ghost" onClick={() => { setEditId(a._id); setForm(a); setShowForm(true); }}><Edit3 size={12} /></Button>
                  <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(a._id)}><Trash2 size={12} /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Account' : 'Add Account'}>
        <form onSubmit={handleSave} className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Code *</label><Input value={form.code} onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))} required /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Name *</label><Input value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required /></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Type</label><Select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}>{types.map(t => <option key={t} value={t}>{t}</option>)}</Select></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Description</label><Input value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Opening Balance</label><Input type="number" step="0.01" value={form.openingBalance} onChange={e => setForm(prev => ({ ...prev, openingBalance: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">Save</Button></div>
        </form>
      </Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Account" message="Are you sure?" />
    </div>
  );
};

export default AccountsTab;