import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

const getStorage = (key) => localStorage.getItem(key) || sessionStorage.getItem(key);
const setStorage = (key, value, remember) => {
  if (remember) localStorage.setItem(key, value);
  else sessionStorage.setItem(key, value);
};
const removeStorage = (key) => { localStorage.removeItem(key); sessionStorage.removeItem(key); };

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { const stored = getStorage('user'); return stored ? JSON.parse(stored) : null; }
    catch { return null; }
  });
  const [token, setToken] = useState(getStorage('accessToken'));
  const [loading, setLoading] = useState(true);

  const login = async (email, password, rememberMe = false) => {
    const { data } = await api.post('/public/auth/login', { email, password, rememberMe });
    const { accessToken, refreshToken, user: userData, requiresActivation } = data.data || {};
    if (requiresActivation || !accessToken) return { requiresActivation: true };

    setStorage('accessToken', accessToken, rememberMe);
    setStorage('refreshToken', refreshToken, rememberMe);
    setStorage('user', JSON.stringify(userData), rememberMe);

    if (rememberMe) {
      localStorage.setItem('userEmail', email);
      localStorage.setItem('rememberMe', 'true');
    }

    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
    setToken(accessToken);
    setUser(userData);
    return data;
  };

  const logout = () => {
    removeStorage('accessToken');
    removeStorage('refreshToken');
    removeStorage('user');
    removeStorage('userEmail');
    removeStorage('rememberMe');
    delete api.defaults.headers.common['Authorization'];
    setToken(null);
    setUser(null);
  };

  const refreshAuth = useCallback(async () => {
    try {
      const rt = localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
      if (!rt) throw new Error('No refresh token');
      const { data } = await api.post('/public/auth/refresh', { refreshToken: rt });
      const newToken = data.data.accessToken;
      const remember = !!localStorage.getItem('refreshToken');
      setStorage('accessToken', newToken, remember);
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      setToken(newToken);
      return newToken;
    } catch { logout(); throw new Error('Session expired'); }
  }, []);

  // Restore session on mount
  useEffect(() => {
    const storedToken = getStorage('accessToken');
    if (storedToken) {
      api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
      setToken(storedToken);
      try {
        const storedUser = getStorage('user');
        if (storedUser) setUser(JSON.parse(storedUser));
      } catch {}
    }
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, refreshAuth, loading, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);