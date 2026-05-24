import { useState, useEffect } from 'react';
import { getBilling } from '../../api/tenant/billingApi';
import { getPlans } from '../../api/public/plansApi';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import formatCurrency from '../../utils/formatCurrency';
import { CreditCard, Check } from 'lucide-react';

const BillingSettings = () => {
  const [billing, setBilling] = useState(null);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getBilling(), getPlans()])
      .then(([bRes, pRes]) => {
        setBilling(bRes.data.data);
        setPlans(pRes.data.data || []);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-10"><Spinner /></div>;

  const currentPlan = plans.find(p => p.name === billing?.currentPlan);

  return (
    <Card className="p-6 max-w-3xl">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Billing & Plan</h2>

      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Current Plan</p>
            <p className="text-xl font-bold text-gray-900 dark:text-white">{billing?.currentPlan || 'N/A'}</p>
            <p className="text-xs text-gray-400 mt-1">
              Expires: {billing?.subscriptionExpiry ? new Date(billing.subscriptionExpiry).toLocaleDateString() : 'N/A'}
            </p>
          </div>
          <Badge variant="success">{billing?.status || 'active'}</Badge>
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Available Plans</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {plans.filter(p => p.enabled).map(plan => (
          <div
            key={plan.name}
            className={`p-4 rounded-lg border-2 transition-all ${
              plan.name === billing?.currentPlan
                ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <p className="font-semibold text-gray-900 dark:text-white">{plan.displayName}</p>
            <p className="text-2xl font-bold text-primary-500">
              {plan.displayCurrency === 'KSh' ? `KSh ${plan.pricing.monthly?.toLocaleString()}` : `$${plan.pricing.monthly}`}
              <span className="text-xs font-normal text-gray-400">/mo</span>
            </p>
            {plan.name === billing?.currentPlan ? (
              <Badge variant="success" className="mt-2"><Check size={12} /> Current Plan</Badge>
            ) : null}
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-400 mt-4">
        To upgrade your plan, please contact support or visit the pricing page.
      </p>
    </Card>
  );
};

export default BillingSettings;