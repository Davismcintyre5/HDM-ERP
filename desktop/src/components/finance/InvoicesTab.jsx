import { useState, useEffect } from 'react';
import { getInvoices, createInvoice, updateInvoiceStatus } from '../../api/tenant/financeApi';
import { getContacts } from '../../api/tenant/contactsApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { Plus, ArrowRight } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const statusFlow = ['draft', 'sent', 'paid'];
const statusColors = { draft: 'default', sent: 'info', paid: 'success', cancelled: 'danger' };

const InvoicesTab = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ customer: '', customerName: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', items: [], notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getInvoices().then(res => setInvoices(res.data.data || [])).finally(() => setLoading(false));
    getContacts().then(res => setCustomers((res.data.data || []).filter(c => c.type === 'customer')));
  }, []);

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }] }));
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: isNaN(value) ? value : Number(value) };
    setForm(prev => ({ ...prev, items }));
  };
  const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const subtotal = form.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const taxTotal = form.items.reduce((s, i) => s + (i.quantity * i.unitPrice * (i.taxRate || 0) / 100), 0);
  const grandTotal = subtotal + taxTotal;

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.items.length) return;
    setSaving(true);
    try {
      await createInvoice({ ...form, customer: form.customer || undefined, customerName: form.customerName || undefined });
      setShowForm(false);
      setForm({ customer: '', customerName: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', items: [], notes: '' });
      getInvoices().then(res => setInvoices(res.data.data || []));
      setMessage({ type: 'success', text: 'Invoice created.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setSaving(false); }
  };

  const advanceStatus = async (id, current) => {
    const idx = statusFlow.indexOf(current);
    if (idx < statusFlow.length - 1) {
      try { await updateInvoiceStatus(id, statusFlow[idx + 1]); getInvoices().then(res => setInvoices(res.data.data || [])); }
      catch { setMessage({ type: 'error', text: 'Failed.' }); }
    }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{invoices.length} invoices</p>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> New Invoice</Button>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Invoice #</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Customer</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{inv.invoiceNumber}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{inv.customer?.companyName || inv.customerName || 'N/A'}</td>
                <td className="py-2 text-gray-500">{formatDate(inv.invoiceDate)}</td>
                <td className="py-2 text-right text-primary-500 font-medium">{formatCurrency(inv.grandTotal)}</td>
                <td className="py-2"><Badge variant={statusColors[inv.status] || 'default'}>{inv.status}</Badge></td>
                <td className="py-2 text-right">
                  {inv.status !== 'paid' && inv.status !== 'cancelled' && (
                    <Button size="sm" variant="ghost" onClick={() => advanceStatus(inv._id, inv.status)}>
                      <ArrowRight size={14} className="mr-1" /> {statusFlow[statusFlow.indexOf(inv.status) + 1]}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Invoice">
        <form onSubmit={handleCreate} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Customer</label><SearchableSelect options={customers.map(c => ({ value: c._id, label: c.companyName }))} value={form.customer} onChange={val => setForm(prev => ({ ...prev, customer: val, customerName: '' }))} placeholder="Search or type new..." creatable /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Invoice Date</label><Input type="date" value={form.invoiceDate} onChange={e => setForm(prev => ({ ...prev, invoiceDate: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Due Date</label><Input type="date" value={form.dueDate} onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))} /></div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Items</label>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-1 items-end">
                  <div className="flex-1 min-w-[120px]"><label className="block text-[10px] text-gray-400 mb-0.5">Description</label><Input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} /></div>
                  <div className="w-14"><label className="block text-[10px] text-gray-400 mb-0.5">Qty</label><Input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} /></div>
                  <div className="w-20"><label className="block text-[10px] text-gray-400 mb-0.5">Price</label><Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} /></div>
                  <div className="w-14"><label className="block text-[10px] text-gray-400 mb-0.5">Tax%</label><Input type="number" step="0.01" value={item.taxRate} onChange={e => updateItem(idx, 'taxRate', e.target.value)} /></div>
                  <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs p-1 mb-1">✕</button>
                </div>
              ))}
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={addItem} className="mt-2">+ Add Item</Button>
          </div>
          <div className="text-right text-sm space-y-0.5">
            <p>Subtotal: {formatCurrency(subtotal)}</p><p>Tax: {formatCurrency(taxTotal)}</p><p className="text-base font-bold text-primary-500">Total: {formatCurrency(grandTotal)}</p>
          </div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Notes</label><Input value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} /></div>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">Create</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default InvoicesTab;