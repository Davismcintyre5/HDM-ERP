import { useState, useEffect } from 'react';
import { getAttendance, markAttendance } from '../../api/tenant/hrApi';
import { getEmployees } from '../../api/tenant/hrApi';
import Button from '../../components/ui/Button';
import SearchableSelect from '../../components/ui/SearchableSelect';
import Input from '../../components/ui/Input';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import { Plus, Printer, Eye } from 'lucide-react';
import formatDate from '../../utils/formatDate';
import { printTable } from '../../utils/printUtils';

const AttendanceTab = () => {
  const [records, setRecords] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
  const [form, setForm] = useState({ employee: '', date: new Date().toISOString().split('T')[0], checkIn: '', checkOut: '', status: 'present' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([getAttendance(), getEmployees()]).then(([aRes, eRes]) => { setRecords(aRes.data.data || []); setEmployees(eRes.data.data || []); }).finally(() => setLoading(false));
  }, []);

  const handleMark = async (e) => { e.preventDefault(); if (!form.employee) return; setSaving(true); try { await markAttendance(form); setShowForm(false); setForm({ employee: '', date: new Date().toISOString().split('T')[0], checkIn: '', checkOut: '', status: 'present' }); getAttendance().then(res => setRecords(res.data.data || [])); setMessage({ type: 'success', text: 'Marked.' }); } catch { setMessage({ type: 'error', text: 'Failed.' }); } finally { setSaving(false); } };

  const handlePrint = () => {
    printTable(records.map(r => ({ employee: `${r.employee?.firstName} ${r.employee?.lastName}`, date: formatDate(r.date), checkIn: r.checkIn || '—', checkOut: r.checkOut || '—', status: r.status })), [
      { key: 'employee', label: 'Employee' }, { key: 'date', label: 'Date' }, { key: 'checkIn', label: 'In' }, { key: 'checkOut', label: 'Out' }, { key: 'status', label: 'Status' }
    ], { title: 'Attendance' });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><p className="text-sm text-gray-500">{records.length} records</p><div className="flex gap-2"><Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button><Button size="sm" onClick={() => setShowForm(true)}><Plus size={14} className="mr-1" /> Mark</Button></div></div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto"><table className="w-full text-sm"><thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Date</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Employee</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">In</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Out</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th><th className="py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400">Actions</th></tr></thead><tbody>{records.map(r => (<tr key={r._id} className="border-b border-gray-100 dark:border-gray-700/50"><td className="py-2 text-gray-500 text-xs">{formatDate(r.date)}</td><td className="py-2 text-gray-900 dark:text-white">{r.employee?.firstName} {r.employee?.lastName}</td><td className="py-2 text-gray-600">{r.checkIn || '—'}</td><td className="py-2 text-gray-600">{r.checkOut || '—'}</td><td className="py-2"><Badge variant={r.status === 'present' ? 'success' : r.status === 'late' ? 'warning' : 'danger'}>{r.status}</Badge></td><td className="py-2 text-center"><Button size="sm" variant="ghost" onClick={() => setViewRecord(r)}><Eye size={12} /></Button></td></tr>))}</tbody></table></div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title="Mark Attendance">
        <form onSubmit={handleMark} className="space-y-3"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Employee *</label><SearchableSelect options={employees.map(e => ({ value: e._id, label: `${e.firstName} ${e.lastName}` }))} value={form.employee} onChange={val => setForm(prev => ({ ...prev, employee: val }))} placeholder="Select" /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Date</label><Input type="date" value={form.date} onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))} /></div><div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Check In</label><Input type="time" value={form.checkIn} onChange={e => setForm(prev => ({ ...prev, checkIn: e.target.value }))} /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Check Out</label><Input type="time" value={form.checkOut} onChange={e => setForm(prev => ({ ...prev, checkOut: e.target.value }))} /></div></div><div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">Save</Button></div></form>
      </Modal>

      {viewRecord && (
        <Modal open={!!viewRecord} onClose={() => setViewRecord(null)} title="Attendance Detail">
          <div className="space-y-3 text-sm"><div className="grid grid-cols-2 gap-2"><div><span className="text-gray-500 text-xs">Employee</span><p className="text-gray-900 dark:text-white font-medium">{viewRecord.employee?.firstName} {viewRecord.employee?.lastName}</p></div><div><span className="text-gray-500 text-xs">Date</span><p className="text-gray-900 dark:text-white">{formatDate(viewRecord.date)}</p></div><div><span className="text-gray-500 text-xs">Check In</span><p className="text-gray-900 dark:text-white">{viewRecord.checkIn || '—'}</p></div><div><span className="text-gray-500 text-xs">Check Out</span><p className="text-gray-900 dark:text-white">{viewRecord.checkOut || '—'}</p></div><div><span className="text-gray-500 text-xs">Status</span><p><Badge variant={viewRecord.status === 'present' ? 'success' : 'warning'}>{viewRecord.status}</Badge></p></div></div><Button size="sm" variant="ghost" onClick={() => setViewRecord(null)}>Close</Button></div>
        </Modal>
      )}
    </div>
  );
};

export default AttendanceTab;