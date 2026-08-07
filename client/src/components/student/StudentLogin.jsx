import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, GraduationCap, Building2, UserCheck, ShieldCheck, BookOpen } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const StudentLogin = ({ onClose, onAdminRedirect }) => {
  const { loginStudent } = useAuth();
  const navigate = useNavigate();

  // Tab State: 'college' | 'institute'
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
          ? 'Please enter your email address and roll number.' 
          : 'Please enter your enrollment ID and password.'
      );
    }

    setIsSubmitting(true);
    try {
      await loginStudent(identifier.trim(), password, rememberMe);
      toast.success('Authentication successful. Loading student portal...');
      navigate('/student/dashboard');
    } catch (err) {
      toast.error(err || 'Authentication failed. Please check your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="w-full min-h-screen flex flex-col md:flex-row bg-white relative font-sans"
    >
      
      {/* LEFT PANE: Branding, Logo, and Accent Background */}
      <motion.div 
        initial={{ opacity: 0, x: -80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -80 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="md:w-1/2 w-full min-h-[45vh] md:min-h-screen bg-[#f3f6fa] flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-200/60 relative overflow-hidden text-center"
      >
        {/* Background Radial Accents */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="z-10 flex flex-col items-center text-center space-y-6 max-w-md"
        >
          <img 
            alt="Assessment Platform Logo" 
            className="w-60 sm:w-72 h-auto object-contain animate-float-slow" 
            src="/logo.png" 
          />
          <div className="space-y-3">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#004f90] tracking-tight leading-tight font-poppins">
              Assessment & Skills<br/>Portal
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Unified testing portal for College Academic Programs & Institute Specialization Tracks.
            </p>
            <div className="w-24 h-1 mx-auto rounded-full bg-[#004f90]/80"></div>
          </div>
        </motion.div>
      </motion.div>

      {/* RIGHT PANE: Dual-Tab Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 80 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="md:w-1/2 w-full min-h-[55vh] md:min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 bg-white overflow-y-auto"
      >
        <div className="w-full max-w-[460px] flex flex-col justify-center space-y-7 py-6 my-auto text-left">
          
          {/* Header Title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <h3 className="text-2xl font-black text-slate-900 mb-1 font-poppins">
              Student Portal Access
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Select your enrollment portal type below to log in.
            </p>
          </motion.div>

          {/* DUAL LOGIN TAB SWITCHER */}
          <div className="p-1.5 bg-slate-100/90 rounded-2xl flex items-center gap-1 border border-slate-200/60 shadow-xs">
            <button
              type="button"
              onClick={() => { setLoginType('college'); setIdentifier(''); setPassword(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                loginType === 'college'
                  ? 'bg-white text-[#004f90] shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <GraduationCap className="h-4 w-4" />
              <span>College Portal</span>
            </button>

            <button
              type="button"
              onClick={() => { setLoginType('institute'); setIdentifier(''); setPassword(''); }}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs font-black transition-all cursor-pointer ${
                loginType === 'institute'
                  ? 'bg-white text-amber-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>SDLC Portal</span>
            </button>
          </div>

          {/* Login Card wrapper */}
          <motion.div 
            key={loginType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white border border-slate-200/90 shadow-xl shadow-slate-100 rounded-[28px] p-6 sm:p-7 space-y-5"
          >
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Identifier Input */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {loginType === 'college' ? 'College Email Address *' : 'Enrollment ID or Personal Email *'}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    required
                    type="text"
                    placeholder={loginType === 'college' ? 'student@college.edu' : 'e.g. SDLC-KRR-2026-0001 or name@gmail.com'}
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/10 transition-all"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {loginType === 'college' ? 'Password (Roll Number) *' : 'Institute Password *'}
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder={loginType === 'college' ? 'Enter Roll Number (e.g. CS23001)' : 'Enter your course password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-slate-50/80 border border-slate-200 rounded-xl py-2.5 pl-10 pr-10 text-slate-900 text-xs font-semibold placeholder:text-slate-400 focus:outline-none focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 text-slate-600 font-semibold cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-300 text-[#004f90] focus:ring-[#004f90] h-4 w-4"
                  />
                  <span>Remember Me</span>
                </label>
                <button 
                  type="button"
                  onClick={() => toast("Please contact your institute center or college administrator to reset your credentials.", { icon: 'ℹ️' })}
                  className="font-bold text-[#004f90] hover:underline bg-transparent border-none p-0 cursor-pointer text-left"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full text-white py-3 rounded-xl font-black text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 ${
                  loginType === 'college'
                    ? 'bg-[#004f90] hover:bg-[#003c6e] shadow-blue-900/15'
                    : 'bg-amber-600 hover:bg-amber-700 shadow-amber-600/15'
                }`}
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Log In to {loginType === 'college' ? 'College Portal' : 'Course Portal'}</span>
                )}
              </button>

              {/* Back to Home Button */}
              <button
                type="button"
                onClick={onClose}
                className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </button>

            </form>
          </motion.div>

          {/* Faculty Switcher Link */}
          <div className="flex flex-col items-center pt-2">
            <button
              type="button"
              onClick={onAdminRedirect}
              className="text-xs font-bold text-[#004f90] hover:underline cursor-pointer transition-all"
            >
              Are you a Faculty / Trainer? Log in here &rarr;
            </button>
          </div>

        </div>
      </motion.div>

    </motion.div>
  );
};

export default StudentLogin;

