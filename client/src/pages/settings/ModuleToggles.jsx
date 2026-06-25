import { useState, useEffect } from 'react';
import { useTenant } from '../../context/TenantContext';
import { getModules, toggleModules } from '../../api/tenant/companyApi';
import Button from '../../components/ui/Button';
import Toggle from '../../components/ui/Toggle';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';

const moduleList = [
  { key: 'finance', label: 'Finance', icon: '💰' },
  { key: 'hr', label: 'HR', icon: '👥' },
  { key: 'sales', label: 'Sales', icon: '🛒' },
  { key: 'inventory', label: 'Inventory', icon: '📦' },
  { key: 'supplyChain', label: 'Supply Chain', icon: '🚚' },
  { key: 'orders', label: 'Orders', icon: '📋' },
  { key: 'manufacturing', label: 'Manufacturing', icon: '🏭' },
  { key: 'crm', label: 'CRM Pipeline', icon: '🎯' },
  { key: 'projects', label: 'Projects & Tasks', icon: '📐' },
  { key: 'assets', label: 'Asset Management', icon: '🔧' },
  { key: 'contacts', label: 'Contacts', icon: '📇' },
  { key: 'products', label: 'Products', icon: '🏷️' },
  { key: 'communications', label: 'Communications', icon: '✉️' },
  { key: 'reports', label: 'Reports', icon: '📈' },
  { key: 'settings', label: 'Settings', icon: '⚙️' },
  { key: 'dashboard', label: 'Dashboard', icon: '📊' },
];

const ModuleToggles = () => {
  const { plan, refreshModules } = useTenant();
  const [planModules, setPlanModules] = useState({});
  const [localModules, setLocalModules] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    getModules()
      .then(res => {
        const data = res.data.data || {};
        setPlanModules(data.planModules || {});
        // Merge plan defaults with tenant overrides
        const merged = { ...(data.planModules || {}), ...(data.modules || {}) };
        setLocalModules(merged);
      })
      .catch(() => setMessage({ type: 'error', text: 'Failed to load modules' }))
      .finally(() => setLoading(false));
  }, []);

  const isInPlan = (key) => planModules[key] === true;
  const isEnabled = (key) => localModules[key] !== false;

  const handleToggle = async (key) => {
    if (!isInPlan(key)) return;

    const newModules = { ...localModules, [key]: !isEnabled(key) };
    setLocalModules(newModules); // Optimistic update

    setSaving(true);
    try {
      await toggleModules(newModules);
      // Dispatch event so sidebar updates instantly
      window.dispatchEvent(new CustomEvent('modules-updated'));
      // Also update context
      if (refreshModules) refreshModules();
      setMessage({ type: 'success', text: `${moduleList.find(m => m.key === key)?.label} ${newModules[key] ? 'enabled' : 'disabled'}.` });
    } catch (err) {
      // Revert on error
      setLocalModules(localModules);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to update' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  return (
    <Card className="p-6 max-w-2xl">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Module Toggles</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
        Enable or disable modules for your company. Grayed out modules are not available on your <strong>{plan}</strong> plan.
      </p>
      {message && <Alert variant={message.type} message={message.text} onClose={() => setMessage(null)} />}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {moduleList.map(mod => (
          <div
            key={mod.key}
            className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
              isInPlan(mod.key)
                ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                : 'border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 opacity-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <span className="text-lg">{mod.icon}</span>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{mod.label}</p>
                {!isInPlan(mod.key) && (
                  <span className="text-xs text-amber-500 font-medium">Upgrade plan</span>
                )}
              </div>
            </div>
            <Toggle
              checked={isEnabled(mod.key)}
              disabled={!isInPlan(mod.key) || saving}
              onChange={() => handleToggle(mod.key)}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg text-xs text-blue-700 dark:text-blue-300">
        Changes take effect immediately. Disabled modules will be hidden from the sidebar.
      </div>
    </Card>
  );
};

export default ModuleToggles;