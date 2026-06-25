import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';

const types = ['preventive', 'corrective', 'inspection'];
const statuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];

const MaintenanceForm = ({ initialData, onSubmit, onCancel, saving }) => {
  const [form, setForm] = useState({
    type: 'preventive', description: '', status: 'scheduled',
    scheduledDate: new Date().toISOString().split('T')[0], completedDate: '',
    cost: 0, vendor: '', notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        type: initialData.type || 'preventive',
        description: initialData.description || '',
        status: initialData.status || 'scheduled',
        scheduledDate: initialData.scheduledDate ? new Date(initialData.scheduledDate).toISOString().split('T')[0] : '',
        completedDate: initialData.completedDate ? new Date(initialData.completedDate).toISOString().split('T')[0] : '',
        cost: initialData.cost || 0,
        vendor: initialData.vendor || '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.description || !form.scheduledDate) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Type *</label>
          <select value={form.type} onChange={e => update('type', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {types.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description *</label>
        <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" placeholder="e.g. Oil change, tire rotation" required />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Scheduled Date *" type="date" value={form.scheduledDate} onChange={e => update('scheduledDate', e.target.value)} required />
        <Input label="Completed Date" type="date" value={form.completedDate} onChange={e => update('completedDate', e.target.value)} />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Cost" type="number" value={form.cost} onChange={e => update('cost', parseFloat(e.target.value) || 0)} />
        <Input label="Vendor" value={form.vendor} onChange={e => update('vendor', e.target.value)} placeholder="Service provider" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : initialData ? 'Update' : 'Schedule'}</Button>
      </div>
    </form>
  );
};

export default MaintenanceForm;