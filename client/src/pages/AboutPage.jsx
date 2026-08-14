import React from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, 
  Zap, 
  Wifi, 
  Award, 
  Users, 
  Building2, 
  CheckCircle2, 
  ArrowRight,
  Eye,
  Rocket,
  Lock,
  Layers,
  GraduationCap
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import MainNavbar from '../components/shared/MainNavbar.jsx';
import Footer from '../components/shared/Footer.jsx';

const AboutPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleAction = () => {
    if (isAuthenticated && user?.role === 'student') {
      navigate('/student/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-[#F7931A]/20 relative overflow-x-hidden flex flex-col justify-between"
    >
      <MainNavbar />

      <main className="flex-grow pt-28 sm:pt-36 pb-20">
        
        {/* Background Ambient Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] pointer-events-none -z-10 overflow-hidden">
          <div className="absolute -top-40 left-1/4 w-96 h-96 bg-[#004f90]/10 rounded-full blur-3xl"></div>
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-[#F7931A]/10 rounded-full blur-3xl"></div>
        </div>

        <section id="about">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
            <div className="max-w-5xl mx-auto space-y-16">
              
              {/* Minimalist Heading */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center space-y-4"
              >
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#004f90] text-xs font-bold uppercase tracking-wider">
                  <span>About SDLC Skill Assessment</span>
                </div>
                
                <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  High-Integrity Testing. <br />
                  <span className="bg-gradient-to-r from-[#004f90] via-blue-600 to-[#F7931A] bg-clip-text text-transparent">
                    Zero Operational Friction.
                  </span>
                </h1>

                <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed font-normal">
                  We engineer advanced digital assessment infrastructure designed specifically for colleges, universities, and training institutes to deliver secure, automated, and cheat-proof examinations at scale.
                </p>
              </motion.div>

              {/* 3 Core Value Pillars */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Card 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 text-[#004f90] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-poppins text-xl font-bold text-slate-900 mb-2">Uncompromised Security</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Automated fullscreen enforcement, strict 3-warning tab switch monitoring, and real-time proctoring audit trails preserve academic honesty.
                  </p>
                </motion.div>

                {/* Card 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 text-[#F7931A] flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Zap className="h-6 w-6" />
                  </div>
                  <h3 className="font-poppins text-xl font-bold text-slate-900 mb-2">Instant Score Matrix</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Zero waiting for results. Candidates and instructors receive instant scorecards, pass/fail status, and percentile breakdowns upon submission.
                  </p>
                </motion.div>

                {/* Card 3 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white p-7 sm:p-8 rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 group"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                    <Wifi className="h-6 w-6" />
                  </div>
                  <h3 className="font-poppins text-xl font-bold text-slate-900 mb-2">Dropout Protection</h3>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Built-in local memory backup safeguards all candidate answers against campus WiFi dropouts, ensuring seamless recovery with zero loss.
                  </p>
                </motion.div>

              </div>

              {/* Vision & Mission Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-8 rounded-2xl border border-slate-200/90 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-[#004f90] font-black text-xs uppercase tracking-wider">
                    <Eye className="h-4 w-4" />
                    <span>Our Institutional Vision</span>
                  </div>
                  <h4 className="font-poppins text-xl font-bold text-slate-800">Transforming Academic Calibration</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    To deliver a seamless, state-of-the-art digital assessment standard that empowers colleges and training academies to evaluate technical competencies accurately with zero manual overhead.
                  </p>
                </div>

                <div className="bg-white p-8 rounded-2xl border border-slate-200/90 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-[#F7931A] font-black text-xs uppercase tracking-wider">
                    <Rocket className="h-4 w-4" />
                    <span>Our Mission</span>
                  </div>
                  <h4 className="font-poppins text-xl font-bold text-slate-800">Speed, Accuracy & Integrity</h4>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    To eliminate manual examination friction through intuitive candidate interfaces, enterprise-grade cloud grading, and transparent cohort analytics.
                  </p>
                </div>
              </div>

              {/* Institutional Call To Action Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-[#07254a] to-[#004f90] p-8 sm:p-12 text-white border border-slate-700/50 shadow-2xl">
                {/* Subtle Ambient Glow Background Orbs */}
                <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#F7931A]/20 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#004f90]/40 rounded-full blur-3xl pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                  <div className="space-y-2 max-w-xl">
                    <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold uppercase tracking-widest text-[#F7931A] bg-[#F7931A]/10 border border-[#F7931A]/30 px-3 py-1 rounded-full">
                      Next-Gen Testing Engine
                    </span>
                    <h3 className="font-poppins text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-tight">
                      Ready to experience the platform?
                    </h3>
                    <p className="text-white text-sm sm:text-base leading-relaxed">
                      Launch candidate assessments or explore administrative cohort analytics instantly with zero setup latency.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-3.5 shrink-0 w-full sm:w-auto">
                    <button 
                      onClick={handleAction}
                      style={{ backgroundColor: '#F7931A', color: '#ffffff' }}
                      className="w-full sm:w-auto bg-[#F7931A] hover:bg-[#e08210] active:scale-95 text-white font-bold px-7 py-3.5 rounded-xl text-sm shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Enter Portal</span>
                      <ArrowRight className="h-4 w-4 text-white" />
                    </button>

                    <Link 
                      to="/contact"
                      className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold px-6 py-3.5 rounded-xl text-sm transition-all text-center flex items-center justify-center"
                    >
                      <span>Contact Us</span>
                    </Link>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </section>
      </main>

      <Footer />
    </motion.div>
  );
};

export default AboutPage;
