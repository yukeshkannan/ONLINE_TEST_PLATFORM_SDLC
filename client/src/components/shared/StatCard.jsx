import React from 'react';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon: Icon, description, trendColor = 'text-[#004f90]' }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white border border-slate-100 shadow-md shadow-slate-100/50 rounded-[20px] p-5 flex items-center justify-between relative overflow-hidden group hover:shadow-lg transition-all duration-300"
    >
      {/* Background Accent glow */}
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-blue-50/20 to-transparent rounded-bl-full pointer-events-none group-hover:bg-[#004f90]/5 transition-colors duration-500"></div>
      
      <div className="space-y-2 z-10">
        <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase block">{title}</span>
        <h3 className="text-3xl font-black text-slate-800 tracking-tight leading-none">
          {value}
        </h3>
        {description && (
          <p className="text-[10px] text-slate-400 font-medium mt-1.5">{description}</p>
        )}
      </div>

      <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl group-hover:border-[#004f90]/30 group-hover:bg-[#004f90]/5 transition-all duration-300 z-10 shadow-sm">
        <Icon className={`h-6 w-6 ${trendColor}`} />
      </div>
    </motion.div>
  );
};

export default StatCard;
