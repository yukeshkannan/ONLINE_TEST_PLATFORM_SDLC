import React, { useState, useEffect } from 'react';
import { Search, ChevronLeft, ChevronRight, X, UserPlus, Check, Trash2, Shield, Mail, ChevronDown } from 'lucide-react';
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

  // Fetch SDLC trainer roster from the server
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/admins');
      setUsers(data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update trainer records.');
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

  const totalTrainersCount = users.length;

  // Filter users based on search term (name or email)
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
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      let start = Math.max(2, currentPage - range);
      let end = Math.min(totalPages - 1, currentPage + range);
      
      if (start > 2) pages.push('...');
      for (let i = start; i <= end; i++) pages.push(i);
      if (end < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password.trim()) {
      return toast.error('Please complete all required fields.');
    }

    const loader = toast.loading('Registering trainer account...');
    try {
      await api.post('/auth/admins', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        categoryMode: 'institute',
        role: 'trainer',
        password: formData.password
      });

      toast.success('Trainer account registered successfully.', { id: loader });
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        role: 'trainer',
        password: 'Trainer@123'
      });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register trainer account.', { id: loader });
    }
  };

  const handleDeleteUser = (id, name) => {
    setUserToDelete({ id, name });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const { id, name } = userToDelete;
    setShowDeleteConfirm(false);
    
    const loader = toast.loading('Deleting trainer account...');
    try {
      await api.delete(`/auth/admins/${id}`);
      toast.success(`Trainer account for ${name} deleted successfully.`, { id: loader });
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete trainer account.', { id: loader });
    } finally {
      setUserToDelete(null);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'ST';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-6 font-sans text-left pb-8 relative animate-fadeIn">
      
      {/* Title Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-poppins">
            User Management Directory
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Register and manage trainer accounts and portal access privileges.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-[#004f90] hover:bg-[#003c6e] text-white px-5 py-2.5 rounded-xl font-semibold text-xs shadow-2xs hover:shadow-xs transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shrink-0 self-start sm:self-auto"
        >
          <UserPlus className="h-4 w-4" />
          <span>Add Trainer Account</span>
        </button>
      </div>

      {/* Top Stat Overview Card */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between col-span-1">
          <div>
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Registered Trainers</p>
            <p className="text-2xl font-extrabold text-slate-900 font-poppins mt-0.5">{totalTrainersCount}</p>
          </div>
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-[#004f90] flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 text-[#004f90]" />
          </div>
        </div>
      </div>

      {/* Roster Container Card */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded-xl overflow-hidden p-5 space-y-4">
        
        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search staff by name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50/70 border border-slate-200/90 focus:border-[#004f90] focus:bg-white rounded-lg py-2 pl-9 pr-3.5 text-xs text-slate-800 focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-8 w-8 border-3 border-[#004f90] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-400 font-semibold">Loading staff directory...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Access Privilege</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-16 text-center text-slate-400 font-semibold text-xs">
                      No staff accounts registered yet.
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name */}
                      <td className="py-3 px-4 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="h-8 w-8 rounded-lg bg-blue-50 text-[#004f90] font-bold text-xs flex items-center justify-center border border-blue-100/80 shrink-0 uppercase font-mono">
                            {getInitials(userItem.name)}
                          </div>
                          <span className="font-semibold text-slate-800 text-xs">{userItem.name}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 text-left">
                        <span className="font-medium text-slate-600 font-mono text-xs">
                          {userItem.email}
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4 text-left">
                        <span className="inline-block border font-bold px-2.5 py-0.5 rounded-md text-[10px] uppercase tracking-wider bg-blue-50 text-[#004f90] border-blue-200">
                          Trainer Account
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(userItem._id, userItem.name)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1 rounded-md text-xs font-semibold transition cursor-pointer border border-transparent hover:border-rose-100"
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

        {/* Table Pagination */}
        {!loading && totalPages > 1 && (
          <div className="flex justify-between items-center pt-3 border-t border-slate-100 text-xs">
            <span className="text-slate-500 font-medium">
              Showing {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, totalItems)} of {totalItems} members
            </span>

            <div className="flex items-center space-x-1.5">
              <button 
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 border rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {getPageNumbers().map((page, index) => {
                if (page === '...') {
                  return (
                    <span key={`dots-${index}`} className="text-slate-400 font-bold px-1 select-none">
                      ...
                    </span>
                  );
                }
                const isActive = currentPage === page;
                return (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`h-7 w-7 text-xs rounded-lg font-semibold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#004f90] text-white font-bold shadow-2xs'
                        : 'border border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button 
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 border rounded-lg border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}

      </div>

      {/* Slide-out Add Trainer Drawer */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[999] cursor-pointer"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 220 }}
              className="fixed right-0 top-0 bottom-0 h-screen w-full max-w-md bg-white z-[1000] shadow-2xl flex flex-col overflow-hidden text-left"
            >
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                
                {/* Drawer Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-[#004f90]" />
                      <span>Add Trainer Account</span>
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">Create a new trainer account for test creation and proctoring.</p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {/* Form fields: Clean 3 Fields (Name, Email, Password) */}
                <form onSubmit={handleSaveUser} className="space-y-4 text-xs font-semibold">
                  
                  {/* FULL NAME */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Full Name *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Ramesh Kumar"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none"
                    />
                  </div>

                  {/* EMAIL ADDRESS */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. ramesh@sdlc.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none"
                    />
                  </div>

                  {/* INITIAL PASSWORD */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Initial Access Password *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter access password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none font-mono"
                    />
                  </div>

                  {/* Drawer Footer Buttons */}
                  <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 bg-[#004f90] hover:bg-[#003c6e] text-white rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                    >
                      <Check className="h-4 w-4" />
                      <span>Add Trainer Account</span>
                    </button>
                  </div>

                </form>

              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Revoke Access Modal */}
      <AnimatePresence>
        {showDeleteConfirm && userToDelete && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 m-auto max-w-sm h-fit bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 flex flex-col items-center text-center space-y-4 z-[2100]"
            >
              <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100 shrink-0">
                <Trash2 className="h-6 w-6 text-rose-600" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 font-poppins">Revoke Trainer Access?</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to delete the trainer account for <span className="font-bold text-slate-800">{userToDelete.name}</span>? This action will revoke portal privileges immediately.
                </p>
              </div>
              <div className="flex items-center gap-2.5 w-full pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg py-2 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2 font-semibold text-xs transition cursor-pointer shadow-2xs"
                >
                  Revoke Access
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
