import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Zap, 
  Wifi, 
  BarChart3, 
  Layers, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Send,
  Award,
  Users,
  Check,
  ShieldAlert,
  GraduationCap,
  Sparkles,
  Activity,
  CheckCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import MainNavbar from '../components/shared/MainNavbar.jsx';
import Footer from '../components/shared/Footer.jsx';

// Scroll-triggered Animated Number Counter Component
const AnimatedCounter = ({ target, duration = 1800, prefix = '', suffix = '', decimals = 0 }) => {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
        }
      },
      { threshold: 0.15 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  useEffect(() => {
    if (!hasAnimated) return;

    const end = parseFloat(target);
    const startTime = performance.now();

    const updateCounter = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Easing function (easeOutExpo)
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      const current = easeOut * end;
      
      setCount(current);

      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        setCount(end);
      }
    };

    requestAnimationFrame(updateCounter);
  }, [hasAnimated, target, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
};

const LandingPage = ({ onEnterPortal }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [sendingMessage, setSendingMessage] = useState(false);

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSendingMessage(true);
    const loadingToast = toast.loading("Sending your message...");
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
      const response = await fetch(`${baseUrl}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactForm)
      });
      
      const responseData = await response.json();
      if (response.ok && responseData.success) {
        toast.success(`Thank you, ${contactForm.name}. Your message has been received successfully.`, { id: loadingToast });
        setContactForm({ name: '', email: '', message: '' });
      } else {
        toast.error(responseData.message || "Unable to send message. Please try again later.", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Network error. Please check your connection and try again.", { id: loadingToast });
    } finally {
      setSendingMessage(false);
    }
  };

  useEffect(() => {
    if (location.state?.openLogin) {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const handleStartExam = () => {
    if (isAuthenticated && user?.role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#F7931A]/20 selection:text-slate-900 relative overflow-x-hidden"
    >
      <MainNavbar onEnterPortal={onEnterPortal} />

      <main className="relative">
        
        {/* Background Ambient Gradient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[640px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-[450px] h-[450px] bg-[#004f90]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-[400px] h-[400px] bg-[#F7931A]/10 rounded-full blur-3xl"></div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 1: HERO SECTION                                   */}
        {/* ========================================================= */}
        <section className="relative pt-28 sm:pt-36 pb-16 md:pb-24 overflow-hidden">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 w-full">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-10 items-center">
              
              {/* Left Column: Headline & Action Points (No top badge pill) */}
              <motion.div 
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 space-y-6 text-left z-10"
              >
                {/* Main Headline */}
                <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-black leading-[1.12] text-slate-900 tracking-tight">
                  Conduct Exams. <br className="hidden sm:block" />
                  <span className="bg-gradient-to-r from-[#004f90] via-blue-600 to-[#F7931A] bg-clip-text text-transparent">
                    Evaluate Smarter.
                  </span>
                </h1>
                
                {/* Subtitle */}
                <p className="text-base sm:text-lg text-slate-600 max-w-xl leading-relaxed font-normal">
                  A high-integrity online examination platform built for colleges and training institutes to administer secure MCQ assessments with zero-latency grading and tamper-proof proctoring.
                </p>
                
                {/* Dual Action Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2">
                  <button 
                    onClick={handleStartExam}
                    className="bg-gradient-to-r from-[#004f90] to-blue-700 hover:from-[#003c6e] hover:to-blue-800 text-white px-7 py-3.5 rounded-xl font-extrabold text-sm sm:text-base shadow-lg shadow-[#004f90]/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2.5"
                  >
                    <span>Launch Assessment Portal</span>
                    <ArrowRight className="h-4.5 w-4.5" />
                  </button>

                  <Link 
                    to="/about"
                    className="border border-slate-200/90 bg-white/80 hover:bg-white text-slate-700 px-6 py-3.5 rounded-xl font-bold text-sm sm:text-base transition-all shadow-xs text-center flex items-center justify-center cursor-pointer hover:border-slate-300"
                  >
                    <span>Explore Features</span>
                  </Link>
                </div>

                {/* Trust Indicators */}
                <div className="pt-4 flex flex-wrap items-center gap-y-2.5 gap-x-6 text-xs text-slate-500 font-medium">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>Zero-Tolerance Anti-Cheat</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Zap className="h-4 w-4 text-amber-500 shrink-0" />
                    <span>Instant Score Evaluation</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Wifi className="h-4 w-4 text-blue-600 shrink-0" />
                    <span>Offline Resilient Auto-Sync</span>
                  </div>
                </div>
              </motion.div>

              {/* Right Column: Professional Human-Crafted Assessment Console & Telemetry Showcase */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="lg:col-span-6 relative w-full max-w-[560px] mx-auto select-none"
              >
                {/* Ambient glow behind card */}
                <div className="absolute -inset-2 bg-gradient-to-tr from-[#004f90]/15 via-blue-500/10 to-[#F7931A]/15 rounded-3xl blur-2xl opacity-80"></div>

                {/* Primary Showcase Card: Real Candidate Exam Console */}
                <div className="relative bg-white border border-slate-200/90 rounded-2xl shadow-2xl p-5 sm:p-6 space-y-4">
                  
                  {/* Candidate Identity Header */}
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-[#004f90] to-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-sm uppercase">
                        YK
                      </div>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-xs font-black text-slate-800">Candidate Workspace</span>
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[9px] font-black uppercase tracking-wider border border-emerald-200">
                            Verified
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 font-mono font-medium block">
                          Roll: 26CS104 • Computer Science
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                      <span>Live Sync</span>
                    </div>
                  </div>

                  {/* Active Assessment Info & Progress */}
                  <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                      <span className="flex items-center gap-1.5 text-slate-800 font-extrabold">
                        <GraduationCap className="h-3.5 w-3.5 text-[#004f90]" />
                        Technical Aptitude & Algorithms
                      </span>
                      <span className="font-mono text-slate-500">14 / 30 Solved</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#004f90] to-[#F7931A] w-[46%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Live Sample Question Presentation */}
                  <div className="space-y-2.5 pt-1 text-left">
                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                      <span>Question 14</span>
                      <span className="text-[#004f90] font-black">2.0 Marks</span>
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-800 leading-snug">
                      What is the worst-case time complexity of searching an element in a balanced Binary Search Tree (AVL Tree)?
                    </p>

                    {/* Options list */}
                    <div className="space-y-1.5 pt-1">
                      <div className="p-2.5 rounded-xl border border-emerald-300 bg-emerald-50/60 text-emerald-900 text-xs font-bold flex items-center justify-between shadow-2xs">
                        <div className="flex items-center space-x-2.5">
                          <span className="w-5 h-5 rounded-md bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black">
                            A
                          </span>
                          <span>O(log N)</span>
                        </div>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                      </div>

                      <div className="p-2.5 rounded-xl border border-slate-200/80 bg-white text-slate-600 text-xs font-medium flex items-center space-x-2.5">
                        <span className="w-5 h-5 rounded-md bg-slate-100 border border-slate-200 text-slate-500 flex items-center justify-center text-[10px] font-bold">
                          B
                        </span>
                        <span>O(N)</span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Proctoring & Status Strip */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-medium">
                    <div className="flex items-center space-x-1.5 text-slate-600 font-bold">
                      <Lock className="h-3.5 w-3.5 text-[#004f90]" />
                      <span>Fullscreen Lock: Active</span>
                    </div>
                    <div className="flex items-center space-x-1 font-mono font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      <Clock className="h-3 w-3 text-[#F7931A]" />
                      <span>24:18 Left</span>
                    </div>
                  </div>

                </div>

                {/* Floating Micro-Card 1: Real-Time Scorecard Preview (Top Right) */}
                <motion.div 
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -top-5 -right-3 sm:-right-6 bg-white border border-slate-200/90 shadow-xl rounded-2xl p-3.5 flex items-center space-x-3 backdrop-blur-md"
                >
                  <div className="h-9 w-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center font-black">
                    <Award className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black text-slate-800 uppercase leading-none block">Auto-Evaluation</span>
                    <span className="text-xs font-black text-emerald-600 font-mono mt-0.5 block">94% • Grade A+ Cleared</span>
                  </div>
                </motion.div>

                {/* Floating Micro-Card 2: Security & Integrity Telemetry (Bottom Left) */}
                <motion.div 
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -bottom-5 -left-3 sm:-left-6 bg-white border border-slate-200/90 shadow-xl rounded-2xl p-3.5 flex items-center space-x-3 backdrop-blur-md"
                >
                  <div className="h-9 w-9 rounded-xl bg-blue-50 border border-blue-100 text-[#004f90] flex items-center justify-center font-black">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div className="text-left">
                    <span className="text-[10px] font-black text-slate-800 uppercase leading-none block">Integrity Shield</span>
                    <span className="text-xs font-black text-slate-700 font-mono mt-0.5 block">0/3 Violations • 100% Focus</span>
                  </div>
                </motion.div>

              </motion.div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 2: FLOATING STATS BAR WITH ANIMATED COUNTER       */}
        {/* ========================================================= */}
        <section className="py-4 relative z-20">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
            <div className="bg-white/95 border border-slate-200/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-slate-200/40 backdrop-blur-xl grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              
              <div className="space-y-1">
                <div className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-black text-[#004f90]">
                  <AnimatedCounter target={1000} suffix="+" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">Candidate Assessments</div>
              </div>

              <div className="space-y-1 border-l border-slate-100 pl-4 md:pl-0">
                <div className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-black text-[#F7931A]">
                  <AnimatedCounter target={100} suffix="%" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">Instant Auto-Grading</div>
              </div>

              <div className="space-y-1 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0">
                <div className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-black text-emerald-600">
                  <AnimatedCounter target={99.9} decimals={1} suffix="%" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">Anti-Cheat Integrity</div>
              </div>

              <div className="space-y-1 border-t md:border-t-0 border-l border-slate-100 pt-4 md:pt-0 pl-4 md:pl-0">
                <div className="font-poppins text-2xl sm:text-3xl lg:text-4xl font-black text-slate-800">
                  <AnimatedCounter target={50} suffix="+" />
                </div>
                <div className="text-xs sm:text-sm font-bold text-slate-500 uppercase tracking-wide">College & Institute Cohorts</div>
              </div>

            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 3: BENTO GRID - ENTERPRISE CAPABILITIES            */}
        {/* ========================================================= */}
        <section className="py-20 sm:py-28 relative" id="features">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
            
            {/* Section Header */}
            <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
              <h2 className="font-poppins text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                Engineered for Integrity, Speed & Scale.
              </h2>
              <p className="text-sm sm:text-base text-slate-500 leading-relaxed font-normal">
                Everything educators and corporate trainers need to manage candidate cohorts, conduct secure examinations, and generate deep actionable analytics.
              </p>
            </div>

            {/* Bento Grid Layout (4 Cards) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Card 1 (Large - 2 Columns): Zero-Tolerance Proctoring */}
              <div className="md:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
                <div className="space-y-4 z-10 max-w-xl">
                  <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center">
                    <ShieldAlert className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-poppins text-xl sm:text-2xl font-black text-slate-900">
                      Zero-Tolerance Proctoring & Integrity Shield
                    </h3>
                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed mt-2">
                      Strict fullscreen lockdown, multi-monitor restriction, and real-time tab switch tracking with automated 3-warning enforcement. Exams auto-submit upon security breach with comprehensive audit logs.
                    </p>
                  </div>
                </div>

                {/* Visual Widget inside Card 1 */}
                <div className="mt-8 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fullscreen Lock</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <Lock className="h-3.5 w-3.5 text-blue-600" /> Active Focus
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tab Switch Guard</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <ShieldAlert className="h-3.5 w-3.5 text-amber-500" /> Max 3 Warnings
                    </span>
                  </div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Audit Trail</span>
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5 mt-0.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> Time-Stamped
                    </span>
                  </div>
                </div>
              </div>

              {/* Card 2: Network Resilient Auto-Save */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 text-[#004f90] flex items-center justify-center">
                    <Wifi className="h-6 w-6" />
                  </div>
                  <h3 className="font-poppins text-xl font-black text-slate-900">
                    Dropout & Offline Resilience
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Student responses are cached securely in local memory. If college lab WiFi drops, candidate progress is preserved with zero loss, auto-syncing seamlessly on reconnect.
                  </p>
                </div>

                <div className="mt-6 bg-emerald-50 border border-emerald-200/80 p-3 rounded-xl flex items-center space-x-2.5 text-xs text-emerald-800 font-bold">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>Continuous Local Auto-Save Active</span>
                </div>
              </div>

              {/* Card 3: Automated Instant Evaluation */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 text-[#F7931A] flex items-center justify-center">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="font-poppins text-xl font-black text-slate-900">
                    Instant Auto-Grading Matrix
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Zero manual paper checking. Test scores, pass/fail clearances, subject breakdowns, and percentile rankings generate the exact millisecond a student submits.
                  </p>
                </div>

                <div className="mt-6 bg-slate-50 border border-slate-200/80 p-3 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">Evaluation Speed:</span>
                  <span className="font-mono font-black text-[#F7931A]">&lt; 0.05 seconds</span>
                </div>
              </div>

              {/* Card 4 (Large - 2 Columns): Dual Track Architecture */}
              <div className="md:col-span-2 bg-white border border-slate-200/90 rounded-3xl p-7 sm:p-9 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
                <div className="space-y-4 max-w-xl">
                  <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 text-purple-600 flex items-center justify-center">
                    <Layers className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-poppins text-xl sm:text-2xl font-black text-slate-900">
                      College & SDLC Institute Dual-Track Control
                    </h3>
                    <p className="text-slate-500 text-sm sm:text-base leading-relaxed mt-2">
                      Tailored cohort mapping designed specifically for academic institutions. Assign assessments precisely by Department, Academic Year, and Batch, or manage corporate training tracks with customized passing criteria.
                    </p>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center gap-3">
                  <span className="px-3.5 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700">
                    🎓 College Cohorts (Dept / Batch / Year)
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-xs font-bold text-[#004f90]">
                    🏢 SDLC Trainee Track
                  </span>
                  <span className="px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-xs font-bold text-amber-700">
                    📊 Downloadable CSV Reports
                  </span>
                </div>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 4: 3-STEP SEAMLESS WORKFLOW                       */}
        {/* ========================================================= */}
        <section className="py-16 sm:py-24 bg-white border-y border-slate-200/80">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
            
            <div className="text-center max-w-2xl mx-auto space-y-2 mb-14">
              <h2 className="font-poppins text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                How the Platform Works
              </h2>
              <p className="text-sm text-slate-500">
                Frictionless experience for both candidates and assessment administrators.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              
              {/* Step 1 */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-4 text-left relative">
                <span className="font-poppins text-3xl font-black text-[#004f90]/20 absolute top-5 right-6">01</span>
                <div className="h-10 w-10 rounded-xl bg-[#004f90] text-white flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <h4 className="font-poppins text-lg font-black text-slate-800">Clearance & Entry</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Candidate logs in with authorized Roll Number / ID. System clears security protocols and preloads question papers.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-4 text-left relative">
                <span className="font-poppins text-3xl font-black text-[#F7931A]/25 absolute top-5 right-6">02</span>
                <div className="h-10 w-10 rounded-xl bg-[#F7931A] text-white flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <h4 className="font-poppins text-lg font-black text-slate-800">Secure Assessment</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Fullscreen mode engages with active timer countdown, randomized question sequence, and local auto-save protection.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-7 space-y-4 text-left relative">
                <span className="font-poppins text-3xl font-black text-emerald-600/20 absolute top-5 right-6">03</span>
                <div className="h-10 w-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <h4 className="font-poppins text-lg font-black text-slate-800">Instant Evaluation</h4>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  System grades responses against answer keys, logs security records, and presents instant scorecards & administrative rankings.
                </p>
              </div>

            </div>

          </div>
        </section>

        {/* ========================================================= */}
        {/* SECTION 5: CONTACT & QUICK ACCESS CARD                    */}
        {/* ========================================================= */}
        <section className="py-20 sm:py-28 relative" id="contact">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
            
            <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-200/60 grid grid-cols-1 lg:grid-cols-12 gap-10">
              
              {/* Left Column: Direct Info */}
              <div className="lg:col-span-5 space-y-7 text-left">
                <div className="space-y-2">
                  <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[11px] font-bold uppercase tracking-wider">
                    <span>Contact Head Office</span>
                  </div>
                  <h3 className="font-poppins text-2xl sm:text-3xl font-black text-slate-900">
                    Get in Touch with SDLC
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Have inquiries regarding institutional onboarding, custom assessment batches, or technical support? Our team is here to assist.
                  </p>
                </div>

                <div className="space-y-4 text-sm text-slate-600">
                  <div className="flex items-start space-x-3.5">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#004f90] shrink-0 mt-0.5">
                      <MapPin className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <strong className="text-slate-800 block text-xs uppercase tracking-wider">Head Office</strong>
                      <span className="text-slate-500 leading-relaxed text-xs">
                        1st Floor, V.V Towers, Opp LGB Petrol Bunk, Kovai Road, Karur - 639002
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3.5">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#004f90] shrink-0">
                      <Phone className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <strong className="text-slate-800 block text-xs uppercase tracking-wider">Direct Line</strong>
                      <a href="tel:+919842662681" className="text-slate-500 hover:text-[#004f90] text-xs font-semibold">
                        +91 98426 62681
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3.5">
                    <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#004f90] shrink-0">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <strong className="text-slate-800 block text-xs uppercase tracking-wider">Email Support</strong>
                      <a href="mailto:info@sdlcskills.com" className="text-slate-500 hover:text-[#004f90] text-xs font-semibold">
                        info@sdlcskills.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Interactive Clean Form */}
              <div className="lg:col-span-7 bg-slate-50/60 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
                <form onSubmit={handleContactSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1 text-left">
                      <label className="text-xs font-bold text-slate-700">Full Name</label>
                      <input 
                        required
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#004f90]/20 focus:border-[#004f90] outline-none transition-all placeholder:text-slate-400 font-medium" 
                        placeholder="Enter your name" 
                        type="text"
                      />
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-xs font-bold text-slate-700">Email Address</label>
                      <input 
                        required
                        value={contactForm.email}
                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#004f90]/20 focus:border-[#004f90] outline-none transition-all placeholder:text-slate-400 font-medium" 
                        placeholder="e.g. name@college.edu" 
                        type="email"
                      />
                    </div>
                  </div>

                  <div className="space-y-1 text-left">
                    <label className="text-xs font-bold text-slate-700">Message / Inquiry</label>
                    <textarea 
                      required
                      value={contactForm.message}
                      onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                      className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#004f90]/20 focus:border-[#004f90] outline-none transition-all placeholder:text-slate-400 font-medium" 
                      placeholder="How can we assist your institution or training program?" 
                      rows="3"
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    disabled={sendingMessage}
                    className="w-full bg-[#F7931A] hover:bg-[#e08210] text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-[#F7931A]/20 transition-all cursor-pointer flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>{sendingMessage ? 'Sending Message...' : 'Submit Inquiry'}</span>
                  </button>
                </form>
              </div>

            </div>

          </div>
        </section>

      </main>

      <Footer onEnterPortal={onEnterPortal} />
    </motion.div>
  );
};

export default LandingPage;
