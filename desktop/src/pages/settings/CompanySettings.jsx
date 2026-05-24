import { useState, useEffect } from 'react';
import { getCompany, updateCompany } from '../../api/tenant/companyApi';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';

const CompanySettings = () => {
  const [form, setForm] = useState({ companyName: '', legalName: '', taxId: '', registrationNumber: '', currency: 'KSh', contactEmail: '', contactPhone: '', website: '', address: { street: '', city: '', state: '', postalCode: '', country: 'Kenya' } });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    getCompany().then(res => { if (res.data.data) setForm(prev => ({ ...prev, ...res.data.data, address: { ...prev.address, ...res.data.data.address } })); }).finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const field = name.split('.')[1];
      setForm(prev => ({ ...prev, address: { ...prev.address, [field]: value } }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateCompany(form);
      setMessage({ type: 'success', text: 'Settings saved.' });
    } catch {
      setMessage({ type: 'error', text: 'Failed to save.' });
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <Card className="p-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Company Information</h2>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label><Input name="companyName" value={form.companyName} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Legal Name</label><Input name="legalName" value={form.legalName} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tax ID</label><Input name="taxId" value={form.taxId} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Registration Number</label><Input name="registrationNumber" value={form.registrationNumber} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label><Select name="currency" value={form.currency} onChange={handleChange}><option value="KSh">KSh</option><option value="USD">USD</option><option value="EUR">EUR</option><option value="GBP">GBP</option></Select></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><Input name="contactEmail" type="email" value={form.contactEmail} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><Input name="contactPhone" value={form.contactPhone} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label><Input name="website" value={form.website} onChange={handleChange} /></div>
        </div>
        <h3 className="text-md font-semibold text-gray-900 dark:text-white mt-4">Address</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Street</label><Input name="address.street" value={form.address.street} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label><Input name="address.city" value={form.address.city} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label><Input name="address.state" value={form.address.state} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Postal Code</label><Input name="address.postalCode" value={form.address.postalCode} onChange={handleChange} /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label><Input name="address.country" value={form.address.country} onChange={handleChange} /></div>
        </div>
        <Button type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</Button>
      </form>
    </Card>
  );
};

export default CompanySettings;