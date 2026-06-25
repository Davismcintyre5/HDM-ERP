import formatDate from '../../utils/formatDate';

export function buildPrintHTML(type, comm, c) {
  const typeName = typeLabels[type] || 'Document';
  const ref = comm.referenceNumber || '';
  const date = formatDate(comm.date);

  let html = `
    <h2 style="text-align:center;color:#10B981;margin-bottom:5px;font-size:16px;">${typeName.toUpperCase()}</h2>
    <p style="text-align:center;font-size:11px;color:#666;margin-bottom:15px;">Ref: ${ref} &nbsp;|&nbsp; Date: ${date}</p>
    <hr style="border-color:#e5e7eb;margin-bottom:15px;">`;

  switch (type) {
    case 'memo': html += buildMemoHTML(c); break;
    case 'letter': html += buildLetterHTML(c); break;
    case 'notice': html += buildNoticeHTML(c); break;
    case 'circular': html += buildCircularHTML(c); break;
    case 'report': html += buildReportHTML(c); break;
    case 'proposal': html += buildProposalHTML(c); break;
    case 'requisition': html += buildRequisitionHTML(c); break;
    case 'minutes': html += buildMinutesHTML(c); break;
    default: html += `<p>${JSON.stringify(c)}</p>`;
  }

  html += `<hr style="border-color:#e5e7eb;margin-top:15px;">`;
  return html;
}

// ── MEMO ──
const buildMemoHTML = (c) => `
  <table style="width:100%;margin-bottom:12px;font-size:12px;">
    <tr><td style="width:90px;font-weight:bold;padding:3px 0;">TO:</td><td style="padding:3px 0;">${c.to || '—'}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">FROM:</td><td style="padding:3px 0;">${c.from || '—'}</td></tr>
    ${c.cc ? `<tr><td style="font-weight:bold;padding:3px 0;">CC:</td><td style="padding:3px 0;">${c.cc}</td></tr>` : ''}
    <tr><td style="font-weight:bold;padding:3px 0;">SUBJECT:</td><td style="padding:3px 0;">${c.subject || '—'}</td></tr>
  </table>
  <hr style="border-color:#eee;">
  <div style="margin:12px 0;font-size:13px;line-height:1.6;">${(c.body || '').replace(/\n/g, '<br>')}</div>
  <hr style="border-color:#eee;">
  <p style="font-size:12px;margin-top:8px;">${c.signature || ''}</p>
  <p style="font-size:11px;color:#666;">
    Classification: ${classificationLabel(c.classification)}
    ${c.isConfidential ? ' &nbsp;|&nbsp; <strong style="color:red;">CONFIDENTIAL</strong>' : ''}
  </p>`;

// ── LETTER ──
const buildLetterHTML = (c) => `
  <div style="font-size:12px;margin-bottom:8px;">
    <p style="margin:0;">${c.recipientName || ''}${c.recipientTitle ? ', ' + c.recipientTitle : ''}</p>
    <p style="margin:0;">${c.recipientCompany || ''}</p>
    <p style="margin:0;white-space:pre-line;">${c.recipientAddress || ''}</p>
  </div>
  <p style="font-size:11px;margin:8px 0;">${c.reference ? 'Your Ref: ' + c.reference + '<br>' : ''}${new Date().toLocaleDateString()}</p>
  <p style="font-size:12px;margin:8px 0;">${c.salutation || ''}</p>
  <p style="font-size:12px;font-weight:bold;margin:8px 0;">RE: ${c.subject || ''}</p>
  <div style="margin:12px 0;font-size:13px;line-height:1.6;">${(c.body || '').replace(/\n/g, '<br>')}</div>
  <p style="font-size:12px;margin:20px 0 5px 0;">${c.closing || ''}</p>
  <p style="font-size:12px;margin:30px 0 0 0;">${c.senderName || ''}</p>
  <p style="font-size:12px;margin:0;">${c.senderTitle || ''}</p>
  <p style="font-size:12px;margin:0;">${c.senderDepartment || ''}</p>
  ${c.enclosures ? `<p style="font-size:11px;margin-top:8px;">${c.enclosures}</p>` : ''}`;

