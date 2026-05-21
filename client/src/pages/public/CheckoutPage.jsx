import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { submitPayment } from '../../api/public/paymentApi';
import { useApp } from '../../context/AppContext';
import LandingNavbar from '../../components/public/LandingNavbar';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import { ArrowRight, Check, Clock, AlertTriangle, Phone, CreditCard, Smartphone, Shield } from 'lucide-react';

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const planName = searchParams.get('plan') || 'free_trial';
  const cycle = searchParams.get('cycle') || 'monthly';
  const company = searchParams.get('company') || '';
  const email = searchParams.get('email') || '';
  const phone = searchParams.get('phone') || '';
  const password = searchParams.get('password') || '';
  const fullName = searchParams.get('fullName') || '';

  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState('');
  const [methods, setMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [proofFile, setProofFile] = useState(null);
  const [requireProof, setRequireProof] = useState(false);
  const [mpesaNumber, setMpesaNumber] = useState('');
  const [mpesaDetails, setMpesaDetails] = useState({});
  const [showConfirm, setShowConfirm] = useState(false);
  const { openLegal, openContact } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const api = (await import('../../api/axios')).default;
        const [plansRes, landingRes] = await Promise.all([api.get('/public/plans'), api.get('/public/landing')]);
        setPlan(plansRes.data.data.find(pl => pl.name === planName));
        const settings = landingRes.data.data;
        const payMethods = [];
        const mpDetails = {};
        if (settings?.payments?.mpesa?.enabled) {
          mpDetails.enabled = true;
          if (settings.payments.mpesa.stkPush) payMethods.push({ value: 'mpesa_stk', label: 'M-Pesa STK Push', icon: Smartphone, desc: 'Receive a popup on your phone to enter your PIN' });
          if (settings.payments.mpesa.sendMoney?.enabled) { mpDetails.sendMoneyNumber = settings.payments.mpesa.sendMoney.phoneNumber || 'N/A'; payMethods.push({ value: 'mpesa_send_money', label: 'M-Pesa Send Money', icon: Phone, desc: `Send money to ${mpDetails.sendMoneyNumber}` }); }
          if (settings.payments.mpesa.paybill?.enabled) { mpDetails.paybillNumber = settings.payments.mpesa.paybill.businessNumber; mpDetails.paybillAccount = settings.payments.mpesa.paybill.accountName; payMethods.push({ value: 'mpesa_paybill', label: 'M-Pesa Paybill', icon: Phone, desc: `Pay to ${mpDetails.paybillNumber}` }); }
          if (settings.payments.mpesa.till?.enabled) { mpDetails.tillNumber = settings.payments.mpesa.till.tillNumber; mpDetails.tillName = settings.payments.mpesa.till.businessName; payMethods.push({ value: 'mpesa_till', label: 'M-Pesa Buy Goods / Till', icon: Phone, desc: `Pay to Till ${mpDetails.tillNumber}` }); }
        }
        if (settings?.payments?.stripe?.enabled) payMethods.push({ value: 'stripe', label: 'Credit/Debit Card (Stripe)', icon: CreditCard, desc: 'Pay securely with your card' });
        setMethods(payMethods);
        setMpesaDetails(mpDetails);
        setRequireProof(settings?.payments?.requireProof || false);
        if (payMethods.length > 0) setSelectedMethod(payMethods[0].value);
      } catch {}
      setLoading(false);
    };
    fetchData();
  }, []);

  const handleFileChange = (e) => { const file = e.target.files[0]; if (file && file.size > 5 * 1024 * 1024) return setError('File too large.'); setProofFile(file); };

  const handleStripePay = async () => {
    setSubmitting(true);
    try {
      const { data } = await submitPayment({ companyName: company, contactEmail: email, plan: planName, billingCycle: cycle, paymentMethod: 'stripe', password, fullName });
      if (data.data?.url) window.location.href = data.data.url;
    } catch (err) { setError(err.response?.data?.message || 'Stripe error'); setSubmitting(false); }
  };

  const handleSTKPush = async () => {
    if (!mpesaNumber || mpesaNumber.length < 10) return setError('Enter a valid phone number');
    setSubmitting(true); setError('');
    try {
      const { data } = await submitPayment({ companyName: company, contactEmail: email, plan: planName, billingCycle: cycle, paymentMethod: 'mpesa_stk', phone: mpesaNumber, password, fullName });
      if (data.data?.CheckoutRequestID) setSuccess({ licenseKey: null, message: 'STK Push sent! Check your phone.' });
    } catch (err) { setError(err.response?.data?.message || 'M-Pesa error'); } finally { setSubmitting(false); }
  };

  const handleManualSubmit = () => {
    if (requireProof && !proofFile && !transactionId) return setError('Please upload proof or enter transaction ID');
    setShowConfirm(true);
  };

  const handleFinalSubmit = async () => {
    setShowConfirm(false); setSubmitting(true); setError('');
    try {
      const payRes = await submitPayment({ companyName: company, contactEmail: email, plan: planName, billingCycle: cycle, paymentMethod: selectedMethod, transactionId, phone: mpesaNumber || phone, password, fullName });
      setSuccess({ licenseKey: null, message: 'Payment submitted for review. You will receive your license key via email once approved.' });
    } catch (err) { setError(err.response?.data?.message || 'Submission failed.'); } finally { setSubmitting(false); }
  };

  const amount = plan?.pricing?.[cycle] || 0;
  const currency = plan?.displayCurrency || 'KSh';
  const isManual = selectedMethod && !['stripe', 'mpesa_stk'].includes(selectedMethod);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Submitted!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{success.message}</p>
          <Button onClick={() => navigate('/login')} className="w-full">🚀 Go to Login</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <LandingNavbar config={{}} onOpenLegal={openLegal} onOpenContact={openContact} />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="flex items-center justify-center gap-2 mb-8 text-sm">
          <span className="flex items-center gap-1 text-gray-400"><Check size={14} className="text-primary-500" /> Plan</span><ArrowRight size={14} className="text-gray-300" />
          <span className="flex items-center gap-1 text-gray-400"><Check size={14} className="text-primary-500" /> Details</span><ArrowRight size={14} className="text-gray-300" />
          <span className="flex items-center gap-1 text-primary-500 font-medium"><span className="w-4 h-4 rounded-full bg-primary-500 text-white text-xs flex items-center justify-center">3</span> Checkout</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Checkout</h1>
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
          <div className="flex justify-between items-center">
            <div><p className="font-semibold text-gray-900 dark:text-white">{plan?.displayName} — {cycle === 'yearly' ? 'Yearly' : cycle === 'permanent' ? 'One-Time' : 'Monthly'}</p><p className="text-sm text-gray-500 dark:text-gray-400">{company} • {email}</p></div>
            <p className="text-xl font-bold text-primary-500">{currency === 'KSh' ? `KSh ${amount.toLocaleString()}` : `$${amount}`}</p>
          </div>
        </div>
        {error && <Alert variant="error" message={error} onClose={() => setError('')} />}
        {planName !== 'free_trial' && (
          <>
            <div className="mb-6"><h3 className="font-semibold text-gray-900 dark:text-white mb-3">Payment Method</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {methods.map(m => (
                  <button key={m.value} onClick={() => { setSelectedMethod(m.value); setError(''); }} className={`p-4 rounded-lg border text-left transition-all ${selectedMethod === m.value ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 ring-1 ring-primary-500' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <m.icon size={20} className="text-primary-500 mb-2" /><span className="font-medium text-sm text-gray-900 dark:text-white block">{m.label}</span><span className="text-xs text-gray-500 dark:text-gray-400">{m.desc}</span>
                  </button>
                ))}
              </div>
            </div>
            {selectedMethod === 'stripe' && (<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><CreditCard size={24} className="text-primary-500 mb-2" /><p className="text-sm text-gray-600 dark:text-gray-400 mb-4">You will be redirected to Stripe's secure checkout.</p><Button onClick={handleStripePay} disabled={submitting} className="w-full">{submitting ? 'Redirecting...' : `Pay ${currency === 'KSh' ? `KSh ${amount.toLocaleString()}` : `$${amount}`}`}</Button></div>)}
            {selectedMethod === 'mpesa_stk' && (<div className="mb-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"><Smartphone size={24} className="text-primary-500 mb-2" /><p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Enter your M-Pesa phone number.</p><div className="mb-3"><label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">M-Pesa Phone Number</label><Input value={mpesaNumber} onChange={e => setMpesaNumber(e.target.value)} placeholder="07XX XXX XXX" /></div><Button onClick={handleSTKPush} disabled={submitting} className="w-full">{submitting ? 'Sending...' : 'Send STK Push'}</Button></div>)}
            {selectedMethod === 'mpesa_send_money' && (<div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"><h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">📱 How to Pay via M-Pesa Send Money</h4><ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside"><li>Go to <strong>Safaricom M-Pesa</strong> menu</li><li>Select <strong>Send Money</strong></li><li>Enter number: <strong className="text-primary-500">{mpesaDetails.sendMoneyNumber || 'N/A'}</strong></li><li>Enter amount: <strong className="text-primary-500">{currency === 'KSh' ? `KSh ${amount.toLocaleString()}` : `$${amount}`}</strong></li><li>Enter PIN and send</li><li>Click <strong>"I Have Paid"</strong></li></ol></div>)}
            {selectedMethod === 'mpesa_paybill' && (<div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"><h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">📱 How to Pay via M-Pesa Paybill</h4><ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside"><li>Go to <strong>Safaricom M-Pesa</strong></li><li>Select <strong>Lipa na M-Pesa</strong> → <strong>Paybill</strong></li><li>Business Number: <strong className="text-primary-500">{mpesaDetails.paybillNumber || 'N/A'}</strong></li><li>Account Name: <strong className="text-primary-500">{mpesaDetails.paybillAccount || 'N/A'}</strong></li><li>Amount: <strong className="text-primary-500">{currency === 'KSh' ? `KSh ${amount.toLocaleString()}` : `$${amount}`}</strong></li><li>Enter PIN, send, click <strong>"I Have Paid"</strong></li></ol></div>)}
            {selectedMethod === 'mpesa_till' && (<div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"><h4 className="font-semibold text-amber-800 dark:text-amber-300 mb-3">📱 How to Pay via M-Pesa Buy Goods / Till</h4><ol className="text-sm text-gray-700 dark:text-gray-300 space-y-2 list-decimal list-inside"><li>Go to <strong>Safaricom M-Pesa</strong></li><li>Select <strong>Lipa na M-Pesa</strong> → <strong>Buy Goods</strong></li><li>Till Number: <strong className="text-primary-500">{mpesaDetails.tillNumber || 'N/A'}</strong></li><li>Amount: <strong className="text-primary-500">{currency === 'KSh' ? `KSh ${amount.toLocaleString()}` : `$${amount}`}</strong></li><li>Enter PIN, send, click <strong>"I Have Paid"</strong></li></ol></div>)}
            {isManual && (
              <>
                {requireProof && (<><div className="mb-4"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Transaction ID *</label><Input value={transactionId} onChange={e => setTransactionId(e.target.value)} placeholder="e.g. QWE123456" /></div><div className="mb-4"><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Proof *</label><input type="file" accept="image/*,.pdf" onChange={handleFileChange} className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700" /></div></>)}
                <div className="flex items-start gap-2 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6"><Clock size={18} className="text-red-500 shrink-0 mt-0.5" /><p className="text-sm text-red-700 dark:text-red-400">Payment not confirmed within <strong>3 hours</strong> will be automatically rejected.</p></div>
                <Button onClick={handleManualSubmit} disabled={submitting} className="w-full">{submitting ? 'Submitting...' : 'I Have Paid — Submit'}</Button>
              </>
            )}
          </>
        )}
      </div>
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setShowConfirm(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}><AlertTriangle size={48} className="text-amber-500 mx-auto mb-4" /><h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Confirm Payment</h3><p className="text-sm text-gray-600 dark:text-gray-400 mb-6">Are you sure you have paid? Unconfirmed payments are auto-rejected after 3 hours.</p><div className="flex gap-3"><Button variant="ghost" onClick={() => setShowConfirm(false)} className="flex-1">Cancel</Button><Button variant="primary" onClick={handleFinalSubmit} className="flex-1">Yes, I Have Paid</Button></div></div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;