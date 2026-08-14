import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Send, 
  Clock, 
  MessageSquare, 
  CheckCircle2,
  Building2,
  ExternalLink
} from 'lucide-react';
import MainNavbar from '../components/shared/MainNavbar.jsx';
import Footer from '../components/shared/Footer.jsx';
import toast from 'react-hot-toast';

const ContactPage = () => {
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
        toast.success(`Thank you, ${contactForm.name}. Your inquiry has been received.`, { id: loadingToast });
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

        <section id="contact">
          <div className="max-w-[1440px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
            <div className="max-w-5xl mx-auto space-y-12">
              
              {/* Header */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-center space-y-3"
              >
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-[#004f90] text-xs font-bold uppercase tracking-wider">
                  <MessageSquare className="h-3.5 w-3.5" />
                  <span>Get in Touch</span>
                </div>

                <h1 className="font-poppins text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 tracking-tight">
                  We're Here to Help Your Institution.
                </h1>
                
                <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
                  Have questions about institutional onboarding, conducting custom campus test batches, or administrative support? Reach out directly to our team.
                </p>
              </motion.div>

              {/* Main Contact Card */}
              <div className="bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 shadow-2xl shadow-slate-200/50 grid grid-cols-1 lg:grid-cols-12 gap-10">
                
                {/* Left Column: Direct Info & Quick Action */}
                <div className="lg:col-span-5 space-y-7 text-left">
                  <div className="space-y-2">
                    <h3 className="font-poppins text-2xl font-black text-slate-900">
                      Headquarters & Support
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                      Visit our development center or contact our support team during regular operational hours.
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
                        <strong className="text-slate-800 block text-xs uppercase tracking-wider">Email Inquiries</strong>
                        <a href="mailto:info@sdlcskills.com" className="text-slate-500 hover:text-[#004f90] text-xs font-semibold">
                          info@sdlcskills.com
                        </a>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3.5">
                      <div className="h-9 w-9 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center text-[#004f90] shrink-0">
                        <Clock className="h-4.5 w-4.5" />
                      </div>
                      <div>
                        <strong className="text-slate-800 block text-xs uppercase tracking-wider">Support Hours</strong>
                        <span className="text-slate-500 text-xs">
                          Monday – Saturday (9:00 AM – 6:30 PM IST)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Direct Website Link Button */}
                  <div className="pt-2">
                    <a
                      href="https://sdlcskills.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-2 text-xs font-bold text-[#004f90] bg-blue-50 hover:bg-blue-100 border border-blue-200 px-4 py-2.5 rounded-xl transition-all"
                    >
                      <span>Visit SDLC Corporate Website</span>
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>

                {/* Right Column: Clean Interactive Message Form */}
                <div className="lg:col-span-7 bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 sm:p-8">
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-slate-700">Your Full Name</label>
                        <input 
                          required
                          value={contactForm.name}
                          onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#004f90]/20 focus:border-[#004f90] outline-none transition-all placeholder:text-slate-400 font-medium" 
                          placeholder="e.g. Dr. Rajesh Kumar" 
                          type="text"
                        />
                      </div>

                      <div className="space-y-1 text-left">
                        <label className="text-xs font-bold text-slate-700">Official Email</label>
                        <input 
                          required
                          value={contactForm.email}
                          onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                          className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#004f90]/20 focus:border-[#004f90] outline-none transition-all placeholder:text-slate-400 font-medium" 
                          placeholder="e.g. rajesh@college.edu" 
                          type="email"
                        />
                      </div>
                    </div>

                    <div className="space-y-1 text-left">
                      <label className="text-xs font-bold text-slate-700">Institutional Message / Inquiry</label>
                      <textarea 
                        required
                        value={contactForm.message}
                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                        className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#004f90]/20 focus:border-[#004f90] outline-none transition-all placeholder:text-slate-400 font-medium" 
                        placeholder="Please describe how we can assist your college or training academy..." 
                        rows="4"
                      ></textarea>
                    </div>

                    <button 
                      type="submit"
                      disabled={sendingMessage}
                      className="w-full bg-[#F7931A] hover:bg-[#e08210] text-white font-extrabold py-3.5 rounded-xl shadow-lg shadow-[#F7931A]/20 transition-all cursor-pointer flex items-center justify-center space-x-2 text-sm disabled:opacity-50"
                    >
                      <Send className="h-4 w-4" />
                      <span>{sendingMessage ? 'Submitting Message...' : 'Send Message'}</span>
                    </button>
                  </form>
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

export default ContactPage;
