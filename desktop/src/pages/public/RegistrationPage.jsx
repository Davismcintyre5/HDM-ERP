import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { register as registerApi } from '../../api/public/registrationApi';
import { submitPayment } from '../../api/public/paymentApi';
import { getPlans } from '../../api/public/plansApi';
import { useApp } from '../../context/AppContext';
import LandingNavbar from '../../components/public/LandingNavbar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';

const RegistrationPage = () => {
  const [searchParams] = useSearchParams();
  const planName = searchParams.get('plan') || 'free_trial';
  const cycle = searchParams.get('cycle') || 'monthly';
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ companyName: '', fullName: '', email: '', phone: '', password: '' });
  const { openLegal, openContact } = useApp();
  const navigate = useNavigate();

  useEffect(() => { getPlans().then(({ data }) => setPlan(data.data.find(pl => pl.name === planName))).finally(() => setLoading(false)); }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.companyName || !form.fullName || !form.email || !form.password) return setError('Please fill all required fields.');
    setError('');

    if (planName === 'free_trial') {
      setSubmitting(true);
      try {
        await registerApi({ companyName: form.companyName, contactEmail: form.email, plan: planName, billingCycle: cycle });
        const payRes = await submitPayment({ companyName: form.companyName, contactEmail: form.email, plan: planName, billingCycle: cycle, paymentMethod: 'free_trial', phone: form.phone, password: form.password, fullName: form.fullName });
        setSuccess({ licenseKey: payRes.data.licenseKey, message: 'Your free trial is ready!' });
      } catch (err) { setError(err.response?.data?.message || 'Registration failed.'); } finally { setSubmitting(false); }
      return;
    }

    setSubmitting(true);
    try {
      await registerApi({ companyName: form.companyName, contactEmail: form.email, plan: planName, billingCycle: cycle });
      navigate(`/checkout?plan=${planName}&cycle=${cycle}&company=${encodeURIComponent(form.companyName)}&email=${encodeURIComponent(form.email)}&phone=${encodeURIComponent(form.phone)}&password=${encodeURIComponent(form.password)}&fullName=${encodeURIComponent(form.fullName)}`);
    } catch (err) { setError(err.response?.data?.message || 'Registration failed.'); } finally { setSubmitting(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-950">
      <LandingNavbar config={{}} onOpenLegal={openLegal} onOpenContact={openContact} />
      <section className="flex-1 flex items-center justify-center py-10">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 w-full max-w-md mx-4">
          {success ? (
            <div className="text-center">
              <div className="text-5xl mb-4">🎉</div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Registration Successful!</h1>
              <p className="text-gray-600 dark:text-gray-400 mb-4">{success.message}</p>
              {success.licenseKey && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
                  <p className="text-xs text-gray-500 mb-1">Your License Key</p>
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-sm font-mono text-primary-500 bg-gray-100 dark:bg-gray-900 px-3 py-2 rounded break-all">{success.licenseKey}</code>
                    <button onClick={() => navigator.clipboard.writeText(success.licenseKey)} className="px-3 py-2 bg-primary-500 text-white text-xs rounded hover:bg-primary-600">Copy</button>
                  </div>
                  <p className="text-xs text-amber-500 mt-2">⚠️ Save this key — you'll need it for activation.</p>
                </div>
              )}
              <Button onClick={() => { localStorage.setItem('deviceActivated', 'true'); navigate('/login'); }} className="w-full">🚀 Launch HDM ERP</Button>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Register</h1>
              <p className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
                {plan?.displayName || planName} — {cycle === 'yearly' ? 'Yearly' : cycle === 'permanent' ? 'One-Time' : 'Monthly'}
                {plan && <span className="block text-primary-500 font-medium mt-1">{plan.displayCurrency === 'KSh' ? `KSh ${plan.pricing[cycle]?.toLocaleString()}` : `$${plan.pricing[cycle]}`}</span>}
              </p>
              {error && <Alert variant="error" message={error} onClose={() => setError('')} />}
              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name *</label><Input name="companyName" value={form.companyName} onChange={handleChange} required /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label><Input name="fullName" value={form.fullName} onChange={handleChange} required /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email *</label><Input name="email" type="email" value={form.email} onChange={handleChange} required /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label><Input name="phone" value={form.phone} onChange={handleChange} /></div>
                <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password *</label><Input name="password" type="password" value={form.password} onChange={handleChange} required /></div>
                <Button type="submit" className="w-full" disabled={submitting}>{submitting ? 'Processing...' : planName === 'free_trial' ? 'Start Free Trial' : 'Continue to Payment'}</Button>
              </form>
              <p className="text-xs text-center text-gray-400 mt-4">By registering, you agree to our <button onClick={() => openLegal('terms_of_service')} className="text-primary-500 hover:underline">Terms</button> and <button onClick={() => openLegal('privacy_policy')} className="text-primary-500 hover:underline">Privacy Policy</button>.</p>
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default RegistrationPage;