import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';
import Spinner from '../../components/ui/Spinner';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return setError('Email is required');
    setError('');
    setLoading(true);
    try {
      await api.post('/public/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-4 text-center">
          <div className="text-5xl mb-4">📧</div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Check Your Email</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-4">
            If an account exists for <strong>{email}</strong>, a password reset link has been sent.
          </p>
          <Link to="/login" className="text-primary-500 hover:underline text-sm">← Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 text-center">Forgot Password</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-6">Enter your email and we'll send you a reset link.</p>
        {error && <Alert variant="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@company.com" required />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Spinner /> : 'Send Reset Link'}
          </Button>
        </form>
        <div className="mt-4 text-center">
          <Link to="/login" className="text-sm text-gray-400 hover:text-primary-500">← Back to Login</Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;