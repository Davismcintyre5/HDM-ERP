import Input from '../../../components/ui/Input';

const NoticeForm = ({ content, onChange }) => {
  const update = (field, value) => onChange({ ...content, [field]: value });

  return (
    <div className="space-y-3">
      <Input label="Issued By" value={content.issuedBy || ''} onChange={e => update('issuedBy', e.target.value)} />
      <Input label="Issued To *" value={content.issuedTo || ''} onChange={e => update('issuedTo', e.target.value)} required />
      <Input label="Subject *" value={content.subject || ''} onChange={e => update('subject', e.target.value)} required />
      <div className="grid grid-cols-2 gap-3">
        <Input label="Notice Date" type="date" value={content.noticeDate || ''} onChange={e => update('noticeDate', e.target.value)} />
        <Input label="Effective Date" type="date" value={content.effectiveDate || ''} onChange={e => update('effectiveDate', e.target.value)} />
      </div>
      <Input label="Reference" value={content.reference || ''} onChange={e => update('reference', e.target.value)} />
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Body</label>
        <textarea value={content.body || ''} onChange={e => update('body', e.target.value)} rows={6} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
      </div>
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Action Required</label>
        <textarea value={content.action || ''} onChange={e => update('action', e.target.value)} rows={2} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" />
      </div>
      <Input label="Deadline" type="date" value={content.deadline || ''} onChange={e => update('deadline', e.target.value)} />
      <div>
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Distribution</label>
        <select value={content.distribution || 'all-staff'} onChange={e => update('distribution', e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
          <option value="all-staff">All Staff</option>
          <option value="department">Department</option>
          <option value="specific">Specific</option>
        </select>
      </div>
    </div>
  );
};

export default NoticeForm;