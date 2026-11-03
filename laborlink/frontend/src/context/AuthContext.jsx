import { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('laborlink_user');
    return stored ? JSON.parse(stored) : null;
  });
  const [authInitializing, setAuthInitializing] = useState(() => Boolean(localStorage.getItem('laborlink_token')));
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem('laborlink_token');

    if (!token) return () => { active = false; };

    api.get('/auth/me')
      .then(({ data }) => {
        if (!active) return;
        const currentUser = data.user;
        const sessionUser = {
          id: currentUser._id || currentUser.id,
          name: currentUser.name,
          email: currentUser.email,
          role: currentUser.role,
        };
        localStorage.setItem('laborlink_user', JSON.stringify(sessionUser));
        setUser(sessionUser);
      })
      .catch((err) => {
        if (!active || ![401, 403].includes(err.response?.status)) return;
        localStorage.removeItem('laborlink_token');
        localStorage.removeItem('laborlink_user');
        setUser(null);
      })
      .finally(() => {
        if (active) setAuthInitializing(false);
      });

    return () => { active = false; };
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      localStorage.setItem('laborlink_token', data.token);
      localStorage.setItem('laborlink_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const register = async (payload) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', payload);
      localStorage.setItem('laborlink_token', data.token);
      localStorage.setItem('laborlink_user', JSON.stringify(data.user));
      setUser(data.user);
      return data.user;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('laborlink_token');
    localStorage.removeItem('laborlink_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout, loading, authInitializing, darkMode, setDarkMode }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