// ── NOTICE ──
const buildNoticeHTML = (c) => `
  <table style="width:100%;margin-bottom:12px;font-size:12px;">
    <tr><td style="width:100px;font-weight:bold;padding:3px 0;">ISSUED BY:</td><td style="padding:3px 0;">${c.issuedBy || '—'}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">ISSUED TO:</td><td style="padding:3px 0;">${c.issuedTo || '—'}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">SUBJECT:</td><td style="padding:3px 0;">${c.subject || '—'}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">NOTICE DATE:</td><td style="padding:3px 0;">${c.noticeDate || ''}</td></tr>
    ${c.effectiveDate ? `<tr><td style="font-weight:bold;padding:3px 0;">EFFECTIVE:</td><td style="padding:3px 0;">${c.effectiveDate}</td></tr>` : ''}
    ${c.reference ? `<tr><td style="font-weight:bold;padding:3px 0;">REF:</td><td style="padding:3px 0;">${c.reference}</td></tr>` : ''}
  </table>
  <hr style="border-color:#eee;">
  <div style="margin:12px 0;font-size:13px;line-height:1.6;">${(c.body || '').replace(/\n/g, '<br>')}</div>
  ${c.action ? `<div style="margin:12px 0;padding:10px;background:#fef3c7;border-radius:4px;font-size:12px;"><strong>ACTION REQUIRED:</strong><br>${c.action}${c.deadline ? '<br><strong>Deadline:</strong> ' + c.deadline : ''}</div>` : ''}
  <p style="font-size:11px;color:#666;">Distribution: ${distributionLabel(c.distribution)}</p>`;

// ── CIRCULAR ──
const buildCircularHTML = (c) => `
  <table style="width:100%;margin-bottom:12px;font-size:12px;">
    <tr><td style="width:110px;font-weight:bold;padding:3px 0;">CIRCULATED BY:</td><td style="padding:3px 0;">${c.circulatedBy || '—'}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">TO:</td><td style="padding:3px 0;">${audienceLabel(c.audience)}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">SUBJECT:</td><td style="padding:3px 0;">${c.subject || '—'}</td></tr>
    ${c.expiryDate ? `<tr><td style="font-weight:bold;padding:3px 0;">VALID UNTIL:</td><td style="padding:3px 0;">${c.expiryDate}</td></tr>` : ''}
  </table>
  <hr style="border-color:#eee;">
  <div style="margin:12px 0;font-size:13px;line-height:1.6;">${(c.body || '').replace(/\n/g, '<br>')}</div>
  ${c.highlights ? `<div style="margin:10px 0;padding:10px;background:#f0fdf4;border-radius:4px;font-size:12px;"><strong>HIGHLIGHTS:</strong><br>${c.highlights}</div>` : ''}
  ${c.actionItems ? `<div style="margin:10px 0;font-size:12px;"><strong>ACTION ITEMS:</strong><br>${c.actionItems}</div>` : ''}
  ${c.contactPerson ? `<p style="font-size:11px;color:#666;">For queries: ${c.contactPerson} ${c.contactEmail ? 'ΓÇö ' + c.contactEmail : ''}</p>` : ''}`;

