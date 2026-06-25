import Input from '../../../components/ui/Input';

const CircularForm = ({ content, onChange }) => {
  const update = (field, value) => onChange({ ...content, [field]: value });

  return (
    <div className="space-y-3">
      <Input label="Circulated By" value={content.circulatedBy || ''} onChange={e => update('circulatedBy', e.target.value)} />
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Audience</label>
        <select value={content.audience || 'all-departments'} onChange={e => update('audience', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <option value="all-departments">All Departments</option>
          <option value="all-staff">All Staff</option>
          <option value="management">Management</option>
          <option value="specific">Specific</option>
        </select>
      </div>
      <Input label="Subject *" value={content.subject || ''} onChange={e => update('subject', e.target.value)} required />
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label>
        <textarea value={content.body || ''} onChange={e => update('body', e.target.value)} rows={6} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Highlights</label>
        <textarea value={content.highlights || ''} onChange={e => update('highlights', e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Action Items</label>
        <textarea value={content.actionItems || ''} onChange={e => update('actionItems', e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Input label="Contact Person" value={content.contactPerson || ''} onChange={e => update('contactPerson', e.target.value)} />
        <Input label="Contact Email" type="email" value={content.contactEmail || ''} onChange={e => update('contactEmail', e.target.value)} />
      </div>
      <Input label="Expiry Date" type="date" value={content.expiryDate || ''} onChange={e => update('expiryDate', e.target.value)} />
    </div>
  );
};

export default CircularForm;