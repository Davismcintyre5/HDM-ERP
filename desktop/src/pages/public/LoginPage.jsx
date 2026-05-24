import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Checkbox from '../../components/ui/Checkbox';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';
import api from '../../api/axios';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [forgotKeyOpen, setForgotKeyOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState({ email: '', phone: '' });
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const savedEmail = localStorage.getItem('userEmail');
    const savedRemember = localStorage.getItem('rememberMe');
    if (savedRemember === 'true' && savedEmail) {
      setEmail(savedEmail);
      setRememberMe(true);
    }
    let cancelled = false;
    api.get('/public/landing').then(res => {
      if (!cancelled) setContactInfo({ email: res.data.data?.contactEmail || '', phone: res.data.data?.contactPhone || '' });
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) return setError('Email and password required');
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password, rememberMe);
      if (result?.requiresActivation) {
        navigate('/activate', { replace: true });
        return;
      }
      if (rememberMe) {
        localStorage.setItem('userEmail', email);
        localStorage.setItem('rememberMe', 'true');
      } else {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('rememberMe');
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      if (err.response?.data?.requiresActivation) {
        navigate('/activate', { replace: true });
        return;
      }
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Login to HDM ERP</h1>
        {error && <Alert variant="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleLogin} className="space-y-4">
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required /></div>
          <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required /></div>
          <div className="flex items-center"><Checkbox label="Remember me" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)} /></div>
          <Button type="submit" className="w-full" disabled={loading}>{loading ? <Spinner /> : 'Login'}</Button>
        </form>
        <div className="mt-6 text-center space-y-2 text-sm">
          <p className="text-gray-500 dark:text-gray-400">Don't have an account? <Link to="/pricing" className="text-primary-500 hover:underline font-medium">Register</Link></p>
          <button onClick={() => setForgotKeyOpen(true)} className="text-gray-400 hover:text-primary-500 block mx-auto">Forgot your license key?</button>
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

export default LoginPage;