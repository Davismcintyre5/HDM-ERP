import { useEffect, useState } from 'react';
import { getLandingConfig } from '../../api/public/landingApi';
import { getPlans } from '../../api/public/plansApi';
import { useApp } from '../../context/AppContext';
import LandingNavbar from '../../components/public/LandingNavbar';
import LandingFooter from '../../components/public/LandingFooter';
import LandingChatbot from '../../components/public/LandingChatbot';
import CookieConsent from '../../components/public/CookieConsent';
import PlanCard from '../../components/public/PlanCard';
import { useNavigate } from 'react-router-dom';
import Spinner from '../../components/ui/Spinner';

const LandingPage = () => {
  const [config, setConfig] = useState({});
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');
  const [selectedPlan, setSelectedPlan] = useState(null);
  const { openLegal, openContact } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const landingRes = await getLandingConfig();
        const landingData = landingRes.data.data;
        if (landingData.maintenanceMode) {
          setMaintenance(true);
          setMaintenanceMessage(landingData.maintenanceMessage);
          setLoading(false);
          return;
        }
        setConfig(landingData);
      } catch (err) {
        if (err.response?.status === 503) {
          setMaintenance(true);
          setMaintenanceMessage(err.response?.data?.message || 'Under maintenance');
          setLoading(false);
          return;
        }
      }
      try {
        const plansRes = await getPlans();
        setPlans(plansRes.data.data || []);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleSelect = (planName) => navigate(`/register?plan=${planName}&cycle=monthly`);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  if (maintenance) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="text-center max-w-md px-6">
          <div className="text-6xl mb-4">🔧</div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Under Maintenance</h1>
          <p className="text-gray-600 dark:text-gray-400">{maintenanceMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <LandingNavbar config={config} onOpenLegal={openLegal} onOpenContact={openContact} />

      {/* HERO */}
      <section className="bg-gradient-to-br from-primary-50 via-white to-primary-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-20 md:py-24">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
            {config.heroHeadline || 'Smart Business Management'}
          </h1>
          <p className="mt-6 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {config.heroSubtext || 'Manage your entire business from one platform'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <button onClick={() => navigate('/pricing')} className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-lg shadow-md transition-colors">
              {config.registerButtonLabel || 'Get Started'}
            </button>
            <button onClick={() => navigate('/login')} className="px-8 py-3 border border-primary-500 text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900 font-semibold rounded-lg transition-colors">
              {config.launchButtonLabel || 'Launch'}
            </button>
          </div>
          {config.moduleTags && (
            <div className="mt-10 flex flex-wrap justify-center gap-2">
              {config.moduleTags.map(tag => (
                <span key={tag} className="px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200 text-sm font-medium">{tag}</span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ABOUT */}
      {config.aboutText && (
        <section id="about" className="py-16 bg-white dark:bg-gray-800">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">About HDM ERP</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">{config.aboutText}</p>
          </div>
        </section>
      )}

      {/* FEATURES */}
      <section id="features" className="py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-4">Features</h2>
          <p className="text-center text-gray-500 dark:text-gray-400 mb-12">Everything you need to run your business</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { letter: 'F', title: 'Finance', items: ['Accounts', 'Journal Entries', 'Invoices & Bills', 'Revenue & Expenses'] },
              { letter: 'H', title: 'HR', items: ['Employees', 'Attendance', 'Leave Management', 'Payroll'] },
              { letter: 'S', title: 'Sales', items: ['Sales Orders', 'Quotations', 'Pricing', 'Customer Management'] },
              { letter: 'I', title: 'Inventory', items: ['Stock Overview', 'Stock Movements', 'Warehouses', 'Stock Transfers'] },
              { letter: 'SC', title: 'Supply Chain', items: ['Purchase Orders', 'Goods Receiving', 'Suppliers', 'Requisitions'] },
              { letter: 'M', title: 'Manufacturing', items: ['Bill of Materials', 'Work Orders', 'Shop Floor', 'Quality Control'] },
              { letter: 'R', title: 'Reports', items: ['Profit & Loss', 'Balance Sheet', 'Trial Balance', 'Tax Reports'] },
              { letter: 'AI', title: 'AI Powered', items: ['Smart Assistant', 'Proactive Alerts', 'Data Analysis', 'File Processing'] },
            ].map(({ letter, title, items }) => (
              <div key={title} className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 text-center">
                <div className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary-100 dark:bg-primary-900 text-primary-600 dark:text-primary-300 flex items-center justify-center text-lg font-bold">{letter}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">{title}</h3>
                <ul className="text-xs text-gray-500 dark:text-gray-400 mt-1 space-y-0.5">
                  {items.map((item, i) => <li key={i}>• {item}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">Choose Your Plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {plans.map(plan => (
              <PlanCard key={plan.name} plan={plan} selected={selectedPlan === plan.name} onSelect={handleSelect} />
            ))}
          </div>
        </div>
      </section>

      <LandingFooter config={config} onOpenLegal={openLegal} onOpenContact={openContact} />
      <LandingChatbot />
      <CookieConsent />
    </div>
  );
};

export default LandingPage;