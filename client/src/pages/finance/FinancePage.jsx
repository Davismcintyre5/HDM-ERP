import { useState } from 'react';
import AccountsTab from '../../components/finance/AccountsTab';
import JournalTab from '../../components/finance/JournalTab';
import InvoicesTab from '../../components/finance/InvoicesTab';
import BillsTab from '../../components/finance/BillsTab';
import RevenueExpensesTab from '../../components/finance/RevenueExpensesTab';
import { Landmark, BookOpen, FileText, CreditCard, TrendingUp } from 'lucide-react';

const tabs = [
  { key: 'accounts', label: 'Accounts', icon: Landmark },
  { key: 'journal', label: 'Journal', icon: BookOpen },
  { key: 'invoices', label: 'Invoices', icon: FileText },
  { key: 'bills', label: 'Bills', icon: CreditCard },
  { key: 'revenue', label: 'Revenue/Expenses', icon: TrendingUp },
];

const FinancePage = () => {
  const [active, setActive] = useState('accounts');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Finance</h1>
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              active === tab.key ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>
      {active === 'accounts' && <AccountsTab />}
      {active === 'journal' && <JournalTab />}
      {active === 'invoices' && <InvoicesTab />}
      {active === 'bills' && <BillsTab />}
      {active === 'revenue' && <RevenueExpensesTab />}
    </div>
  );
};

export default FinancePage;