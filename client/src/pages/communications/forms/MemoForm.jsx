import Input from '../../../components/ui/Input';

const MemoForm = ({ content, onChange }) => {
  const update = (field, value) => onChange({ ...content, [field]: value });
  const ta = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
  const lbl = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";
  const sel = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

  return (
    <div className="space-y-3">
      <Input label="To (Recipient Name or Department)" required value={content.to || ''} onChange={e => update('to', e.target.value)} placeholder="e.g. John Doe, Finance Dept" />
      <Input label="From (Sender Name)" value={content.from || ''} onChange={e => update('from', e.target.value)} placeholder="e.g. Jane Smith" />
      <Input label="CC (Carbon Copy)" value={content.cc || ''} onChange={e => update('cc', e.target.value)} placeholder="e.g. manager@company.com" />
      <Input label="Subject" required value={content.subject || ''} onChange={e => update('subject', e.target.value)} placeholder="Brief subject of the memo" />
      <div>
        <label className={lbl}>Body / Message <span className="text-red-500">*</span></label>
        <textarea value={content.body || ''} onChange={e => update('body', e.target.value)} rows={6} className={ta} placeholder="Write your memo content here..." />
      </div>
      <div>
        <label className={lbl}>Classification</label>
        <select value={content.classification || 'for-information'} onChange={e => update('classification', e.target.value)} className={sel}>
          <option value="action-required">Action Required</option>
          <option value="for-review">For Review</option>
          <option value="for-information">For Information</option>
        </select>
      </div>
      <div className="flex items-center gap-2">
        <input type="checkbox" id="memo-conf" checked={content.isConfidential || false} onChange={e => update('isConfidential', e.target.checked)} className="rounded border-gray-300 dark:border-gray-600" />
        <label htmlFor="memo-conf" className="text-sm text-gray-700 dark:text-gray-300 font-medium">Mark as Confidential</label>
      </div>
      <Input label="Signature (Printed Name)" value={content.signature || ''} onChange={e => update('signature', e.target.value)} placeholder="e.g. Jane Smith, HR Manager" />
      <Input label="Attachments (comma-separated URLs)" value={(content.attachments || []).join(', ')} onChange={e => update('attachments', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="https://..." />
    </div>
  );
};

export default MemoForm;