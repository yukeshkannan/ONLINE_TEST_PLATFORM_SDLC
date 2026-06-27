import React, { useState } from 'react';
import { motion } from 'framer-motion';
import MainNavbar from '../components/shared/MainNavbar.jsx';
import Footer from '../components/shared/Footer.jsx';
import toast from 'react-hot-toast';

const ContactPage = () => {
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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col relative overflow-x-hidden"
    >
      <MainNavbar />

      <main className="flex-grow pt-20 sm:pt-24 pb-20">
        {/* CONTACT US SECTION */}
        <section className="py-10 bg-surface-container-low" id="contact">
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

      <Footer />
    </motion.div>
  );
};

export default ContactPage;
