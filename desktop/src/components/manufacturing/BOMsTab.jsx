import { useState, useEffect } from 'react';
import { getBOMs, createBOM } from '../../api/tenant/manufacturingApi';
import { getProducts } from '../../api/tenant/productsApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import Card from '../../components/ui/Card';
import { Plus, Layers, Trash2 } from 'lucide-react';

const BOMsTab = () => {
  const [boms, setBoms] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ product: '', components: [{ product: '', quantity: 1, unit: 'piece' }] });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([getBOMs(), getProducts()]).then(([bRes, pRes]) => { setBoms(bRes.data.data || []); setProducts(pRes.data.data || []); }).finally(() => setLoading(false));
  }, []);

  const addComponent = () => setForm(prev => ({ ...prev, components: [...prev.components, { product: '', quantity: 1, unit: 'piece' }] }));
  const updateComponent = (idx, field, value) => {
    const comps = [...form.components];
    comps[idx] = { ...comps[idx], [field]: isNaN(value) ? value : Number(value) };
    setForm(prev => ({ ...prev, components: comps }));
  };
  const removeComponent = (idx) => setForm(prev => ({ ...prev, components: prev.components.filter((_, i) => i !== idx) }));

  const handleCreate = async (e) => {
    e.preventDefault(); if (!form.product || !form.components.length) return;
    setSaving(true);
    try { await createBOM(form); setShowForm(false); setForm({ product: '', components: [{ product: '', quantity: 1, unit: 'piece' }] }); getBOMs().then(res => setBoms(res.data.data || [])); setMessage({ type: 'success', text: 'BOM created.' }); }
    catch { setMessage({ type: 'error', text: 'Failed.' }); } finally { setSaving(false); }
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><p className="text-sm text-gray-500">{boms.length} BOMs</p><Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> New BOM</Button></div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {boms.map(b => (
          <Card key={b._id} className="p-4">
            <div className="flex items-center gap-2 mb-3"><Layers size={18} className="text-primary-500" /><h3 className="font-semibold text-gray-900 dark:text-white">{b.product?.name || 'N/A'}</h3></div>
            <div className="text-xs text-gray-500 space-y-1">
              {b.components?.map((c, i) => <p key={i}>• {c.product?.name || 'Component'} — {c.quantity} {c.unit}</p>)}
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="New Bill of Materials">
        <form onSubmit={handleCreate} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Finished Product *</label><SearchableSelect options={products.map(p => ({ value: p._id, label: p.name }))} value={form.product} onChange={val => setForm(prev => ({ ...prev, product: val }))} placeholder="Select product" /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Components</label><div className="space-y-2">{form.components.map((c, idx) => (<div key={idx} className="flex gap-1 items-end"><div className="flex-1"><SearchableSelect options={products.filter(p => p._id !== form.product).map(p => ({ value: p._id, label: p.name }))} value={c.product} onChange={val => updateComponent(idx, 'product', val)} placeholder="Component" /></div><div className="w-16"><Input type="number" placeholder="Qty" value={c.quantity} onChange={e => updateComponent(idx, 'quantity', e.target.value)} /></div><div className="w-20"><Input placeholder="Unit" value={c.unit} onChange={e => updateComponent(idx, 'unit', e.target.value)} /></div><button onClick={() => removeComponent(idx)} className="text-red-500 text-xs p-1 mb-1"><Trash2 size={12} /></button></div>))}</div><Button type="button" size="sm" variant="ghost" onClick={addComponent} className="mt-2">+ Add Component</Button></div>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">Create BOM</Button></div>
        </form>
      </Modal>
    </div>
  );
};

export default BOMsTab;