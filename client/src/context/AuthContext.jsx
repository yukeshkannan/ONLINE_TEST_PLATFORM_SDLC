import React, { createContext, useState, useEffect, useContext } from 'react';
import api, { setAccessToken, isTokenExpired } from '../utils/api.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkLocalFallback = () => {
      const savedToken = localStorage.getItem('auth_token');
      const savedUser = localStorage.getItem('auth_user');
      if (savedToken && savedUser) {
        try {
          if (!isTokenExpired(savedToken)) {
            const parsedUser = JSON.parse(savedUser);
            setAccessToken(savedToken);
            setUser(parsedUser);
            setIsAuthenticated(true);
            return true;
          }
        } catch (e) {
          console.error('Failed to parse saved user:', e);
        }
      }
      setUser(null);
      setIsAuthenticated(false);
      setAccessToken('');
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_token');
      return false;
    };

    const restoreSession = async () => {
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
          checkLocalFallback();
        }
      } catch (error) {
        checkLocalFallback();
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

  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      await api.post('/auth/logout');
    } catch (err) {
      console.error('Logout request failed:', err);
    }
    
    // 0.85s smooth branded transition with official SDLC logo
    await new Promise(resolve => setTimeout(resolve, 850));
    setAccessToken('');
    setUser(null);
    localStorage.removeItem('auth_user');
    setIsAuthenticated(false);
    setIsLoggingOut(false);
    setLoading(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        isLoggingOut,
        loginAdmin,
        loginStudent,
        logout,
        setUser
      }}
    >
      {/* SDLC Professional Branded Logout Screen */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/95 backdrop-blur-md select-none transition-all duration-300 animate-fadeIn">
          <div className="flex flex-col items-center justify-center space-y-6 max-w-sm px-6 text-center">
            {/* Official SDLC Logo with subtle glow pulse */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl shadow-sm animate-pulse">
              <img 
                src="/logo.png" 
                alt="SDLC Platform" 
                className="h-12 sm:h-14 w-auto object-contain"
              />
            </div>

            {/* Rotating Clock Spinner */}
            <div className="pt-2">
              <div className="relative w-8 h-8 rounded-full border-2 border-slate-200 flex items-center justify-center">
                <div 
                  className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[2px] h-3 rounded-full bg-[#004f90] animate-clock-smooth"
                  style={{ transformOrigin: 'bottom center' }}
                />
                <div className="w-1.5 h-1.5 rounded-full bg-[#004f90]" />
              </div>
            </div>

            {/* Status text */}
            <div className="space-y-1">
              <h3 className="text-sm sm:text-base font-extrabold text-slate-800 tracking-tight font-poppins">
                Signing out securely...
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Ending session and clearing local security tokens.
              </p>
            </div>
          </div>
        </div>
      )}

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
