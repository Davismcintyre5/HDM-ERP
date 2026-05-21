import { useState } from 'react';
import BOMsTab from '../../components/manufacturing/BOMsTab';
import WorkOrdersTab from '../../components/manufacturing/WorkOrdersTab';
import ShopFloorTab from '../../components/manufacturing/ShopFloorTab';
import QCTab from '../../components/manufacturing/QCTab';
import { Layers, Wrench, Hammer, CheckCircle } from 'lucide-react';

const tabs = [
  { key: 'boms', label: 'BOMs', icon: Layers },
  { key: 'workorders', label: 'Work Orders', icon: Wrench },
  { key: 'shopfloor', label: 'Shop Floor', icon: Hammer },
  { key: 'qc', label: 'Quality Control', icon: CheckCircle },
];

const ManufacturingPage = () => {
  const [active, setActive] = useState('boms');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Manufacturing</h1>
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.key} onClick={() => setActive(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
              active === tab.key ? 'border-primary-500 text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
            }`}>
            <tab.icon size={14} /> {tab.label}
          </button>
        ))}
      </div>
      {active === 'boms' && <BOMsTab />}
      {active === 'workorders' && <WorkOrdersTab />}
      {active === 'shopfloor' && <ShopFloorTab />}
      {active === 'qc' && <QCTab />}
    </div>
  );
};

export default ManufacturingPage;