import { useState, useEffect, useCallback } from 'react';
import { getCommunications, createCommunication, updateCommunication, deleteCommunication, sendCommunication } from '../../api/tenant/communicationsApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import { Plus, Printer, Send, Edit3, Trash2, MessageSquare, Search, X } from 'lucide-react';
import { printContent } from '../../utils/printUtils';
import formatDate from '../../utils/formatDate';
import MemoForm from './forms/MemoForm';
import LetterForm from './forms/LetterForm';
import NoticeForm from './forms/NoticeForm';
import CircularForm from './forms/CircularForm';
import ReportForm from './forms/ReportForm';
import ProposalForm from './forms/ProposalForm';
import RequisitionForm from './forms/RequisitionForm';
import MinutesForm from './forms/MinutesForm';
import { buildPrintHTML } from './printTemplates';

const typeLabels = {
  memo: 'Memo', requisition: 'Requisition', circular: 'Circular',
  letter: 'Letter', notice: 'Notice', report: 'Report',
  proposal: 'Proposal', minutes: 'Minutes'
};

const typeIcons = {
  memo: '📄', requisition: '📋', circular: '📣', letter: '✉️',
  notice: '📌', report: '📊', proposal: '💼', minutes: '📝'
};

const defaultContent = {
  memo: { to: '', from: '', cc: '', subject: '', body: '', classification: 'for-information', isConfidential: false, signature: '', attachments: [] },
  letter: { recipientName: '', recipientTitle: '', recipientCompany: '', recipientAddress: '', salutation: '', subject: '', body: '', closing: 'Sincerely,', senderName: '', senderTitle: '', senderDepartment: '', reference: '', enclosures: '', attachments: [], letterhead: true },
  notice: { issuedBy: '', issuedTo: '', subject: '', noticeDate: new Date().toISOString().split('T')[0], effectiveDate: '', reference: '', body: '', action: '', deadline: '', attachments: [], distribution: 'all-staff' },
  circular: { circulatedBy: '', audience: 'all-departments', subject: '', body: '', highlights: '', actionItems: '', contactPerson: '', contactEmail: '', expiryDate: '', attachments: [] },
  report: { reportType: 'project', preparedBy: '', reviewedBy: '', approvedBy: '', period: '', subject: '', executiveSummary: '', methodology: '', findings: '', analysis: '', recommendations: '', conclusion: '', appendices: '', attachments: [], distribution: 'internal' },
  proposal: { proposalType: 'project', submittedTo: '', submittedBy: '', subject: '', background: '', objective: '', scope: '', methodology: '', timeline: '', costEstimate: '', benefits: '', risks: '', conclusion: '', validUntil: '', attachments: [] },
  requisition: { requisitionType: 'purchase', requestedBy: '', department: '', subject: '', items: [{ description: '', quantity: 1, unit: 'pcs', estimatedCost: 0, totalCost: 0 }], justification: '', urgency: 'normal', requiredBy: '', budgetCode: '', approvalRoute: [], attachments: [] },
  minutes: { meetingType: 'department', meetingTitle: '', date: new Date().toISOString().split('T')[0], startTime: '', endTime: '', venue: '', chairperson: '', secretary: '', attendees: '', apologies: '', agenda: '', discussions: '', decisions: '', actionItems: [{ task: '', responsible: '', deadline: '' }], nextMeetingDate: '', nextMeetingAgenda: '', attachments: [], distribution: 'attendees' }
};

const formComponents = {
  memo: MemoForm, letter: LetterForm, notice: NoticeForm, circular: CircularForm,
  report: ReportForm, proposal: ProposalForm, requisition: RequisitionForm, minutes: MinutesForm
};

