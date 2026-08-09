import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import ClockLoader from '../shared/ClockLoader.jsx';

const StudentLogin = ({ onClose, onAdminRedirect }) => {
  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  // Portal Tab: 'college' | 'institute'
  const [loginType, setLoginType] = useState('college');

  // Input States
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      return toast.error(
        loginType === 'college' 
          ? 'Please enter your college email address and password.' 
          : 'Please enter your email address and password.'
      );
    }

    setIsSubmitting(true);
    try {
      await loginStudent(identifier.trim(), password, rememberMe, loginType);
      toast.success('Authentication successful. Loading your dashboard...');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCollege = loginType === 'college';
  const primaryColor = isCollege ? '#004f90' : '#e45d13';

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="w-full min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#004f90]/10 selection:text-[#004f90]"
    >
      
      {/* ========================================================================= */}
      {/* LEFT PANE: Minimalist Animated Logo Showcase                              */}
      {/* ========================================================================= */}
      <div className="lg:w-[48%] xl:w-[46%] w-full min-h-[35vh] lg:min-h-screen bg-gradient-to-b from-[#003866] via-[#004f90] to-[#002b50] flex items-center justify-center p-8 sm:p-12 relative overflow-hidden">
        
        {/* Subtle geometric background grid line overlay */}
        <div 
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)`,
            backgroundSize: '48px 48px'
          }}
        />

        {/* Ambient subtle soft glows for depth */}
        <div className="absolute -top-24 -left-24 w-80 h-80 bg-sky-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        {/* Centered Animated Logo Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 20 }}
          animate={{ 
            opacity: 1, 
            scale: 1, 
            y: [0, -8, 0] 
          }}
          transition={{ 
            opacity: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            scale: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
            y: { duration: 4.5, repeat: Infinity, ease: 'easeInOut' }
          }}
          whileHover={{ scale: 1.04 }}
          className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl p-7 sm:p-9 shadow-2xl shadow-black/25 border border-white/50 flex items-center justify-center max-w-[320px] sm:max-w-[360px] cursor-default transition-shadow hover:shadow-sky-900/30"
        >
          <img 
            alt="SDLC Skill Development Learning Centre" 
            className="w-56 sm:w-64 h-auto object-contain select-none" 
            src="/logo.png" 
          />
        </motion.div>

      </div>

      {/* ========================================================================= */}
      {/* RIGHT PANE: Modern High-End Authentication Card                           */}
      {/* ========================================================================= */}
      <div className="lg:w-[52%] xl:w-[54%] w-full flex flex-col justify-center items-center p-6 sm:p-12 lg:p-16 bg-[#f8fafc] overflow-y-auto">
        
        <div className="w-full max-w-[440px] space-y-7 my-auto">
          
          {/* Header Title */}
          <div className="space-y-1.5">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-poppins tracking-tight">
              Student Portal Access
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Select your examination portal and enter your credentials.
            </p>
          </div>

          {/* DUAL PORTAL SWITCHER PILL */}
          <div className="p-1 bg-slate-200/80 rounded-2xl flex items-center gap-1 border border-slate-300/60 shadow-inner">
            <button
              type="button"
              onClick={() => { 
                setLoginType('college'); 
                setIdentifier(''); 
                setPassword(''); 
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer text-center ${
                isCollege
                  ? 'bg-white text-[#004f90] shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              College Portal
            </button>

            <button
              type="button"
              onClick={() => { 
                setLoginType('institute'); 
                setIdentifier(''); 
                setPassword(''); 
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-extrabold transition-all duration-200 cursor-pointer text-center ${
                !isCollege
                  ? 'bg-white text-[#e45d13] shadow-sm border border-slate-200 font-black'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SDLC Portal
            </button>
          </div>

          {/* AUTHENTICATION FORM CARD */}
          <div className="bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Field 1: Email Address */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase">
                  {isCollege ? 'College Email Address *' : 'Email Address *'}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    required
                    type="email"
                    placeholder={isCollege ? 'student@college.edu' : 'name@gmail.com'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="email"
                    className="w-full bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/15 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase">
                  {isCollege ? 'Password (Roll Number) *' : 'Password *'}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder={isCollege ? 'Enter roll number (e.g. CS23001)' : 'Enter your password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="current-password"
                    className="w-full bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-10 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/15 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password Row */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#004f90] focus:ring-[#004f90] h-4 w-4 cursor-pointer"
                  />
                  <span>Remember Me</span>
                </label>
                <button 
                  type="button"
                  onClick={() => toast("Please contact your institute center or college administrator to reset your credentials.")}
                  className="font-bold text-[#004f90] hover:underline bg-transparent border-none p-0 cursor-pointer text-left text-xs"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2 ${
                  isCollege
                    ? 'bg-[#004f90] hover:bg-[#003e73] shadow-[#004f90]/20'
                    : 'bg-[#e45d13] hover:bg-[#cc500d] shadow-[#e45d13]/20'
                }`}
              >
                {isSubmitting ? (
                  <ClockLoader size="xs" color="#ffffff" />
                ) : (
                  <span>Log In to {isCollege ? 'College Portal' : 'SDLC Portal'}</span>
                )}
              </button>

              {/* Back to Home Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </button>

            </form>

          </div>

          {/* Faculty / Staff Redirect Footer Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={onAdminRedirect}
              className="text-xs font-bold text-[#004f90] hover:underline cursor-pointer transition-all inline-flex items-center gap-1"
            >
              <span>Are you a Faculty / Trainer?</span>
              <span className="font-extrabold">Log in here &rarr;</span>
            </button>
          </div>

        </div>

      </div>

    </motion.div>
  );
};

export default StudentLogin;
