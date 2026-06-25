import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import SearchableSelect from '../ui/SearchableSelect';

const categories = ['equipment', 'vehicle', 'furniture', 'it', 'building', 'other'];
const depreciationMethods = ['straight_line', 'reducing_balance', 'none'];

const AssetForm = ({ initialData, users, onSubmit, onCancel, saving }) => {
  const [form, setForm] = useState({
    name: '', code: '', category: 'equipment',
    purchaseDate: '', purchaseCost: 0,
    depreciationMethod: 'straight_line', depreciationRate: 20,
    usefulLifeYears: 5, salvageValue: 0,
    location: '', assignedTo: '', supplier: '',
    warrantyExpiry: '', notes: ''
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        name: initialData.name || '',
        code: initialData.code || '',
        category: initialData.category || 'equipment',
        purchaseDate: initialData.purchaseDate ? new Date(initialData.purchaseDate).toISOString().split('T')[0] : '',
        purchaseCost: initialData.purchaseCost || 0,
        depreciationMethod: initialData.depreciationMethod || 'straight_line',
        depreciationRate: initialData.depreciationRate || 20,
        usefulLifeYears: initialData.usefulLifeYears || 5,
        salvageValue: initialData.salvageValue || 0,
        location: initialData.location || '',
        assignedTo: initialData.assignedTo?._id || initialData.assignedTo || '',
        supplier: initialData.supplier || '',
        warrantyExpiry: initialData.warrantyExpiry ? new Date(initialData.warrantyExpiry).toISOString().split('T')[0] : '',
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.code) return;
    onSubmit(form);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 max-h-[70vh] overflow-y-auto">
      <div className="grid grid-cols-2 gap-3">
        <Input label="Asset Name *" value={form.name} onChange={e => update('name', e.target.value)} required placeholder="e.g. Toyota Hilux" />
        <Input label="Asset Code *" value={form.code} onChange={e => update('code', e.target.value)} required placeholder="e.g. AST-001" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Category *</label>
        <select value={form.category} onChange={e => update('category', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <h4 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1 pt-1">Purchase</h4>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Purchase Date" type="date" value={form.purchaseDate} onChange={e => update('purchaseDate', e.target.value)} />
        <Input label="Purchase Cost" type="number" value={form.purchaseCost} onChange={e => update('purchaseCost', parseFloat(e.target.value) || 0)} />
      </div>
      <Input label="Supplier" value={form.supplier} onChange={e => update('supplier', e.target.value)} placeholder="Vendor name" />
      <Input label="Warranty Expiry" type="date" value={form.warrantyExpiry} onChange={e => update('warrantyExpiry', e.target.value)} />

      <h4 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1 pt-1">Depreciation</h4>
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Method</label>
        <select value={form.depreciationMethod} onChange={e => update('depreciationMethod', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          {depreciationMethods.map(m => <option key={m} value={m}>{m.replace('_', ' ')}</option>)}
        </select>
      </div>
      {form.depreciationMethod !== 'none' && (
        <div className="grid grid-cols-3 gap-3">
          <Input label="Rate %" type="number" value={form.depreciationRate} onChange={e => update('depreciationRate', parseFloat(e.target.value) || 0)} />
          <Input label="Useful Life (yrs)" type="number" value={form.usefulLifeYears} onChange={e => update('usefulLifeYears', parseFloat(e.target.value) || 0)} />
          <Input label="Salvage Value" type="number" value={form.salvageValue} onChange={e => update('salvageValue', parseFloat(e.target.value) || 0)} />
        </div>
      )}

      <h4 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1 pt-1">Assignment</h4>
      <Input label="Location" value={form.location} onChange={e => update('location', e.target.value)} placeholder="e.g. Office 3, Floor 2" />
      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Assigned To</label>
        <SearchableSelect
          options={users.map(u => ({ value: u._id, label: `${u.firstName} ${u.lastName}` }))}
          value={form.assignedTo}
          onChange={val => update('assignedTo', val)}
          placeholder="Select user..."
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">Notes</label>
        <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none" />
      </div>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" disabled={saving} className="flex-1">{saving ? 'Saving...' : initialData ? 'Update' : 'Create'}</Button>
      </div>
    </form>
  );
};

export default AssetForm;