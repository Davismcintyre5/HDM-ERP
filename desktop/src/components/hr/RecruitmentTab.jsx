import { useState, useEffect } from 'react';
import { postJob, getJobs } from '../../api/tenant/hrApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Card from '../../components/ui/Card';
import { Plus, Briefcase, MapPin, Clock, Eye, Printer, Share2, Trash2, Ban } from 'lucide-react';
import formatDate from '../../utils/formatDate';
import api from '../../api/axios';

const emptyForm = { title: '', department: '', type: 'full_time', location: '', salary: '', description: '', duties: '', qualifications: '', requirements: '', applicationMethod: '', applicationLink: '', startDate: '', endDate: '' };

const getApplicationText = (job) => {
  const endDate = formatDate(job.endDate);
  const link = job.applicationLink || '';
  switch (job.applicationMethod) {
    case 'email': return `Interested candidates are required to submit their application via email to ${link} on or before ${endDate}.`;
    case 'online': return `Interested candidates are required to submit their application through our online portal at ${link} on or before ${endDate}.`;
    case 'hand_delivery': return `Interested candidates are required to hand deliver their application to ${link} on or before ${endDate}.`;
    case 'both': return `Interested candidates are required to submit their application via email to ${link} or hand deliver on or before ${endDate}.`;
    default: return '';
  }
};

