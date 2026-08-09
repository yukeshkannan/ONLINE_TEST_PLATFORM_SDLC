import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import ClockLoader from '../components/shared/ClockLoader.jsx';

const AdminLogin = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Forgot password flow states
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [forgotStep, setForgotStep] = useState(1);
  const [otpLoading, setOtpLoading] = useState(false);
  const [forgotShowPassword, setForgotShowPassword] = useState(false);

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!forgotEmail.trim()) {
      return toast.error('Please provide your registered faculty email address.');
    }

    setOtpLoading(true);
    const loader = toast.loading('Dispatching verification code...');
    try {
      const axiosApi = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        withCredentials: true
      });
      await axiosApi.post('/auth/admin/forgot-password', { email: forgotEmail.trim() });
      toast.success(`Verification code sent to ${forgotEmail}`, { id: loader });
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Unable to send security verification code.', { id: loader });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      return toast.error('Please enter the 6-digit verification code.');
    }

    setOtpLoading(true);
    const loader = toast.loading('Verifying security code...');
    try {
      const axiosApi = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        withCredentials: true
      });
      await axiosApi.post('/auth/admin/verify-otp', { email: forgotEmail.trim(), otp: otp.trim() });
      toast.success('Security code verified successfully.', { id: loader });
      setForgotStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired security code.', { id: loader });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      return toast.error('Please complete all required fields.');
    }
    if (newPassword !== confirmNewPassword) {
      return toast.error('Passwords do not match. Please verify your entry.');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }

    setOtpLoading(true);
    const loader = toast.loading('Updating password credentials...');
    try {
      const axiosApi = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        withCredentials: true
      });
      await axiosApi.post('/auth/admin/reset-password', { 
        email: forgotEmail.trim(), 
        otp: otp.trim(), 
        newPassword 
      });
      toast.success('Password updated successfully. You may now log in.', { id: loader });
      setShowForgotModal(false);
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password credentials.', { id: loader });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      return toast.error('Please enter both your email address and password.');
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await loginAdmin(email.trim(), password, rememberMe);
      if (loggedUser?.role === 'trainer') {
        toast.success(`Authentication successful. Welcome back, Trainer ${loggedUser.name}!`);
      } else {
        toast.success('Authentication successful. Welcome back, Administrator!');
      }
      navigate('/admin/dashboard');
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
      transition={{ duration: 0.35 }}
      className="w-full min-h-screen flex flex-col lg:flex-row bg-[#f8fafc] text-slate-900 font-sans selection:bg-[#004f90]/10 selection:text-[#004f90]"
    >
      
      {/* ========================================================================= */}
      {/* LEFT PANE: Minimalist Animated Logo Showcase (Matches Student Login)      */}
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
              Faculty & Admin Portal
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              Enter your credentials to access test management & analytics.
            </p>
          </div>

          {/* AUTHENTICATION FORM CARD */}
          <div className="bg-white border border-slate-200/90 shadow-xl shadow-slate-200/50 rounded-3xl p-6 sm:p-8 space-y-6">
            
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Field 1: Email Address */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase">
                  Faculty / Admin Email Address *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="h-4 w-4" />
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="faculty@college.edu or admin@sdlc.in"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    autoComplete="email"
                    className="w-full bg-slate-50/70 border border-slate-200 hover:border-slate-300 rounded-xl py-2.5 pl-10 pr-4 text-slate-900 text-xs font-medium placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/15 transition-all"
                  />
                </div>
              </div>

              {/* Field 2: Password */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase">
                  Password *
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
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
                  onClick={() => { 
                    setForgotStep(1);
                    setForgotEmail('');
                    setOtp('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setShowForgotModal(true); 
                  }}
                  className="font-bold text-[#004f90] hover:underline bg-transparent border-none p-0 cursor-pointer text-left text-xs"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#004f90] hover:bg-[#003e73] text-white py-3 rounded-xl font-bold text-xs shadow-md shadow-[#004f90]/20 transition-all active:scale-[0.99] cursor-pointer flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <ClockLoader size="xs" color="#ffffff" />
                ) : (
                  <span>Log In to Faculty Portal</span>
                )}
              </button>

              {/* Back to Home Button */}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full border border-slate-200 text-slate-700 hover:bg-slate-50 py-2.5 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </button>

            </form>

          </div>

          {/* Student Switcher Link */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-xs font-bold text-[#004f90] hover:underline cursor-pointer transition-all inline-flex items-center gap-1"
            >
              <span>Are you a Student?</span>
              <span className="font-extrabold">Access Candidate Portal here &rarr;</span>
            </button>
          </div>

        </div>

      </div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotModal && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => !otpLoading && setShowForgotModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[2000] cursor-pointer"
            />
            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed inset-0 m-auto max-w-[440px] w-[92%] h-fit bg-white rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 flex flex-col space-y-5 z-[2100] text-left font-sans"
            >
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <h4 className="text-xl font-bold text-slate-900 tracking-tight font-poppins">Reset Password</h4>
                <button
                  onClick={() => !otpLoading && setShowForgotModal(false)}
                  className="p-1.5 hover:bg-slate-50 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border-none bg-none"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Step 1: Input Email */}
              {forgotStep === 1 && (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Enter your registered faculty email address. We will send a 6-digit verification code to reset your password.
                  </p>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase">Email Address</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-slate-400 pointer-events-none">
                        <Mail className="h-4 w-4" />
                      </span>
                      <input
                        required
                        type="email"
                        placeholder="name@college.edu"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={otpLoading}
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/15 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-[#004f90] hover:bg-[#003e73] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {otpLoading ? (
                      <ClockLoader size="xs" color="#ffffff" />
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    A verification code has been sent to <span className="font-bold text-slate-800">{forgotEmail}</span>. Enter the 6-digit code below.
                  </p>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase">Verification Code (OTP)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-slate-400 pointer-events-none">
                        <Lock className="h-4 w-4" />
                      </span>
                      <input
                        required
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={otpLoading}
                        className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-slate-900 text-sm focus:outline-none focus:border-[#004f90] tracking-widest text-center font-bold font-mono focus:ring-2 focus:ring-[#004f90]/15 transition-all"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-[#004f90] hover:bg-[#003e73] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {otpLoading ? (
                      <ClockLoader size="xs" color="#ffffff" />
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    disabled={otpLoading}
                    className="w-full border border-slate-200 text-slate-600 hover:bg-slate-50 py-2.5 rounded-xl font-semibold text-xs transition-all cursor-pointer"
                  >
                    Back to Email
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">
                    Identity verified! You can now set your new password.
                  </p>
                  <div className="space-y-3">
                    {/* New Password */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase">New Password</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-400 pointer-events-none">
                          <Lock className="h-4 w-4" />
                        </span>
                        <input
                          required
                          type={forgotShowPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={otpLoading}
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-9 pr-10 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/15 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setForgotShowPassword(!forgotShowPassword)}
                          className="absolute right-3 text-slate-400 hover:text-slate-600 cursor-pointer border-none bg-none"
                        >
                          {forgotShowPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    {/* Confirm Password */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[11px] font-extrabold text-slate-700 tracking-wider uppercase">Confirm New Password</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-400 pointer-events-none">
                          <Lock className="h-4 w-4" />
                        </span>
                        <input
                          required
                          type={forgotShowPassword ? 'text' : 'password'}
                          placeholder="Re-enter password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          disabled={otpLoading}
                          className="w-full bg-slate-50/70 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-slate-900 text-xs font-medium focus:outline-none focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/15 transition-all"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-[#004f90] hover:bg-[#003e73] text-white py-3 rounded-xl font-bold text-xs shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {otpLoading ? (
                      <ClockLoader size="xs" color="#ffffff" />
                    ) : (
                      <span>Reset Password</span>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default AdminLogin;
