import { useState, useEffect } from 'react';
import { getProfitLoss, getBalanceSheet, getTrialBalance } from '../../api/tenant/financeApi';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import { Printer } from 'lucide-react';
import formatCurrency from '../../utils/formatCurrency';
import { printContent } from '../../utils/printUtils';

const FinanceReportsTab = () => {
  const [active, setActive] = useState('pl');
  const [plData, setPlData] = useState(null);
  const [bsData, setBsData] = useState(null);
  const [tbData, setTbData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getProfitLoss(), getBalanceSheet(), getTrialBalance()])
      .then(([plRes, bsRes, tbRes]) => {
        setPlData(plRes.data.data);
        setBsData(bsRes.data.data);
        setTbData(tbRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    let title = '', content = '';
    if (active === 'pl' && plData) {
      title = 'Profit & Loss';
      content = `<h2 style="text-align:center;">${title}</h2>
        <div style="margin-top:15px;"><div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Revenue</span><span>${formatCurrency(plData.revenue)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Expenses</span><span>${formatCurrency(plData.expenses)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-weight:bold;border-top:2px solid #10B981;margin-top:5px;"><span>Net Profit</span><span style="color:#10B981;">${formatCurrency(plData.profit)}</span></div></div>`;
    } else if (active === 'bs' && bsData) {
      title = 'Balance Sheet';
      content = `<h2 style="text-align:center;">${title}</h2>
        <div style="margin-top:15px;"><div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Assets</span><span>${formatCurrency(bsData.assets)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Liabilities</span><span>${formatCurrency(bsData.liabilities)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;font-weight:bold;"><span>Equity</span><span>${formatCurrency(bsData.equity)}</span></div></div>`;
    } else if (active === 'tb' && tbData) {
      title = 'Trial Balance';
      content = `<h2 style="text-align:center;">${title}</h2>
        <div style="margin-top:15px;"><div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Total Debit</span><span>${formatCurrency(tbData.totalDebit)}</span></div>
        <div style="display:flex;justify-content:space-between;padding:6px 0;"><span>Total Credit</span><span>${formatCurrency(tbData.totalCredit)}</span></div>
        <div style="text-align:center;margin-top:5px;font-weight:bold;color:${tbData.balanced ? '#10B981' : '#EF4444'};">${tbData.balanced ? '✓ Balanced' : '⚠ Unbalanced'}</div></div>`;
    }
    printContent(content, { title });
  };

  if (loading) return <Spinner />;

  return (
    <div>
      <div className="flex gap-1 mb-4 border-b border-gray-200 dark:border-gray-700">
        {['pl', 'bs', 'tb'].map(k => (
          <button key={k} onClick={() => setActive(k)} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${active === k ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}>
            {k === 'pl' ? 'Profit & Loss' : k === 'bs' ? 'Balance Sheet' : 'Trial Balance'}
          </button>
        ))}
      </div>

      <div className="max-w-lg">
        {active === 'pl' && plData && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">Profit & Loss</h2><Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button></div>
            <div className="space-y-3"><div className="flex justify-between py-2 border-b"><span>Revenue</span><span className="font-medium">{formatCurrency(plData.revenue)}</span></div><div className="flex justify-between py-2 border-b"><span>Expenses</span><span className="font-medium">{formatCurrency(plData.expenses)}</span></div><div className="flex justify-between py-2 text-lg font-bold border-t-2 border-primary-500 pt-3"><span>Net Profit</span><span className={plData.profit >= 0 ? 'text-primary-500' : 'text-red-500'}>{formatCurrency(plData.profit)}</span></div></div>
          </Card>
        )}
        {active === 'bs' && bsData && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">Balance Sheet</h2><Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button></div>
            <div className="space-y-3"><div className="flex justify-between py-2 border-b"><span>Assets</span><span className="font-medium">{formatCurrency(bsData.assets)}</span></div><div className="flex justify-between py-2 border-b"><span>Liabilities</span><span className="font-medium">{formatCurrency(bsData.liabilities)}</span></div><div className="flex justify-between py-2 font-bold"><span>Equity</span><span className="text-primary-500">{formatCurrency(bsData.equity)}</span></div></div>
          </Card>
        )}
        {active === 'tb' && tbData && (
          <Card className="p-6">
            <div className="flex justify-between items-center mb-4"><h2 className="text-lg font-semibold">Trial Balance</h2><Button size="sm" variant="outline" onClick={handlePrint}><Printer size={14} className="mr-1" /> Print</Button></div>
            <div className="space-y-3"><div className="flex justify-between py-2 border-b"><span>Total Debit</span><span className="font-medium">{formatCurrency(tbData.totalDebit)}</span></div><div className="flex justify-between py-2 border-b"><span>Total Credit</span><span className="font-medium">{formatCurrency(tbData.totalCredit)}</span></div><div className="text-center mt-3"><Badge variant={tbData.balanced ? 'success' : 'danger'}>{tbData.balanced ? '✓ Balanced' : '⚠ Unbalanced'}</Badge></div></div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FinanceReportsTab;