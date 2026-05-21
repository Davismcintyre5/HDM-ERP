import Button from '../ui/Button';
import formatCurrency from '../../utils/formatCurrency';
import { Check, X } from 'lucide-react';

const moduleLabels = {
  finance: 'Finance', hr: 'HR', sales: 'Sales', inventory: 'Inventory',
  supplyChain: 'Supply Chain', orders: 'Unified Orders', manufacturing: 'Manufacturing',
  contacts: 'Contacts', products: 'Products', reports: 'Reports',
};

const planColors = {
  free_trial: 'bg-gray-500 hover:bg-gray-600',
  standard: 'bg-blue-500 hover:bg-blue-600',
  pro: 'bg-primary-500 hover:bg-primary-600',
  enterprise: 'bg-amber-500 hover:bg-amber-600',
};

const PlanCard = ({ plan, onSelect, selected }) => {
  const modules = plan.modules || {};
  const limits = plan.limits || {};
  const pricing = plan.pricing || {};

  return (
    <div className={`border rounded-lg p-4 flex flex-col ${selected ? 'border-primary-500 shadow-md ring-1 ring-primary-500' : 'border-gray-200 dark:border-gray-700'} bg-white dark:bg-gray-800 transition-all hover:shadow-sm`}>
      <h3 className="text-sm font-bold text-gray-900 dark:text-white">{plan.displayName}</h3>

      <div className="mt-1.5 space-y-0.5">
        <div className="flex items-baseline gap-1">
          <span className="text-lg font-bold text-primary-500">{formatCurrency(pricing.monthly, plan.displayCurrency)}</span>
          <span className="text-[10px] text-gray-400">/mo</span>
        </div>
        {pricing.yearly > 0 && (
          <p className="text-[11px] text-blue-500 font-medium">{formatCurrency(pricing.yearly, plan.displayCurrency)} /yr</p>
        )}
        {pricing.permanent > 0 && (
          <p className="text-[11px] text-amber-500 font-medium">{formatCurrency(pricing.permanent, plan.displayCurrency)} one-time</p>
        )}
      </div>

      {plan.name === 'free_trial' && <p className="text-[11px] text-primary-500 mt-0.5">{plan.trialDays} days free</p>}

      <div className="mt-3 space-y-0.5 text-[11px] flex-1">
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <Check size={11} className="text-primary-500 shrink-0" /> {limits.maxUsers} users
        </div>
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <Check size={11} className="text-primary-500 shrink-0" /> {limits.maxStorageGB} GB
        </div>
        <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
          <Check size={11} className="text-primary-500 shrink-0" /> {limits.maxCustomReports} reports
        </div>

        <div className="border-t border-gray-100 dark:border-gray-700 my-1.5 pt-1.5 space-y-0.5">
          {Object.entries(moduleLabels).map(([key, label]) => (
            <div key={key} className="flex items-center gap-1.5">
              {modules[key] ? <Check size={11} className="text-primary-500 shrink-0" /> : <X size={11} className="text-gray-300 dark:text-gray-600 shrink-0" />}
              <span className={modules[key] ? 'text-gray-600 dark:text-gray-400' : 'text-gray-400 dark:text-gray-500'}>{label}</span>
            </div>
          ))}
          {limits.aiWrite && <div className="flex items-center gap-1.5 text-primary-500"><Check size={11} /> AI Write</div>}
          {limits.whiteLabel && <div className="flex items-center gap-1.5 text-primary-500"><Check size={11} /> White Label</div>}
        </div>
      </div>

      <button
        onClick={() => onSelect(plan.name)}
        className={`mt-3 w-full py-1.5 rounded-md text-xs font-medium text-white transition-colors ${planColors[plan.name] || 'bg-primary-500 hover:bg-primary-600'}`}
      >
        {selected ? 'Selected' : plan.name === 'free_trial' ? 'Free Trial' : 'Choose'}
      </button>
    </div>
  );
};

export default PlanCard;