// ── REPORT ──
const buildReportHTML = (c) => `
  <p style="font-size:12px;"><strong>Type:</strong> ${reportTypeLabel(c.reportType)} &nbsp;|&nbsp; <strong>Period:</strong> ${c.period || '—'} &nbsp;|&nbsp; <strong>Distribution:</strong> ${distributionLabel(c.distribution)}</p>
  <table style="width:100%;margin-bottom:12px;font-size:12px;">
    <tr><td style="width:110px;font-weight:bold;padding:3px 0;">PREPARED BY:</td><td style="padding:3px 0;">${c.preparedBy || '—'}</td></tr>
    ${c.reviewedBy ? `<tr><td style="font-weight:bold;padding:3px 0;">REVIEWED BY:</td><td style="padding:3px 0;">${c.reviewedBy}</td></tr>` : ''}
    ${c.approvedBy ? `<tr><td style="font-weight:bold;padding:3px 0;">APPROVED BY:</td><td style="padding:3px 0;">${c.approvedBy}</td></tr>` : ''}
  </table>
  <hr style="border-color:#eee;">
  <h3 style="font-size:13px;margin:10px 0 4px 0;">1. Executive Summary</h3>
  <div style="font-size:12px;line-height:1.6;">${(c.executiveSummary || '').replace(/\n/g, '<br>')}</div>
  ${c.methodology ? `<h3 style="font-size:13px;margin:10px 0 4px 0;">2. Methodology</h3><div style="font-size:12px;line-height:1.6;">${c.methodology.replace(/\n/g, '<br>')}</div>` : ''}
  <h3 style="font-size:13px;margin:10px 0 4px 0;">${c.methodology ? '3' : '2'}. Findings</h3>
  <div style="font-size:12px;line-height:1.6;">${(c.findings || '').replace(/\n/g, '<br>')}</div>
  ${c.analysis ? `<h3 style="font-size:13px;margin:10px 0 4px 0;">${c.methodology ? '4' : '3'}. Analysis</h3><div style="font-size:12px;line-height:1.6;">${c.analysis.replace(/\n/g, '<br>')}</div>` : ''}
  <h3 style="font-size:13px;margin:10px 0 4px 0;">Recommendations</h3>
  <div style="font-size:12px;line-height:1.6;">${(c.recommendations || '').replace(/\n/g, '<br>')}</div>
  ${c.conclusion ? `<h3 style="font-size:13px;margin:10px 0 4px 0;">Conclusion</h3><div style="font-size:12px;line-height:1.6;">${c.conclusion.replace(/\n/g, '<br>')}</div>` : ''}
  ${c.appendices ? `<h3 style="font-size:13px;margin:10px 0 4px 0;">Appendices</h3><div style="font-size:12px;line-height:1.6;">${c.appendices.replace(/\n/g, '<br>')}</div>` : ''}`;

// ── PROPOSAL ──
const buildProposalHTML = (c) => `
  <p style="font-size:12px;"><strong>Type:</strong> ${proposalTypeLabel(c.proposalType)}</p>
  <table style="width:100%;margin-bottom:12px;font-size:12px;">
    <tr><td style="width:110px;font-weight:bold;padding:3px 0;">SUBMITTED TO:</td><td style="padding:3px 0;">${c.submittedTo || '—'}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">SUBMITTED BY:</td><td style="padding:3px 0;">${c.submittedBy || '—'}</td></tr>
    ${c.validUntil ? `<tr><td style="font-weight:bold;padding:3px 0;">VALID UNTIL:</td><td style="padding:3px 0;">${c.validUntil}</td></tr>` : ''}
  </table>
  <hr style="border-color:#eee;">
  <h3 style="font-size:13px;margin:10px 0 4px 0;">1. Background</h3><div style="font-size:12px;line-height:1.6;">${(c.background || '').replace(/\n/g, '<br>')}</div>
  <h3 style="font-size:13px;margin:10px 0 4px 0;">2. Objective</h3><div style="font-size:12px;line-height:1.6;">${(c.objective || '').replace(/\n/g, '<br>')}</div>
  <h3 style="font-size:13px;margin:10px 0 4px 0;">3. Scope of Work</h3><div style="font-size:12px;line-height:1.6;">${(c.scope || '').replace(/\n/g, '<br>')}</div>
  ${c.methodology ? `<h3 style="font-size:13px;margin:10px 0 4px 0;">4. Methodology</h3><div style="font-size:12px;line-height:1.6;">${c.methodology.replace(/\n/g, '<br>')}</div>` : ''}
  ${c.timeline ? `<h3 style="font-size:13px;margin:10px 0 4px 0;">Timeline</h3><div style="font-size:12px;line-height:1.6;">${c.timeline.replace(/\n/g, '<br>')}</div>` : ''}
  <h3 style="font-size:13px;margin:10px 0 4px 0;">Cost Estimate</h3><div style="font-size:12px;line-height:1.6;">${(c.costEstimate || '').replace(/\n/g, '<br>')}</div>
  ${c.benefits ? `<h3 style="font-size:13px;margin:10px 0 4px 0;">Benefits</h3><div style="font-size:12px;line-height:1.6;">${c.benefits.replace(/\n/g, '<br>')}</div>` : ''}
  ${c.risks ? `<h3 style="font-size:13px;margin:10px 0 4px 0;">Risks & Mitigation</h3><div style="font-size:12px;line-height:1.6;">${c.risks.replace(/\n/g, '<br>')}</div>` : ''}
  <h3 style="font-size:13px;margin:10px 0 4px 0;">Conclusion</h3><div style="font-size:12px;line-height:1.6;">${(c.conclusion || '').replace(/\n/g, '<br>')}</div>`;

