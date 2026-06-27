import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Phone, Mail, MapPin } from 'lucide-react';

const Footer = ({ onEnterPortal }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleStartExam = () => {
    if (isAuthenticated && user?.role === 'student') {
      if (onEnterPortal) {
        onEnterPortal();
      } else {
        navigate('/');
      }
    } else {
      navigate('/login');
    }
  };

  const handlePortalRedirect = () => {
    if (onEnterPortal) {
      onEnterPortal();
    } else {
      navigate('/');
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200/80 pt-16 pb-8 px-4 sm:px-6 md:px-16 lg:px-20 w-full relative z-10">
      <div className="max-w-[1440px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-12 pb-12">
          
          {/* Column 1: Brand Info & Socials (Spans 4 columns) */}
          <div className="lg:col-span-4 space-y-5">
            <a 
              href="/"
              onClick={(e) => {
                e.preventDefault();
                window.location.href = '/';
              }}
              className="cursor-pointer inline-block"
            >
              <img 
                alt="Assessment Platform Logo" 
                className="h-10 sm:h-11 w-auto object-contain" 
                src="/logo.png" 
              />
            </a>
            <p className="text-sm text-slate-500 leading-relaxed max-w-[340px]">
              Leading digital transformation in academic assessments with secure, scalable, and real-time evaluation systems for modern educational institutions.
            </p>
            <div className="flex justify-start gap-3 pt-1">
              <a 
                className="w-10 h-10 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 cursor-pointer" 
                href="https://sdlcskills.com/" 
                aria-label="Website"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="material-symbols-outlined text-[19px]">public</span>
              </a>
              <a 
                className="w-10 h-10 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 cursor-pointer" 
                href="https://www.linkedin.com/in/sdlc-skill-development-learning-centre-karur-a633a0294" 
                aria-label="LinkedIn"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>
              <a 
                className="w-10 h-10 rounded-full border border-slate-200/80 flex items-center justify-center text-slate-500 hover:bg-primary hover:text-white hover:border-primary transition-all duration-300 cursor-pointer" 
                href="#" 
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
          
          {/* Column 2: Platform Links (Spans 2 columns, pushed to col 6 on lg screens to create breathing room) */}
          <div className="lg:col-span-2 lg:col-start-6">
            <h4 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-900 mb-5">
              Platform
            </h4>
            <ul className="flex flex-col space-y-3">
              <li>
                <button 
                  onClick={handleStartExam}
                  className="text-sm text-slate-600 hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Start Assessment
                </button>
              </li>
              <li>
                {isAuthenticated && user?.role === 'student' ? (
                  <button 
                    onClick={handlePortalRedirect}
                    className="text-sm text-slate-600 hover:text-primary transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                  >
                    Student Dashboard
                  </button>
                ) : isAuthenticated && (user?.role === 'admin' || user?.role === 'faculty') ? (
                  <Link 
                    to="/admin/dashboard"
                    className="text-sm text-slate-600 hover:text-primary transition-colors cursor-pointer"
                  >
                    Admin Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/login"
                    className="text-sm text-slate-600 hover:text-primary transition-colors cursor-pointer"
                  >
                    Student Login
                  </Link>
                )}
              </li>
              <li>
                <Link 
                  to="/admin/login"
                  className="text-sm text-slate-600 hover:text-primary transition-colors cursor-pointer"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Company Links (Spans 2 columns) */}
          <div className="lg:col-span-2">
            <h4 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-900 mb-5">
              Company
            </h4>
            <ul className="flex flex-col space-y-3">
              <li>
                <Link 
                  className={`text-sm transition-colors ${location.pathname === '/' ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary'}`} 
                  to="/"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  className={`text-sm transition-colors ${location.pathname === '/about' ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary'}`} 
                  to="/about"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link 
                  className={`text-sm transition-colors ${location.pathname === '/contact' ? 'text-primary font-bold' : 'text-slate-600 hover:text-primary'}`} 
                  to="/contact"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact Info (Spans 3 columns) */}
          <div className="lg:col-span-3 space-y-4">
            <h4 className="font-poppins text-xs font-bold uppercase tracking-wider text-slate-900 mb-5">
              Get In Touch
            </h4>
            <ul className="flex flex-col space-y-3">
              <li className="flex items-start gap-3 text-sm text-slate-600">
                <MapPin className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="leading-relaxed">1st Floor , V.V Towers , Opp LGB Petrol Bunk, Kovai Road , Karur-639002</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <Phone className="h-5 w-5 text-primary flex-shrink-0" />
                <span>+91 9842662681</span>
              </li>
              <li className="flex items-center gap-3 text-sm text-slate-600">
                <Mail className="h-5 w-5 text-primary flex-shrink-0" />
                <span>info@sdlcskills.com</span>
              </li>
            </ul>
          </div>
          
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t border-slate-200/60 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-400 font-medium text-center sm:text-left">
            © 2026 SDLC Online Test Platform. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
