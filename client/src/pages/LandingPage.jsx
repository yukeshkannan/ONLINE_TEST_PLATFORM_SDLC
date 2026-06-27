import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import MainNavbar from '../components/shared/MainNavbar.jsx';
import Footer from '../components/shared/Footer.jsx';

const LandingPage = ({ onEnterPortal }) => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });

  const handleContactSubmit = async (e) => {
    e.preventDefault();
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
        toast.success(`Thank you ${contactForm.name}! We've received your message.`, { id: loadingToast });
        setContactForm({ name: '', email: '', message: '' });
      } else {
        toast.error(responseData.message || "Failed to send message. Please try again.", { id: loadingToast });
      }
    } catch (error) {
      console.error("Error submitting contact form:", error);
      toast.error("Something went wrong. Please check your connection.", { id: loadingToast });
    }
  };

  useEffect(() => {
    if (location.state?.openLogin) {
      navigate('/login', { replace: true });
    }
  }, [location, navigate]);

  const handleStartExam = () => {
    if (isAuthenticated && user?.role === 'student') {
      onEnterPortal();
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
      className="min-h-screen bg-background text-on-surface font-body-md selection:bg-primary-fixed selection:text-on-primary-fixed relative overflow-x-hidden"
    >
      <MainNavbar onEnterPortal={onEnterPortal} />

      <main>
        <section className="relative min-h-screen flex items-center pt-20 sm:pt-24 pb-12 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-surface via-surface-bright to-primary-fixed/20 -z-20"></div>
          <div className="absolute inset-0 grid-texture opacity-30 -z-10"></div>
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-16 lg:px-20 w-full">
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-6 text-left z-10"
              >
                <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight text-slate-900">
                  Conduct Exams. <span className="orange-underline">Evaluate Smarter.</span>
                </h1>
                
                <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
                  A professional online assessment platform designed for training institutes and colleges to conduct secure MCQ-based examinations and generate instant reports.
                </p>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <button 
                    onClick={handleStartExam}
                    className="!bg-[#F7931A] text-white px-8 py-3.5 rounded-xl font-bold text-base hover:!bg-[#e08210] shadow-lg shadow-[#F7931A]/20 transition-all transform hover:-translate-y-0.5 cursor-pointer w-full sm:w-auto text-center"
                  >
                    Start Assessment
                  </button>
                  <Link 
                    to="/about"
                    className="border-2 border-slate-300 text-slate-700 px-8 py-3.5 rounded-xl font-bold text-base hover:bg-slate-100 transition-all text-center flex items-center justify-center cursor-pointer w-full sm:w-auto"
                  >
                    Explore Platform
                  </Link>
                </div>
              </motion.div>

              {/* Right Column Dashboard Mock Graphic */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.9, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="relative mt-6 lg:mt-0 w-full max-w-lg lg:max-w-[560px] xl:max-w-[660px] mx-auto flex justify-center"
              >
                <div className="relative z-10 p-2 animate-float-slow w-full">
                  <img 
                    alt="Student taking online exam" 
                    className="rounded-2xl shadow-2xl w-full border border-outline-variant/10 aspect-[4/3] object-cover" 
                    src="/hero_user.jpg" 
                  />
                </div>
              </motion.div>
            </div>

          </div>
        </section>

        {/* ABOUT US SECTION */}
        <section className="py-16 sm:py-24 bg-surface" id="about">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-16 lg:px-20">
            
            {/* Centered Heading */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-20px" }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="text-center mb-12 sm:mb-16"
            >
              <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">
                Built for Next-Gen <span className="orange-underline">Assessments</span>
              </h2>
              <p className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto">
                SDLC Platform simplifies examination workflows with automated grading and uncompromised security.
              </p>
            </motion.div>
            
            {/* 3 Sleek Core Pillar Cards with Smooth Hover Zoom & Box Shadow */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-primary/15 transform hover:-translate-y-2 hover:scale-[1.03] hover:border-primary/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl font-bold">verified_user</span>
                </div>
                <h3 className="font-poppins text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">Secure Proctoring</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Advanced anti-cheating mechanisms with tab-switch monitoring and secure test session enforcement.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-[#F7931A]/15 transform hover:-translate-y-2 hover:scale-[1.03] hover:border-[#F7931A]/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-[#F7931A]/10 text-[#F7931A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl font-bold">bolt</span>
                </div>
                <h3 className="font-poppins text-xl font-bold text-slate-900 mb-2 group-hover:text-[#F7931A] transition-colors">Instant Analytics</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Automated scoring and real-time rank list generation instantly after candidate submission.
                </p>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-primary/15 transform hover:-translate-y-2 hover:scale-[1.03] hover:border-primary/40 transition-all duration-300 group cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-2xl font-bold">cloud_sync</span>
                </div>
                <h3 className="font-poppins text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">Cloud Scale</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Seamlessly handle thousands of concurrent test takers with zero latency and 99.9% uptime.
                </p>
              </motion.div>

            </div>
          </div>
        </section>

        {/* CONTACT US SECTION */}
        <section className="py-20 bg-surface-container-low" id="contact">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-16 lg:px-20">
            <div className="max-w-6xl mx-auto">
              
              {/* Centered Heading */}
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "0px" }}
                transition={{ duration: 0.7, ease: "easeOut" }}
                className="text-center mb-12"
              >
                <h2 className="font-poppins text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight mb-3">Get in Touch</h2>
                <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto">Have questions? We're here to help your institute grow with the best-in-class assessment tools.</p>
              </motion.div>
              
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Contact details sidebar */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px" }}
                  transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
                  className="lg:col-span-1 space-y-6 sm:space-y-8 py-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/5 p-3 rounded-xl text-primary flex items-center justify-center border border-primary/10">
                      <span className="material-symbols-outlined text-2xl">location_on</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Head Office</h4>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">1st Floor , V.V Towers , Opp LGB Petrol Bunk<br/>Kovai Road , Karur-639002</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/5 p-3 rounded-xl text-primary flex items-center justify-center border border-primary/10">
                      <span className="material-symbols-outlined text-2xl">call</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Phone</h4>
                      <p className="text-sm text-slate-500 mt-1">+91 9842662681</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-4">
                    <div className="bg-primary/5 p-3 rounded-xl text-primary flex items-center justify-center border border-primary/10">
                      <span className="material-symbols-outlined text-2xl">mail</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-base">Email</h4>
                      <p className="text-sm text-slate-500 mt-1">info@sdlcskills.com</p>
                    </div>
                  </div>
                </motion.div>

                {/* Interactive Contact Form */}
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "0px" }}
                  transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
                  className="lg:col-span-2 bg-white rounded-2xl p-6 sm:p-8 border border-outline-variant/30 shadow-md"
                >
                  <form onSubmit={handleContactSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-1.5 flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                        <input 
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full bg-background border border-outline-variant/40 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-outline/50 outline-none" 
                          placeholder="John Doe" 
                          type="text"
                        />
                      </div>
                      
                      <div className="space-y-1.5 flex flex-col">
                        <label className="text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                        <input 
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full bg-background border border-outline-variant/40 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-outline/50 outline-none" 
                          placeholder="john@institute.com" 
                          type="email"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-sm font-semibold text-slate-700 mb-1.5">Message</label>
                      <textarea 
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full bg-background border border-outline-variant/40 rounded-lg p-3 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-outline/50 outline-none" 
                        placeholder="How can we help your institute?" 
                        rows="4"
                      ></textarea>
                    </div>
                    
                    <button 
                      type="submit"
                      className="w-full !bg-[#F7931A] text-white font-bold py-3.5 rounded-lg hover:!bg-[#e08210] shadow-lg shadow-[#F7931A]/20 transition-all cursor-pointer"
                    >
                      Send Message
                    </button>
                  </form>
                </motion.div>

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
