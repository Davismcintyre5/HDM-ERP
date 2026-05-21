import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import api from '../../api/axios';
import { Shield, ArrowRight } from 'lucide-react';

const ActivationPage = () => {
  const [licenseKey, setLicenseKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [forgotKeyOpen, setForgotKeyOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/public/landing').then(res => {
      setContactInfo({ email: res.data.data?.contactEmail || '', phone: res.data.data?.contactPhone || '' });
    }).catch(() => {});
  }, []);

  const handleActivate = async (e) => {
    e.preventDefault();
    if (!licenseKey) return setError('License key is required');
    setError('');
    setLoading(true);
    try {
      const { data } = await api.post('/public/activation', { licenseKey });
      setCompanyName(data.data?.companyName || '');
      setSuccess(true);
      setTimeout(() => navigate('/login', { replace: true }), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid license key.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
            <Shield size={32} className="text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Activated Successfully!</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-1">License key verified for</p>
          <p className="text-lg font-semibold text-primary-500 mb-4">{companyName}</p>
          <p className="text-sm text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-4">
        <div className="text-center mb-6">
          <div className="text-5xl mb-3">🔐</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Activate Your Device</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Enter your license key to activate this device.</p>
        </div>
        {error && <Alert variant="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleActivate} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">License Key</label><Input value={licenseKey} onChange={e => setLicenseKey(e.target.value.toUpperCase())} placeholder="HDM-XXXX-XXXX-XXXX" className="text-center tracking-widest" required /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? <Spinner /> : 'Activate'}</Button>
        </form>
        <div className="mt-6 text-center space-y-2 text-sm">
          <button onClick={() => setForgotKeyOpen(true)} className="text-gray-400 hover:text-primary-500 block mx-auto">Forgot your license key?</button>
          <p className="text-gray-500 dark:text-gray-400">Don't have an account? <Link to="/pricing" className="text-primary-500 hover:underline font-medium">Register</Link></p>
          <Link to="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 block">← Back to Home</Link>
        </div>
      </div>
      {forgotKeyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setForgotKeyOpen(false)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-sm p-6 text-center" onClick={e => e.stopPropagation()}>
            <div className="text-4xl mb-3">🔑</div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Forgot Your License Key?</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Contact our support team and we'll help you recover it.</p>
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4 text-sm text-left space-y-1">
              <p><strong>Email:</strong> {contactInfo.email}</p>
              <p><strong>Phone:</strong> {contactInfo.phone}</p>
              <p className="text-xs text-gray-500 mt-2">Include your company name and registered email.</p>
            </div>
            <Button variant="primary" onClick={() => setForgotKeyOpen(false)} className="w-full">Got It</Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivationPage;