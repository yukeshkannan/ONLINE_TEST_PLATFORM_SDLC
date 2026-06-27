import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldAlert, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const AdminLogin = () => {
  const { loginAdmin } = useAuth();
  const navigate = useNavigate();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      return toast.error('Please enter your registered email address.');
    }

    setOtpLoading(true);
    const loader = toast.loading('Sending verification code...');
    try {
      const axiosApi = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        withCredentials: true
      });
      await axiosApi.post('/auth/admin/forgot-password', { email: forgotEmail.trim() });
      toast.success(`Verification code sent to ${forgotEmail}`, { id: loader });
      setForgotStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send OTP code.', { id: loader });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (!otp.trim()) {
      return toast.error('Please enter the 6-digit OTP code.');
    }

    setOtpLoading(true);
    const loader = toast.loading('Verifying code...');
    try {
      const axiosApi = axios.create({
        baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
        withCredentials: true
      });
      await axiosApi.post('/auth/admin/verify-otp', { email: forgotEmail.trim(), otp: otp.trim() });
      toast.success('Code verified successfully!', { id: loader });
      setForgotStep(3);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired OTP code.', { id: loader });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmNewPassword) {
      return toast.error('Please fill in all fields.');
    }
    if (newPassword !== confirmNewPassword) {
      return toast.error('Passwords do not match.');
    }
    if (newPassword.length < 6) {
      return toast.error('Password must be at least 6 characters long.');
    }

    setOtpLoading(true);
    const loader = toast.loading('Updating password...');
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
      toast.success('Password updated successfully! Please log in.', { id: loader });
      setShowForgotModal(false);
      setForgotEmail('');
      setOtp('');
      setNewPassword('');
      setConfirmNewPassword('');
      setForgotStep(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password.', { id: loader });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      return toast.error('Please enter both email and password.');
    }

    setIsSubmitting(true);
    try {
      const loggedUser = await loginAdmin(email.trim(), password, rememberMe);
      if (loggedUser?.role === 'trainer') {
        toast.success(`Welcome back, Trainer ${loggedUser.name}!`);
      } else {
        toast.success('Welcome back, Admin!');
      }
      navigate('/admin/dashboard');
    } catch (err) {
      toast.error(err || 'Invalid faculty credentials.');
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
        className="md:w-1/2 w-full min-h-[45vh] md:min-h-screen bg-[#f3f6fa] flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-slate-200/60 relative overflow-hidden"
      >
        {/* Soft Background Radial Accents */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-[#F7931A]/5 rounded-full blur-[100px] pointer-events-none"></div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
          className="z-10 flex flex-col items-center text-center space-y-6"
        >
          <img 
            alt="SDLC Logo" 
            className="w-60 sm:w-72 h-auto object-contain animate-float-slow" 
            src="/logo.png" 
          />
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#004f90] tracking-tight leading-tight font-poppins">
              Skill Development<br/>Learning Centre
            </h2>
            <div className="w-24 h-1 bg-[#F7931A] mx-auto rounded-full"></div>
          </div>
        </motion.div>
      </motion.div>

      {/* RIGHT PANE: Card Container & Login Form */}
      <motion.div 
        initial={{ opacity: 0, x: 80 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 80 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="md:w-1/2 w-full min-h-[55vh] md:min-h-screen flex flex-col items-center justify-center p-6 sm:p-12 md:p-16 bg-white overflow-y-auto"
      >
        <div className="w-full max-w-[460px] flex flex-col justify-center space-y-8 py-8 my-auto">
          
          {/* Welcome Text */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
          >
            <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-1 font-poppins">
              Welcome Back, Faculty
            </h3>
            <p className="text-sm text-slate-500 font-medium">
              Login to access your test design & analytics engine
            </p>
          </motion.div>

          {/* Login Card wrapper */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="bg-white border border-slate-100 shadow-2xl shadow-slate-100 rounded-[28px] p-6 sm:p-8 space-y-6"
          >
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Input */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-slate-700">
                  Faculty Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="name@college.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-4 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/5 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-slate-700">
                  Password
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-11 pr-11 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/5 transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between text-sm pt-1">
                <label className="flex items-center gap-2 text-slate-500 font-medium cursor-pointer select-none">
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
                  onClick={() => { 
                    setForgotStep(1);
                    setForgotEmail('');
                    setOtp('');
                    setNewPassword('');
                    setConfirmNewPassword('');
                    setShowForgotModal(true); 
                  }}
                  className="font-semibold text-[#004f90] hover:underline bg-transparent border-none p-0 cursor-pointer text-left"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full !bg-[#F7931A] hover:!bg-[#e08210] text-white py-2.5 rounded-xl font-semibold shadow-md shadow-[#F7931A]/20 transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Login</span>
                )}
              </button>

              {/* Back to Home Button */}
              <button
                type="button"
                onClick={() => navigate('/')}
                className="w-full border border-[#004f90] text-[#004f90] hover:bg-slate-50 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back to Home</span>
              </button>

            </form>
          </motion.div>

          {/* Secure Login Footer */}
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.35 }}
            className="flex flex-col items-center space-y-2"
          >
            {/* Student Switcher Link */}
            <button
              type="button"
              onClick={() => navigate('/login')}
              className="text-sm font-bold text-[#004f90] hover:underline cursor-pointer transition-all"
            >
              Are you a Student? Access Candidate Portal here &rarr;
            </button>
          </motion.div>

        </div>
      </motion.div>

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
              className="fixed inset-0 m-auto max-w-[440px] h-fit bg-white rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 flex flex-col space-y-5 z-[2100] text-left font-sans"
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
                  <p className="text-sm text-slate-500 font-medium leading-relaxed">
                    Enter your registered faculty email address. We will send a 6-digit verification code to reset your password.
                  </p>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-0.5">Email Address</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-slate-400 pointer-events-none">
                        <Mail className="h-5 w-5" />
                      </span>
                      <input
                        required
                        type="email"
                        placeholder="name@college.edu"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={otpLoading}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm focus:outline-none focus:border-[#004f90] transition-all outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-[#004f90] hover:bg-[#003c6e] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {otpLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Send Verification Code</span>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Verify OTP */}
              {forgotStep === 2 && (
                <form onSubmit={handleVerifyOTP} className="space-y-4">
                  <p className="text-sm text-slate-550 font-medium leading-relaxed">
                    A verification code has been sent to <span className="font-bold text-slate-800">{forgotEmail}</span>. Enter the 6-digit code below.
                  </p>
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-0.5">Verification Code (OTP)</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-3 text-slate-400 pointer-events-none">
                        <Lock className="h-5 w-5" />
                      </span>
                      <input
                        required
                        type="text"
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        disabled={otpLoading}
                        className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm focus:outline-none focus:border-[#004f90] tracking-widest text-center font-bold font-mono focus:ring-2 focus:ring-[#004f90]/5 transition-all outline-none"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-[#004f90] hover:bg-[#003c6e] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {otpLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <span>Verify Code</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setForgotStep(1)}
                    disabled={otpLoading}
                    className="w-full border border-slate-200 text-slate-550 hover:bg-slate-50 py-3 rounded-xl font-bold text-sm transition-all cursor-pointer"
                  >
                    Back to Email
                  </button>
                </form>
              )}

              {/* Step 3: New Password */}
              {forgotStep === 3 && (
                <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                  <p className="text-sm text-slate-550 font-medium leading-relaxed">
                    Identity verified! You can now set your new password.
                  </p>
                  <div className="space-y-4">
                    {/* New Password */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-0.5">New Password</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-400 pointer-events-none">
                          <Lock className="h-5 w-5" />
                        </span>
                        <input
                          required
                          type={forgotShowPassword ? 'text' : 'password'}
                          placeholder="At least 6 characters"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          disabled={otpLoading}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-slate-900 text-sm focus:outline-none focus:border-[#004f90] transition-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setForgotShowPassword(!forgotShowPassword)}
                          className="absolute right-3 text-slate-400 hover:text-slate-655 cursor-pointer border-none bg-none"
                        >
                          {forgotShowPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>
                    {/* Confirm Password */}
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-0.5">Confirm New Password</label>
                      <div className="relative flex items-center">
                        <span className="absolute left-3 text-slate-400 pointer-events-none">
                          <Lock className="h-5 w-5" />
                        </span>
                        <input
                          required
                          type={forgotShowPassword ? 'text' : 'password'}
                          placeholder="Re-enter password"
                          value={confirmNewPassword}
                          onChange={(e) => setConfirmNewPassword(e.target.value)}
                          disabled={otpLoading}
                          className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-slate-900 text-sm focus:outline-none focus:border-[#004f90] transition-all outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    disabled={otpLoading}
                    className="w-full bg-[#004f90] hover:bg-[#003c6e] text-white py-3 rounded-xl font-bold text-sm shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    {otpLoading ? (
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
