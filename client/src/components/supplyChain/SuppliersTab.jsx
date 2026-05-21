import { useState, useEffect } from 'react';
import { getContacts, createContact, updateContact, deleteContact } from '../../api/tenant/contactsApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Card from '../../components/ui/Card';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Edit3, Trash2, Truck } from 'lucide-react';

const SuppliersTab = () => {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [form, setForm] = useState({ companyName: '', contactPerson: '', email: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getContacts().then(res => setSuppliers((res.data.data || []).filter(c => c.type === 'supplier'))).finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.companyName) return;
    setSaving(true);
    try {
      if (editId) await updateContact(editId, { ...form, type: 'supplier' });
      else await createContact({ ...form, type: 'supplier' });
      setShowForm(false); setEditId(null); setForm({ companyName: '', contactPerson: '', email: '', phone: '' });
      getContacts().then(res => setSuppliers((res.data.data || []).filter(c => c.type === 'supplier')));
      setMessage({ type: 'success', text: 'Supplier saved.' });
    } catch { setMessage({ type: 'error', text: 'Failed.' }); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => { try { await deleteContact(deleteId); setDeleteId(null); getContacts().then(res => setSuppliers((res.data.data || []).filter(c => c.type === 'supplier'))); } catch {} };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500">{suppliers.length} suppliers</p>
        <Button size="sm" onClick={() => { setEditId(null); setForm({ companyName: '', contactPerson: '', email: '', phone: '' }); setShowForm(true); }}><Plus size={14} className="mr-1" /> Add Supplier</Button>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map(s => (
          <Card key={s._id} className="p-4">
            <Truck size={20} className="text-primary-500 mb-2" />
            <h3 className="font-semibold text-gray-900 dark:text-white">{s.companyName}</h3>
            {s.contactPerson && <p className="text-sm text-gray-500">{s.contactPerson}</p>}
            {s.email && <p className="text-sm text-gray-500">{s.email}</p>}
            {s.phone && <p className="text-sm text-gray-500">{s.phone}</p>}
            <div className="flex gap-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button size="sm" variant="ghost" onClick={() => { setEditId(s._id); setForm(s); setShowForm(true); }}><Edit3 size={12} className="mr-1" /> Edit</Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(s._id)}><Trash2 size={12} className="mr-1" /> Delete</Button>
            </div>
          </Card>
        ))}
      </div>
<Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Supplier' : 'Add Supplier'}>
  <form onSubmit={handleSave} className="space-y-3">
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Company Name *</label>
      <Input placeholder="Supplier company" value={form.companyName} onChange={e => setForm(prev => ({ ...prev, companyName: e.target.value }))} required />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Contact Person</label>
      <Input placeholder="Contact name" value={form.contactPerson} onChange={e => setForm(prev => ({ ...prev, contactPerson: e.target.value }))} />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Email</label>
      <Input placeholder="supplier@email.com" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} />
    </div>
    <div>
      <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Phone</label>
      <Input placeholder="Phone number" value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} />
    </div>
    <div className="flex gap-2 pt-2">
      <Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
      <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : 'Save'}</Button>
    </div>
  </form>
</Modal>
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Supplier" message="Are you sure?" />
    </div>
  );
};

export default SuppliersTab;