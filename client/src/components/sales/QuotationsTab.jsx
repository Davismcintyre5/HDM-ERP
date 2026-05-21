import { useState, useEffect } from 'react';
import { getQuotations, createQuotation } from '../../api/tenant/salesApi';
import { getContacts } from '../../api/tenant/contactsApi';
import { getProducts } from '../../api/tenant/productsApi';
import { createOrder } from '../../api/tenant/salesApi';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import SearchableSelect from '../../components/ui/SearchableSelect';
import { Plus, ArrowRightLeft } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';

const QuotationsTab = () => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [contacts, setContacts] = useState([]);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ customer: '', customerName: '', items: [], validityDate: '' });
  const [saving, setSaving] = useState(false);

  const fetchQuotations = () => {
    getQuotations().then(res => setQuotations(res.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchQuotations();
    getContacts().then(res => setContacts((res.data.data || []).filter(c => c.type === 'customer')));
    getProducts().then(res => setProducts(res.data.data || []));
  }, []);

  const addItem = () => setForm(prev => ({ ...prev, items: [...prev.items, { product: '', quantity: 1, unitPrice: 0 }] }));
  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    if (field === 'product') { const p = products.find(p => p._id === value); items[idx] = { ...items[idx], product: value, unitPrice: p?.sellingPrice || 0 }; }
    else items[idx] = { ...items[idx], [field]: isNaN(value) ? value : Number(value) };
    setForm(prev => ({ ...prev, items }));
  };
  const removeItem = (idx) => setForm(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== idx) }));

  const subtotal = form.items.reduce((s, i) => s + (i.quantity * i.unitPrice), 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    if ((!form.customer && !form.customerName) || !form.items.length) return setMessage({ type: 'error', text: 'Customer and items required.' });
    setSaving(true);
    try {
      const existingContact = contacts.find(c => c._id === form.customer);
      await createQuotation({
        ...form,
        customer: existingContact ? form.customer : undefined,
        customerName: existingContact ? undefined : (form.customer || form.customerName)
      });
      setShowForm(false);
      setForm({ customer: '', customerName: '', items: [], validityDate: '' });
      fetchQuotations();
      setMessage({ type: 'success', text: 'Quotation created.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setSaving(false); }
  };

  const handleConvertToOrder = async (quotation) => {
    try {
      await createOrder({
        customer: quotation.customer?._id || quotation.customer || undefined,
        customerName: quotation.customerName || undefined,
        orderDate: new Date().toISOString().split('T')[0],
        items: quotation.items.map(i => ({ product: i.product?._id || i.product, quantity: i.quantity, unitPrice: i.unitPrice, discount: 0, taxRate: 0 })),
        notes: `Converted from quotation ${quotation.orderNumber}`
      });
      await import('../../api/tenant/salesApi').then(m => m.updateOrderStatus(quotation._id, 'accepted'));
      fetchQuotations();
      setMessage({ type: 'success', text: 'Converted to Sales Order!' });
    } catch { setMessage({ type: 'error', text: 'Failed to convert.' }); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{quotations.length} quotations</p>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> New Quotation</Button>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">#</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Customer</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Total</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead>
          <tbody>
            {quotations.map(q => (
              <tr key={q._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{q.orderNumber}</td>
                <td className="py-2 text-gray-600 dark:text-gray-400">{q.customer?.companyName || q.customerName || 'N/A'}</td>
                <td className="py-2 text-gray-500 dark:text-gray-400">{formatDate(q.createdAt)}</td>
                <td className="py-2 text-primary-500 font-medium">{formatCurrency(q.grandTotal)}</td>
                <td className="py-2"><Badge variant={q.status === 'accepted' ? 'success' : q.status === 'declined' ? 'danger' : 'info'}>{q.status}</Badge></td>
                <td className="py-2 text-right">
                  {(q.status === 'draft' || q.status === 'sent') ? (
                    <Button size="sm" variant="ghost" onClick={() => handleConvertToOrder(q)}>
                      <ArrowRightLeft size={14} className="mr-1" /> Convert to Order
                    </Button>
                  ) : (
                    <span className="text-xs text-gray-400 dark:text-gray-500">{q.status === 'accepted' ? 'Converted' : ''}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Quotation">
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
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Valid Until</label>
            <Input type="date" value={form.validityDate} onChange={e => setForm(prev => ({ ...prev, validityDate: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Items</label>
            <div className="space-y-2">
              {form.items.map((item, idx) => (
                <div key={idx} className="flex gap-1 items-center">
                  <SearchableSelect
                    options={products.map(p => ({ value: p._id, label: `${p.name} (${formatCurrency(p.sellingPrice)})` }))}
                    value={item.product}
                    onChange={val => updateItem(idx, 'product', val)}
                    placeholder="Product"
                    className="flex-1 min-w-[140px]"
                  />
                  <Input type="number" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} className="w-16" />
                  <Input type="number" step="0.01" placeholder="Price" value={item.unitPrice} onChange={e => updateItem(idx, 'unitPrice', e.target.value)} className="w-20" />
                  <button type="button" onClick={() => removeItem(idx)} className="text-red-500 text-xs p-1">✕</button>
                </div>
              ))}
            </div>
            <Button type="button" size="sm" variant="ghost" onClick={addItem} className="mt-2">+ Add Item</Button>
          </div>
          <p className="text-right text-sm text-gray-600 dark:text-gray-400">Total: <span className="font-bold text-primary-500">{formatCurrency(subtotal)}</span></p>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Creating...' : 'Create Quotation'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default QuotationsTab;