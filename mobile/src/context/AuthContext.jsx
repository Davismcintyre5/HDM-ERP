import { createContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { getStorage, setStorage, removeStorage, clearAll } from '../utils/storage';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const storedToken = await getStorage('accessToken');
      const storedUser = await getStorage('user');
      if (storedToken) {
        setToken(storedToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      }
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch {}
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const { data } = await api.post('/public/auth/login', { email, password, rememberMe });
    const { accessToken, refreshToken, user: userData, requiresActivation } = data.data || {};
    if (requiresActivation || !accessToken) return { requiresActivation: true };

    await setStorage('accessToken', accessToken);
    await setStorage('refreshToken', refreshToken);
    await setStorage('user', JSON.stringify(userData));

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setToken(accessToken);
    setUser(userData);
    return data;
  };

  const logout = async () => {
    await clearAll();
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};