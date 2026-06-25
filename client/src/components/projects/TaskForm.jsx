import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SearchableSelect from '../ui/SearchableSelect';

const statuses = ['todo', 'in_progress', 'review', 'done'];
const priorities = ['low', 'medium', 'high', 'urgent'];

const TaskForm = ({ initialData, users, onSubmit, onCancel, saving }) => {
  const [form, setForm] = useState({
    title: '', description: '', status: 'todo', priority: 'medium',
    assignedTo: '', dueDate: '', estimatedHours: 0
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || '',
        description: initialData.description || '',
        status: initialData.status || 'todo',
        priority: initialData.priority || 'medium',
        assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        estimatedHours: initialData.estimatedHours || 0
      });
    }
  }, [initialData]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Input label="Task Title *" value={form.title} onChange={e => update('title', e.target.value)} required placeholder="e.g. Design homepage" />
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Status</label>
          <select value={form.status} onChange={e => update('status', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Priority</label>
          <select value={form.priority} onChange={e => update('priority', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
            {priorities.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
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
      <div className="grid grid-cols-2 gap-3">
        <Input label="Due Date" type="date" value={form.dueDate} onChange={e => update('dueDate', e.target.value)} />
        <Input label="Est. Hours" type="number" value={form.estimatedHours} onChange={e => update('estimatedHours', parseFloat(e.target.value) || 0)} />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : initialData ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default TaskForm;