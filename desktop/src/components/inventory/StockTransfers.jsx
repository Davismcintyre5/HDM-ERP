import { useState, useEffect } from 'react';
import { transferStock, getWarehouses } from '../../api/tenant/inventoryApi';
import { getProducts } from '../../api/tenant/productsApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import { ArrowRight } from 'lucide-react';

const StockTransfers = () => {
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [form, setForm] = useState({ product: '', fromWarehouse: '', toWarehouse: '', quantity: 1 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getProducts().then(res => setProducts(res.data.data || []));
    getWarehouses().then(res => setWarehouses(res.data.data || []));
  }, []);

  const handleTransfer = async (e) => {
    e.preventDefault();
    if (!form.product || !form.fromWarehouse || !form.toWarehouse) return setMessage({ type: 'error', text: 'All fields required.' });
    if (form.fromWarehouse === form.toWarehouse) return setMessage({ type: 'error', text: 'Select different warehouses.' });
    setSaving(true);
    try {
      await transferStock(form);
      setMessage({ type: 'success', text: 'Stock transferred successfully.' });
      setForm({ product: '', fromWarehouse: '', toWarehouse: '', quantity: 1 });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-lg">
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Transfer Stock</h2>
        {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
        <form onSubmit={handleTransfer} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Product *</label>
            <SearchableSelect options={products.map(p => ({ value: p._id, label: p.name }))} value={form.product} onChange={val => setForm(prev => ({ ...prev, product: val }))} placeholder="Select product" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">From → To</label>
            <div className="flex items-center gap-2">
              <SearchableSelect options={warehouses.map(w => ({ value: w._id, label: w.name }))} value={form.fromWarehouse} onChange={val => setForm(prev => ({ ...prev, fromWarehouse: val }))} placeholder="From" className="flex-1" />
              <ArrowRight size={18} className="text-gray-400 shrink-0" />
              <SearchableSelect options={warehouses.map(w => ({ value: w._id, label: w.name }))} value={form.toWarehouse} onChange={val => setForm(prev => ({ ...prev, toWarehouse: val }))} placeholder="To" className="flex-1" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Quantity</label>
            <Input type="number" placeholder="Enter quantity" value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} />
          </div>
          <Button type="submit" disabled={saving} className="w-full">{saving ? 'Transferring...' : 'Transfer Stock'}</Button>
        </form>
      </Card>
    </div>
  );
};

export default StockTransfers;