// ── REQUISITION ──
const buildRequisitionHTML = (c) => `
  <p style="font-size:12px;"><strong>Type:</strong> ${requisitionTypeLabel(c.requisitionType)} &nbsp;|&nbsp; <strong>Urgency:</strong> ${(c.urgency || 'normal').toUpperCase()}</p>
  <table style="width:100%;margin-bottom:12px;font-size:12px;">
    <tr><td style="width:110px;font-weight:bold;padding:3px 0;">REQUESTED BY:</td><td style="padding:3px 0;">${c.requestedBy || '—'}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">DEPARTMENT:</td><td style="padding:3px 0;">${c.department || '—'}</td></tr>
    ${c.requiredBy ? `<tr><td style="font-weight:bold;padding:3px 0;">REQUIRED BY:</td><td style="padding:3px 0;">${c.requiredBy}</td></tr>` : ''}
    ${c.budgetCode ? `<tr><td style="font-weight:bold;padding:3px 0;">BUDGET CODE:</td><td style="padding:3px 0;">${c.budgetCode}</td></tr>` : ''}
  </table>
  <hr style="border-color:#eee;">
  ${c.items && c.items.length > 0 ? `
    <table style="width:100%;border-collapse:collapse;margin:10px 0;font-size:11px;">
      <tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:5px;">#</th><th style="border:1px solid #ddd;padding:5px;">Description</th><th style="border:1px solid #ddd;padding:5px;">Qty</th><th style="border:1px solid #ddd;padding:5px;">Unit</th><th style="border:1px solid #ddd;padding:5px;">Total</th></tr>
      ${c.items.map((item, i) => `<tr><td style="border:1px solid #ddd;padding:5px;">${i + 1}</td><td style="border:1px solid #ddd;padding:5px;">${item.description}</td><td style="border:1px solid #ddd;padding:5px;">${item.quantity}</td><td style="border:1px solid #ddd;padding:5px;">${item.unit}</td><td style="border:1px solid #ddd;padding:5px;">${item.totalCost || ''}</td></tr>`).join('')}
    </table>
  ` : ''}
  <h3 style="font-size:13px;margin:10px 0 4px 0;">Justification</h3>
  <div style="font-size:12px;line-height:1.6;">${(c.justification || '').replace(/\n/g, '<br>')}</div>`;

