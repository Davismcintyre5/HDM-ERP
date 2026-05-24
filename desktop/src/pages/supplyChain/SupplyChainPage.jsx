import { useState } from 'react';
import PurchaseOrdersTab from '../../components/supplyChain/PurchaseOrdersTab';
import GoodsReceivingTab from '../../components/supplyChain/GoodsReceivingTab';
import SuppliersTab from '../../components/supplyChain/SuppliersTab';
import RequisitionsTab from '../../components/supplyChain/RequisitionsTab';
import { Truck, Package, Users, FileText } from 'lucide-react';

const tabs = [
  { key: 'pos', label: 'Purchase Orders', icon: Truck },
  { key: 'receiving', label: 'Receiving', icon: Package },
  { key: 'suppliers', label: 'Suppliers', icon: Users },
  { key: 'requisitions', label: 'Requisitions', icon: FileText },
];

const SupplyChainPage = () => {
  const [active, setActive] = useState('pos');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Supply Chain</h1>
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              active === tab.key ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>
      {active === 'pos' && <PurchaseOrdersTab />}
      {active === 'receiving' && <GoodsReceivingTab />}
      {active === 'suppliers' && <SuppliersTab />}
      {active === 'requisitions' && <RequisitionsTab />}
    </div>
  );
};

export default SupplyChainPage;