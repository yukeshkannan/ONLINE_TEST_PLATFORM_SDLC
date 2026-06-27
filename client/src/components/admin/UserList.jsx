import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, X, UserPlus, Check, Trash2, GraduationCap, AlertTriangle, Shield, Mail } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api.js';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Custom delete confirmation modal states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'trainer',
    password: 'Trainer@123'
  });

  // Fetch admin/trainer roster from the server
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/admins');
      setUsers(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Reset page to 1 if search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter users based on search term (checking name and email)
  const filteredUsers = users.filter(u =>
    (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredUsers.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Get current page users
  const indexOfLastUser = currentPage * itemsPerPage;
  const indexOfFirstUser = indexOfLastUser - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const getPageNumbers = () => {
    const pages = [];
    const range = 1;
    
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      
      let start = Math.max(2, currentPage - range);
      let end = Math.min(totalPages - 1, currentPage + range);
      
      if (start > 2) {
        pages.push('...');
      }
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      pages.push(totalPages);
    }
    return pages;
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      return toast.error('Please enter all required fields.');
    }

    const roleText = formData.role === 'trainer' ? 'Trainer' : 'Administrator';
    const loader = toast.loading(`Registering ${roleText.toLowerCase()} account...`);
    try {
      await api.post('/auth/admins', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        role: formData.role,
        password: formData.password
      });

      toast.success(`${roleText} registered successfully!`, { id: loader });
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        role: 'trainer',
        password: 'Trainer@123'
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to register ${roleText.toLowerCase()}.`, { id: loader });
    }
  };

  const handleDeleteUser = (id, name, role) => {
    setUserToDelete({ id, name, role });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const { id, role } = userToDelete;
    setShowDeleteConfirm(false);
    
    const roleText = role === 'trainer' ? 'Trainer' : 'Administrator';
    const loader = toast.loading(`Deleting ${roleText.toLowerCase()} profile...`);
    try {
      await api.delete(`/auth/admins/${id}`);
      toast.success(`${roleText} account deleted successfully.`, { id: loader });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to delete ${roleText.toLowerCase()}.`, { id: loader });
    } finally {
      setUserToDelete(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleColor = (role) => {
    return role === 'admin'
      ? 'bg-rose-50 text-rose-700 border-rose-200'
      : 'bg-indigo-50 text-indigo-700 border-indigo-200';
  };

  return (
    <div className="space-y-8 font-sans text-left pb-8 relative overflow-hidden animate-fadeIn">
      
      {/* Title block with brand primary deep blue "+ Add Staff" button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-poppins">
            User Management Directory
          </h2>
          <p className="text-base text-slate-500 mt-2 font-medium">
            Manage administrative personnel, register new trainers/admins, and assign departments.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#004f90] hover:bg-[#003c6e] text-white px-7 py-4.5 rounded-xl font-bold text-base shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2.5 shrink-0"
        >
          <UserPlus className="h-5 w-5" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Main card panel */}
      <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-[24px] p-6 sm:p-8 space-y-6">
        
        {/* Search and filters bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full">
            <Search className="absolute left-5 top-5 h-6 w-6 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name or email address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200/80 hover:border-slate-350 focus:border-[#004f90] focus:bg-white rounded-2xl py-5 pl-15 pr-5 text-slate-800 text-lg focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Dynamic staff list table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="h-12 w-12 border-4 border-[#004f90] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-base text-slate-400 font-bold font-sans">Loading administrative records...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-base">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-sm uppercase font-bold tracking-wider">
                  <th className="py-6 px-6">User Details</th>
                  <th className="py-6 px-6">Email Address</th>
                  <th className="py-6 px-6">Role Privilege</th>
                  <th className="py-6 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-24 text-center text-slate-400 font-extrabold text-base">
                      No staff accounts found.
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Name Details */}
                      <td className="py-5.5 px-6 text-left">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#004f90] to-blue-500 text-white font-bold text-base flex items-center justify-center border border-white shadow-sm shrink-0 uppercase">
                            {getInitials(userItem.name)}
                          </div>
                          <span className="font-bold text-slate-800 text-lg tracking-tight leading-tight">{userItem.name}</span>
                        </div>
                      </td>
                      {/* Email Address */}
                      <td className="py-5.5 px-6 text-left">
                        <span className="font-bold text-slate-600 font-mono tracking-wide text-base bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                          {userItem.email}
                        </span>
                      </td>

                      {/* Role Privilege */}
                      <td className="py-5.5 px-6 text-left">
                        <span className={`inline-block border font-bold px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider ${getRoleColor(userItem.role)}`}>
                          {userItem.role}
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="py-5.5 px-6 text-right">
                        <button
                          onClick={() => handleDeleteUser(userItem._id, userItem.name, userItem.role)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer border border-transparent hover:border-red-100"
                        >
                          Revoke Access
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Table footer with pagination */}
        {!loading && (
          <div className="flex justify-end items-center pt-4 border-t border-slate-100">
            <div className="flex items-center space-x-2">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-3 border rounded-xl border-slate-200 text-slate-650 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>

              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`dots-${index}`} className="text-slate-400 font-bold px-2 select-none text-base">
                      ...
                    </span>
                  );
                }
                const isActive = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-11 w-11 text-sm rounded-xl font-bold transition-all cursor-pointer ${
                      isActive
                        ? 'bg-[#004f90] text-white border border-[#004f90] shadow-sm'
                        : 'border border-slate-200 text-slate-650 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-3 border rounded-xl border-slate-200 text-slate-650 hover:bg-slate-50 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Slide-out Drawer Panel overlay */}
      <AnimatePresence>
        {showAddModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-[2px] z-[999] cursor-pointer"
            />

            {/* Sliding Drawer Container */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 h-screen w-full max-w-[460px] bg-white z-[1000] shadow-[0_0_50px_rgba(0,0,0,0.15)] flex flex-col rounded-l-[40px] overflow-hidden"
            >
              
              <div className="flex-1 overflow-y-auto px-9 sm:px-11 py-10 space-y-8 scrollbar-none text-left">
                
                {/* Drawer Header with Logo */}
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <img 
                      src="/logo.png" 
                      alt="SDLC Logo" 
                      className="h-11 w-auto object-contain max-w-[190px] self-start"
                    />
                    
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-800 font-poppins leading-tight">
                        Add Staff Account
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
                        Create an administrator or trainer profile to manage questions.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form fields */}
                <form onSubmit={handleSaveUser} className="space-y-6 pt-2">
                  
                  {/* FULL NAME */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      FULL NAME
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Trainer Ramesh"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-855 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* EMAIL ADDRESS */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      EMAIL ADDRESS
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. ramesh@sdlc.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-855 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
                    />
                  </div>



                  {/* PRIVILEGE ROLE */}
                  <div className="space-y-2 flex flex-col">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 leading-none mb-1.5">
                      PRIVILEGE ROLE
                    </label>
                    <div className="relative">
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full bg-white border border-slate-200/80 hover:border-slate-350 focus:border-[#004f90] rounded-full py-4.5 px-5 text-slate-800 text-sm focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm relative z-10"
                      >
                        <option value="trainer">Trainer (Questions & Roster Only)</option>
                        <option value="admin">Administrator (Full Access)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-550 z-20 pointer-events-none">
                        <svg className="fill-current h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  {/* PASSWORD */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      PASSWORD
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter access password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-855 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                    <button
                      type="submit"
                      className="flex-1 bg-[#004f90] hover:bg-[#003c6e] text-white font-extrabold py-4.5 px-8 rounded-full text-base transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check className="h-5 w-5" />
                      <span>Create Account</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="border border-slate-200 text-slate-550 font-bold px-6 py-4.5 rounded-full text-sm hover:bg-slate-50 transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>

                </form>

              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Custom Premium Delete User Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && userToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed inset-0 m-auto max-w-[420px] h-fit bg-white/95 backdrop-blur-[12px] rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100/80 flex flex-col items-center text-center space-y-5 z-[2100]"
            >
              <div className="h-14 w-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100 shrink-0">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Revoke Staff Access?</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                  Are you sure you want to delete the staff account for <span className="font-semibold text-slate-800">{userToDelete.name}</span>? This action is permanent and will revoke all administrative portal access immediately.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 bg-red-600 hover:bg-red-750 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Revoke Access
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 border border-slate-200 text-slate-650 font-semibold py-3 px-5 rounded-xl text-sm hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default UserList;
