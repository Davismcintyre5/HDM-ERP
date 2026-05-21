import { useEffect, useState } from 'react';
import { getPlans } from '../../api/public/plansApi';
import { useApp } from '../../context/AppContext';
import LandingNavbar from '../../components/public/LandingNavbar';
import PlanCard from '../../components/public/PlanCard';
import Spinner from '../../components/ui/Spinner';
import { X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PricingPage = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [billingOverlay, setBillingOverlay] = useState(null);
  const { openLegal, openContact } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    getPlans().then(({ data }) => setPlans(data.data || [])).finally(() => setLoading(false));
  }, []);

  const handleSelect = (planName) => {
    if (planName === 'free_trial') {
      navigate(`/register?plan=free_trial&cycle=monthly`);
      return;
    }
    const plan = plans.find(p => p.name === planName);
    setSelectedPlan(plan);
    setBillingOverlay(planName);
  };

  const handleBilling = (cycle) => {
    navigate(`/register?plan=${billingOverlay}&cycle=${cycle}`);
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingNavbar config={{}} onOpenLegal={openLegal} onOpenContact={openContact} />
      <div className="max-w-6xl mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-center text-gray-900 dark:text-white mb-4">Choose Your Plan</h1>
        <p className="text-center text-gray-500 dark:text-gray-400 mb-12">Select the plan that fits your business</p>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {plans.map(plan => (
            <PlanCard key={plan.name} plan={plan} selected={selectedPlan?.name === plan.name} onSelect={handleSelect} />
          ))}
        </div>
      </div>

      {/* Billing Cycle Overlay */}
      {billingOverlay && selectedPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setBillingOverlay(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedPlan.displayName} — Choose Billing</h3>
              <button onClick={() => setBillingOverlay(null)} className="p-1 text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6 space-y-3">
              {[
                { cycle: 'monthly', price: selectedPlan.pricing.monthly, label: 'Monthly', desc: 'Billed every month' },
                { cycle: 'yearly', price: selectedPlan.pricing.yearly, label: 'Yearly', desc: 'Billed annually, save more' },
                { cycle: 'permanent', price: selectedPlan.pricing.permanent, label: 'One-Time', desc: 'Pay once, use forever' },
              ].filter(({ price }) => price >= 0).map(({ cycle, price, label, desc }) => (
                <button
                  key={cycle}
                  onClick={() => handleBilling(cycle)}
                  className="w-full p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900 transition-all text-left"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-900 dark:text-white">{label}</span>
                    <span className="text-lg font-bold text-primary-500">
                      {price === 0 ? 'Free' : selectedPlan.displayCurrency === 'KSh' ? `KSh ${price.toLocaleString()}` : `$${price}`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{desc}</p>
                </button>
              ))}
              <button onClick={() => setBillingOverlay(null)} className="w-full py-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PricingPage;