import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SearchableSelect from '../ui/SearchableSelect';

const sources = ['website', 'referral', 'social', 'email', 'call', 'other'];

const LeadForm = ({ initialData, users, onSubmit, onCancel, saving }) => {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', company: '',
    source: 'other', value: 0, notes: '', assignedTo: '', nextFollowUp: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        firstName: initialData.firstName || '',
        lastName: initialData.lastName || '',
        email: initialData.email || '',
        phone: initialData.phone || '',
        company: initialData.company || '',
        source: initialData.source || 'other',
        value: initialData.value || 0,
        notes: initialData.notes || '',
        assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
        nextFollowUp: initialData.nextFollowUp ? new Date(initialData.nextFollowUp).toISOString().split('T')[0] : ''
      });
    }
  }, [initialData]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        <Input label="First Name *" value={form.firstName} onChange={e => update('firstName', e.target.value)} required placeholder="John" />
        <Input label="Last Name *" value={form.lastName} onChange={e => update('lastName', e.target.value)} required placeholder="Doe" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Email" type="email" value={form.email} onChange={e => update('email', e.target.value)} placeholder="john@company.com" />
        <Input label="Phone" value={form.phone} onChange={e => update('phone', e.target.value)} placeholder="+254..." />
      </div>
      <Input label="Company" value={form.company} onChange={e => update('company', e.target.value)} placeholder="Company name" />
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Source</label>
          <select value={form.source} onChange={e => update('source', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {sources.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <Input label="Deal Value" type="number" value={form.value} onChange={e => update('value', parseFloat(e.target.value) || 0)} />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
        <SearchableSelect
          options={users.map(u => ({ value: u._id, label: `${u.firstName} ${u.lastName}` }))}
          value={form.assignedTo}
          onChange={val => update('assignedTo', val)}
          placeholder="Select user..."
        />
      </div>
      <Input label="Next Follow-up" type="date" value={form.nextFollowUp} onChange={e => update('nextFollowUp', e.target.value)} />
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" placeholder="Any additional notes..." />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : initialData ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default LeadForm;