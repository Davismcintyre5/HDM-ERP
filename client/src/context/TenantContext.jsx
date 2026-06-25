import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getModules } from '../api/tenant/companyApi';
import api from '../api/axios';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const [tenant, setTenant] = useState(null);
  const [modules, setModules] = useState({});
  const [plan, setPlan] = useState('');
  const [loaded, setLoaded] = useState(false);

  const refreshModules = useCallback(async () => {
    try {
      const res = await getModules();
      const data = res.data.data;
      setModules(data.modules || {});
      setPlan(data.plan || '');
      setTenant(prev => prev || {});
      return data;
    } catch (err) {
      console.error('Failed to refresh modules:', err);
    }
  }, []);

  // Initial load
  useEffect(() => {
    const token = localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken');
    if (!token) {
      setLoaded(true);
      return;
    }

    refreshModules().finally(() => setLoaded(true));

    // Listen for storage changes (other tabs)
    const handleStorage = (e) => {
      if (e.key === 'accessToken' || e.key === null) {
        refreshModules();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshModules]);

  // Refresh after any settings change — listen for custom event
  useEffect(() => {
    const handleModuleChange = () => refreshModules();
    window.addEventListener('modules-updated', handleModuleChange);
    return () => window.removeEventListener('modules-updated', handleModuleChange);
  }, [refreshModules]);

  return (
    <TenantContext.Provider value={{ tenant, setTenant, modules, plan, refreshModules, loaded }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);