const RecruitmentTab = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [viewJob, setViewJob] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  useEffect(() => { getJobs().then(res => setJobs(res.data.data || [])).finally(() => setLoading(false)); }, []);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title || !form.department) return setMessage({ type: 'error', text: 'Title and department required.' });
    setSaving(true);
    try {
      if (editId) { await api.put(`/tenant/hr/recruitment/${editId}`, form); setMessage({ type: 'success', text: 'Job updated.' }); }
      else { await postJob(form); setMessage({ type: 'success', text: 'Job posted.' }); }
      setShowForm(false); setEditId(null); setForm(emptyForm);
      getJobs().then(res => setJobs(res.data.data || []));
    } catch { setMessage({ type: 'error', text: 'Failed.' }); } finally { setSaving(false); }
  };

  const handleDelete = async () => { try { await api.delete(`/tenant/hr/recruitment/${deleteId}`); setDeleteId(null); getJobs().then(res => setJobs(res.data.data || [])); } catch {} };
  const handleClose = async (id) => { try { await api.put(`/tenant/hr/recruitment/${id}/close`); getJobs().then(res => setJobs(res.data.data || [])); } catch {} };

  const handlePrint = (job) => {
    const content = `
      <div style="text-align:center;margin-bottom:20px;">
        <h1 style="color:#10B981;margin:0;">${job.title}</h1>
        <p style="color:#555;margin:4px 0;">${job.department} • ${job.type} • ${job.location || 'N/A'}</p>
        ${job.salary ? `<p style="color:#10B981;font-weight:bold;margin:4px 0;">${job.salary}</p>` : ''}
      </div>
      <div style="margin-bottom:20px;"><h3 style="color:#111;border-bottom:1px solid #10B981;padding-bottom:4px;">Job Description</h3><p>${job.description || 'N/A'}</p></div>
      <div style="margin-bottom:20px;"><h3 style="color:#111;border-bottom:1px solid #10B981;padding-bottom:4px;">Key Duties & Responsibilities</h3><ol>${(job.duties || '').split('\n').filter(Boolean).map(d => `<li>${d}</li>`).join('')}</ol></div>
      <div style="margin-bottom:20px;"><h3 style="color:#111;border-bottom:1px solid #10B981;padding-bottom:4px;">Qualifications</h3><ol>${(job.qualifications || '').split('\n').filter(Boolean).map(q => `<li>${q}</li>`).join('')}</ol></div>
      ${job.requirements ? `<div style="margin-bottom:20px;"><h3 style="color:#111;border-bottom:1px solid #10B981;padding-bottom:4px;">Requirements</h3><ol>${job.requirements.split('\n').filter(Boolean).map(r => `<li>${r}</li>`).join('')}</ol></div>` : ''}
      ${job.applicationMethod ? `<div style="margin-bottom:20px;"><h3 style="color:#111;border-bottom:1px solid #10B981;padding-bottom:4px;">How to Apply</h3><p>${getApplicationText(job)}</p></div>` : ''}
      <p style="text-align:center;font-size:11px;color:#888;">Application Period: ${formatDate(job.startDate)} – ${formatDate(job.endDate)}</p>
    `;
    import('../../utils/printUtils').then(m => m.printContent(content, { title: `Job: ${job.title}` }));
  };

  const handleShare = (job) => {
    if (navigator.share) navigator.share({ title: job.title, text: `${job.title}\n${job.department}\n${job.location || ''}\nApply by: ${formatDate(job.endDate)}` });
    else handlePrint(job);
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><p className="text-sm text-gray-500 dark:text-gray-400">{jobs.length} openings</p><Button size="sm" onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }}><Plus size={14} className="mr-1" /> Post Job</Button></div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {jobs.map(j => (
          <Card key={j._id} className="p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start gap-3 mb-3"><div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900 flex items-center justify-center"><Briefcase size={20} className="text-primary-500" /></div><div className="flex-1 min-w-0"><h3 className="font-semibold text-gray-900 dark:text-white truncate">{j.title}</h3><p className="text-xs text-gray-500 dark:text-gray-400">{j.department}</p></div></div>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1 mb-3">
              {j.location && <p className="flex items-center gap-1"><MapPin size={12} /> {j.location}</p>}
              <Badge variant="info">{j.type}</Badge>
              {j.salary && <p>💰 {j.salary}</p>}
              {j.applicationMethod && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{getApplicationText(j)}</p>}
              {j.startDate && <p className="flex items-center gap-1"><Clock size={12} /> {formatDate(j.startDate)} – {formatDate(j.endDate)}</p>}
            </div>
            <div className="flex gap-1 pt-3 border-t border-gray-100 dark:border-gray-700 flex-wrap">
              <Button size="sm" variant="ghost" onClick={() => setViewJob(j)}><Eye size={12} className="mr-1" /> View</Button>
              <Button size="sm" variant="ghost" onClick={() => handlePrint(j)}><Printer size={12} className="mr-1" /> Print</Button>
              <Button size="sm" variant="ghost" onClick={() => handleShare(j)}><Share2 size={12} className="mr-1" /> Share</Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditId(j._id); setForm(j); setShowForm(true); }}>Edit</Button>
              <Button size="sm" variant="ghost" className="text-amber-500" onClick={() => handleClose(j._id)}><Ban size={12} className="mr-1" /> Close</Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(j._id)}><Trash2 size={12} className="mr-1" /> Delete</Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Job' : 'Post Job'}>
        <form onSubmit={handlePost} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Job Title *</label><Input value={form.title} onChange={e => setForm(prev => ({ ...prev, title: e.target.value }))} required /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Department *</label><Input value={form.department} onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))} required /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Type</label><Select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}><option value="full_time">Full Time</option><option value="part_time">Part Time</option><option value="contract">Contract</option><option value="intern">Intern</option></Select></div></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Location</label><Input value={form.location} onChange={e => setForm(prev => ({ ...prev, location: e.target.value }))} /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Salary</label><Input value={form.salary} onChange={e => setForm(prev => ({ ...prev, salary: e.target.value }))} /></div></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Description</label><textarea rows={3} value={form.description} onChange={e => setForm(prev => ({ ...prev, description: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none" /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Duties</label><textarea rows={3} value={form.duties} onChange={e => setForm(prev => ({ ...prev, duties: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none" /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Qualifications</label><textarea rows={2} value={form.qualifications} onChange={e => setForm(prev => ({ ...prev, qualifications: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none" /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Requirements</label><textarea rows={2} value={form.requirements} onChange={e => setForm(prev => ({ ...prev, requirements: e.target.value }))} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm resize-none" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">How to Apply</label><Select value={form.applicationMethod} onChange={e => setForm(prev => ({ ...prev, applicationMethod: e.target.value }))}><option value="">Select</option><option value="email">Email</option><option value="online">Online Portal</option><option value="hand_delivery">Hand Delivery</option><option value="both">Email & Hand</option></Select></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Link / Email</label><Input value={form.applicationLink} onChange={e => setForm(prev => ({ ...prev, applicationLink: e.target.value }))} placeholder="careers@co.com or URL" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Start Date</label><Input type="date" value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))} /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">End Date</label><Input type="date" value={form.endDate} onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))} /></div></div>
          <div className="flex gap-2 pt-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">{editId ? 'Update' : 'Post Job'}</Button></div>
        </form>
      </Modal>

      {viewJob && (
        <Modal open={!!viewJob} onClose={() => setViewJob(null)} title={viewJob.title}>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto text-sm">
            <div className="flex flex-wrap gap-2"><Badge variant="info">{viewJob.department}</Badge><Badge>{viewJob.type}</Badge>{viewJob.location && <Badge variant="warning">{viewJob.location}</Badge>}</div>
            {viewJob.salary && <p className="text-primary-500 font-medium">{viewJob.salary}</p>}
            {viewJob.applicationMethod && (<div className="bg-primary-50 dark:bg-primary-900/20 p-3 rounded-lg"><h4 className="font-semibold text-gray-900 dark:text-white mb-1">How to Apply</h4><p className="text-sm text-gray-600 dark:text-gray-400">{getApplicationText(viewJob)}</p></div>)}
            {viewJob.description && <div><h4 className="font-semibold text-gray-900 dark:text-white mb-1">Description</h4><p className="text-gray-600 dark:text-gray-400">{viewJob.description}</p></div>}
            {viewJob.duties && <div><h4 className="font-semibold text-gray-900 dark:text-white mb-1">Duties</h4><p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{viewJob.duties}</p></div>}
            {viewJob.qualifications && <div><h4 className="font-semibold text-gray-900 dark:text-white mb-1">Qualifications</h4><p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{viewJob.qualifications}</p></div>}
            {viewJob.requirements && <div><h4 className="font-semibold text-gray-900 dark:text-white mb-1">Requirements</h4><p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{viewJob.requirements}</p></div>}
            <p className="text-xs text-gray-400">Posted: {formatDate(viewJob.startDate)} – {formatDate(viewJob.endDate)}</p>
            <div className="flex gap-2 pt-2"><Button size="sm" variant="outline" onClick={() => handlePrint(viewJob)}><Printer size={14} className="mr-1" /> Print</Button><Button size="sm" variant="outline" onClick={() => handleShare(viewJob)}><Share2 size={14} className="mr-1" /> Share</Button><Button size="sm" variant="ghost" onClick={() => setViewJob(null)}>Close</Button></div>
          </div>
        </Modal>
      )}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Job" message="Are you sure?" />
    </div>
  );
};

export default RecruitmentTab;