import { useState, useEffect } from 'react';
import { getBills, createBill, updateBillStatus } from '../../api/tenant/financeApi';
import { getContacts } from '../../api/tenant/contactsApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { Plus, ArrowRight, Printer } from 'lucide-react';
import { printTable } from '../../utils/printUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const BillsTab = () => {
  const [bills, setBills] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ supplier: '', supplierName: '', billDate: new Date().toISOString().split('T')[0], dueDate: '', reference: '', items: [], notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getBills().then(res => setBills(res.data.data || [])).finally(() => setLoading(false));
    getContacts().then(res => setSuppliers((res.data.data || []).filter(c => c.type === 'supplier')));
  }, []);

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }] }));
  const updateItem = (idx, field, value) => { const items = [...form.items]; items[idx] = { ...items[idx], [field]: isNaN(value) ? value : Number(value) }; setForm(prev => ({ ...prev, items })); };
  const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const grandTotal = form.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const handleCreate = async (e) => {
    e.preventDefault(); if (!form.items.length) return;
    setSaving(true);
    try {
      await createBill({ ...form, supplier: form.supplier || undefined, supplierName: form.supplierName || undefined });
      setShowForm(false); setForm({ supplier: '', supplierName: '', billDate: new Date().toISOString().split('T')[0], dueDate: '', reference: '', items: [], notes: '' });
      getBills().then(res => setBills(res.data.data || []));
      setMessage({ type: 'success', text: 'Bill created.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); } finally { setSaving(false); }
  };

  const advanceStatus = async (id, current) => {
    const flow = ['draft', 'open', 'paid'];
    const idx = flow.indexOf(current);
    if (idx < flow.length - 1) { try { await updateBillStatus(id, flow[idx + 1]); getBills().then(res => setBills(res.data.data || [])); } catch {} }
  };

  const handlePrint = () => {
    printTable(bills.map(b => ({
      billNumber: b.billNumber,
      supplier: b.supplier?.companyName || b.supplierName || 'N/A',
      date: formatDate(b.billDate),
      total: formatCurrency(b.grandTotal),
      status: b.status,
    })), [
      { key: 'billNumber', label: 'Bill #' },
      { key: 'supplier', label: 'Supplier' },
      { key: 'date', label: 'Date' },
      { key: 'total', label: 'Total' },
      { key: 'status', label: 'Status' },
    ], { title: 'Bills' });
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{bills.length} bills</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> New Bill</Button>
        </div>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Bill #</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Supplier</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
          <tbody>{bills.map(b => (
            <tr key={b._id} className="border-b border-gray-100 dark:border-gray-700/50">
              <td className="py-2 font-medium text-gray-900 dark:text-white">{b.billNumber}</td>
              <td className="py-2 text-gray-600 dark:text-gray-400">{b.supplier?.companyName || b.supplierName || 'N/A'}</td>
              <td className="py-2 text-gray-500 dark:text-gray-400">{formatDate(b.billDate)}</td>
              <td className="py-2 text-right text-primary-500 dark:text-primary-400 font-medium">{formatCurrency(b.grandTotal)}</td>
              <td className="py-2"><Badge variant={b.status === 'paid' ? 'success' : b.status === 'open' ? 'warning' : 'default'}>{b.status}</Badge></td>
              <td className="py-2 text-right">{b.status !== 'paid' && b.status !== 'void' && <Button size="sm" variant="ghost" onClick={() => advanceStatus(b._id, b.status)}><ArrowRight size={14} className="mr-1" /> {b.status === 'draft' ? 'Open' : 'Pay'}</Button>}</td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Bill">
        <form onSubmit={handleCreate} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Supplier</label><SearchableSelect options={suppliers.map(s => ({ value: s._id, label: s.companyName }))} value={form.supplier} onChange={val => setForm(prev => ({ ...prev, supplier: val }))} placeholder="Select supplier" creatable /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Bill Date</label><Input type="date" value={form.billDate} onChange={e => setForm(prev => ({ ...prev, billDate: e.target.value }))} /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Due Date</label><Input type="date" value={form.dueDate} onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))} /></div></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Reference</label><Input value={form.reference} onChange={e => setForm(prev => ({ ...prev, reference: e.target.value }))} /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Items</label><div className="space-y-2">{form.items.map((item, idx) => (<div key={idx} className="flex gap-1 items-end"><div className="flex-1"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Description</label><Input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} /></div><div className="w-14"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Qty</label><Input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} /></div><div className="w-20"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Price</label><Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} /></div><button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs p-1 mb-1">✕</button></div>))}</div><Button type="button" size="sm" variant="ghost" onClick={addItem} className="mt-2">+ Add Item</Button></div>
          <p className="text-right font-bold text-primary-500">Total: {formatCurrency(grandTotal)}</p>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">Create</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default BillsTab;