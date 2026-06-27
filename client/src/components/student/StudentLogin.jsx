import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const StudentLogin = ({ onClose, onAdminRedirect }) => {
  const { loginStudent } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      return toast.error('Please enter both email and password.');
    }

    setIsSubmitting(true);
    try {
      await loginStudent(email.trim(), password, rememberMe);
      toast.success('Successfully signed in!');
      navigate('/');
    } catch (err) {
      toast.error(err || 'Failed to authenticate. Please check your credentials.');
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
            alt="Assessment Platform Logo" 
            className="w-60 sm:w-72 h-auto object-contain animate-float-slow" 
            src="/logo.png" 
          />
          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#004f90] tracking-tight leading-tight font-poppins">
              Online Test<br/>Platform
            </h2>
            <div className="w-24 h-1 mx-auto rounded-full bg-[#004f90]"></div>
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
              Welcome Back
            </h3>
          </motion.div>

          {/* Login Card wrapper */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1], delay: 0.25 }}
            className="bg-white border border-slate-100 shadow-2xl shadow-slate-100 rounded-[28px] p-6 sm:p-8 space-y-6"
          >
            
            {/* Custom Tab Segment Switcher Removed */}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Email Input */}
              <div className="space-y-1.5 flex flex-col">
                <label className="text-sm font-semibold text-slate-700">
                  Email Address
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Mail className="h-5 w-5" />
                  </span>
                  <input
                    required
                    type="email"
                    placeholder="student@example.com"
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
                  Password (Roll Number)
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                    <Lock className="h-5 w-5" />
                  </span>
                  <input
                    required
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter Roll Number (e.g. CS23001)"
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
                  onClick={() => toast("Please contact your administration office to reset your credentials.", { icon: 'ℹ️' })}
                  className="font-semibold text-[#004f90] hover:underline bg-transparent border-none p-0 cursor-pointer text-left"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full text-white py-2.5 rounded-xl font-semibold shadow-md transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2 bg-[#004f90] hover:bg-[#003c6e] shadow-[#004f90]/20"
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
                onClick={onClose}
                className="w-full border border-slate-200 text-slate-500 hover:bg-slate-50 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
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
            
            
            {/* Faculty Switcher Link */}
            <button
              type="button"
              onClick={onAdminRedirect}
              className="text-sm font-bold text-[#004f90] hover:underline cursor-pointer transition-all"
            >
              Are you a Faculty/Admin? Log in here &rarr;
            </button>
          </motion.div>

        </div>
      </motion.div>

    </motion.div>
  );
};

export default StudentLogin;
