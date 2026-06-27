import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, LogOut, Shield, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';

const Sidebar = () => {
  const { logout, user } = useAuth();
  const menuItems = [
    {
      name: 'Dashboard',
      path: '/admin/dashboard',
      icon: LayoutDashboard
    },
    {
      name: 'Students',
      path: '/admin/students',
      icon: Users
    },
    {
      name: 'Create Test',
      path: '/admin/tests',
      icon: PlusCircle
    },
    {
      name: 'Proctoring',
      path: '/admin/proctoring',
      icon: ShieldAlert
    },
    ...(user?.role === 'admin' ? [{
      name: 'User Management',
      path: '/admin/users',
      icon: Shield
    }] : [])
  ];

  return (
    <aside className="w-64 h-screen bg-white border-r border-slate-100 flex flex-col justify-between py-8 font-sans">
      {/* Brand Header */}
      <div>
        <div className="px-8 mb-4 text-left flex flex-col items-start">
          <img 
            src="/logo.png" 
            alt="Assessment Portal Logo" 
            className="h-10 w-auto object-contain max-w-[180px] self-start"
          />
          <div className="mt-2.5">
            <span className="text-[10px] font-black text-[#004f90] tracking-wider uppercase bg-blue-50 px-2.5 py-1 rounded-md">
              Assessment Portal
            </span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="px-4">
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center space-x-3.5 px-6 py-3.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      isActive
                        ? 'bg-[#eef2f6] text-[#004f90] font-bold'
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Footer / Logout Section */}
      <div className="px-4">
        <div className="border-t border-slate-100 my-4"></div>
        <button
          onClick={logout}
          className="w-full flex items-center space-x-3.5 px-6 py-3.5 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 hover:text-red-700 transition-all duration-300 cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
