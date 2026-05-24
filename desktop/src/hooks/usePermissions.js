import { useAuth } from './useAuth';
import { hasPermission } from '../utils/permissions';

const usePermissions = (module) => {
  const { user } = useAuth();
  return hasPermission(user?.role, module);
};

export default usePermissions;