import React from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import { LogOut } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <nav className="sticky top-0 z-50 h-16 w-full px-6 flex items-center justify-between border-b border-slate-100 bg-white shadow-sm shadow-slate-100/50">
      {/* Brand Logo & Portal Tag */}
      <div className="flex items-center">
        <img 
          src="/logo.png" 
          alt="SDLC Logo" 
          className="h-10 sm:h-11 w-auto object-contain"
        />
      </div>

      {/* User Actions */}
      {user && (() => {
        const isInst = user?.studentType === 'institute' || user?.portalType === 'sdlc' || !!user?.enrollmentId;
        return (
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* User Profile Badge */}
            <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200/80 px-3.5 py-1.5 rounded-xl">
              {/* Avatar Circle */}
              <div className={`h-8 w-8 rounded-full border flex items-center justify-center text-[11px] font-black shrink-0 shadow-inner ${
                isInst 
                  ? 'bg-amber-50 border-amber-200 text-[#F7931A]' 
                  : 'bg-blue-50 border-blue-200 text-[#004f90]'
              }`}>
                {getInitials(user.name)}
              </div>
              
              {/* Details */}
              <div className="text-right hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5 font-mono">
                  {isInst ? (user.enrollmentId || user.email) : (user.rollNumber || user.email)}
                </p>
              </div>
              
              {/* Role Chip */}
              <span className={`text-[9px] font-black px-2 py-0.5 rounded border tracking-wider uppercase ${
                isInst
                  ? 'bg-amber-50 border-amber-300 text-amber-800'
                  : 'bg-blue-50 border-blue-200 text-[#004f90]'
              }`}>
                {isInst ? 'SDLC' : 'STUDENT'}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={logout}
              className="flex items-center justify-center space-x-2 border border-red-200 hover:border-red-300 bg-white hover:bg-red-50 text-red-600 hover:text-red-700 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all duration-300 cursor-pointer shadow-xs active:scale-[0.98]"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden md:inline">Log Out</span>
            </button>
          </div>
        );
      })()}
    </nav>
  );
};

export default Navbar;
