import Input from '../../../components/ui/Input';

const ProposalForm = ({ content, onChange }) => {
  const update = (field, value) => onChange({ ...content, [field]: value });
  const textareaClass = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1";
  const selectClass = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

  return (
    <div className="space-y-3">
      <div><label className={labelClass}>Proposal Type</label>
        <select value={content.proposalType || 'project'} onChange={e => update('proposalType', e.target.value)} className={selectClass}>
          <option value="project">Project</option><option value="budget">Budget</option><option value="partnership">Partnership</option><option value="service">Service</option><option value="product">Product</option>
        </select>
      </div>
      <Input label="Submitted To *" value={content.submittedTo || ''} onChange={e => update('submittedTo', e.target.value)} required />
      <Input label="Submitted By" value={content.submittedBy || ''} onChange={e => update('submittedBy', e.target.value)} />
      <Input label="Subject *" value={content.subject || ''} onChange={e => update('subject', e.target.value)} required />
      <div><label className={labelClass}>Background</label><textarea value={content.background || ''} onChange={e => update('background', e.target.value)} rows={3} className={textareaClass} /></div>
      <div><label className={labelClass}>Objective</label><textarea value={content.objective || ''} onChange={e => update('objective', e.target.value)} rows={3} className={textareaClass} /></div>
      <div><label className={labelClass}>Scope of Work</label><textarea value={content.scope || ''} onChange={e => update('scope', e.target.value)} rows={3} className={textareaClass} /></div>
      <div><label className={labelClass}>Methodology</label><textarea value={content.methodology || ''} onChange={e => update('methodology', e.target.value)} rows={2} className={textareaClass} /></div>
      <div><label className={labelClass}>Timeline</label><textarea value={content.timeline || ''} onChange={e => update('timeline', e.target.value)} rows={2} className={textareaClass} /></div>
      <div><label className={labelClass}>Cost Estimate</label><textarea value={content.costEstimate || ''} onChange={e => update('costEstimate', e.target.value)} rows={2} className={textareaClass} /></div>
      <div><label className={labelClass}>Benefits</label><textarea value={content.benefits || ''} onChange={e => update('benefits', e.target.value)} rows={2} className={textareaClass} /></div>
      <div><label className={labelClass}>Risks & Mitigation</label><textarea value={content.risks || ''} onChange={e => update('risks', e.target.value)} rows={2} className={textareaClass} /></div>
      <div><label className={labelClass}>Conclusion</label><textarea value={content.conclusion || ''} onChange={e => update('conclusion', e.target.value)} rows={2} className={textareaClass} /></div>
      <Input label="Valid Until" type="date" value={content.validUntil || ''} onChange={e => update('validUntil', e.target.value)} />
    </div>
  );
};

export default ProposalForm;