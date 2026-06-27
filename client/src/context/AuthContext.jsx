import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { setAccessToken } from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restoreSession = async () => {
      const isSessionActive = sessionStorage.getItem('app_session_active');
      sessionStorage.setItem('app_session_active', 'true');

      try {
        const { data } = await api.post('/auth/refresh', { freshSession: !isSessionActive });
        if (data && data.accessToken) {
          setAccessToken(data.accessToken);
          setUser(data.user);
          setIsAuthenticated(true);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
      } catch (error) {
        setUser(null);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    restoreSession();

    const handleAuthExpired = () => {
      setUser(null);
      setIsAuthenticated(false);
      setAccessToken('');
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
      setIsAuthenticated(true);
      return data.user;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error.response?.data?.message || 'Admin login failed';
    } finally {
      setLoading(false);
    }
  };

  const loginStudent = async (email, password, rememberMe) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/student/login', { email, password, rememberMe });
      setAccessToken(data.accessToken);
      setUser(data.user);
      setIsAuthenticated(true);
      return data.user;
    } catch (error) {
      setIsAuthenticated(false);
      setUser(null);
      throw error.response?.data?.message || 'Student login failed';
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    } finally {
      setAccessToken('');
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
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

