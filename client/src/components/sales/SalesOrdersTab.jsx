import { useState, useEffect } from 'react';
import { getOrders, createOrder, updateOrderStatus } from '../../api/tenant/salesApi';
import { getContacts } from '../../api/tenant/contactsApi';
import { getProducts } from '../../api/tenant/productsApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { Plus, ArrowRight, Printer } from 'lucide-react';
import { printTable } from '../../utils/printUtils';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const statusFlow = ['draft', 'confirmed', 'processing', 'shipped', 'delivered', 'invoiced', 'paid'];
const statusColors = { draft: 'default', confirmed: 'info', processing: 'warning', shipped: 'info', delivered: 'success', invoiced: 'info', paid: 'success', cancelled: 'danger' };

const SalesOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ customer: '', customerName: '', orderDate: new Date().toISOString().split('T')[0], items: [], notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchOrders = () => {
    getOrders().then(res => setOrders(res.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
    getContacts().then(res => setContacts((res.data.data || []).filter(c => c.type === 'customer')));
    getProducts().then(res => setProducts(res.data.data || []));
  }, []);

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { product: '', quantity: 1, unitPrice: 0, discount: 0, taxRate: 0 }] }));

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    if (field === 'product') {
      const p = products.find(p => p._id === value);
      items[idx] = { ...items[idx], product: value, unitPrice: p?.sellingPrice || 0 };
    } else {
      items[idx] = { ...items[idx], [field]: isNaN(value) ? value : Number(value) };
    }
    setForm(prev => ({ ...prev, items }));
  };

  const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const subtotal = form.items.reduce((s, i) => s + (i.quantity * i.unitPrice - (i.discount || 0)), 0);
  const taxTotal = form.items.reduce((s, i) => s + ((i.quantity * i.unitPrice - (i.discount || 0)) * (i.taxRate || 0) / 100), 0);
  const grandTotal = subtotal + taxTotal;

  const handleCreate = async (e) => {
    e.preventDefault();
    if ((!form.customer && !form.customerName) || !form.items.length) return setMessage({ type: 'error', text: 'Customer and at least one item required.' });
    setSaving(true);
    try {
      const existingContact = contacts.find(c => c._id === form.customer);
      await createOrder({
        ...form,
        customer: existingContact ? form.customer : undefined,
        customerName: existingContact ? undefined : (form.customer || form.customerName)
      });
      setShowForm(false);
      setForm({ customer: '', customerName: '', orderDate: new Date().toISOString().split('T')[0], items: [], notes: '' });
      fetchOrders();
      setMessage({ type: 'success', text: 'Sales order created.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create order.' }); }
    finally { setSaving(false); }
  };

  const advanceStatus = async (id, current) => {
    const idx = statusFlow.indexOf(current);
    if (idx < statusFlow.length - 1) {
      try { await updateOrderStatus(id, statusFlow[idx + 1]); fetchOrders(); setMessage({ type: 'success', text: `Status updated to ${statusFlow[idx + 1]}.` }); }
      catch { setMessage({ type: 'error', text: 'Failed.' }); }
    }
  };

  const handlePrint = () => {
    printTable(orders.map(o => ({
      orderNumber: o.orderNumber,
      customer: o.customer?.companyName || o.customerName || 'N/A',
      date: formatDate(o.orderDate),
      total: formatCurrency(o.grandTotal),
      status: o.status
    })), [
      { key: 'orderNumber', label: 'Order #' },
      { key: 'customer', label: 'Customer' },
      { key: 'date', label: 'Date' },
      { key: 'total', label: 'Total' },
      { key: 'status', label: 'Status' },
    ], { title: 'Sales Orders' });
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{orders.length} orders</p>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button>
          <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> New Order</Button>
        </div>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Order #</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Customer</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Total</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{o.orderNumber}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{o.customer?.companyName || o.customerName || 'N/A'}</td>
                <td className="py-2 text-gray-500 dark:text-gray-400">{formatDate(o.orderDate)}</td>
                <td className="py-2 text-primary-500 font-medium">{formatCurrency(o.grandTotal)}</td>
                <td className="py-2"><Badge variant={statusColors[o.status] || 'default'}>{o.status}</Badge></td>
                <td className="py-2 text-right">
                  {o.status !== 'paid' && o.status !== 'cancelled' && (
                    <Button size="sm" variant="ghost" onClick={() => advanceStatus(o._id, o.status)}>
                      <ArrowRight size={14} className="mr-1" /> {statusFlow[statusFlow.indexOf(o.status) + 1]}
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Sales Order">
        <form onSubmit={handleCreate} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Customer *</label>
            <SearchableSelect
              options={contacts.map(c => ({ value: c._id, label: c.companyName }))}
              value={form.customer}
              onChange={val => setForm(prev => ({ ...prev, customer: val, customerName: '' }))}
              placeholder="Search or type new customer..."
              creatable
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Order Date</label>
            <Input type="date" value={form.orderDate} onChange={e => setForm(prev => ({ ...prev, orderDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Items</label>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-1 items-center flex-wrap">
                  <SearchableSelect
                    options={products.map(p => ({ value: p._id, label: `${p.name} (${formatCurrency(p.sellingPrice)})` }))}
                    value={item.product}
                    onChange={val => updateItem(idx, 'product', val)}
                    placeholder="Product"
                    className="flex-1 min-w-[140px]"
                  />
                  <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-14" />
                  <Input type="number" step="0.01" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} className="w-20" />
                  <Input type="number" step="0.01" placeholder="Disc" value={item.discount} onChange={e => updateItem(idx, 'discount', e.target.value)} className="w-14" />
                  <Input type="number" step="0.01" placeholder="Tax%" value={item.taxRate} onChange={e => updateItem(idx, 'taxRate', e.target.value)} className="w-14" />
                  <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs p-1">✕</button>
                </div>
              ))}
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={addItem} className="mt-2">+ Add Item</Button>
          </div>
          <div className="text-right text-sm text-gray-600 dark:text-gray-400 space-y-0.5">
            <p>Subtotal: <span className="font-medium">{formatCurrency(subtotal)}</span></p>
            <p>Tax: <span className="font-medium">{formatCurrency(taxTotal)}</span></p>
            <p className="text-base font-bold text-primary-500">Total: {formatCurrency(grandTotal)}</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Notes</label>
            <Input placeholder="Optional notes" value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Creating...' : 'Create Order'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default SalesOrdersTab;