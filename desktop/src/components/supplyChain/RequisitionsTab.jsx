import { useState, useEffect } from 'react';
import { createRequisition, getRequisitions } from '../../api/tenant/supplyChainApi';
import { getProducts } from '../../api/tenant/productsApi';
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

const RequisitionsTab = () => {
  const [requisitions, setRequisitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [products, setProducts] = useState([]);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ product: '', quantity: 1, reason: '', requestedBy: '', department: '', priority: 'medium' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getRequisitions().then(res => setRequisitions(res.data.data || [])).finally(() => setLoading(false));
    getProducts().then(res => setProducts(res.data.data || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.product) return;
    setSaving(true);
    try {
      await createRequisition(form);
      setShowForm(false);
      setForm({ product: '', quantity: 1, reason: '', requestedBy: '', department: '', priority: 'medium' });
      getRequisitions().then(res => setRequisitions(res.data.data || []));
      setMessage({ type: 'success', text: 'Requisition submitted.' });
    } catch { setMessage({ type: 'error', text: 'Failed.' }); }
    finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{requisitions.length} requisitions</p>
        <Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> New Requisition</Button>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Product</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Qty</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Dept</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Priority</th></tr></thead>
          <tbody>
            {requisitions.map(r => (
              <tr key={r._id} className="border-b border-gray-100 dark:border-gray-700/50">
                <td className="py-2 text-gray-500 text-xs">{formatDate(r.createdAt)}</td>
                <td className="py-2 font-medium text-gray-900 dark:text-white">{r.product?.name || '—'}</td>
                <td className="py-2 text-right">{r.quantity}</td>
                <td className="py-2 text-gray-500">{r.department || '—'}</td>
                <td className="py-2"><Badge variant={r.priority === 'high' ? 'danger' : r.priority === 'medium' ? 'warning' : 'info'}>{r.priority}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
<Modal open={showForm} onClose={() => setShowForm(false)} title="New Requisition">
  <form onSubmit={handleSubmit} className="space-y-3">
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Product *</label>
      <SearchableSelect options={products.map(p => ({ value: p._id, label: p.name }))} value={form.product} onChange={val => setForm(prev => ({ ...prev, product: val }))} placeholder="Select product" />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Quantity</label>
      <Input type="number" placeholder="1" value={form.quantity} onChange={e => setForm(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))} />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Reason</label>
      <Input placeholder="Why is this needed?" value={form.reason} onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))} />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Requested By</label>
      <Input placeholder="Your name" value={form.requestedBy} onChange={e => setForm(prev => ({ ...prev, requestedBy: e.target.value }))} />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Department</label>
      <Input placeholder="e.g. Production" value={form.department} onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))} />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Priority</label>
      <Select value={form.priority} onChange={e => setForm(prev => ({ ...prev, priority: e.target.value }))}>
        <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option>
      </Select>
    </div>
    <div className="flex gap-2 pt-2">
      <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
      <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Submitting...' : 'Submit'}</Button>
    </div>
  </form>
</Modal>
    </div>
  );
};

export default RequisitionsTab;