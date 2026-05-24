import { useState } from 'react';
import SalesOrdersTab from '../../components/sales/SalesOrdersTab';
import QuotationsTab from '../../components/sales/QuotationsTab';
import PricingTab from '../../components/sales/PricingTab';

const tabs = [
  { key: 'orders', label: 'Sales Orders' },
  { key: 'quotations', label: 'Quotations' },
  { key: 'pricing', label: 'Pricing' },
];

const SalesPage = () => {
  const [active, setActive] = useState('orders');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Sales</h1>
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              active === tab.key ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {active === 'orders' && <SalesOrdersTab />}
      {active === 'quotations' && <QuotationsTab />}
      {active === 'pricing' && <PricingTab />}
    </div>
  );
};

export default SalesPage;