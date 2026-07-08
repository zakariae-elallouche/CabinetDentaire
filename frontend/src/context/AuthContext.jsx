import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import api from '../api';

const AuthContext = createContext();

export function AuthProvider({ children }) {

  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [branding, setBranding] = useState(() => {
    const saved = localStorage.getItem('branding');
    return saved ? JSON.parse(saved) : null;
  });

  const [token, setToken] = useState(
    () => localStorage.getItem('token') || null
  );

  const [tenantStatut, setTenantStatut] = useState(
    () => localStorage.getItem('tenantStatut') || null
  );

  const applyBranding = useCallback(() => {
    document.documentElement.style.setProperty('--accent', '#57c8cb');
  }, []);

  const buildNomComplet = (obj) => {
    const nom = obj?.nom || obj?.nom_clinique || ''
    const prenom = obj?.prenom || ''
    const nc = prenom && nom ? `${prenom} ${nom}` : nom
    return { ...obj, nom, prenom, nom_complet: nc }
  }

  useEffect(() => {
    if (token) {
      api.get('/me')
        .then(res => {
          const merged = buildNomComplet({ ...res.data.user, ...res.data.profile });
          setUser(merged);
          localStorage.setItem('user', JSON.stringify(merged));
          if (res.data.tenant_branding) {
            setBranding(res.data.tenant_branding);
            localStorage.setItem('branding', JSON.stringify(res.data.tenant_branding));
          }
          if (res.data.tenant_statut) {
            setTenantStatut(res.data.tenant_statut);
            localStorage.setItem('tenantStatut', res.data.tenant_statut);
          }
        })
        .catch(() => logout());
    }
  }, []);

  useEffect(() => {
    applyBranding();
  }, [applyBranding]);

  const login = async (email, password) => {
    const res = await api.post('/login', { email, password });
    const { token: newToken, user: userData, tenant_branding, tenant_statut } = res.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);

    if (tenant_branding) {
      setBranding(tenant_branding);
      localStorage.setItem('branding', JSON.stringify(tenant_branding));
    }

    if (tenant_statut) {
      setTenantStatut(tenant_statut);
      localStorage.setItem('tenantStatut', tenant_statut);
    }

    let mergedUser = { ...userData };
    try {
      const profileRes = await api.get('/me');
      mergedUser = buildNomComplet({ ...userData, ...profileRes.data.profile });
      if (profileRes.data.tenant_statut) {
        setTenantStatut(profileRes.data.tenant_statut);
        localStorage.setItem('tenantStatut', profileRes.data.tenant_statut);
      }
    } catch { mergedUser = buildNomComplet(mergedUser) }

    setUser(mergedUser);
    localStorage.setItem('user', JSON.stringify(mergedUser));

    return mergedUser;
  };

  const register = async (data) => {
    const res = await api.post('/register', data);
    const { token: newToken, user: userData, tenant_branding } = res.data;

    localStorage.setItem('token', newToken);
    setToken(newToken);
    const merged = buildNomComplet(userData);
    setUser(merged);
    localStorage.setItem('user', JSON.stringify(merged));

    if (tenant_branding) {
      setBranding(tenant_branding);
      localStorage.setItem('branding', JSON.stringify(tenant_branding));
    }
  };

  const logout = async () => {
    await api.post('/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('branding');
    localStorage.removeItem('tenantStatut');
    setToken(null);
    setUser(null);
    setBranding(null);
    setTenantStatut(null);
  };

  const updateUser = (patch) => {
    setUser(prev => {
      const next = { ...prev, ...patch };
      localStorage.setItem('user', JSON.stringify(next));
      return next;
    });
  };

  const updateBranding = (b) => {
    setBranding(b);
    localStorage.setItem('branding', JSON.stringify(b));
  };

  const forgotPassword = async (email) => {
    const res = await api.post('/forgot-password', { email });
    return res.data;
  };

  const resetPassword = async (email, token, password, password_confirmation) => {
    const res = await api.post('/reset-password', { email, token, password, password_confirmation });
    return res.data;
  };

  return (
    <AuthContext.Provider value={{ user, token, branding, tenantStatut, login, register, logout, updateUser, updateBranding, forgotPassword, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
