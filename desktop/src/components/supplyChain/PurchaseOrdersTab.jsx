import { useState, useEffect } from 'react';
import { getPurchaseOrders, createPurchaseOrder } from '../../api/tenant/supplyChainApi';
import { getContacts } from '../../api/tenant/contactsApi';
import { getProducts } from '../../api/tenant/productsApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { Plus } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const PurchaseOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [suppliers, setSuppliers] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ supplier: '', orderDate: new Date().toISOString().split('T')[0], expectedDelivery: '', items: [], notes: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getPurchaseOrders().then(res => setOrders(res.data.data || [])).finally(() => setLoading(false));
    getContacts().then(res => setSuppliers((res.data.data || []).filter(c => c.type === 'supplier')));
    getProducts().then(res => setProducts(res.data.data || []));
  }, []);

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { product: '', quantity: 1, unitPrice: 0 }] }));
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    if (field === 'product') { const p = products.find(p => p._id === value); items[idx] = { ...items[idx], product: value, unitPrice: p?.costPrice || 0 }; }
    else items[idx] = { ...items[idx], [field]: isNaN(value) ? value : Number(value) };
    setForm(prev => ({ ...prev, items }));
  };
  const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));
  const subtotal = form.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.supplier || !form.items.length) return setMessage({ type: 'error', text: 'Supplier and items required.' });
    setSaving(true);
    try {
      await createPurchaseOrder(form);
      setShowForm(false);
      setForm({ supplier: '', orderDate: new Date().toISOString().split('T')[0], expectedDelivery: '', items: [], notes: '' });
      getPurchaseOrders().then(res => setOrders(res.data.data || []));
      setMessage({ type: 'success', text: 'PO created.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{orders.length} orders</p>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> New PO</Button>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">PO #</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Supplier</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Total</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{o.orderNumber}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{o.supplier?.companyName || 'N/A'}</td>
                <td className="py-2 text-gray-500">{formatDate(o.orderDate)}</td>
                <td className="py-2 text-right text-primary-500 font-medium">{formatCurrency(o.grandTotal)}</td>
                <td className="py-2"><Badge>{o.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

<Modal open={showForm} onClose={() => setShowForm(false)} title="New Purchase Order">
  <form onSubmit={handleCreate} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Supplier *</label>
      <SearchableSelect options={suppliers.map(s => ({ value: s._id, label: s.companyName }))} value={form.supplier} onChange={val => setForm(prev => ({ ...prev, supplier: val }))} placeholder="Select supplier" />
    </div>
    <div className="grid grid-cols-2 gap-2">
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Order Date</label>
        <Input type="date" value={form.orderDate} onChange={e => setForm(prev => ({ ...prev, orderDate: e.target.value }))} />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Expected Delivery</label>
        <Input type="date" value={form.expectedDelivery} onChange={e => setForm(prev => ({ ...prev, expectedDelivery: e.target.value }))} />
      </div>
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Items</label>
      <div className="space-y-2">
        {form.items.map((item, idx) => (
          <div key={idx} className="flex gap-1 items-end">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Product</label>
              <SearchableSelect options={products.map(p => ({ value: p._id, label: `${p.name} (${formatCurrency(p.costPrice)})` }))} value={item.product} onChange={val => updateItem(idx, 'product', val)} placeholder="Select" />
            </div>
            <div className="w-14">
              <label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Qty</label>
              <Input type="number" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
            </div>
            <div className="w-20">
              <label className="block text-[10px] text-gray-400 dark:text-gray-500 mb-0.5">Price</label>
              <Input type="number" step="0.01" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} />
            </div>
            <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs p-1 mb-1">✕</button>
          </div>
        ))}
      </div>
      <Button type="button" size="sm" variant="ghost" onClick={addItem} className="mt-2">+ Add Item</Button>
    </div>
    <p className="text-right text-sm text-gray-600 dark:text-gray-400">Total: <span className="font-bold text-primary-500">{formatCurrency(subtotal)}</span></p>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Notes</label>
      <Input placeholder="Optional notes" value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} />
    </div>
    <div className="flex gap-2 pt-2">
      <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
      <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Creating...' : 'Create PO'}</Button>
    </div>
  </form>
</Modal>
    </div>
  );
};

export default PurchaseOrdersTab;