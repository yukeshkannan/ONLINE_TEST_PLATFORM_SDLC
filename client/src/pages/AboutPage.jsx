import React from 'react';
import { motion } from 'framer-motion';
import MainNavbar from '../components/shared/MainNavbar.jsx';
import Footer from '../components/shared/Footer.jsx';

const AboutPage = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-background text-on-surface font-body-md relative overflow-x-hidden flex flex-col justify-between"
    >
      <MainNavbar />

      <main className="flex-grow pt-28 sm:pt-36 pb-20">
        <section id="about">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-16 lg:px-20">
            <div className="max-w-5xl mx-auto">
              
              {/* Minimalist Heading */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center mb-16"
              >
                <span className="text-xs font-bold uppercase tracking-widest text-primary bg-primary/10 px-3.5 py-1.5 rounded-full inline-block mb-4">About SDLC Platform</span>
                <h1 className="font-poppins text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
                  Smart Testing. <span className="orange-underline">Zero Friction.</span>
                </h1>
                <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
                  We empower educational institutions with cutting-edge evaluation technology designed for high reliability, automated grading, and uncompromised security.
                </p>
              </motion.div>

              {/* 3 Sleek Core Value Pillar Cards with Hover Zoom & Box Shadow */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                
                {/* Card 1 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-primary/15 transform hover:-translate-y-2 hover:scale-[1.03] hover:border-primary/40 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl font-bold">verified_user</span>
                  </div>
                  <h3 className="font-poppins text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">Secure Proctoring</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Automated tab-switch monitoring and secure browser sessions ensure 100% integrity during examinations.
                  </p>
                </motion.div>

                {/* Card 2 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-[#F7931A]/15 transform hover:-translate-y-2 hover:scale-[1.03] hover:border-[#F7931A]/40 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-[#F7931A]/10 text-[#F7931A] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl font-bold">bolt</span>
                  </div>
                  <h3 className="font-poppins text-xl font-bold text-slate-900 mb-2 group-hover:text-[#F7931A] transition-colors">Instant Analytics</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Automated evaluation engine delivers instant scorecards, rank sheets, and detailed student metrics.
                  </p>
                </motion.div>

                {/* Card 3 */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.3 }}
                  className="bg-white p-8 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-2xl hover:shadow-primary/15 transform hover:-translate-y-2 hover:scale-[1.03] hover:border-primary/40 transition-all duration-300 group cursor-pointer"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-2xl font-bold">cloud_sync</span>
                  </div>
                  <h3 className="font-poppins text-xl font-bold text-slate-900 mb-2 group-hover:text-primary transition-colors">Cloud Scale</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Engineered to host thousands of concurrent exam candidates smoothly with zero latency and 99.9% uptime.
                  </p>
                </motion.div>

              </div>

              {/* Minimalist Vision & Mission Strip */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/70 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-primary font-bold text-sm uppercase tracking-wider">
                    <span className="material-symbols-outlined text-lg">visibility</span>
                    <span>Our Vision</span>
                  </div>
                  <p className="text-slate-700 text-base leading-relaxed">
                    To build the most trusted, effortless digital testing infrastructure for colleges and training academies.
                  </p>
                </div>

                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200/70 space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-[#F7931A] font-bold text-sm uppercase tracking-wider">
                    <span className="material-symbols-outlined text-lg">rocket_launch</span>
                    <span>Our Mission</span>
                  </div>
                  <p className="text-slate-700 text-base leading-relaxed">
                    To eliminate manual examination hassles through intelligent automation and transparent skill calibration.
                  </p>
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
