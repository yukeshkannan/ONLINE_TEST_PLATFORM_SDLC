import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import { Toaster, ToastBar, toast } from 'react-hot-toast';
import { X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import StudentPortal from './pages/StudentPortal.jsx';
import AboutPage from './pages/AboutPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import StudentLogin from './components/student/StudentLogin.jsx';
import PremiumLoader from './components/shared/PremiumLoader.jsx';

const StudentLoginWrapper = () => {
  const navigate = useNavigate();
  return (
    <StudentLogin 
      onClose={() => navigate('/')} 
      onAdminRedirect={() => navigate('/admin/login')} 
    />
  );
};

const AnimatedRoutes = () => {
  const location = useLocation();
  const { loading } = useAuth();
  const [transitioning, setTransitioning] = React.useState(false);
  const [initialLoading, setInitialLoading] = React.useState(true);
  const [loaderText, setLoaderText] = React.useState('Initializing SDLC Platform...');

  const prevPathRef = React.useRef(location.pathname);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setInitialLoading(false);
    }, 1300);
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const prevPath = prevPathRef.current;
    const currentPath = location.pathname;

    if (prevPath !== currentPath) {
      let shouldTransition = false;
      let text = 'Navigating...';

      const isGoingToLogin = currentPath === '/login';
      const isGoingToAdminLogin = currentPath === '/admin/login';

      if (isGoingToLogin) {
        shouldTransition = true;
        text = 'Redirecting to Student Login...';
      } else if (isGoingToAdminLogin) {
        shouldTransition = true;
        text = 'Loading Faculty Portal...';
      }

      if (shouldTransition) {
        setLoaderText(text);
        setTransitioning(true);
        const timer = setTimeout(() => {
          setTransitioning(false);
        }, 1300);
        return () => clearTimeout(timer);
      }
    }
    prevPathRef.current = currentPath;
  }, [location.pathname]);

  const isGlobalLoading = loading || transitioning || initialLoading;

  let activeText = loaderText;
  if (loading) {
    if (!sessionStorage.getItem('app_session_active')) {
      activeText = 'Initializing Secure Academic Portals...';
    } else {
      activeText = 'Verifying Credentials & Establishing Secure Session...';
    }
  }

  return (
    <>
      <AnimatePresence>
        {isGlobalLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="fixed inset-0 z-[9999]"
          >
            <PremiumLoader text={activeText} />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Student Portal Shell: Handles student login & quiz layouts */}
          <Route path="/" element={<StudentPortal />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />

          {/* Student Login credentials */}
          <Route path="/login" element={<StudentLoginWrapper />} />

          {/* Admin Portal Credentials */}
          <Route path="/admin/login" element={<AdminLogin />} />

          {/* Admin Control Center */}
          <Route path="/admin/dashboard" element={<AdminDashboard tab="dashboard" />} />
          <Route path="/admin/students" element={<AdminDashboard tab="students" />} />
          <Route path="/admin/users" element={<AdminDashboard tab="users" />} />
          <Route path="/admin/tests" element={<AdminDashboard tab="tests" />} />
          <Route path="/admin/proctoring" element={<AdminDashboard tab="proctoring" />} />

          {/* Fallback Redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>
    </>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        {/* Styled Hot Toast Center */}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1E1E1E',
              color: '#FFFFFF',
              border: '1px solid rgba(245, 166, 35, 0.25)',
              fontSize: '12px',
              fontFamily: 'Inter, Sora, sans-serif',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22C55E', // Success Emerald
                secondary: '#1E1E1E',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#EF4444', // Danger Red
                secondary: '#1E1E1E',
              },
            },
          }}
        >
          {(t) => (
            <ToastBar
              toast={t}
              style={{
                ...t.style,
                cursor: 'pointer',
              }}
            >
              {({ icon, message }) => (
                <div 
                  className="flex items-center w-full"
                  onClick={() => toast.dismiss(t.id)}
                >
                  {icon}
                  <div className="flex-1 text-left mr-1">{message}</div>
                  {t.type !== 'loading' && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toast.dismiss(t.id);
                      }}
                      className="ml-2 p-1 rounded-full hover:bg-white/15 text-white/60 hover:text-white transition-colors cursor-pointer flex items-center justify-center shrink-0"
                      style={{ border: 'none', background: 'none' }}
                      aria-label="Close"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              )}
            </ToastBar>
          )}
        </Toaster>
        <AnimatedRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
