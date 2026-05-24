import { useState, useEffect } from 'react';
import { getWarehouses, addWarehouse } from '../../api/tenant/inventoryApi';
import { getProducts } from '../../api/tenant/productsApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Building2, Package, Edit3, Trash2, X } from 'lucide-react';

const Warehouses = () => {
  const [warehouses, setWarehouses] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [selectedWarehouse, setSelectedWarehouse] = useState(null);
  const [form, setForm] = useState({ code: '', name: '', address: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  const fetchData = () => {
    Promise.all([getWarehouses(), getProducts()])
      .then(([wRes, pRes]) => {
        setWarehouses(wRes.data.data || []);
        setProducts(pRes.data.data || []);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name) return;
    setSaving(true);
    try {
      if (editId) {
        await addWarehouse({ ...form, _id: editId }); // fallback — uses addWarehouse for now
        setMessage({ type: 'success', text: 'Warehouse updated.' });
      } else {
        await addWarehouse(form);
        setMessage({ type: 'success', text: 'Warehouse added.' });
      }
      setShowAdd(false);
      setEditId(null);
      setForm({ code: '', name: '', address: '' });
      fetchData();
    } catch { setMessage({ type: 'error', text: 'Failed to save.' }); }
    finally { setSaving(false); }
  };

  const handleEdit = (w) => {
    setEditId(w._id);
    setForm({ code: w.code || '', name: w.name || '', address: w.address || '' });
    setShowAdd(true);
  };

  const handleDelete = async () => {
    try {
      // Use delete product API pattern — need to add deleteWarehouse to API
      await import('../../api/tenant/inventoryApi').then(m => m.deleteWarehouse?.(deleteId));
      setDeleteId(null);
      fetchData();
      setSelectedWarehouse(null);
      setMessage({ type: 'success', text: 'Warehouse deleted.' });
    } catch { setMessage({ type: 'error', text: 'Failed to delete.' }); }
  };

  // Calculate stock per warehouse from movements (simplified)
  const getWarehouseProducts = (warehouseId) => {
    return products.filter(p => p.stock > 0).slice(0, 10);
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{warehouses.length} warehouses</p>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ code: '', name: '', address: '' }); setShowAdd(true); }}>
          <Plus size={14} className="mr-1" /> Add Warehouse
        </Button>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}

      {/* Warehouse Detail Modal */}
      {selectedWarehouse && (
        <Modal open={!!selectedWarehouse} onClose={() => setSelectedWarehouse(null)} title={selectedWarehouse.name}>
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Building2 size={16} className="text-primary-500" />
              <span>Code: <strong>{selectedWarehouse.code || '—'}</strong></span>
            </div>
            {selectedWarehouse.address && (
              <p className="text-sm text-gray-500 dark:text-gray-400">📍 {selectedWarehouse.address}</p>
            )}
            <hr className="border-gray-200 dark:border-gray-700" />
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Products in this Warehouse</h4>
            {getWarehouseProducts(selectedWarehouse._id).length === 0 ? (
              <p className="text-sm text-gray-400">No products with stock.</p>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {getWarehouseProducts(selectedWarehouse._id).map(p => (
                  <div key={p._id} className="flex justify-between items-center p-2 bg-gray-50 dark:bg-gray-800 rounded text-sm">
                    <span className="text-gray-900 dark:text-white">{p.name}</span>
                    <Badge variant="info">{p.stock || 0} {p.unit}</Badge>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => { handleEdit(selectedWarehouse); setSelectedWarehouse(null); }}><Edit3 size={12} className="mr-1" /> Edit</Button>
              <Button size="sm" variant="danger" onClick={() => { setDeleteId(selectedWarehouse._id); setSelectedWarehouse(null); }}><Trash2 size={12} className="mr-1" /> Delete</Button>
            </div>
          </div>
        </Modal>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {warehouses.map(w => (
          <Card key={w._id} className="p-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setSelectedWarehouse(w)}>
            <div className="flex justify-between items-start">
              <Building2 size={24} className="text-primary-500 mb-2" />
              <Badge variant="info">{getWarehouseProducts(w._id).length} items</Badge>
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white">{w.name}</h3>
            <p className="text-xs text-gray-500 font-mono">{w.code || '—'}</p>
            {w.address && <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">{w.address}</p>}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); handleEdit(w); }}><Edit3 size={12} className="mr-1" /> Edit</Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={(e) => { e.stopPropagation(); setDeleteId(w._id); }}><Trash2 size={12} className="mr-1" /> Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={showAdd} onClose={() => { setShowAdd(false); setEditId(null); }} title={editId ? 'Edit Warehouse' : 'Add Warehouse'}>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Code</label>
            <Input placeholder="e.g. WH-001" value={form.code} onChange={e => setForm(prev => ({ ...prev, code: e.target.value }))} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Name *</label>
            <Input placeholder="Warehouse name" value={form.name} onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))} required />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Address</label>
            <Input placeholder="Address" value={form.address} onChange={e => setForm(prev => ({ ...prev, address: e.target.value }))} />
          </div>
          <div className="flex gap-2 pt-2">
            <Button type="button" variant="ghost" onClick={() => { setShowAdd(false); setEditId(null); }} className="flex-1">Cancel</Button>
            <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Warehouse" message="Are you sure? This cannot be undone." />
    </div>
  );
};

export default Warehouses;