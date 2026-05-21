import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  const [maintenance, setMaintenance] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      import('../api/axios').then(({ default: api }) => {
        api.get('/public/landing')
          .then(res => {
            if (res.data.data?.maintenanceMode) {
              setMaintenance(true);
              setMaintenanceMessage(res.data.data.maintenanceMessage);
            }
          })
          .catch(err => {
            if (err.response?.status === 503) {
              setMaintenance(true);
              setMaintenanceMessage(err.response?.data?.message || 'Under maintenance');
            }
          });
      });
    }
  }, [isAuthenticated]);

  if (loading) return <div className="flex justify-center py-20"><Spinner /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

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

  return <Outlet />;
};

export default ProtectedRoute;