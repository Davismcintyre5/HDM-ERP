import { useState, useEffect } from 'react';
import { getStockOverview, addProduct } from '../../api/tenant/inventoryApi';
import { getProducts } from '../../api/tenant/productsApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { Plus, Search, Printer } from 'lucide-react';
import { printTable } from '../../utils/printUtils';
import formatCurrency from '../../utils/formatCurrency';

const StockOverview = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', category: '', unit: 'piece', costPrice: 0, sellingPrice: 0, reorderLevel: 0, quantity: 0 });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchStock = () => {
    getStockOverview().then(res => setProducts(res.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStock(); }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!form.name) return setMessage({ type: 'error', text: 'Product name required.' });
    setSaving(true);
    try {
      await addProduct({ ...form, quantity: undefined, stock: form.quantity });
      setShowAdd(false);
      setForm({ name: '', category: '', unit: 'piece', costPrice: 0, sellingPrice: 0, reorderLevel: 0, quantity: 0 });
      fetchStock();
      setMessage({ type: 'success', text: 'Product added.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setSaving(false); }
  };

  const filtered = products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()) || p.sku?.toLowerCase().includes(search.toLowerCase()));

  const handlePrint = () => {
    printTable(filtered.map(p => ({
      name: p.name,
      sku: p.sku || '—',
      stock: `${p.stock || 0} ${p.unit || ''}`,
      cost: formatCurrency(p.costPrice),
      selling: formatCurrency(p.sellingPrice),
    })), [
      { key: 'name', label: 'Product' },
      { key: 'sku', label: 'SKU' },
      { key: 'stock', label: 'Stock' },
      { key: 'cost', label: 'Cost' },
      { key: 'selling', label: 'Selling' },
    ], { title: 'Stock Overview' });
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div className="relative max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input className="pl-9" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button>
          <Button size="sm" onClick={() => setShowAdd(true)}><Plus size={14} className="mr-1" /> Add Product</Button>
        </div>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Product</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">SKU</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Category</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Stock</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Cost</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Selling</th></tr></thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 font-medium text-gray-900 dark:text-white">{p.name}</td>
                <td className="py-2 text-xs font-mono text-gray-500">{p.sku || '—'}</td>
                <td className="py-2 text-gray-500">{p.category || '—'}</td>
                <td className={`py-2 text-right font-medium ${(p.stock || 0) <= (p.reorderLevel || 0) ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>{p.stock || 0} {p.unit}</td>
                <td className="py-2 text-right text-gray-600">{formatCurrency(p.costPrice)}</td>
                <td className="py-2 text-right text-primary-500 font-medium">{formatCurrency(p.sellingPrice)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showAdd} onClose={() => setShowAdd(false)} title="Add Product">
        <form onSubmit={handleAdd} className="space-y-3">
          <Input name="name" placeholder="Product Name *" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required />
          <div className="grid grid-cols-2 gap-2">
            <Input name="category" placeholder="Category" value={form.category} onChange={e => setForm(prev => ({ ...prev, category: e.target.value }))} />
            <Input name="unit" placeholder="Unit" value={form.unit} onChange={e => setForm(prev => ({ ...prev, unit: e.target.value }))} />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Input name="costPrice" type="number" step="0.01" placeholder="Cost" value={form.costPrice} onChange={e => setForm(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))} />
            <Input name="sellingPrice" type="number" step="0.01" placeholder="Selling" value={form.sellingPrice} onChange={e => setForm(prev => ({ ...prev, sellingPrice: parseFloat(e.target.value) || 0 }))} />
            <Input name="quantity" type="number" placeholder="Qty" value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))} />
          </div>
          <Input name="reorderLevel" type="number" placeholder="Reorder Level" value={form.reorderLevel} onChange={e => setForm(prev => ({ ...prev, reorderLevel: parseInt(e.target.value) || 0 }))} />
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowAdd(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Adding...' : 'Add Product'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockOverview;