import React from 'react';

/**
 * ClockLoader - Modern, minimalist single-needle rotating clock loader
 * Replaces generic circular spinners across the platform with a sleek time/exam-inspired clock animation.
 */
const ClockLoader = ({ size = 'md', color = '#004f90', text = '', className = '' }) => {
  const sizeMap = {
    xs: { outer: 'w-4 h-4 border', handH: 'h-1.5', handW: 'w-[1.5px]', dot: 'w-1 h-1', text: 'text-[10px]' },
    sm: { outer: 'w-6 h-6 border-[1.5px]', handH: 'h-2', handW: 'w-[1.5px]', dot: 'w-1.5 h-1.5', text: 'text-xs' },
    md: { outer: 'w-10 h-10 border-2', handH: 'h-3.5', handW: 'w-[2px]', dot: 'w-2 h-2', text: 'text-xs' },
    lg: { outer: 'w-14 h-14 border-2', handH: 'h-5', handW: 'w-[2px]', dot: 'w-2.5 h-2.5', text: 'text-sm' },
    xl: { outer: 'w-16 h-16 border-[2.5px]', handH: 'h-6', handW: 'w-[2.5px]', dot: 'w-3 h-3', text: 'text-sm' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 select-none ${className}`}>
      {/* Clock Face Circle */}
      <div
        className={`relative ${currentSize.outer} rounded-full border-slate-200 bg-white/80 backdrop-blur-xs flex items-center justify-center shadow-xs shrink-0`}
        style={{ borderColor: color ? `${color}35` : '#004f9035' }}
      >
        {/* Subtle 12 O'Clock Tick Mark */}
        <div 
          className="absolute top-0.5 left-1/2 -translate-x-1/2 w-[1.5px] h-1 rounded-full opacity-60"
          style={{ backgroundColor: color || '#004f90' }}
        />
        
        {/* Rotating Single Clock Hand / Needle */}
        <div
          className={`absolute bottom-1/2 left-1/2 -translate-x-1/2 ${currentSize.handW} ${currentSize.handH} rounded-full animate-clock-smooth`}
          style={{
            backgroundColor: color || '#004f90',
            transformOrigin: 'bottom center'
          }}
        />

        {/* Center Pivot Dot */}
        <div
          className={`absolute ${currentSize.dot} rounded-full z-10`}
          style={{ backgroundColor: color || '#004f90' }}
        />
      </div>

      {/* Optional Loading Text */}
      {text && (
        <p className={`${currentSize.text} font-semibold text-slate-500 tracking-tight animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );
};

export default ClockLoader;