const CommunicationsPage = () => {
  const [comms, setComms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [sendId, setSendId] = useState(null);
  const [sendEmail, setSendEmail] = useState('');
  const [formType, setFormType] = useState('memo');
  const [formContent, setFormContent] = useState(defaultContent.memo);
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);

  const fetchComms = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 20 };
      if (activeTab !== 'all') params.type = activeTab;
      if (searchTerm) params.search = searchTerm;
      const res = await getCommunications(params);
      setComms(res.data.data || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch {} finally { setLoading(false); }
  }, [activeTab, searchTerm, page]);

  useEffect(() => { fetchComms(); }, [fetchComms]);

  const openNewForm = (type) => {
    setEditId(null);
    setFormType(type);
    setFormContent(JSON.parse(JSON.stringify(defaultContent[type])));
    setFormTitle('');
    setFormDate(new Date().toISOString().split('T')[0]);
    setShowForm(true);
  };

  const openEditForm = (comm) => {
    setEditId(comm._id);
    setFormType(comm.type);
    setFormContent(JSON.parse(JSON.stringify(comm.content[comm.type] || defaultContent[comm.type])));
    setFormTitle(comm.title);
    setFormDate(comm.date ? new Date(comm.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!formTitle) return setMessage('Title required');
    setSaving(true);
    try {
      const payload = { type: formType, title: formTitle, date: formDate, content: formContent };
      if (editId) await updateCommunication(editId, payload);
      else await createCommunication(payload);
      setShowForm(false); setEditId(null); setMessage('');
      fetchComms();
    } catch (err) { setMessage(err.response?.data?.message || 'Failed'); } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    await deleteCommunication(deleteId); setDeleteId(null); fetchComms();
  };

  const handleSend = async () => {
    if (!sendEmail) return setMessage('Email required');
    await sendCommunication(sendId, sendEmail);
    setSendId(null); setSendEmail('');
    fetchComms();
    setMessage('Email sent!');
  };

  const handlePrint = (comm) => {
    const typeName = typeLabels[comm.type] || 'Document';
    const content = buildPrintHTML(comm.type, comm, comm.content[comm.type] || {});
    printContent(content, { title: `${typeName} — ${comm.referenceNumber}` });
  };

  if (loading && comms.length === 0) return <Spinner />;

  const FormComponent = formComponents[formType] || MemoForm;

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-4 gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Communications</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} documents</p>
        </div>
        <div className="relative group">
          <Button onClick={() => openNewForm('memo')}>
            <Plus size={16} className="mr-1" /> New Document
          </Button>
          <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md shadow-lg z-50 hidden group-hover:block hover:block p-2 w-48">
            {Object.entries(typeLabels).map(([key, label]) => (
              <button key={key} onClick={() => { openNewForm(key); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2">
                <span>{typeIcons[key]}</span> {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Message */}
      {message && <Alert variant="info" message={message} onClose={() => setMessage('')} />}

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
          <input
            type="text" placeholder="Search by title or reference..."
            value={searchTerm} onChange={e => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          {searchTerm && <button onClick={() => setSearchTerm('')} className="absolute right-2 top-1/2 -translate-y-1/2"><X size={14} className="text-gray-400 dark:text-gray-500" /></button>}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        <button onClick={() => { setActiveTab('all'); setPage(1); }} className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === 'all' ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>All</button>
        {Object.entries(typeLabels).map(([key, label]) => (
          <button key={key} onClick={() => { setActiveTab(key); setPage(1); }} className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === key ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {typeIcons[key]} {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {comms.map(c => (
          <Card key={c._id} className="p-4">
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0 flex-1 mr-2">
                <p className="text-xs text-gray-400 dark:text-gray-500 font-mono truncate">{c.referenceNumber}</p>
                <h3 className="font-semibold text-gray-900 dark:text-white truncate">{c.title}</h3>
              </div>
              <Badge variant={c.status === 'sent' ? 'success' : c.status === 'printed' ? 'info' : 'default'}>{c.status}</Badge>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{typeIcons[c.type]} {typeLabels[c.type]} • {formatDate(c.date)}</p>
            <div className="flex gap-1 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button size="sm" variant="ghost" onClick={() => openEditForm(c)}><Edit3 size={12} /></Button>
              <Button size="sm" variant="ghost" onClick={() => handlePrint(c)}><Printer size={12} /></Button>
              <Button size="sm" variant="ghost" onClick={() => { setSendId(c._id); setSendEmail(''); }}><Send size={12} /></Button>
              <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => setDeleteId(c._id)}><Trash2 size={12} /></Button>
            </div>
          </Card>
        ))}
        {comms.length === 0 && (
          <div className="col-span-full text-center py-10 text-gray-400 dark:text-gray-500">
            <MessageSquare size={40} className="mx-auto mb-2 opacity-50" />
            <p>No documents found</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-6">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400">Page {page} of {pages}</span>
          <Button variant="ghost" size="sm" disabled={page >= pages} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}

      {/* Form Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? `Edit ${typeLabels[formType]}` : `New ${typeLabels[formType]}`} size="lg">
        <div className="space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="flex gap-3 flex-wrap sm:flex-nowrap">
            <div className="w-full sm:w-40">
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
              <select value={formType} onChange={e => { setFormType(e.target.value); setFormContent(JSON.parse(JSON.stringify(defaultContent[e.target.value]))); }} className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
                {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{typeIcons[k]} {v}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <Input label="Title *" value={formTitle} onChange={e => setFormTitle(e.target.value)} required />
            </div>
            <div className="w-full sm:w-40">
              <Input label="Date" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
            </div>
          </div>
          <hr className="border-gray-200 dark:border-gray-700" />
          <FormComponent content={formContent} onChange={setFormContent} />
          <div className="flex gap-2 pt-2">
            <Button variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} disabled={saving} className="flex-1">{saving ? 'Saving...' : editId ? 'Update' : 'Save'}</Button>
          </div>
        </div>
      </Modal>

      {/* Send Modal */}
      <Modal open={!!sendId} onClose={() => setSendId(null)} title="Send via Email">
        <Input label="Recipient Email *" type="email" value={sendEmail} onChange={e => setSendEmail(e.target.value)} required />
        <Button onClick={handleSend} className="w-full mt-4">Send Email</Button>
      </Modal>

      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Document" message="Are you sure?" />
    </div>
  );
};

export default CommunicationsPage;