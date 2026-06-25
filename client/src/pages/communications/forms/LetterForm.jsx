import Input from '../../../components/ui/Input';

const LetterForm = ({ content, onChange }) => {
  const update = (field, value) => onChange({ ...content, [field]: value });
  const ta = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
  const lbl = "block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="space-y-3">
      <h4 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1">Recipient Details</h4>
      <Input label="Recipient Full Name" required value={content.recipientName || ''} onChange={e => update('recipientName', e.target.value)} placeholder="e.g. Mr. Robert Kamanzi" />
      <Input label="Recipient Job Title" value={content.recipientTitle || ''} onChange={e => update('recipientTitle', e.target.value)} placeholder="e.g. Managing Director" />
      <Input label="Recipient Company / Organization" value={content.recipientCompany || ''} onChange={e => update('recipientCompany', e.target.value)} placeholder="e.g. ABC Ltd" />
      <div>
        <label className={lbl}>Recipient Postal Address</label>
        <textarea value={content.recipientAddress || ''} onChange={e => update('recipientAddress', e.target.value)} rows={2} className={ta} placeholder="P.O. Box 1234&#10;Kigali, Rwanda" />
      </div>

      <h4 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1 pt-2">Letter Content</h4>
      <Input label="Salutation" required value={content.salutation || ''} onChange={e => update('salutation', e.target.value)} placeholder="e.g. Dear Mr. Kamanzi," />
      <Input label="Subject / Reference Line" required value={content.subject || ''} onChange={e => update('subject', e.target.value)} placeholder="e.g. RE: Proposal for IT Consultancy Services" />
      <div>
        <label className={lbl}>Body of Letter <span className="text-red-500">*</span></label>
        <textarea value={content.body || ''} onChange={e => update('body', e.target.value)} rows={8} className={ta} placeholder="Write your letter content here..." />
      </div>
      <Input label="Closing Salutation" value={content.closing || 'Sincerely,'} onChange={e => update('closing', e.target.value)} placeholder="e.g. Sincerely," />

      <h4 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1 pt-2">Sender Details</h4>
      <Input label="Sender Full Name" value={content.senderName || ''} onChange={e => update('senderName', e.target.value)} placeholder="e.g. Alice Uwimana" />
      <Input label="Sender Job Title" value={content.senderTitle || ''} onChange={e => update('senderTitle', e.target.value)} placeholder="e.g. CEO" />
      <Input label="Sender Department" value={content.senderDepartment || ''} onChange={e => update('senderDepartment', e.target.value)} placeholder="e.g. Administration" />

      <h4 className="text-sm font-bold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1 pt-2">Additional</h4>
      <Input label="Your Reference Number" value={content.reference || ''} onChange={e => update('reference', e.target.value)} placeholder="e.g. HDM/2026/001" />
      <Input label="Enclosures (e.g. Brochure, Invoice)" value={content.enclosures || ''} onChange={e => update('enclosures', e.target.value)} placeholder="e.g. Encl: Company Profile, Quotation" />
      <div className="flex items-center gap-2">
        <input type="checkbox" id="letter-lh" checked={content.letterhead !== false} onChange={e => update('letterhead', e.target.checked)} className="rounded border-gray-300 dark:border-gray-600" />
        <label htmlFor="letter-lh" className="text-sm text-gray-700 dark:text-gray-300 font-medium">Print on Company Letterhead</label>
      </div>
      <Input label="Attachments (comma-separated URLs)" value={(content.attachments || []).join(', ')} onChange={e => update('attachments', e.target.value.split(',').map(s => s.trim()).filter(Boolean))} placeholder="https://..." />
    </div>
  );
};

export default LetterForm;