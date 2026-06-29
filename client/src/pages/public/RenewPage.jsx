import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRenewInfo, submitRenew } from '../../api/public/renewApi';
import Button from '../../components/ui/Button';
import Spinner from '../../components/ui/Spinner';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Input from '../../components/ui/Input';
import formatCurrency from '../../utils/formatCurrency';
import { Check, Phone, CreditCard, Smartphone, AlertTriangle, Clock } from 'lucide-react';
import api from '../../api/axios';

const cycleLabels = { monthly: 'Monthly', yearly: 'Yearly', permanent: 'One-Time' };

const RenewPage = () => {
  const navigate = useNavigate();
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [selectedCycle, setSelectedCycle] = useState('monthly');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState(null);
  const [done, setDone] = useState(false);
  const [result, setResult] = useState(null);

  // Payment methods from API
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [mpesaDetails, setMpesaDetails] = useState({});
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [requireProof, setRequireProof] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('renew_token');
    if (!token) {
      navigate('/login');
      return;
    }

    Promise.all([
      getRenewInfo(token),
      api.get('/public/landing')
    ]).then(([renewRes, landingRes]) => {
      setInfo(renewRes.data.data);
      if (renewRes.data.data?.availablePlans?.length > 0) {
        setSelectedPlan(renewRes.data.data.availablePlans[0].name);
      }

      // Build payment methods from settings
      const settings = landingRes.data.data;
      const payMethods = [];
      const mpDetails = {};
      if (settings?.payments?.mpesa?.enabled) {
        mpDetails.enabled = true;
        if (settings.payments.mpesa.stkPush) payMethods.push({ value: 'mpesa_stk', label: 'M-Pesa STK Push', icon: Smartphone, desc: 'Receive a popup on your phone to enter your PIN' });
        if (settings.payments.mpesa.sendMoney?.enabled) { mpDetails.sendMoneyNumber = settings.payments.mpesa.sendMoney.phoneNumber || 'N/A'; payMethods.push({ value: 'mpesa_send_money', label: 'M-Pesa Send Money', icon: Phone, desc: `Send to ${mpDetails.sendMoneyNumber}` }); }
        if (settings.payments.mpesa.paybill?.enabled) { mpDetails.paybillNumber = settings.payments.mpesa.paybill.businessNumber; mpDetails.paybillAccount = settings.payments.mpesa.paybill.accountName; payMethods.push({ value: 'mpesa_paybill', label: 'M-Pesa Paybill', icon: Phone, desc: `Pay to ${mpDetails.paybillNumber}` }); }
        if (settings.payments.mpesa.till?.enabled) { mpDetails.tillNumber = settings.payments.mpesa.till.tillNumber; mpDetails.tillName = settings.payments.mpesa.till.businessName; payMethods.push({ value: 'mpesa_till', label: 'M-Pesa Buy Goods / Till', icon: Phone, desc: `Pay to Till ${mpDetails.tillNumber}` }); }
      }
      if (settings?.payments?.stripe?.enabled) payMethods.push({ value: 'stripe', label: 'Credit/Debit Card (Stripe)', icon: CreditCard, desc: 'Pay securely with your card' });
      setMethods(payMethods);
      setMpesaDetails(mpDetails);
      setRequireProof(settings?.payments?.requireProof || false);
      if (payMethods.length > 0) setSelectedMethod(payMethods[0].value);
    }).catch(() => setMessage({ type: 'error', text: 'Failed to load' }))
    .finally(() => setLoading(false));
  }, [navigate]);

  const handleSubmit = async () => {
    if (!selectedPlan || !selectedCycle) return;
    setSubmitting(true);
    const token = sessionStorage.getItem('renew_token');
    try {
      const res = await submitRenew(token, selectedPlan, selectedCycle, selectedMethod, transactionId, mpesaNumber);
      setResult(res.data.data);
      setDone(true);
      setMessage({ type: 'success', text: res.data.data?.message || 'Renewal submitted for approval!' });
    } catch (err) {
      setMessage({ type: 'error', text: err?.response?.data?.message || 'Failed to submit renewal' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="text-5xl mb-4">📋</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Renewal Submitted!</h1>
          <p className="text-gray-500 dark:text-gray-400 mb-2">{message?.text}</p>
          {result?.reference && <p className="text-xs text-gray-400 mb-4">Reference: <strong>{result.reference}</strong></p>}
          <Button onClick={() => { sessionStorage.removeItem('renew_token'); navigate('/login'); }} className="w-full">
            Go to Login
          </Button>
        </Card>
      </div>
    );
  }

  const currentPlan = info?.availablePlans?.find(p => p.name === selectedPlan);
  const rate = info?.currency === 'KSh' ? 154 : 1;
  const price = currentPlan?.pricing?.[selectedCycle] || 0;
  const displayPrice = info?.currency === 'KSh' ? Math.round(price * rate) : price;
  const isManual = selectedMethod && !['stripe', 'mpesa_stk'].includes(selectedMethod);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4 py-8">
      <Card className="max-w-2xl w-full p-6">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription Expired</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Renew your plan to regain access</p>
        </div>

        {message && (
          <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
            {message.text}
          </div>
        )}

        {/* Account Info */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">Account</p>
          <p className="font-semibold text-gray-900 dark:text-white">{info?.companyName}</p>
          <p className="text-xs text-gray-400">{info?.email}</p>
          <div className="flex gap-2 mt-2">
            <Badge variant="warning">Current: {info?.currentPlanName}</Badge>
            {info?.trialEndDate && <Badge>Expired: {new Date(info?.trialEndDate).toLocaleDateString()}</Badge>}
            {info?.subscriptionExpiry && <Badge>Expired: {new Date(info?.subscriptionExpiry).toLocaleDateString()}</Badge>}
          </div>
        </div>

        {/* Plan Selection */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Select Plan</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(info?.availablePlans || []).map(plan => (
              <button
                key={plan.name}
                onClick={() => setSelectedPlan(plan.name)}
                className={`p-3 rounded-lg border text-center transition-all ${
                  selectedPlan === plan.name
                    ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                }`}
              >
                <p className="text-sm font-semibold text-gray-900 dark:text-white">{plan.displayName}</p>
                <p className="text-xs text-primary-500 font-medium">
                  {info?.currency} {Math.round((plan.pricing.monthly || 0) * rate).toLocaleString()}/mo
                </p>
              </button>
            ))}
          </div>
        </div>

        {/* Billing Cycle */}
        <div className="mb-4">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Billing Cycle</p>
          <div className="flex gap-2">
            {['monthly', 'yearly', 'permanent'].map(cycle => {
              const cyclePrice = currentPlan?.pricing?.[cycle] || 0;
              const displayCyclePrice = info?.currency === 'KSh' ? Math.round(cyclePrice * rate) : cyclePrice;
              if (cyclePrice <= 0) return null;
              return (
                <button
                  key={cycle}
                  onClick={() => setSelectedCycle(cycle)}
                  className={`flex-1 p-3 rounded-lg border text-center transition-all ${
                    selectedCycle === cycle
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                  }`}
                >
                  <p className="text-xs font-semibold text-gray-900 dark:text-white">{cycleLabels[cycle]}</p>
                  <p className="text-xs text-primary-500">{formatCurrency(displayCyclePrice, info?.currency)}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Payment Method */}
        {methods.length > 0 && (
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Payment Method</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {methods.map(m => (
                <button
                  key={m.value}
                  onClick={() => { setSelectedMethod(m.value); setMessage(null); }}
                  className={`p-3 rounded-lg border text-left transition-all ${
                    selectedMethod === m.value
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`}
                >
                  <m.icon size={18} className="text-primary-500 mb-1" />
                  <span className="font-medium text-xs text-gray-900 dark:text-white block">{m.label}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">{m.desc}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Payment Instructions */}
        {selectedMethod === 'mpesa_stk' && (
          <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Input label="M-Pesa Phone Number" value={mpesaNumber} onChange={e => setMpesaNumber(e.target.value)} placeholder="07XX XXX XXX" />
          </div>
        )}
        {selectedMethod === 'mpesa_send_money' && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg text-xs">
            <p className="font-semibold text-amber-800 dark:text-amber-300 mb-1">Send Money Instructions:</p>
            <p>1. Go to M-Pesa → Send Money</p>
            <p>2. Enter: <strong>{mpesaDetails.sendMoneyNumber || 'N/A'}</strong></p>
            <p>3. Amount: <strong>{formatCurrency(displayPrice, info?.currency)}</strong></p>
            <p>4. Enter PIN and send, then click Submit below</p>
          </div>
        )}
        {isManual && requireProof && (
          <div className="mb-4">
            <Input label="Transaction ID / Reference" value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="e.g. QWE123456" />
          </div>
        )}

        {/* Total */}
        <div className="bg-primary-50 dark:bg-primary-900/20 rounded-lg p-4 mb-4 flex justify-between items-center">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Total</span>
          <span className="text-lg font-bold text-primary-500">{formatCurrency(displayPrice, info?.currency)}</span>
        </div>

        {isManual && (
          <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
            <Clock size={16} className="text-red-500 shrink-0 mt-0.5" />
            <p className="text-xs text-red-700 dark:text-red-400">Unconfirmed payments are auto-rejected after 3 hours.</p>
          </div>
        )}

        <Button onClick={handleSubmit} disabled={submitting || !selectedPlan} className="w-full">
          {submitting ? 'Submitting...' : 'Submit Renewal Request'}
        </Button>

        <p className="text-xs text-gray-400 text-center mt-3">
          Your request will be reviewed by an admin. You'll receive an email once approved.
        </p>
      </Card>
    </div>
  );
};

export default RenewPage;