import { useState } from 'react';
import { createContact, updateContact } from '../../api/tenant/contactsApi';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import Alert from '../ui/Alert';

const types = [
  { value: 'customer', label: 'Customer' },
  { value: 'supplier', label: 'Supplier' },
  { value: 'partner', label: 'Partner' },
];

const emptyForm = { type: 'customer', companyName: '', contactPerson: '', email: '', phone: '', address: { street: '', city: '', state: '', country: 'Kenya' }, taxId: '', notes: '' };

const ContactForm = ({ contact, onClose, onSaved }) => {
  const [form, setForm] = useState(contact ? { ...contact, address: { ...emptyForm.address, ...contact.address } } : emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.companyName) return setError('Company name is required.');
    setSaving(true);
    try {
      if (contact) await updateContact(contact._id, form);
      else await createContact(form);
      onSaved();
    } catch (err) { setError(err.response?.data?.message || 'Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <Modal open onClose={onClose} title={contact ? 'Edit Contact' : 'Add Contact'}>
      {error && <Alert variant="error" message={error} onClose={() => setError('')} />}
      <form onSubmit={handleSave} className="space-y-3">
        <Select name="type" value={form.type} onChange={handleChange}>
          {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </Select>
        <Input name="companyName" placeholder="Company Name *" value={form.companyName} onChange={handleChange} required />
        <Input name="contactPerson" placeholder="Contact Person" value={form.contactPerson} onChange={handleChange} />
        <div className="grid grid-cols-2 gap-3">
          <Input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} />
          <Input name="phone" placeholder="Phone" value={form.phone} onChange={handleChange} />
        </div>
        <Input name="address.street" placeholder="Street" value={form.address.street} onChange={handleChange} />
        <div className="grid grid-cols-3 gap-3">
          <Input name="address.city" placeholder="City" value={form.address.city} onChange={handleChange} />
          <Input name="address.state" placeholder="State" value={form.address.state} onChange={handleChange} />
          <Input name="address.country" placeholder="Country" value={form.address.country} onChange={handleChange} />
        </div>
        <Input name="taxId" placeholder="Tax ID" value={form.taxId} onChange={handleChange} />
        <Input name="notes" placeholder="Notes" value={form.notes} onChange={handleChange} />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">Cancel</Button>
          <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : 'Save'}</Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContactForm;