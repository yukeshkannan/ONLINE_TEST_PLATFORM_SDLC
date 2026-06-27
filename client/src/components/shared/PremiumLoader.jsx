import React from 'react';
import { motion } from 'framer-motion';

const PremiumLoader = ({ text = 'Loading SDLC Platform...' }) => {
  const subtitle = "Skill Development Learning Centre";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.025,
      },
    },
  };

  const letterVariants = {
    hidden: { opacity: 0, y: 3 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.12, ease: 'easeOut' },
    },
  };

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white text-[#0F172A] select-none">
      <div className="flex flex-col items-center space-y-7">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="w-64 sm:w-72 h-auto flex items-center justify-center"
        >
          <img 
            src="/logo.png" 
            alt="SDLC Logo" 
            className="w-full h-auto object-contain" 
            draggable="false"
          />
        </motion.div>

        <div className="relative w-9 h-9 flex items-center justify-center mt-2">
          <div className="absolute inset-0 w-9 h-9 border-3 border-slate-100 rounded-full" />
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }}
            className="absolute inset-0 w-9 h-9 border-3 border-transparent border-t-[#004f90] border-r-[#004f90] rounded-full"
          />
        </div>

        <div className="text-center min-h-[16px] flex justify-center items-center">
          <motion.p 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-[10px] sm:text-[11px] font-bold text-slate-500 tracking-widest uppercase font-sans flex flex-wrap justify-center"
          >
            {subtitle.split("").map((char, index) => (
              <motion.span 
                key={index} 
                variants={letterVariants}
                style={{ 
                  display: char === ' ' ? 'inline-block' : 'inline', 
                  whiteSpace: 'pre',
                  marginRight: char === ' ' ? '4px' : '0px' 
                }}
              >
                {char}
              </motion.span>
            ))}
          </motion.p>
        </div>
      </div>
    </div>
  );
};

export default PremiumLoader;

