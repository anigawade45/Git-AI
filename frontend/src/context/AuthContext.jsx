import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from 'react';
import { authService } from '@/services/authService';
import { fetchApi } from '@/services/api';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch (error) {
      localStorage.removeItem('user');
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState(true);

  // Restore current session from API or OAuth callback parameters
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthToken = params.get('token');
    const oauthUserRaw = params.get('user');

    if (params.get('auth') === 'success' || (oauthToken && oauthUserRaw)) {
      if (oauthToken && oauthUserRaw) {
        try {
          const parsedUser = JSON.parse(decodeURIComponent(oauthUserRaw));
          localStorage.setItem('user_token', oauthToken);
          localStorage.setItem('user', JSON.stringify(parsedUser));
          setUser(parsedUser);
          setIsLoading(false);
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        } catch (err) {
          // ignore parse error
        }
      }
      fetchApi('/auth/me')
        .then((res) => {
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
          }
        })
        .finally(() => setIsLoading(false));
      window.history.replaceState({}, document.title, window.location.pathname);
      return;
    }

    const token = localStorage.getItem('user_token');
    if (token) {
      fetchApi('/auth/me')
        .then((res) => {
          if (res && res.user) {
            setUser(res.user);
            localStorage.setItem('user', JSON.stringify(res.user));
          } else {
            setUser(null);
            localStorage.removeItem('user');
            localStorage.removeItem('user_token');
          }
        })
        .catch(() => {
          setUser(null);
          localStorage.removeItem('user');
          localStorage.removeItem('user_token');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const isAuthenticated = !!user;

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.login(email, password);
      if (res && res.user) {
        setUser(res.user);
        localStorage.setItem('user', JSON.stringify(res.user));
        return res.user;
      }
      throw new Error(res?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (name, email, password) => {
    setIsLoading(true);
    try {
      const res = await authService.register(name, email, password);
      if (res && res.success) {
        return res;
      }
      throw new Error(res?.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('user_token');
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


