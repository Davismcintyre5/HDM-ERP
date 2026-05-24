import { useState, useEffect } from 'react';
import { getLeave, requestLeave, updateLeaveStatus } from '../../api/tenant/hrApi';
import { getEmployees } from '../../api/tenant/hrApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { Plus, Printer, Eye } from 'lucide-react';
import formatDate from '../../utils/formatDate';
import { printTable, printDetail } from '../../utils/printUtils';

const leaveTypes = ['annual', 'sick', 'maternity', 'paternity', 'unpaid', 'other'];

const LeaveTab = () => {
  const [leaves, setLeaves] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewLeave, setViewLeave] = useState(null);
  const [form, setForm] = useState({ employee: '', type: 'annual', startDate: '', endDate: '', reason: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { Promise.all([getLeave(), getEmployees()]).then(([lRes, eRes]) => { setLeaves(lRes.data.data || []); setEmployees(eRes.data.data || []); }).finally(() => setLoading(false)); }, []);

  const handleRequest = async (e) => { e.preventDefault(); if (!form.employee || !form.startDate || !form.endDate) return; setSaving(true); try { await requestLeave(form); setShowForm(false); setForm({ employee: '', type: 'annual', startDate: '', endDate: '', reason: '' }); getLeave().then(res => setLeaves(res.data.data || [])); setMessage({ type: 'success', text: 'Requested.' }); } catch { setMessage({ type: 'error', text: 'Failed.' }); } finally { setSaving(false); } };

  const handleStatus = async (id, status) => { try { await updateLeaveStatus(id, status); getLeave().then(res => setLeaves(res.data.data || [])); } catch {} };

  const handlePrint = () => { printTable(leaves.map(l => ({ employee: `${l.employee?.firstName} ${l.employee?.lastName}`, type: l.type, from: formatDate(l.startDate), to: formatDate(l.endDate), days: l.days, status: l.status })), [{ key: 'employee', label: 'Employee' }, { key: 'type', label: 'Type' }, { key: 'from', label: 'From' }, { key: 'to', label: 'To' }, { key: 'days', label: 'Days' }, { key: 'status', label: 'Status' }], { title: 'Leave Requests' }); };

  const handlePrintSingle = (l) => { printDetail({ Employee: `${l.employee?.firstName} ${l.employee?.lastName}`, Type: l.type, From: formatDate(l.startDate), To: formatDate(l.endDate), Days: l.days, Reason: l.reason || 'N/A', Status: l.status }, { title: `Leave: ${l.employee?.firstName} ${l.employee?.lastName}` }); };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><p className="text-sm text-gray-500">{leaves.length} requests</p><div className="flex gap-2"><Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button><Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> Request</Button></div></div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Employee</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Type</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">From</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">To</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Days</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th><th className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead><tbody>{leaves.map(l => (<tr key={l._id} className="border-b border-gray-100 dark:border-gray-700/50"><td className="py-2 text-gray-900 dark:text-white">{l.employee?.firstName} {l.employee?.lastName}</td><td className="py-2 text-gray-500">{l.type}</td><td className="py-2 text-gray-500">{formatDate(l.startDate)}</td><td className="py-2 text-gray-500">{formatDate(l.endDate)}</td><td className="py-2 text-right">{l.days}</td><td className="py-2"><Badge variant={l.status === 'approved' ? 'success' : l.status === 'rejected' ? 'danger' : 'warning'}>{l.status}</Badge></td><td className="py-2 text-center"><Button size="sm" variant="ghost" onClick={() => setViewLeave(l)}><Eye size={12} /></Button><Button size="sm" variant="ghost" onClick={() => handlePrintSingle(l)}><Printer size={12} /></Button>{l.status === 'pending' && <><Button size="sm" variant="ghost" className="text-emerald-500" onClick={() => handleStatus(l._id, 'approved')}>Approve</Button><Button size="sm" variant="ghost" className="text-red-500" onClick={() => handleStatus(l._id, 'rejected')}>Reject</Button></>}</td></tr>))}</tbody></table></div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Request Leave"><form onSubmit={handleRequest} className="space-y-3"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Employee *</label><SearchableSelect options={employees.map(e => ({ value: e._id, label: `${e.firstName} ${e.lastName}` }))} value={form.employee} onChange={val => setForm(prev => ({ ...prev, employee: val }))} placeholder="Select" /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Type</label><Select value={form.type} onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}>{leaveTypes.map(t => <option key={t} value={t}>{t}</option>)}</Select></div><div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Start *</label><Input type="date" value={form.startDate} onChange={e => setForm(prev => ({ ...prev, startDate: e.target.value }))} required /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">End *</label><Input type="date" value={form.endDate} onChange={e => setForm(prev => ({ ...prev, endDate: e.target.value }))} required /></div></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Reason</label><Input value={form.reason} onChange={e => setForm(prev => ({ ...prev, reason: e.target.value }))} /></div><div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">Submit</Button></div></form></Modal>

      {viewLeave && (
        <Modal open={!!viewLeave} onClose={() => setViewLeave(null)} title="Leave Detail">
          <div className="space-y-3 text-sm"><div className="grid grid-cols-2 gap-2"><div><span className="text-gray-500 text-xs">Employee</span><p className="text-gray-900 dark:text-white font-medium">{viewLeave.employee?.firstName} {viewLeave.employee?.lastName}</p></div><div><span className="text-gray-500 text-xs">Type</span><p className="text-gray-900 dark:text-white capitalize">{viewLeave.type}</p></div><div><span className="text-gray-500 text-xs">From</span><p className="text-gray-900 dark:text-white">{formatDate(viewLeave.startDate)}</p></div><div><span className="text-gray-500 text-xs">To</span><p className="text-gray-900 dark:text-white">{formatDate(viewLeave.endDate)}</p></div><div><span className="text-gray-500 text-xs">Days</span><p className="text-gray-900 dark:text-white font-medium">{viewLeave.days}</p></div><div><span className="text-gray-500 text-xs">Status</span><p><Badge variant={viewLeave.status === 'approved' ? 'success' : viewLeave.status === 'rejected' ? 'danger' : 'warning'}>{viewLeave.status}</Badge></p></div></div>{viewLeave.reason && <div><span className="text-gray-500 text-xs">Reason</span><p className="text-gray-600 dark:text-gray-400">{viewLeave.reason}</p></div>}<div className="flex gap-2 pt-2"><Button size="sm" variant="outline" onClick={() => handlePrintSingle(viewLeave)}><Printer size={14} className="mr-1" /> Print</Button><Button size="sm" variant="ghost" onClick={() => setViewLeave(null)}>Close</Button></div></div>
        </Modal>
      )}
    </div>
  );
};

export default LeaveTab;