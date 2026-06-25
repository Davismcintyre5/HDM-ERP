import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';

const RequisitionForm = ({ content, onChange }) => {
  const update = (field, value) => onChange({ ...content, [field]: value });
  const textareaClass = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1";
  const selectClass = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

  const addItem = () => {
    const items = [...(content.items || []), { description: '', quantity: 1, unit: 'pcs', estimatedCost: 0, totalCost: 0 }];
    update('items', items);
  };
  const removeItem = (index) => update('items', content.items.filter((_, i) => i !== index));
  const updateItem = (index, field, value) => {
    const items = content.items.map((item, i) => {
      if (i !== index) return item;
      const updated = { ...item, [field]: value };
      if (field === 'quantity' || field === 'estimatedCost') updated.totalCost = (updated.quantity || 0) * (updated.estimatedCost || 0);
      return updated;
    });
    update('items', items);
  };

  return (
    <div className="space-y-3">
      <div><label className={labelClass}>Requisition Type</label>
        <select value={content.requisitionType || 'purchase'} onChange={e => update('requisitionType', e.target.value)} className={selectClass}>
          <option value="purchase">Purchase</option><option value="stock">Stock</option><option value="asset">Asset</option><option value="service">Service</option><option value="travel">Travel</option>
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Requested By" value={content.requestedBy || ''} onChange={e => update('requestedBy', e.target.value)} />
        <Input label="Department" value={content.department || ''} onChange={e => update('department', e.target.value)} />
      </div>
      <Input label="Subject *" value={content.subject || ''} onChange={e => update('subject', e.target.value)} required />
      <div><label className={labelClass}>Urgency</label>
        <select value={content.urgency || 'normal'} onChange={e => update('urgency', e.target.value)} className={selectClass}>
          <option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option>
        </select>
      </div>
      <Input label="Required By" type="date" value={content.requiredBy || ''} onChange={e => update('requiredBy', e.target.value)} />
      <Input label="Budget Code" value={content.budgetCode || ''} onChange={e => update('budgetCode', e.target.value)} />
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="text-xs font-medium text-gray-700 dark:text-gray-300">Items</label>
          <Button size="sm" variant="ghost" onClick={addItem}><Plus size={12} className="mr-1" /> Add Item</Button>
        </div>
        {(content.items || []).map((item, i) => (
          <div key={i} className="grid grid-cols-12 gap-2 mb-2 items-start p-2 border border-gray-200 dark:border-gray-700 rounded-md">
            <div className="col-span-4"><Input label="Description" value={item.description || ''} onChange={e => updateItem(i, 'description', e.target.value)} /></div>
            <div className="col-span-2"><Input label="Qty" type="number" value={item.quantity || ''} onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value) || 0)} /></div>
            <div className="col-span-2"><Input label="Unit" value={item.unit || ''} onChange={e => updateItem(i, 'unit', e.target.value)} /></div>
            <div className="col-span-2"><Input label="Cost/Unit" type="number" value={item.estimatedCost || ''} onChange={e => updateItem(i, 'estimatedCost', parseFloat(e.target.value) || 0)} /></div>
            <div className="col-span-1 flex items-end pb-1"><span className="text-xs text-gray-500 dark:text-gray-400">{item.totalCost || 0}</span></div>
            <div className="col-span-1 flex items-end pb-1 justify-center"><button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600"><Trash2 size={14} /></button></div>
          </div>
        ))}
      </div>
      <div><label className={labelClass}>Justification</label><textarea value={content.justification || ''} onChange={e => update('justification', e.target.value)} rows={3} className={textareaClass} /></div>
    </div>
  );
};

export default RequisitionForm;