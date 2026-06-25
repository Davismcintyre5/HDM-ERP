import { useState, useEffect } from 'react';
import { getJournals, createJournal, updateJournal, deleteJournal } from '../../api/tenant/financeApi';
import { getAccounts } from '../../api/tenant/financeApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Printer, Edit3, Trash2, Eye } from 'lucide-react';
import { printContent } from '../../utils/printUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const JournalTab = () => {
  const [entries, setEntries] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], description: '', reference: '', lines: [{ account: '', description: '', debit: 0, credit: 0 }] });
  const [saving, setSaving] = useState(false);

  const fetchEntries = () => getJournals().then(res => setEntries(res.data.data || []));

  useEffect(() => {
    Promise.all([getJournals(), getAccounts()]).then(([jRes, aRes]) => {
      setEntries(jRes.data.data || []);
      setAccounts(aRes.data.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const addLine = () => setForm(prev => ({ ...prev, lines: [...prev.lines, { account: '', description: '', debit: 0, credit: 0 }] }));
  const updateLine = (idx, field, value) => { const lines = [...form.lines]; lines[idx] = { ...lines[idx], [field]: isNaN(value) ? value : Number(value) }; setForm(prev => ({ ...prev, lines })); };
  const removeLine = (idx) => setForm(prev => ({ ...prev, lines: prev.lines.filter((_, i) => i !== idx) }));
  const totalDebit = form.lines.reduce((s, l) => s + (l.debit || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + (l.credit || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.001;

  const openEdit = (e) => { setEditId(e._id); setForm(e); setShowForm(true); };
  const openNew = () => { setEditId(null); setForm({ date: new Date().toISOString().split('T')[0], description: '', reference: '', lines: [{ account: '', description: '', debit: 0, credit: 0 }] }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!balanced) return setMessage({ type: 'error', text: 'Debits must equal credits.' });
    setSaving(true);
    try {
      if (editId) await updateJournal(editId, form);
      else await createJournal(form);
      setShowForm(false); setEditId(null);
      setForm({ date: new Date().toISOString().split('T')[0], description: '', reference: '', lines: [{ account: '', description: '', debit: 0, credit: 0 }] });
      fetchEntries();
      setMessage({ type: 'success', text: editId ? 'Entry updated.' : 'Journal entry posted.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => { try { await deleteJournal(deleteId); setDeleteId(null); fetchEntries(); } catch {} };

  const handlePrint = (entry) => {
    const linesRows = entry.lines.map((l, i) => {
      const acct = accounts.find(a => a._id === l.account);
      return `<tr><td style="border:1px solid #ddd;padding:5px;">${acct ? acct.code + ' - ' + acct.name : l.account}</td><td style="border:1px solid #ddd;padding:5px;">${l.description || ''}</td><td style="border:1px solid #ddd;padding:5px;text-align:right;">${l.debit > 0 ? formatCurrency(l.debit) : ''}</td><td style="border:1px solid #ddd;padding:5px;text-align:right;">${l.credit > 0 ? formatCurrency(l.credit) : ''}</td></tr>`;
    }).join('');
    const html = `<h2 style="text-align:center;color:#10B981;">JOURNAL ENTRY</h2>
      <p style="text-align:center;font-size:11px;">${formatDate(entry.date)}${entry.reference ? ' | Ref: ' + entry.reference : ''}</p>
      <p><strong>Description:</strong> ${entry.description || '—'}</p>
      <table style="width:100%;border-collapse:collapse;margin:10px 0;"><thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:5px;">Account</th><th style="border:1px solid #ddd;padding:5px;">Description</th><th style="border:1px solid #ddd;padding:5px;text-align:right;">Debit</th><th style="border:1px solid #ddd;padding:5px;text-align:right;">Credit</th></tr></thead><tbody>${linesRows}</tbody></table>
      <p style="text-align:right;"><strong>Total Debit:</strong> ${formatCurrency(entry.totalDebit)} | <strong>Total Credit:</strong> ${formatCurrency(entry.totalCredit)}</p>`;
    printContent(html, { title: `Journal Entry ${entry.reference || ''}` });
  };

  if (loading) return <Spinner />;

  const viewedEntry = entries.find(e => e._id === viewId);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{entries.length} entries</p>
        <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> New Entry</Button>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Reference</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Description</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Debit</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Credit</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
          <tbody>
            {entries.map(e => (
              <tr key={e._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{formatDate(e.date)}</td>
                <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{e.reference || '—'}</td>
                <td className="py-2 text-gray-900 dark:text-white">{e.description}</td>
                <td className="py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(e.totalDebit)}</td>
                <td className="py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(e.totalCredit)}</td>
                <td className="py-2"><Badge variant="success">{e.status}</Badge></td>
                <td className="py-2 text-right">
                  <div className="flex justify-end gap-0.5">
                    <Button size="sm" variant="ghost" onClick={() => handlePrint(e)} title="Print"><Printer size={12} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setViewId(e._id)} title="View"><Eye size={12} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => openEdit(e)} title="Edit"><Edit3 size={12} /></Button>
                    <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(e._id)} title="Delete"><Trash2 size={12} /></Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Modal open={!!viewId} onClose={() => setViewId(null)} title="Journal Entry">
        {viewedEntry && (
          <div className="space-y-2 text-sm">
            <p><strong>Date:</strong> {formatDate(viewedEntry.date)} | <strong>Ref:</strong> {viewedEntry.reference || '—'}</p>
            <p><strong>Description:</strong> {viewedEntry.description || '—'}</p>
            <p><strong>Status:</strong> <Badge variant="success">{viewedEntry.status}</Badge></p>
            <table className="w-full text-xs mt-2 border-collapse"><thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-1 border">Account</th><th className="p-1 border">Desc</th><th className="p-1 border text-right">Debit</th><th className="p-1 border text-right">Credit</th></tr></thead>
              <tbody>{viewedEntry.lines.map((l, i) => { const acct = accounts.find(a => a._id === l.account); return <tr key={i}><td className="p-1 border">{acct ? acct.code + ' - ' + acct.name : l.account}</td><td className="p-1 border">{l.description || ''}</td><td className="p-1 border text-right">{l.debit > 0 ? formatCurrency(l.debit) : ''}</td><td className="p-1 border text-right">{l.credit > 0 ? formatCurrency(l.credit) : ''}</td></tr>; })}</tbody></table>
            <p className="text-right"><strong>Total Debit:</strong> {formatCurrency(viewedEntry.totalDebit)} | <strong>Total Credit:</strong> {formatCurrency(viewedEntry.totalCredit)}</p>
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Journal Entry' : 'New Journal Entry'}>
        <form onSubmit={handleSave} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Date</label><Input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Reference</label><Input placeholder="Optional" value={form.reference} onChange={e => setForm(prev => ({ ...prev, reference: e.target.value }))} /></div></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Description</label><Input placeholder="Entry description" value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Lines</label><div className="space-y-2">{form.lines.map((line, idx) => (<div key={idx} className="flex gap-1 items-end"><div className="flex-1 min-w-[120px]"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Account</label><SearchableSelect options={accounts.map(a => ({ value: a._id, label: `${a.code} - ${a.name}` }))} value={line.account} onChange={val => updateLine(idx, 'account', val)} placeholder="Account" /></div><div className="w-20"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Debit</label><Input type="number" step="0.01" value={line.debit} onChange={e => updateLine(idx, 'debit', e.target.value)} /></div><div className="w-20"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Credit</label><Input type="number" step="0.01" value={line.credit} onChange={e => updateLine(idx, 'credit', e.target.value)} /></div><button type="button" onClick={() => removeLine(idx)} className="text-red-500 text-xs p-1 mb-1">✕</button></div>))}</div><Button type="button" size="sm" variant="ghost" onClick={addLine} className="mt-2">+ Add Line</Button></div>
          <div className={`text-right text-sm ${balanced ? 'text-emerald-500' : 'text-red-500'}`}>Debit: {formatCurrency(totalDebit)} | Credit: {formatCurrency(totalCredit)} | {balanced ? '✓ Balanced' : '⚠ Unbalanced'}</div>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving || !balanced} className="flex-1">{editId ? 'Update' : 'Post Entry'}</Button></div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Journal Entry" message="Are you sure?" />
    </div>
  );
};

export default JournalTab;