// ── MINUTES ──
const buildMinutesHTML = (c) => `
  <p style="font-size:12px;"><strong>Type:</strong> ${meetingTypeLabel(c.meetingType)}</p>
  <table style="width:100%;margin-bottom:12px;font-size:12px;">
    <tr><td style="width:90px;font-weight:bold;padding:3px 0;">MEETING:</td><td style="padding:3px 0;">${c.meetingTitle || '—'}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">DATE:</td><td style="padding:3px 0;">${c.date || ''}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">TIME:</td><td style="padding:3px 0;">${c.startTime || ''} ${c.endTime ? 'ΓÇö ' + c.endTime : ''}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">VENUE:</td><td style="padding:3px 0;">${c.venue || '—'}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">CHAIR:</td><td style="padding:3px 0;">${c.chairperson || '—'}</td></tr>
    <tr><td style="font-weight:bold;padding:3px 0;">SECRETARY:</td><td style="padding:3px 0;">${c.secretary || '—'}</td></tr>
  </table>
  <p style="font-size:12px;"><strong>Attendees:</strong><br>${(c.attendees || '').replace(/\n/g, '<br>')}</p>
  ${c.apologies ? `<p style="font-size:12px;"><strong>Apologies:</strong><br>${c.apologies.replace(/\n/g, '<br>')}</p>` : ''}
  <hr style="border-color:#eee;">
  <h3 style="font-size:13px;margin:10px 0 4px 0;">1. Agenda</h3><div style="font-size:12px;line-height:1.6;">${(c.agenda || '').replace(/\n/g, '<br>')}</div>
  <h3 style="font-size:13px;margin:10px 0 4px 0;">2. Discussions</h3><div style="font-size:12px;line-height:1.6;">${(c.discussions || '').replace(/\n/g, '<br>')}</div>
  <h3 style="font-size:13px;margin:10px 0 4px 0;">3. Decisions</h3><div style="font-size:12px;line-height:1.6;">${(c.decisions || '').replace(/\n/g, '<br>')}</div>
  ${c.actionItems && c.actionItems.length > 0 ? `
    <h3 style="font-size:13px;margin:10px 0 4px 0;">4. Action Items</h3>
    <table style="width:100%;border-collapse:collapse;margin:8px 0;font-size:11px;">
      <tr style="background:#f5f5f5;"><th style="border:1px solid #ddd;padding:5px;">#</th><th style="border:1px solid #ddd;padding:5px;">Task</th><th style="border:1px solid #ddd;padding:5px;">Responsible</th><th style="border:1px solid #ddd;padding:5px;">Deadline</th></tr>
      ${c.actionItems.map((ai, i) => `<tr><td style="border:1px solid #ddd;padding:5px;">${i + 1}</td><td style="border:1px solid #ddd;padding:5px;">${ai.task}</td><td style="border:1px solid #ddd;padding:5px;">${ai.responsible}</td><td style="border:1px solid #ddd;padding:5px;">${ai.deadline || ''}</td></tr>`).join('')}
    </table>
  ` : ''}
  ${c.nextMeetingDate ? `<p style="font-size:12px;"><strong>Next Meeting:</strong> ${c.nextMeetingDate}</p>` : ''}
  ${c.nextMeetingAgenda ? `<p style="font-size:12px;"><strong>Tentative Agenda:</strong><br>${c.nextMeetingAgenda}</p>` : ''}
  <p style="font-size:11px;color:#666;">Distribution: ${distributionLabel(c.distribution)}</p>`;

// ── Labels ──
const typeLabels = { memo: 'Memo', requisition: 'Requisition', circular: 'Circular', letter: 'Letter', notice: 'Notice', report: 'Report', proposal: 'Proposal', minutes: 'Minutes' };
const classificationLabel = (v) => ({ 'action-required': 'Action Required', 'for-review': 'For Review', 'for-information': 'For Information' }[v] || v);
const distributionLabel = (v) => ({ 'all-staff': 'All Staff', 'department': 'Department', 'specific': 'Specific', 'internal': 'Internal', 'client': 'Client', 'board': 'Board', 'public': 'Public', 'attendees': 'Attendees Only' }[v] || v);
const audienceLabel = (v) => ({ 'all-departments': 'All Departments', 'all-staff': 'All Staff', 'management': 'Management', 'specific': 'Specific' }[v] || v);
const reportTypeLabel = (v) => ({ monthly: 'Monthly', quarterly: 'Quarterly', annual: 'Annual', project: 'Project', incident: 'Incident', audit: 'Audit' }[v] || v);
const proposalTypeLabel = (v) => ({ project: 'Project', budget: 'Budget', partnership: 'Partnership', service: 'Service', product: 'Product' }[v] || v);
const requisitionTypeLabel = (v) => ({ purchase: 'Purchase', stock: 'Stock', asset: 'Asset', service: 'Service', travel: 'Travel' }[v] || v);
const meetingTypeLabel = (v) => ({ board: 'Board', management: 'Management', department: 'Department', committee: 'Committee', project: 'Project', agm: 'AGM' }[v] || v);