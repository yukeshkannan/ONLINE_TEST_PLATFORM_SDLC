import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, PlusCircle, LogOut, Shield, ShieldAlert, BookOpen } from 'lucide-react';
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
      name: 'Course Catalog',
      path: '/admin/courses',
      icon: BookOpen
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
        <div className="px-6 mb-6 text-left flex flex-col items-start">
          <img 
            src="/logo.png" 
            alt="Assessment Portal Logo" 
            className="h-10 w-auto object-contain max-w-[180px] self-start"
          />
        </div>

        {/* Navigation Links */}
        <div className="px-3">
          <nav className="space-y-1.5">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#004f90] text-white font-bold shadow-md shadow-blue-900/15'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <div className="flex items-center space-x-3">
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className={isActive ? 'text-white font-bold' : 'text-slate-600'}>{item.name}</span>
                    </div>
                  )}
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
