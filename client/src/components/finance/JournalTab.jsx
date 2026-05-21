import { useState, useEffect } from 'react';
import { getJournals, createJournal } from '../../api/tenant/financeApi';
import { getAccounts } from '../../api/tenant/financeApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { Plus, Printer } from 'lucide-react';
import { printTable } from '../../utils/printUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const JournalTab = () => {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', reference: '', lines: [{ account: '', description: '', debit: 0, credit: 0 }] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getJournals(), getAccounts()]).then(([jRes, aRes]) => {
      setEntries(jRes.data.data || []);
      setAccounts(aRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const addLine = () => setForm(prev => ({ ...prev, lines: [...prev.lines, { account: '', description: '', debit: 0, credit: 0 }] }));
  const updateLine = (idx, field, value) => {
    const lines = [...form.lines];
    lines[idx] = { ...lines[idx], [field]: isNaN(value) ? value : Number(value) };
    setForm(prev => ({ ...prev, lines }));
  };
  const removeLine = (idx) => setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== idx) }));

  const totalDebit = form.lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + (l.credit || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.001;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!balanced) return setMessage({ type: 'error', text: 'Debits must equal credits.' });
    setSaving(true);
    try {
      await createJournal(form);
      setShowForm(false);
      setForm({ date: new Date().toISOString().split('T')[0], description: '', reference: '', lines: [{ account: '', description: '', debit: 0, credit: 0 }] });
      getJournals().then(res => setEntries(res.data.data || []));
      setMessage({ type: 'success', text: 'Journal entry posted.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setSaving(false); }
  };

  const handlePrint = () => {
    printTable(entries.map(e => ({
      date: formatDate(e.date),
      description: e.description,
      debit: formatCurrency(e.totalDebit),
      credit: formatCurrency(e.totalCredit),
    })), [
      { key: 'date', label: 'Date' },
      { key: 'description', label: 'Description' },
      { key: 'debit', label: 'Debit' },
      { key: 'credit', label: 'Credit' },
    ], { title: 'Journal Entries' });
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{entries.length} entries</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> New Entry</Button>
        </div>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Reference</th>
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Description</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Debit</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Credit</th>
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {entries.map(e => (
              <tr key={e._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{formatDate(e.date)}</td>
                <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{e.reference || '—'}</td>
                <td className="py-2 text-gray-900 dark:text-white">{e.description}</td>
                <td className="py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(e.totalDebit)}</td>
                <td className="py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(e.totalCredit)}</td>
                <td className="py-2"><Badge variant="success">{e.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Journal Entry">
        <form onSubmit={handleCreate} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Date</label><Input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Reference</label><Input placeholder="Optional" value={form.reference} onChange={e => setForm(prev => ({ ...prev, reference: e.target.value }))} /></div>
          </div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Description</label><Input placeholder="Entry description" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} /></div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Lines</label>
            <div className="space-y-2">
              {form.lines.map((line, idx) => (
                <div key={idx} className="flex gap-1 items-end">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Account</label>
                    <SearchableSelect options={accounts.map(a => ({ value: a._id, label: `${a.code} - ${a.name}` }))} value={line.account} onChange={val => updateLine(idx, 'account', val)} placeholder="Account" />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Debit</label>
                    <Input type="number" step="0.01" value={line.debit} onChange={e => updateLine(idx, 'debit', e.target.value)} />
                  </div>
                  <div className="w-20">
                    <label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Credit</label>
                    <Input type="number" step="0.01" value={line.credit} onChange={e => updateLine(idx, 'credit', e.target.value)} />
                  </div>
                  <button type="button" onClick={() => removeLine(idx)} className="text-red-500 text-xs p-1 mb-1">✕</button>
                </div>
              ))}
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={addLine} className="mt-2">+ Add Line</Button>
          </div>
          <div className={`text-right text-sm ${balanced ? 'text-emerald-500' : 'text-red-500'}`}>
            Debit: {formatCurrency(totalDebit)} | Credit: {formatCurrency(totalCredit)} | {balanced ? '✓ Balanced' : '⚠ Unbalanced'}
          </div>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving || !balanced} className="flex-1">Post Entry</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default JournalTab;