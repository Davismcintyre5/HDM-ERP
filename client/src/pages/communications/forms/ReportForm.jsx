import Input from '../../../components/ui/Input';

const ReportForm = ({ content, onChange }) => {
  const update = (field, value) => onChange({ ...content, [field]: value });

  const textareaClass = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none focus:ring-2 focus:ring-primary-500 focus:border-transparent";
  const labelClass = "block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1";
  const selectClass = "w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white";

  return (
    <div className="space-y-3">
      <div>
        <label className={labelClass}>Report Type</label>
        <select value={content.reportType || 'project'} onChange={e => update('reportType', e.target.value)} className={selectClass}>
          <option value="monthly">Monthly</option>
          <option value="quarterly">Quarterly</option>
          <option value="annual">Annual</option>
          <option value="project">Project</option>
          <option value="incident">Incident</option>
          <option value="audit">Audit</option>
        </select>
      </div>
      <Input label="Period" value={content.period || ''} onChange={e => update('period', e.target.value)} placeholder="e.g., Q3 2026" />
      <div className="grid grid-cols-3 gap-3">
        <Input label="Prepared By" value={content.preparedBy || ''} onChange={e => update('preparedBy', e.target.value)} />
        <Input label="Reviewed By" value={content.reviewedBy || ''} onChange={e => update('reviewedBy', e.target.value)} />
        <Input label="Approved By" value={content.approvedBy || ''} onChange={e => update('approvedBy', e.target.value)} />
      </div>
      <Input label="Subject *" value={content.subject || ''} onChange={e => update('subject', e.target.value)} required />
      <div><label className={labelClass}>Executive Summary</label><textarea value={content.executiveSummary || ''} onChange={e => update('executiveSummary', e.target.value)} rows={3} className={textareaClass} /></div>
      <div><label className={labelClass}>Methodology</label><textarea value={content.methodology || ''} onChange={e => update('methodology', e.target.value)} rows={2} className={textareaClass} /></div>
      <div><label className={labelClass}>Findings</label><textarea value={content.findings || ''} onChange={e => update('findings', e.target.value)} rows={3} className={textareaClass} /></div>
      <div><label className={labelClass}>Analysis</label><textarea value={content.analysis || ''} onChange={e => update('analysis', e.target.value)} rows={3} className={textareaClass} /></div>
      <div><label className={labelClass}>Recommendations</label><textarea value={content.recommendations || ''} onChange={e => update('recommendations', e.target.value)} rows={3} className={textareaClass} /></div>
      <div><label className={labelClass}>Conclusion</label><textarea value={content.conclusion || ''} onChange={e => update('conclusion', e.target.value)} rows={2} className={textareaClass} /></div>
      <div><label className={labelClass}>Appendices</label><textarea value={content.appendices || ''} onChange={e => update('appendices', e.target.value)} rows={2} className={textareaClass} /></div>
      <div>
        <label className={labelClass}>Distribution</label>
        <select value={content.distribution || 'internal'} onChange={e => update('distribution', e.target.value)} className={selectClass}>
          <option value="internal">Internal</option><option value="client">Client</option><option value="board">Board</option><option value="public">Public</option>
        </select>
      </div>
    </div>
  );
};

export default ReportForm;