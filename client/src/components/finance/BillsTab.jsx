import { useState, useEffect } from 'react';
import { getBills, createBill, updateBill, deleteBill, updateBillStatus } from '../../api/tenant/financeApi';
import { getContacts } from '../../api/tenant/contactsApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Printer, Edit3, Trash2, Eye, ArrowRight } from 'lucide-react';
import { printContent } from '../../utils/printUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const statusFlow = ['draft', 'open', 'paid'];
const statusColors = { draft: 'default', open: 'warning', paid: 'success', void: 'danger' };

const BillsTab = () => {
  const [bills, setBills] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewId, setViewId] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ supplier: '', supplierName: '', billDate: new Date().toISOString().split('T')[0], dueDate: '', reference: '', items: [], notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchBills = () => getBills().then(res => setBills(res.data.data || []));

  useEffect(() => {
    Promise.all([getBills(), getContacts()]).then(([bRes, cRes]) => {
      setBills(bRes.data.data || []);
      setSuppliers((cRes.data.data || []).filter(c => c.type === 'supplier'));
    }).finally(() => setLoading(false));
  }, []);

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { description: '', quantity: 1, unitPrice: 0 }] }));
  const updateItem = (idx, field, value) => { const items = [...form.items]; items[idx] = { ...items[idx], [field]: isNaN(value) ? value : Number(value) }; setForm(prev => ({ ...prev, items })); };
  const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const grandTotal = form.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const openEdit = (b) => { setEditId(b._id); setForm({ ...b, supplier: b.supplier?._id || b.supplier || '', supplierName: b.supplierName || '' }); setShowForm(true); };
  const openNew = () => { setEditId(null); setForm({ supplier: '', supplierName: '', billDate: new Date().toISOString().split('T')[0], dueDate: '', reference: '', items: [], notes: '' }); setShowForm(true); };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.items.length) return;
    setSaving(true);
    try {
      if (editId) await updateBill(editId, form);
      else await createBill({ ...form, supplier: form.supplier || undefined, supplierName: form.supplierName || undefined });
      setShowForm(false); setEditId(null);
      setForm({ supplier: '', supplierName: '', billDate: new Date().toISOString().split('T')[0], dueDate: '', reference: '', items: [], notes: '' });
      fetchBills();
      setMessage({ type: 'success', text: editId ? 'Bill updated.' : 'Bill created.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => { try { await deleteBill(deleteId); setDeleteId(null); fetchBills(); } catch {} };

  const advanceStatus = async (id, current) => {
    const idx = statusFlow.indexOf(current);
    if (idx < statusFlow.length - 1) { try { await updateBillStatus(id, statusFlow[idx + 1]); fetchBills(); } catch {} }
  };

  const handlePrint = (b) => {
    const itemsRows = b.items.map((item, i) => `<tr><td style="border:1px solid #ddd;padding:5px;">${i + 1}</td><td style="border:1px solid #ddd;padding:5px;">${item.description}</td><td style="border:1px solid #ddd;padding:5px;">${item.quantity}</td><td style="border:1px solid #ddd;padding:5px;">${formatCurrency(item.unitPrice)}</td><td style="border:1px solid #ddd;padding:5px;">${formatCurrency(item.quantity * item.unitPrice)}</td></tr>`).join('');
    const html = `<h2 style="text-align:center;color:#10B981;">BILL</h2>
      <p style="text-align:center;font-size:11px;">${b.billNumber} | ${formatDate(b.billDate)}</p>
      <p><strong>Supplier:</strong> ${b.supplier?.companyName || b.supplierName || 'N/A'}</p>
      <p><strong>Due Date:</strong> ${formatDate(b.dueDate)}</p>
      ${b.reference ? `<p><strong>Reference:</strong> ${b.reference}</p>` : ''}
      <table style="width:100%;border-collapse:collapse;margin:10px 0;"><thead><tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:5px;">#</th><th style="border:1px solid #ddd;padding:5px;">Item</th><th style="border:1px solid #ddd;padding:5px;">Qty</th><th style="border:1px solid #ddd;padding:5px;">Price</th><th style="border:1px solid #ddd;padding:5px;">Total</th></tr></thead><tbody>${itemsRows}</tbody></table>
      <p style="text-align:right;font-size:14px;font-weight:bold;">Total: ${formatCurrency(b.grandTotal)}</p>
      ${b.notes ? `<p><strong>Notes:</strong> ${b.notes}</p>` : ''}`;
    printContent(html, { title: `Bill ${b.billNumber}` });
  };

  if (loading) return <Spinner />;

  const viewedBill = bills.find(b => b._id === viewId);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{bills.length} bills</p>
        <Button size="sm" onClick={openNew}><Plus size={14} className="mr-1" /> New Bill</Button>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Bill #</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Supplier</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
          <tbody>
            {bills.map(b => (
              <tr key={b._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{b.billNumber}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{b.supplier?.companyName || b.supplierName || 'N/A'}</td>
                <td className="py-2 text-gray-500 dark:text-gray-400">{formatDate(b.billDate)}</td>
                <td className="py-2 text-right text-primary-500 font-medium">{formatCurrency(b.grandTotal)}</td>
                <td className="py-2"><Badge variant={statusColors[b.status] || 'default'}>{b.status}</Badge></td>
                <td className="py-2 text-right">
                  <div className="flex justify-end gap-0.5">
                    <Button size="sm" variant="ghost" onClick={() => handlePrint(b)} title="Print"><Printer size={12} /></Button>
                    <Button size="sm" variant="ghost" onClick={() => setViewId(b._id)} title="View"><Eye size={12} /></Button>
                    {b.status === 'draft' && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => openEdit(b)} title="Edit"><Edit3 size={12} /></Button>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(b._id)} title="Delete"><Trash2 size={12} /></Button>
                        <Button size="sm" variant="ghost" className="text-amber-600" onClick={() => advanceStatus(b._id, b.status)} title="Mark Open"><ArrowRight size={12} /></Button>
                      </>
                    )}
                    {b.status === 'open' && (
                      <>
                        <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(b._id)} title="Delete"><Trash2 size={12} /></Button>
                        <Button size="sm" variant="ghost" className="text-green-600" onClick={() => advanceStatus(b._id, b.status)} title="Mark Paid"><ArrowRight size={12} /></Button>
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
      <Modal open={!!viewId} onClose={() => setViewId(null)} title={`Bill ${viewedBill?.billNumber || ''}`}>
        {viewedBill && (
          <div className="space-y-2 text-sm">
            <p><strong>Supplier:</strong> {viewedBill.supplier?.companyName || viewedBill.supplierName || 'N/A'}</p>
            <p><strong>Date:</strong> {formatDate(viewedBill.billDate)} | <strong>Due:</strong> {formatDate(viewedBill.dueDate)}</p>
            <p><strong>Status:</strong> <Badge variant={statusColors[viewedBill.status]}>{viewedBill.status}</Badge></p>
            {viewedBill.reference && <p><strong>Reference:</strong> {viewedBill.reference}</p>}
            <table className="w-full text-xs mt-2 border-collapse"><thead><tr className="bg-gray-100 dark:bg-gray-700"><th className="p-1 border">#</th><th className="p-1 border">Item</th><th className="p-1 border">Qty</th><th className="p-1 border">Price</th><th className="p-1 border">Total</th></tr></thead>
              <tbody>{viewedBill.items.map((item, i) => <tr key={i}><td className="p-1 border">{i + 1}</td><td className="p-1 border">{item.description}</td><td className="p-1 border">{item.quantity}</td><td className="p-1 border">{formatCurrency(item.unitPrice)}</td><td className="p-1 border">{formatCurrency(item.quantity * item.unitPrice)}</td></tr>)}</tbody></table>
            <p className="text-right font-bold text-primary-500">{formatCurrency(viewedBill.grandTotal)}</p>
            {viewedBill.notes && <p><strong>Notes:</strong> {viewedBill.notes}</p>}
          </div>
        )}
      </Modal>

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Bill' : 'New Bill'}>
        <form onSubmit={handleSave} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Supplier</label><SearchableSelect options={suppliers.map(s => ({ value: s._id, label: s.companyName }))} value={form.supplier} onChange={val => setForm(prev => ({ ...prev, supplier: val }))} placeholder="Select supplier" creatable /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Bill Date</label><Input type="date" value={form.billDate} onChange={e => setForm(prev => ({ ...prev, billDate: e.target.value }))} /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Due Date</label><Input type="date" value={form.dueDate} onChange={e => setForm(prev => ({ ...prev, dueDate: e.target.value }))} /></div></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Reference</label><Input value={form.reference} onChange={e => setForm(prev => ({ ...prev, reference: e.target.value }))} /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Items</label><div className="space-y-2">{form.items.map((item, idx) => (<div key={idx} className="flex gap-1 items-end"><div className="flex-1"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Description</label><Input value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} /></div><div className="w-14"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Qty</label><Input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} /></div><div className="w-20"><label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Price</label><Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} /></div><button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs p-1 mb-1">✕</button></div>))}</div><Button type="button" size="sm" variant="ghost" onClick={addItem} className="mt-2">+ Add Item</Button></div>
          <p className="text-right font-bold text-primary-500">Total: {formatCurrency(grandTotal)}</p>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Notes</label><Input value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} /></div>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">{editId ? 'Update' : 'Create'}</Button></div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Bill" message="Are you sure?" />
    </div>
  );
};

export default BillsTab;