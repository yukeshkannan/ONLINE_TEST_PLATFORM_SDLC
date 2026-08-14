import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { Phone, Mail, MapPin, Globe, ExternalLink, ArrowRight, ShieldCheck } from 'lucide-react';

const Footer = ({ onEnterPortal }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleStartExam = () => {
    if (isAuthenticated && user?.role === 'student') {
      if (onEnterPortal) {
        onEnterPortal();
      } else {
        navigate('/student/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  return (
    <footer className="bg-white border-t border-slate-200/90 pt-16 pb-10 px-4 sm:px-6 md:px-12 lg:px-16 w-full relative z-10 text-slate-700">
      <div className="max-w-[1440px] mx-auto space-y-12">
        
        {/* Main 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12 pb-6">
          
          {/* Column 1: Brand Info & Mission (Spans 4 columns) */}
          <div className="lg:col-span-4 space-y-5 text-left">
            <Link to="/" className="inline-block">
              <img 
                alt="SDLC Assessment Platform" 
                className="h-10 w-auto object-contain" 
                src="/logo.png" 
              />
            </Link>

            <p className="text-sm text-slate-500 leading-relaxed max-w-sm font-normal">
              A high-integrity online examination platform built for educational institutions and corporate academies to conduct secure, automated, and cheat-proof assessments at scale.
            </p>

            {/* Social Icons & Status */}
            <div className="flex items-center space-x-3 pt-1">
              <a 
                href="https://sdlcskills.com/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-[#004f90] hover:text-white hover:border-[#004f90] transition-all"
                title="Official Website"
              >
                <Globe className="h-4 w-4" />
              </a>

              <a 
                href="https://www.linkedin.com/in/sdlc-skill-development-learning-centre-karur-a633a0294" 
                target="_blank" 
                rel="noopener noreferrer"
                className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-[#004f90] hover:text-white hover:border-[#004f90] transition-all"
                title="LinkedIn"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
              </a>

              <a 
                href="mailto:info@sdlcskills.com" 
                className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-center text-slate-600 hover:bg-[#004f90] hover:text-white hover:border-[#004f90] transition-all"
                title="Email Support"
              >
                <Mail className="h-4 w-4" />
              </a>
            </div>
          </div>
          
          {/* Column 2: Assessment Platform (Spans 2 columns, pushed to col 6) */}
          <div className="lg:col-span-2 lg:col-start-6 text-left space-y-4">
            <h4 className="font-poppins text-xs font-black uppercase tracking-wider text-slate-900">
              Assessment Hub
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <button 
                  onClick={handleStartExam}
                  className="text-slate-500 hover:text-[#004f90] font-medium transition-colors cursor-pointer bg-transparent border-none p-0 text-left"
                >
                  Start Assessment
                </button>
              </li>
              <li>
                {isAuthenticated && user?.role === 'student' ? (
                  <Link 
                    to="/student/dashboard"
                    className="text-slate-500 hover:text-[#004f90] font-medium transition-colors"
                  >
                    Student Dashboard
                  </Link>
                ) : (
                  <Link 
                    to="/login"
                    className="text-slate-500 hover:text-[#004f90] font-medium transition-colors"
                  >
                    Student Login
                  </Link>
                )}
              </li>
              <li>
                <Link 
                  to="/admin/login"
                  className="text-slate-500 hover:text-[#004f90] font-medium transition-colors"
                >
                  Admin Portal
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Column 3: Institutional Navigation (Spans 2 columns) */}
          <div className="lg:col-span-2 text-left space-y-4">
            <h4 className="font-poppins text-xs font-black uppercase tracking-wider text-slate-900">
              Navigation
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link 
                  to="/"
                  className={`transition-colors ${location.pathname === '/' ? 'text-[#004f90] font-bold' : 'text-slate-500 hover:text-[#004f90] font-medium'}`}
                >
                  Home
                </Link>
              </li>
              <li>
                <Link 
                  to="/about"
                  className={`transition-colors ${location.pathname === '/about' ? 'text-[#004f90] font-bold' : 'text-slate-500 hover:text-[#004f90] font-medium'}`}
                >
                  About Platform
                </Link>
              </li>
              <li>
                <Link 
                  to="/contact"
                  className={`transition-colors ${location.pathname === '/contact' ? 'text-[#004f90] font-bold' : 'text-slate-500 hover:text-[#004f90] font-medium'}`}
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <a 
                  href="https://sdlcskills.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-slate-500 hover:text-[#004f90] font-medium transition-colors inline-flex items-center gap-1"
                >
                  <span>SDLC Corporate</span>
                  <ExternalLink className="h-3 w-3" />
                </a>
              </li>
            </ul>
          </div>
          
          {/* Column 4: Contact & Office (Spans 3 columns) */}
          <div className="lg:col-span-3 text-left space-y-4">
            <h4 className="font-poppins text-xs font-black uppercase tracking-wider text-slate-900">
              Headquarters
            </h4>
            <ul className="space-y-3 text-xs text-slate-500 leading-relaxed">
              <li className="flex items-start space-x-2.5">
                <MapPin className="h-4 w-4 text-[#004f90] mt-0.5 shrink-0" />
                <span>1st Floor, V.V Towers, Opp LGB Petrol Bunk, Kovai Road, Karur - 639002</span>
              </li>
              <li className="flex items-center space-x-2.5">
                <Phone className="h-4 w-4 text-[#004f90] shrink-0" />
                <a href="tel:+919842662681" className="hover:text-[#004f90] font-semibold text-slate-700">
                  +91 98426 62681
                </a>
              </li>
              <li className="flex items-center space-x-2.5">
                <Mail className="h-4 w-4 text-[#004f90] shrink-0" />
                <a href="mailto:info@sdlcskills.com" className="hover:text-[#004f90] font-semibold text-slate-700">
                  info@sdlcskills.com
                </a>
              </li>
            </ul>
          </div>
          
        </div>
        
        {/* Bottom Bar: Operational Status & Copyright */}
        <div className="border-t border-slate-100 pt-7 flex flex-col sm:flex-row justify-between items-center gap-3.5 text-xs text-slate-400">
          <p className="font-medium text-center sm:text-left">
            © 2026 SDLC Skill Development Learning Centre. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
