import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SearchableSelect from '../ui/SearchableSelect';

const statuses = ['planning', 'active', 'on_hold', 'completed', 'cancelled'];
const priorities = ['low', 'medium', 'high', 'urgent'];

const ProjectForm = ({ initialData, contacts, users, onSubmit, onCancel, saving }) => {
  const [form, setForm] = useState({
    name: '', description: '', status: 'planning', priority: 'medium',
    startDate: '', endDate: '', budget: 0, client: '', manager: '', team: []
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        description: initialData.description || '',
        status: initialData.status || 'planning',
        priority: initialData.priority || 'medium',
        startDate: initialData.startDate ? new Date(initialData.startDate).toISOString().split('T')[0] : '',
        endDate: initialData.endDate ? new Date(initialData.endDate).toISOString().split('T')[0] : '',
        budget: initialData.budget || 0,
        client: initialData.client?._id || initialData.client || '',
        manager: initialData.manager?._id || initialData.manager || '',
        team: initialData.team?.map(u => u._id || u) || []
      });
    }
  }, [initialData]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto">
      <Input label="Project Name *" value={form.name} onChange={e => update('name', e.target.value)} required placeholder="e.g. Website Redesign" />
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Description</label>
        <textarea value={form.description} onChange={e => update('description', e.target.value)} rows={3} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" placeholder="Project description..." />
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

      <div className="grid grid-cols-2 gap-3">
        <Input label="Start Date" type="date" value={form.startDate} onChange={e => update('startDate', e.target.value)} />
        <Input label="End Date" type="date" value={form.endDate} onChange={e => update('endDate', e.target.value)} />
      </div>

      <Input label="Budget" type="number" value={form.budget} onChange={e => update('budget', parseFloat(e.target.value) || 0)} />

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Client</label>
        <SearchableSelect
          options={contacts.filter(c => c.type === 'customer').map(c => ({ value: c._id, label: c.companyName }))}
          value={form.client}
          onChange={val => update('client', val)}
          placeholder="Select client..."
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Project Manager</label>
        <SearchableSelect
          options={users.map(u => ({ value: u._id, label: `${u.firstName} ${u.lastName}` }))}
          value={form.manager}
          onChange={val => update('manager', val)}
          placeholder="Select manager..."
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Team Members</label>
        <div className="flex flex-wrap gap-1">
          {users.map(u => (
            <button
              key={u._id}
              type="button"
              onClick={() => {
                const exists = form.team.includes(u._id);
                update('team', exists ? form.team.filter(t => t !== u._id) : [...form.team, u._id]);
              }}
              className={`px-2 py-1 rounded text-xs transition-colors ${form.team.includes(u._id) ? 'bg-primary-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              {u.firstName} {u.lastName}
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : initialData ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default ProjectForm;