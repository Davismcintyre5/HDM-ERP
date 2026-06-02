import { createContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../hooks/useAuth';
import api from '../api/axios';

export const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [modules, setModules] = useState({});
  const [plan, setPlan] = useState(null);

  const fetchTenantData = useCallback(async () => {
    try {
      const [companyRes, modulesRes] = await Promise.all([
        api.get('/tenant/company'),
        api.get('/tenant/company/modules')
      ]);
      setTenant(companyRes.data.data);
      setModules(modulesRes.data.data.modules || modulesRes.data.data.planModules || {});
      setPlan(modulesRes.data.data.plan);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setTenant(null);
      setModules({});
      setPlan(null);
      return;
    }
    fetchTenantData();
  }, [isAuthenticated, token, fetchTenantData]);

  const refreshModules = useCallback(async () => {
    try {
      const modulesRes = await api.get('/tenant/company/modules');
      setModules(modulesRes.data.data.modules || modulesRes.data.data.planModules || {});
    } catch {}
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, modules, plan, refreshModules }}>
      {children}
    </TenantContext.Provider>
  );
};