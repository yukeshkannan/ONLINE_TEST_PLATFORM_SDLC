import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { X, Menu, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const MainNavbar = ({ onEnterPortal }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleStartExam = () => {
    if (isAuthenticated && user?.role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <nav 
      id="navbar" 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'nav-scrolled py-2.5 bg-white/95 shadow-md border-b border-slate-100' : 'bg-transparent py-4 sm:py-4.5'
      }`}
    >
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-16 lg:px-20 flex justify-between items-center transition-all duration-300">
        <div className="flex-shrink-0 flex items-center">
          <a 
            href="/"
            onClick={(e) => {
              e.preventDefault();
              window.location.href = '/';
            }}
            className="cursor-pointer"
          >
            <img 
              alt="Assessment Platform Logo" 
              className="h-8 sm:h-10 md:h-11 w-auto object-contain transition-all duration-300" 
              src="/logo.png" 
            />
          </a>
        </div>
        
        <div className="hidden md:flex items-center space-x-10 lg:space-x-14">
          <div className="flex space-x-8 sm:space-x-10">
            <Link 
              className={`text-[15px] sm:text-base transition-all duration-200 ${
                location.pathname === '/' ? 'font-bold text-primary border-b-2 border-primary pb-1.5' : 'font-semibold text-slate-600 hover:text-primary'
              }`} 
              to="/" 
            >
              Home
            </Link>
            <Link 
              className={`text-[15px] sm:text-base transition-all duration-200 ${
                location.pathname === '/about' ? 'font-bold text-primary border-b-2 border-primary pb-1.5' : 'font-semibold text-slate-600 hover:text-primary'
              }`} 
              to="/about" 
            >
              About Us
            </Link>
            <Link 
              className={`text-[15px] sm:text-base transition-all duration-200 ${
                location.pathname === '/contact' ? 'font-bold text-primary border-b-2 border-primary pb-1.5' : 'font-semibold text-slate-600 hover:text-primary'
              }`} 
              to="/contact" 
            >
              Contact Us
            </Link>
          </div>
          
          {isAuthenticated && user?.role === 'student' ? (
            <button 
              onClick={handleStartExam}
              className="bg-primary text-on-primary px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold shadow-md hover:shadow-lg hover:bg-primary-light transition-all active:scale-95 flex items-center space-x-2 cursor-pointer"
            >
              <span>Dashboard</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          ) : isAuthenticated && (user?.role === 'admin' || user?.role === 'faculty') ? (
            <button 
              onClick={() => navigate('/admin/dashboard')}
              className="bg-[#004f90] text-white px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold shadow-md hover:shadow-lg hover:bg-blue-600 transition-all active:scale-95 flex items-center space-x-2 cursor-pointer"
            >
              <span>Admin Dashboard</span>
              <ArrowRight className="h-4.5 w-4.5" />
            </button>
          ) : (
            <button 
              onClick={() => navigate('/login')}
              className="bg-primary text-on-primary px-6 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold shadow-md hover:shadow-lg hover:bg-primary-light transition-all active:scale-95 cursor-pointer"
            >
              Login
            </button>
          )}
        </div>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-on-surface-variant focus:outline-none p-1 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-white border-b border-outline-variant/20 overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col space-y-4">
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold py-1 border-b border-slate-100 transition-colors ${
                  location.pathname === '/' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`} 
                to="/"
              >
                Home
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold py-1 border-b border-slate-100 transition-colors ${
                  location.pathname === '/about' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`} 
                to="/about"
              >
                About Us
              </Link>
              <Link 
                onClick={() => setMobileMenuOpen(false)}
                className={`text-sm font-bold py-1 border-b border-slate-100 transition-colors ${
                  location.pathname === '/contact' ? 'text-primary' : 'text-on-surface-variant hover:text-primary'
                }`} 
                to="/contact"
              >
                Contact Us
              </Link>
              
              {isAuthenticated && user?.role === 'student' ? (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleStartExam();
                  }}
                  className="bg-primary text-on-primary w-full py-2.5 rounded-lg text-sm font-bold text-center shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>Go to Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : isAuthenticated && (user?.role === 'admin' || user?.role === 'faculty') ? (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/admin/dashboard');
                  }}
                  className="bg-[#004f90] text-white w-full py-2.5 rounded-lg text-sm font-bold text-center shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
                >
                  <span>Go to Admin Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button 
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigate('/login');
                  }}
                  className="bg-primary text-on-primary w-full py-2.5 rounded-lg text-sm font-bold text-center shadow-sm cursor-pointer"
                >
                  Login
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default MainNavbar;

