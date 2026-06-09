import { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from '../../api/axios';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Alert from '../../components/ui/Alert';

const ResetPasswordPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password) return setError('Password is required');
    setLoading(true);
    try {
      await axios.post('/public/auth/reset-password', { token, password });
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-4 text-center">
          <div className="text-4xl mb-4">✅</div>
          <h1 className="text-xl font-bold mb-2">Password Reset!</h1>
          <p className="text-gray-500 text-sm">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-4 text-center">
          <h1 className="text-xl font-bold mb-2">Invalid Link</h1>
          <p className="text-gray-500 text-sm">This reset link is missing or invalid.</p>
          <Link to="/login" className="text-primary-500 hover:underline mt-4 block">← Back to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md mx-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">Reset Password</h1>
        {error && <Alert variant="error" message={error} onClose={() => setError('')} />}
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="New password" required />
          <Button type="submit" className="w-full" disabled={loading}>{loading ? 'Resetting...' : 'Reset Password'}</Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;