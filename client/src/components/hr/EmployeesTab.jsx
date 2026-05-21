import { useState, useEffect } from 'react';
import { getEmployees, addEmployee, updateEmployee, deleteEmployee } from '../../api/tenant/hrApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Badge from '../../components/ui/Badge';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Modal from '../../components/ui/Modal';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Card from '../../components/ui/Card';
import { Plus, Edit3, Trash2, Eye, Printer } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import { printDetail } from '../../utils/printUtils';

const emptyForm = { firstName: '', lastName: '', email: '', phone: '', department: '', position: '', employmentType: 'full_time', hireDate: '', basicSalary: 0 };

const EmployeesTab = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [viewEmp, setViewEmp] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => { getEmployees().then(res => setEmployees(res.data.data || [])).finally(() => setLoading(false)); }, []);

  const handleSave = async (e) => {
    e.preventDefault(); if (!form.firstName || !form.lastName || !form.email) return;
    setSaving(true);
    try {
      if (editId) await updateEmployee(editId, form); else await addEmployee(form);
      setShowForm(false); setEditId(null); setForm(emptyForm);
      getEmployees().then(res => setEmployees(res.data.data || []));
      setMessage({ type: 'success', text: 'Employee saved.' });
    } catch (err) { setMessage({ type: 'error', text: err.response?.data?.message || 'Failed.' }); } finally { setSaving(false); }
  };

  const handleDelete = async () => { try { await deleteEmployee(deleteId); setDeleteId(null); getEmployees().then(res => setEmployees(res.data.data || [])); } catch {} };

  const handlePrint = (emp) => {
    printDetail({
      Name: `${emp.firstName} ${emp.lastName}`,
      Email: emp.email,
      Phone: emp.phone || 'N/A',
      Department: emp.department || 'N/A',
      Position: emp.position || 'N/A',
      Type: emp.employmentType,
      'Hire Date': emp.hireDate || 'N/A',
      'Basic Salary': formatCurrency(emp.basicSalary),
    }, { title: `Employee: ${emp.firstName} ${emp.lastName}` });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4"><p className="text-sm text-gray-500">{employees.length} employees</p><Button size="sm" onClick={() => { setEditId(null); setForm(emptyForm); setShowForm(true); }}><Plus size={14} className="mr-1" /> Add</Button></div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {employees.map(e => (
          <Card key={e._id} className="p-4">
            <div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-full bg-primary-500 text-white flex items-center justify-center font-bold">{e.firstName?.[0]}{e.lastName?.[0]}</div><div><h3 className="font-semibold text-gray-900 dark:text-white">{e.firstName} {e.lastName}</h3><p className="text-xs text-gray-500">{e.position || e.department || '—'}</p></div></div>
            <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1"><p>📧 {e.email}</p>{e.phone && <p>📞 {e.phone}</p>}<p>💰 {formatCurrency(e.basicSalary)}/mo</p><Badge variant="info">{e.employmentType}</Badge></div>
            <div className="flex gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
              <Button size="sm" variant="ghost" onClick={() => setViewEmp(e)}><Eye size={12} /></Button>
              <Button size="sm" variant="ghost" onClick={() => handlePrint(e)}><Printer size={12} /></Button>
              <Button size="sm" variant="ghost" onClick={() => { setEditId(e._id); setForm(e); setShowForm(true); }}><Edit3 size={12} /></Button>
              <Button size="sm" variant="ghost" className="text-red-500" onClick={() => setDeleteId(e._id)}><Trash2 size={12} /></Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal open={showForm} onClose={() => setShowForm(false)} title={editId ? 'Edit Employee' : 'Add Employee'}>
        <form onSubmit={handleSave} className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">First Name *</label><Input value={form.firstName} onChange={e => setForm(prev => ({ ...prev, firstName: e.target.value }))} required /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Last Name *</label><Input value={form.lastName} onChange={e => setForm(prev => ({ ...prev, lastName: e.target.value }))} required /></div></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Email *</label><Input type="email" value={form.email} onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))} required /></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Phone</label><Input value={form.phone} onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))} /></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Department</label><Input value={form.department} onChange={e => setForm(prev => ({ ...prev, department: e.target.value }))} /></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Position</label><Input value={form.position} onChange={e => setForm(prev => ({ ...prev, position: e.target.value }))} /></div></div>
          <div className="grid grid-cols-2 gap-2"><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Type</label><Select value={form.employmentType} onChange={e => setForm(prev => ({ ...prev, employmentType: e.target.value }))}><option value="full_time">Full Time</option><option value="part_time">Part Time</option><option value="contract">Contract</option></Select></div><div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Hire Date</label><Input type="date" value={form.hireDate} onChange={e => setForm(prev => ({ ...prev, hireDate: e.target.value }))} /></div></div>
          <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Basic Salary</label><Input type="number" step="0.01" value={form.basicSalary} onChange={e => setForm(prev => ({ ...prev, basicSalary: parseFloat(e.target.value) || 0 }))} /></div>
          <div className="flex gap-2"><Button type="button" variant="ghost" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button><Button type="submit" disabled={saving} className="flex-1">Save</Button></div>
        </form>
      </Modal>

      {viewEmp && (
        <Modal open={!!viewEmp} onClose={() => setViewEmp(null)} title={`${viewEmp.firstName} ${viewEmp.lastName}`}>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 mb-3"><div className="w-14 h-14 rounded-full bg-primary-500 text-white flex items-center justify-center text-xl font-bold">{viewEmp.firstName?.[0]}{viewEmp.lastName?.[0]}</div><div><h3 className="font-semibold text-gray-900 dark:text-white text-lg">{viewEmp.firstName} {viewEmp.lastName}</h3><p className="text-gray-500">{viewEmp.position} • {viewEmp.department}</p></div></div>
            <div className="grid grid-cols-2 gap-2"><div><span className="text-gray-500 text-xs">Email</span><p className="text-gray-900 dark:text-white">{viewEmp.email}</p></div><div><span className="text-gray-500 text-xs">Phone</span><p className="text-gray-900 dark:text-white">{viewEmp.phone || 'N/A'}</p></div><div><span className="text-gray-500 text-xs">Type</span><p className="text-gray-900 dark:text-white"><Badge variant="info">{viewEmp.employmentType}</Badge></p></div><div><span className="text-gray-500 text-xs">Hire Date</span><p className="text-gray-900 dark:text-white">{viewEmp.hireDate || 'N/A'}</p></div><div><span className="text-gray-500 text-xs">Basic Salary</span><p className="text-primary-500 font-medium text-lg">{formatCurrency(viewEmp.basicSalary)}</p></div></div>
            <div className="flex gap-2 pt-2"><Button size="sm" variant="outline" onClick={() => handlePrint(viewEmp)}><Printer size={14} className="mr-1" /> Print</Button><Button size="sm" variant="ghost" onClick={() => setViewEmp(null)}>Close</Button></div>
          </div>
        </Modal>
      )}
      <ConfirmDialog open={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={handleDelete} title="Delete Employee" message="Are you sure?" />
    </div>
  );
};

export default EmployeesTab;