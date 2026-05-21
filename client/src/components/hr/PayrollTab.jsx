import { useState, useEffect } from 'react';
import { runPayroll, getPayrollHistory } from '../../api/tenant/hrApi';
import { getEmployees } from '../../api/tenant/hrApi';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Spinner from '../../components/ui/Spinner';
import Alert from '../../components/ui/Alert';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import { Plus, Trash2, Printer, Eye } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import formatDate from '../../utils/formatDate';
import { printTable, printDetail } from '../../utils/printUtils';

const PayrollTab = () => {
  const [history, setHistory] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showRun, setShowRun] = useState(false);
  const [viewPayslip, setViewPayslip] = useState(null);
  const [form, setForm] = useState({ periodStart: '', periodEnd: '', paymentDate: '', items: [] });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    Promise.all([getPayrollHistory(), getEmployees()])
      .then(([pRes, eRes]) => { setHistory(pRes.data.data || []); setEmployees(eRes.data.data || []); })
      .finally(() => setLoading(false));
  }, []);

  const initRun = () => {
    setForm({
      periodStart: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      paymentDate: new Date().toISOString().split('T')[0],
      items: employees.map(e => ({
        employee: e._id,
        basicPay: e.basicSalary || 0,
        allowances: [],
        deductions: [],
        grossPay: e.basicSalary || 0,
        netPay: e.basicSalary || 0
      }))
    });
    setShowRun(true);
  };

  const updateItem = (idx, field, value) => {
    const items = [...form.items];
    items[idx] = { ...items[idx], [field]: isNaN(value) ? value : Number(value) };
    recalcItem(items, idx);
    setForm(prev => ({ ...prev, items }));
  };

  const addAllowance = (idx) => {
    const items = [...form.items];
    items[idx].allowances.push({ name: '', amount: 0 });
    recalcItem(items, idx);
    setForm(prev => ({ ...prev, items }));
  };

  const updateAllowance = (idx, aIdx, field, value) => {
    const items = [...form.items];
    items[idx].allowances[aIdx] = { ...items[idx].allowances[aIdx], [field]: isNaN(value) ? value : Number(value) };
    recalcItem(items, idx);
    setForm(prev => ({ ...prev, items }));
  };

  const removeAllowance = (idx, aIdx) => {
    const items = [...form.items];
    items[idx].allowances.splice(aIdx, 1);
    recalcItem(items, idx);
    setForm(prev => ({ ...prev, items }));
  };

  const addDeduction = (idx) => {
    const items = [...form.items];
    items[idx].deductions.push({ name: '', amount: 0 });
    recalcItem(items, idx);
    setForm(prev => ({ ...prev, items }));
  };

  const updateDeduction = (idx, dIdx, field, value) => {
    const items = [...form.items];
    items[idx].deductions[dIdx] = { ...items[idx].deductions[dIdx], [field]: isNaN(value) ? value : Number(value) };
    recalcItem(items, idx);
    setForm(prev => ({ ...prev, items }));
  };

  const removeDeduction = (idx, dIdx) => {
    const items = [...form.items];
    items[idx].deductions.splice(dIdx, 1);
    recalcItem(items, idx);
    setForm(prev => ({ ...prev, items }));
  };

  const recalcItem = (items, idx) => {
    const item = items[idx];
    const allowanceTotal = (item.allowances || []).reduce((s, a) => s + (Number(a.amount) || 0), 0);
    const deductionTotal = (item.deductions || []).reduce((s, d) => s + (Number(d.amount) || 0), 0);
    item.grossPay = (Number(item.basicPay) || 0) + allowanceTotal;
    item.netPay = item.grossPay - deductionTotal;
  };

  const handleRun = async () => {
    const totalGross = form.items.reduce((s, i) => s + (i.grossPay || 0), 0);
    const totalNet = form.items.reduce((s, i) => s + (i.netPay || 0), 0);
    setSaving(true);
    try {
      await runPayroll({ ...form, totalGross, totalNet });
      setShowRun(false);
      getPayrollHistory().then(res => setHistory(res.data.data || []));
      setMessage({ type: 'success', text: 'Payroll processed.' });
    } catch { setMessage({ type: 'error', text: 'Failed.' }); }
    finally { setSaving(false); }
  };

  const handlePrintPayslip = (item) => {
    const emp = employees.find(e => e._id === item.employee);
    printDetail({
      Employee: `${emp?.firstName || ''} ${emp?.lastName || ''}`,
      Period: `${formatDate(form.periodStart)} – ${formatDate(form.periodEnd)}`,
      'Payment Date': formatDate(form.paymentDate),
      'Basic Pay': formatCurrency(item.basicPay),
      Allowances: (item.allowances || []).map(a => `${a.name}: ${formatCurrency(a.amount)}`).join(', ') || 'None',
      Deductions: (item.deductions || []).map(d => `${d.name}: ${formatCurrency(d.amount)}`).join(', ') || 'None',
      'Gross Pay': formatCurrency(item.grossPay),
      'Net Pay': formatCurrency(item.netPay),
    }, { title: `Payslip — ${emp?.firstName} ${emp?.lastName}` });
  };

  const handlePrintHistory = () => {
    printTable(history.map(p => ({
      period: `${formatDate(p.periodStart)} – ${formatDate(p.periodEnd)}`,
      gross: formatCurrency(p.totalGross),
      net: formatCurrency(p.totalNet),
      status: p.status,
    })), [
      { key: 'period', label: 'Period' },
      { key: 'gross', label: 'Gross' },
      { key: 'net', label: 'Net' },
      { key: 'status', label: 'Status' },
    ], { title: 'Payroll History' });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">{history.length} runs</p>
        <div className="flex gap-2">
          {history.length > 0 && <Button size="sm" variant="outline" onClick={handlePrintHistory}><Printer size={14} className="mr-1" /> Print</Button>}
          <Button size="sm" onClick={initRun}>Run Payroll</Button>
        </div>
      </div>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage('')} />}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-gray-200 dark:border-gray-700"><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Period</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Employees</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Gross</th><th className="py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400">Net</th><th className="py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400">Status</th></tr></thead>
          <tbody>{history.map(p => (
            <tr key={p._id} className="border-b border-gray-100 dark:border-gray-700/50">
              <td className="py-2 text-gray-500 dark:text-gray-400 text-xs">{formatDate(p.periodStart)} – {formatDate(p.periodEnd)}</td>
              <td className="py-2 text-right text-gray-700 dark:text-gray-300">{p.items?.length || 0}</td>
              <td className="py-2 text-right text-gray-700 dark:text-gray-300">{formatCurrency(p.totalGross)}</td>
              <td className="py-2 text-right text-primary-500 dark:text-primary-400 font-medium">{formatCurrency(p.totalNet)}</td>
              <td className="py-2"><Badge variant="success">{p.status}</Badge></td>
            </tr>
          ))}</tbody>
        </table>
      </div>

      {/* Run Payroll Modal */}
      <Modal open={showRun} onClose={() => setShowRun(false)} title="Run Payroll" className="max-w-3xl">
        <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-3 gap-2">
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Start Date</label><Input type="date" value={form.periodStart} onChange={e => setForm(prev => ({ ...prev, periodStart: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">End Date</label><Input type="date" value={form.periodEnd} onChange={e => setForm(prev => ({ ...prev, periodEnd: e.target.value }))} /></div>
            <div><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5">Pay Date</label><Input type="date" value={form.paymentDate} onChange={e => setForm(prev => ({ ...prev, paymentDate: e.target.value }))} /></div>
          </div>

          {form.items.map((item, idx) => {
            const emp = employees.find(e => e._id === item.employee);
            return (
              <div key={idx} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">{emp?.firstName} {emp?.lastName}</p>
                  <Button size="sm" variant="ghost" onClick={() => handlePrintPayslip(item)}><Printer size={12} /></Button>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <div><label className="block text-[10px] text-gray-400 mb-0.5">Basic Pay</label><Input type="number" value={item.basicPay} onChange={e => updateItem(idx, 'basicPay', e.target.value)} /></div>
                  <div><label className="block text-[10px] text-gray-400 mb-0.5">Gross</label><Input type="number" value={item.grossPay} disabled className="bg-gray-100" /></div>
                  <div><label className="block text-[10px] text-gray-400 mb-0.5">Net</label><Input type="number" value={item.netPay} disabled className="bg-gray-100 text-primary-500 font-medium" /></div>
                </div>

                {/* Allowances */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-gray-500">Allowances</span>
                    <button onClick={() => addAllowance(idx)} className="text-primary-500 text-xs hover:underline">+ Add</button>
                  </div>
                  {(item.allowances || []).map((a, aIdx) => (
                    <div key={aIdx} className="flex gap-1 items-center mb-1">
                      <Input placeholder="Name" value={a.name} onChange={e => updateAllowance(idx, aIdx, 'name', e.target.value)} className="flex-1 text-xs py-1" />
                      <Input type="number" placeholder="0" value={a.amount} onChange={e => updateAllowance(idx, aIdx, 'amount', e.target.value)} className="w-20 text-xs py-1" />
                      <button onClick={() => removeAllowance(idx, aIdx)} className="text-red-500 text-xs"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>

                {/* Deductions */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-medium text-gray-500">Deductions</span>
                    <button onClick={() => addDeduction(idx)} className="text-red-500 text-xs hover:underline">+ Add</button>
                  </div>
                  {(item.deductions || []).map((d, dIdx) => (
                    <div key={dIdx} className="flex gap-1 items-center mb-1">
                      <Input placeholder="Name" value={d.name} onChange={e => updateDeduction(idx, dIdx, 'name', e.target.value)} className="flex-1 text-xs py-1" />
                      <Input type="number" placeholder="0" value={d.amount} onChange={e => updateDeduction(idx, dIdx, 'amount', e.target.value)} className="w-20 text-xs py-1" />
                      <button onClick={() => removeDeduction(idx, dIdx)} className="text-red-500 text-xs"><Trash2 size={12} /></button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="flex justify-between text-sm font-medium text-gray-900 dark:text-white pt-2 border-t border-gray-200 dark:border-gray-700">
            <span>Total Gross: {formatCurrency(form.items.reduce((s, i) => s + (i.grossPay || 0), 0))}</span>
            <span className="text-primary-500">Total Net: {formatCurrency(form.items.reduce((s, i) => s + (i.netPay || 0), 0))}</span>
          </div>
          <Button onClick={handleRun} disabled={saving} className="w-full">{saving ? 'Processing...' : 'Run Payroll'}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default PayrollTab;