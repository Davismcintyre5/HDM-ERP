import { useState, useEffect } from 'react';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, updateInvoiceStatus } from '../../api/tenant/financeApi';
import { getContacts } from '../../api/tenant/contactsApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Printer, Send, Edit3, Trash2, Eye, ArrowRight } from 'lucide-react';
import { printContent } from '../../utils/printUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const statusFlow = ['draft', 'sent', 'paid'];
const statusColors = { draft: 'default', sent: 'info', paid: 'success', cancelled: 'danger' };

const InvoicesTab = () => {
  const [invoices, setInvoices] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [message, setMessage] = useState(null);
  const [form, setForm] = useState({ customer: '', customerName: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', items: [], notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchInvoices = async () => {
    setRefreshing(true);
    try {
      const res = await getInvoices();
      setInvoices(res.data.data || []);
    } catch (err) {
      setMessage({ type: 'error', text: 'Failed to load invoices' });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    Promise.all([getInvoices(), getContacts()]).then(([invRes, conRes]) => {
      setInvoices(invRes.data.data || []);
      setCustomers((conRes.data.data || []).filter(c => c.type === 'customer'));
    }).catch(() => {
      setMessage({ type: 'error', text: 'Failed to load data' });
    }).finally(() => setLoading(false));
  }, []);

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, unitPrice: 0, taxRate: 0 }] }));
  const updateItem = (idx, field, value) => { const items = [...form.items]; items[idx] = { ...items[idx], [field]: isNaN(value) ? value : Number(value) }; setForm(prev => ({ ...prev, items })); };
  const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const subtotal = form.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);
  const taxTotal = form.items.reduce((s, i) => s + (i.quantity * i.unitPrice * (i.taxRate || 0) / 100), 0);
  const grandTotal = subtotal + taxTotal;

  const openEdit = (inv) => { 
    setEditId(inv._id); 
    setForm({
      customer: inv.customer?._id || inv.customer || '',
      customerName: inv.customerName || '',
      invoiceDate: inv.invoiceDate ? new Date(inv.invoiceDate).toISOString().split('T')[0] : '',
      dueDate: inv.dueDate ? new Date(inv.dueDate).toISOString().split('T')[0] : '',
      items: inv.items || [],
      notes: inv.notes || ''
    }); 
    setShowForm(true); 
  };
  
  const openNew = () => { 
    setEditId(null); 
    setForm({ customer: '', customerName: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', items: [], notes: '' }); 
    setShowForm(true); 
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.items.length) {
      setMessage({ type: 'error', text: 'Add at least one item' });
      return;
    }
    setSaving(true);
    setMessage(null);
    try {
      if (editId) {
        await updateInvoice(editId, form);
        setMessage({ type: 'success', text: 'Invoice updated successfully' });
      } else {
        await createInvoice({ ...form, customer: form.customer || undefined, customerName: form.customerName || undefined });
        setMessage({ type: 'success', text: 'Invoice created successfully' });
      }
      setShowForm(false);
      setEditId(null);
      setForm({ customer: '', customerName: '', invoiceDate: new Date().toISOString().split('T')[0], dueDate: '', items: [], notes: '' });
      await fetchInvoices();
    } catch (err) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save invoice' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteInvoice(deleteId);
      setDeleteId(null);
      setMessage({ type: 'success', text: 'Invoice deleted' });
      await fetchInvoices();
    } catch (err) {
      setDeleteId(null);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete invoice' });
    }
  };

  const advanceStatus = async (id, current) => {
    const idx = statusFlow.indexOf(current);
    if (idx < statusFlow.length - 1) {
      try {
        const newStatus = statusFlow[idx + 1];
        await updateInvoiceStatus(id, newStatus);
        setMessage({ type: 'success', text: `Invoice marked as ${newStatus}` });
        await fetchInvoices();
      } catch (err) {
        setMessage({ type: 'error', text: err.response?.data?.message || 'Status update failed' });
      }
    }
  };

  const handlePrint = (inv) => {
    const itemsRows = inv.items.map((item, i) => `<tr><td style="border:1px solid #ddd;padding:5px;">${i + 1}</td><td style="border:1px solid #ddd;padding:5px;">${item.description}</td><td style="border:1px solid #ddd;padding:5px;">${item.quantity}</td><td style="border:1px solid #ddd;padding:5px;">${formatCurrency(item.unitPrice)}</td><td style="border:1px solid #ddd;padding:5px;">${formatCurrency(item.quantity * item.unitPrice)}</td></tr>`).join('');
    const html = `<h2 style="text-align:center;color:#10B981;">INVOICE</h2>
      <p style="text-align:center;font-size:11px;">${inv.invoiceNumber} | ${formatDate(inv.invoiceDate)}</p>
      <p><strong>Customer:</strong> ${inv.customer?.companyName || inv.customerName || 'N/A'}</p>
      <p><strong>Due Date:</strong> ${formatDate(inv.dueDate)}</p>
      <table style="width:100%;border-collapse:collapse;margin:10px 0;"><thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:5px;">#</th><th style="border:1px solid #ddd;padding:5px;">Item</th><th style="border:1px solid #ddd;padding:5px;">Qty</th><th style="border:1px solid #ddd;padding:5px;">Price</th><th style="border:1px solid #ddd;padding:5px;">Total</th></tr></thead><tbody>${itemsRows}</tbody></table>
      <p style="text-align:right;font-size:14px;font-weight:bold;">Total: ${formatCurrency(inv.grandTotal)}</p>
      ${inv.notes ? `<p><strong>Notes:</strong> ${inv.notes}</p>` : ''}`;
    printContent(html, { title: `Invoice ${inv.invoiceNumber}` });
  };

  if (loading) return <Spinner />;

  const viewedInvoice = invoices.find(i => i._id === viewId);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">{invoices.length} invoices</p>
          {refreshing && <Spinner />}
        </div>
        <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> New Invoice</Button>
      </div>
      
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage(null)} />}
      
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Invoice #</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Customer</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
          <tbody>
            {invoices.map(inv => (
              <tr key={inv._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{inv.invoiceNumber}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{inv.customer?.companyName || inv.customerName || 'N/A'}</td>
                <td className="py-2 text-gray-500 dark:text-gray-400">{formatDate(inv.invoiceDate)}</td>
                <td className="py-2 text-right text-primary-500 font-medium">{formatCurrency(inv.grandTotal)}</td>
                <td className="py-2"><Badge variant={statusColors[inv.status] || 'default'}>{inv.status}</Badge></td>
                <td className="py-2 text-right">
                  <div className="flex justify-end gap-0.5">
                    <Button size="sm" variant="ghost" onClick={() => handlePrint(inv)} title="Print"><Printer size={12} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setViewId(inv._id)} title="View"><Eye size={12} /></Button>
                    {inv.status === 'draft' && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(inv)} title="Edit"><Edit3 size={12} /></Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(inv._id)} title="Delete"><Trash2 size={12} /></Button>
                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => advanceStatus(inv._id, inv.status)} title="Send"><Send size={12} /></Button>
                      </>
                    )}
                    {inv.status === 'sent' && (
                      <>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(inv._id)} title="Delete"><Trash2 size={12} /></Button>
                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => advanceStatus(inv._id, inv.status)} title="Mark Paid"><ArrowRight size={12} /></Button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* View Modal */}
      <Modal open={!!viewId} onClose={() => setViewId(null)} title={`Invoice ${viewedInvoice?.invoiceNumber || ''}`}>
        {viewedInvoice && (
          <div className="space-y-2 text-sm">
            <p><strong>Customer:</strong> {viewedInvoice.customer?.companyName || viewedInvoice.customerName || 'N/A'}</p>
            <p><strong>Date:</strong> {formatDate(viewedInvoice.invoiceDate)} | <strong>Due:</strong> {formatDate(viewedInvoice.dueDate)}</p>
            <p><strong>Status:</strong> <Badge variant={statusColors[viewedInvoice.status]}>{viewedInvoice.status}</Badge></p>
            <table className="w-full text-xs mt-2 border-collapse"><thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-1 border">#</th><th className="p-1 border">Item</th><th className="p-1 border">Qty</th><th className="p-1 border">Price</th><th className="p-1 border">Total</th></tr></thead>
              <tbody>{viewedInvoice.items.map((item, i) => <tr key={i}><td className="p-1 border">{i + 1}</td><td className="p-1 border">{item.description}</td><td className="p-1 border">{item.quantity}</td><td className="p-1 border">{formatCurrency(item.unitPrice)}</td><td className="p-1 border">{formatCurrency(item.quantity * item.unitPrice)}</td></tr>)}</tbody></table>
            <p className="text-right font-bold text-primary-500">{formatCurrency(viewedInvoice.grandTotal)}</p>
            {viewedInvoice.notes && <p><strong>Notes:</strong> {viewedInvoice.notes}</p>}
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Invoice' : 'New Invoice'}>
        <form onSubmit={handleSave} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Customer</label><SearchableSelect options={customers.map(c => ({ value: c._id, label: c.companyName }))} value={form.customer} onChange={val => setForm(prev => ({ ...prev, customer: val, customerName: '' }))} placeholder="Search or type new..." creatable /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Invoice Date</label><Input type="date" value={form.invoiceDate} onChange={e => setForm(prev => ({ ...prev, invoiceDate: e.target.value }))} /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Due Date</label><Input type="date" value={form.dueDate} onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))} /></div></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Items</label><div className="space-y-2">{form.items.map((item, idx) => (<div key={idx} className="flex gap-1 items-end"><div className="flex-1 min-w-[120px]"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Description</label><Input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} /></div><div className="w-14"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Qty</label><Input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} /></div><div className="w-20"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Price</label><Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} /></div><div className="w-14"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Tax%</label><Input type="number" step="0.01" value={item.taxRate} onChange={e => updateItem(idx, 'taxRate', e.target.value)} /></div><button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs p-1 mb-1">✕</button></div>))}</div><Button type="button" size="sm" variant="ghost" onClick={addItem} className="mt-2">+ Add Item</Button></div>
          <div className="text-right text-sm space-y-0.5"><p>Subtotal: {formatCurrency(subtotal)}</p><p>Tax: {formatCurrency(taxTotal)}</p><p className="text-base font-bold text-primary-500">Total: {formatCurrency(grandTotal)}</p></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Notes</label><Input value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} /></div>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : editId ? 'Update' : 'Create'}</Button></div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Invoice" message="Are you sure? This cannot be undone." />
    </div>
  );
};

export default InvoicesTab;