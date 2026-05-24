import { useState, useEffect } from 'react';
import { getMovements, recordMovement } from '../../api/tenant/inventoryApi';
import { getProducts } from '../../api/tenant/productsApi';
import { getWarehouses } from '../../api/tenant/inventoryApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { Plus } from 'lucide-react';
import formatDate from '../../utils/formatDate';

const types = ['receipt', 'issue', 'adjustment', 'return', 'production', 'consumption'];
const typeColors = { receipt: 'success', issue: 'danger', adjustment: 'warning', return: 'info', production: 'info', consumption: 'danger' };

const StockMovements = () => {
  const [movements, setMovements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ product: '', type: 'receipt', warehouse: '', quantity: 1, unitCost: 0, notes: '' });
  const [saving, setSaving] = useState(false);

  const fetchMovements = () => {
    getMovements().then(res => setMovements(res.data.data || [])).finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMovements();
    getProducts().then(res => setProducts(res.data.data || []));
    getWarehouses().then(res => setWarehouses(res.data.data || []));
  }, []);

  const handleRecord = async (e) => {
    e.preventDefault();
    if (!form.product) return setMessage({ type: 'error', text: 'Product required.' });
    setSaving(true);
    try {
      await recordMovement(form);
      setShowForm(false);
      setForm({ product: '', type: 'receipt', warehouse: '', quantity: 1, unitCost: 0, notes: '' });
      fetchMovements();
      setMessage({ type: 'success', text: 'Movement recorded.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{movements.length} movements</p>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> Record Movement</Button>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 dark:border-gray-700">
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th>
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Product</th>
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th>
              <th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Warehouse</th>
              <th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Cost</th>
            </tr>
          </thead>
          <tbody>
            {movements.map(m => (
              <tr key={m._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{formatDate(m.createdAt)}</td>
                <td className="py-2 font-medium text-gray-900 dark:text-white">{m.product?.name || '—'}</td>
                <td className="py-2"><Badge variant={typeColors[m.type] || 'default'}>{m.type}</Badge></td>
                <td className="py-2 text-right text-gray-700 dark:text-gray-300">{m.quantity}</td>
                <td className="py-2 text-gray-500 dark:text-gray-400">{m.warehouse?.name || '—'}</td>
                <td className="py-2 text-right text-gray-600 dark:text-gray-400">{m.unitCost ? `KSh ${m.unitCost}` : '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Record Movement">
        <form onSubmit={handleRecord} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Product *</label>
            <SearchableSelect
  options={products.map(p => ({ value: p._id, label: p.name }))}
  value={form.product}
  onChange={val => {
    const p = products.find(prod => prod._id === val);
    setForm(prev => ({ ...prev, product: val, unitCost: p?.costPrice || 0 }));
  }}
  placeholder="Select product"
/>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Movement Type</label>
            <Select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}>{types.map(t => <option key={t} value={t}>{t}</option>)}</Select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Warehouse (optional)</label>
            <SearchableSelect options={warehouses.map(w => ({ value: w._id, label: w.name }))} value={form.warehouse} onChange={val => setForm(prev => ({ ...prev, warehouse: val }))} placeholder="Select warehouse" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Quantity</label>
              <Input type="number" placeholder="1" value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Unit Cost</label>
              <Input type="number" step="0.01" placeholder="0.00" value={form.unitCost} onChange={e => setForm(prev => ({ ...prev, unitCost: parseFloat(e.target.value) || 0 }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Notes</label>
            <Input placeholder="Optional notes" value={form.notes} onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Recording...' : 'Record'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StockMovements;