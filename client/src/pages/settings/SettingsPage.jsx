import { useState } from 'react';
import { Building2, Users, Brain, Key, CreditCard, Shield, HardDrive, Layers } from 'lucide-react';
import CompanySettings from './CompanySettings';
import UserManagement from './UserManagement';
import AISettings from './AISettings';
import OutwardAPIKeys from './OutwardAPIKeys';
import BillingSettings from './BillingSettings';
import SecuritySettings from './SecuritySettings';
import BackupSettings from './BackupSettings';
import ModuleToggles from './ModuleToggles';

const tabs = [
  { key: 'company', label: 'Company', icon: Building2 },
  { key: 'users', label: 'Users', icon: Users },
  { key: 'modules', label: 'Modules', icon: Layers },
  { key: 'ai', label: 'AI', icon: Brain },
  { key: 'keys', label: 'API Keys', icon: Key },
  { key: 'billing', label: 'Billing', icon: CreditCard },
  { key: 'security', label: 'Security', icon: Shield },
  { key: 'backups', label: 'Backups', icon: HardDrive },
];

const SettingsPage = () => {
  const [active, setActive] = useState('company');

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Settings</h1>
      <div className="flex gap-1 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActive(tab.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-md text-xs font-medium transition-colors whitespace-nowrap ${
              active === tab.key
                ? 'bg-white dark:bg-gray-800 text-primary-500 border-b-2 border-primary-500'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>
      <div>
        {active === 'company' && <CompanySettings />}
        {active === 'users' && <UserManagement />}
        {active === 'modules' && <ModuleToggles />}
        {active === 'ai' && <AISettings />}
        {active === 'keys' && <OutwardAPIKeys />}
        {active === 'billing' && <BillingSettings />}
        {active === 'security' && <SecuritySettings />}
        {active === 'backups' && <BackupSettings />}
      </div>
    </div>
  );
};

export default SettingsPage;