import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { setAccessToken, isTokenExpired } from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');

      // 1. If valid unexpired access token exists, authenticate immediately without network latency
      if (savedToken && savedUser) {
        try {
          if (!isTokenExpired(savedToken)) {
            const parsedUser = JSON.parse(savedUser);
            setAccessToken(savedToken);
            setUser(parsedUser);
            setIsAuthenticated(true);
            setLoading(false);
            return;
          }
        } catch (e) {
          console.error('Failed to parse saved user:', e);
        }
      }

      // 2. If no saved token/user exists (guest visitor), skip refresh request to avoid console 401 errors
      if (!savedToken && !savedUser) {
        setUser(null);
        setIsAuthenticated(false);
        setAccessToken('');
        setLoading(false);
        return;
      }

      // 3. If token is expired, attempt token refresh
      const isSessionActive = sessionStorage.getItem('app_session_active');
      sessionStorage.setItem('app_session_active', 'true');

      try {
        const { data } = await api.post('/auth/refresh', { freshSession: !isSessionActive });
        if (data && data.accessToken) {
          setAccessToken(data.accessToken);
          setUser(data.user);
          localStorage.setItem('auth_user', JSON.stringify(data.user));
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
          setAccessToken('');
          localStorage.removeItem('auth_user');
          localStorage.removeItem('auth_token');
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
        setAccessToken('');
        localStorage.removeItem('auth_user');
        localStorage.removeItem('auth_token');
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    const handleAuthExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setAccessToken('');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
    };

    window.addEventListener('auth-expired', handleAuthExpired);
    return () => {
      window.removeEventListener('auth-expired', handleAuthExpired);
    };
  }, []);

  const loginAdmin = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/admin/login', { email, password, rememberMe });
      setAccessToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setIsAuthenticated(true);
      return data.user;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('auth_user');
      throw error.response?.data?.message || 'Admin login failed';
    } finally {
      setLoading(false);
    }
  };

  const loginStudent = async (identifier, password, rememberMe, loginType = 'college') => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/student/login', { 
        identifier, 
        email: identifier, 
        password, 
        rememberMe,
        loginType,
        studentType: loginType
      });
      setAccessToken(data.accessToken);
      setUser(data.user);
      localStorage.setItem('auth_user', JSON.stringify(data.user));
      setIsAuthenticated(true);
      return data.user;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      localStorage.removeItem('auth_user');
      throw error.response?.data?.message || 'Student login failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    
    setAccessToken('');
    setUser(null);
    localStorage.removeItem('auth_user');
    setIsAuthenticated(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        loginAdmin,
        loginStudent,
        logout,
        setUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
