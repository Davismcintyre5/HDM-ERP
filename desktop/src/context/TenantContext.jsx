import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useAuth } from './AuthContext';
import api from '../api/axios';

const TenantContext = createContext(null);

export const TenantProvider = ({ children }) => {
  const { isAuthenticated, token } = useAuth();
  const [tenant, setTenant] = useState(null);
  const [modules, setModules] = useState({});
  const [limits, setLimits] = useState({});
  const [plan, setPlan] = useState(null);
  const fetchedRef = useRef(false);

  const fetchTenantData = useCallback(async () => {
    try {
      const [companyRes, modulesRes] = await Promise.all([
        api.get('/tenant/company'),
        api.get('/tenant/company/modules')
      ]);
      setTenant(companyRes.data.data);
      setModules(modulesRes.data.data.modules || modulesRes.data.data.planModules || {});
      setLimits(modulesRes.data.data.limits || {});
      setPlan(modulesRes.data.data.plan);
    } catch {}
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setTenant(null);
      setModules({});
      setLimits({});
      setPlan(null);
      fetchedRef.current = false;
      return;
    }

    if (fetchedRef.current) return;
    fetchedRef.current = true;
    fetchTenantData();
  }, [isAuthenticated, token, fetchTenantData]);

  const refreshModules = useCallback(async () => {
    try {
      const modulesRes = await api.get('/tenant/company/modules');
      setModules(modulesRes.data.data.modules || modulesRes.data.data.planModules || {});
      setPlan(modulesRes.data.data.plan);
    } catch {}
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, modules, limits, plan, refreshModules }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => useContext(TenantContext);