import React, { useState, useEffect } from 'react';
import { 
  Search, ChevronLeft, ChevronRight, X, UserPlus, Check, Trash2, 
  Shield, Mail, ChevronDown, RefreshCw, Users, ShieldCheck, KeyRound, 
  AlertTriangle, PlusCircle, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import ClockLoader from '../shared/ClockLoader.jsx';
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
    if (!name) return 'TR';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="space-y-5 font-sans text-left pb-10 relative animate-fadeIn">
      
      {/* Title Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-poppins flex items-center gap-2">
            <span>User Management Directory</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Register and manage trainer accounts and portal access privileges.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchUsers}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 p-2.5 rounded-xl transition cursor-pointer shadow-2xs"
            title="Refresh Directory"
          >
            <RefreshCw className="h-4 w-4" />
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#004f90] hover:bg-[#003c6e] text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-2xs hover:shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Trainer Account</span>
          </button>
        </div>
      </div>

      {/* Top Stat Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Trainers</span>
            <p className="text-2xl font-extrabold text-slate-900 font-poppins mt-0.5">{totalTrainersCount}</p>
          </div>
          <div className="h-10 w-10 bg-blue-50 text-[#004f90] rounded-xl flex items-center justify-center border border-blue-100">
            <Users className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Active Faculty & Staff</span>
            <p className="text-2xl font-extrabold text-emerald-600 font-poppins mt-0.5">{totalTrainersCount}</p>
          </div>
          <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center border border-emerald-100">
            <ShieldCheck className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Default Access Role</span>
            <p className="text-sm font-extrabold text-[#F7931A] font-poppins mt-1.5 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#F7931A]"></span>
              <span>SDLC Faculty Staff</span>
            </p>
          </div>
          <div className="h-10 w-10 bg-orange-50 text-[#F7931A] rounded-xl flex items-center justify-center border border-orange-100">
            <Shield className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search staff by name or email address..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl text-xs font-medium text-slate-800 outline-none transition"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
            Showing {filteredUsers.length} of {totalTrainersCount} Members
          </span>
        </div>
      </div>

      {/* Roster Table Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center">
            <ClockLoader size="lg" color="#004f90" text="Loading staff directory..." />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Staff Member</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4 text-center">Access Privilege</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-16 text-center text-slate-400 space-y-2">
                      <Users className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700">No staff accounts found.</p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="text-xs font-semibold text-[#004f90] hover:underline cursor-pointer"
                        >
                          Clear Search Filter
                        </button>
                      )}
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((userItem) => (
                    <tr key={userItem._id} className="hover:bg-slate-50/60 transition-colors group">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="h-9 w-9 rounded-xl bg-blue-50 text-[#004f90] font-bold text-xs flex items-center justify-center border border-blue-100/80 shrink-0 uppercase font-mono shadow-2xs">
                            {getInitials(userItem.name)}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 text-xs block group-hover:text-[#004f90] transition">
                              {userItem.name}
                            </span>
                            <span className="text-[11px] text-slate-400 font-medium">Faculty Member</span>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3.5 px-4 text-left">
                        <span className="font-medium text-slate-600 font-mono text-xs flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          <span>{userItem.email}</span>
                        </span>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200/80 text-[#004f90] font-bold px-2.5 py-0.5 rounded-full text-[10px] uppercase tracking-wider">
                          <Shield className="w-3 h-3 text-[#004f90]" />
                          <span>Trainer Account</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDeleteUser(userItem._id, userItem.name)}
                          className="inline-flex items-center gap-1 text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border border-transparent hover:border-rose-100"
                          title="Revoke Portal Access"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Revoke Access</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Pagination Footer */}
        {!loading && filteredUsers.length > 0 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs">
            <span className="text-slate-500 font-medium">
              Showing <strong className="text-slate-800">{indexOfFirstUser + 1}</strong> to <strong className="text-slate-800">{Math.min(indexOfLastUser, totalItems)}</strong> of <strong className="text-slate-800">{totalItems}</strong> members
            </span>

            {totalPages > 1 && (
              <div className="flex items-center gap-1.5 self-end sm:self-auto">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                
                <span className="px-2 font-bold text-slate-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Slide-out / Floating Add Trainer Modal */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[2000] cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 m-auto max-w-md h-fit bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 z-[2100] text-left"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5">
                <div className="space-y-0.5">
                  <h3 className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
                    <UserPlus className="w-4 h-4 text-[#004f90]" />
                    <span>Add Trainer Account</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Create a new trainer account for test creation and proctoring.</p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Form fields: Clean 3 Fields (Name, Email, Password) */}
              <form onSubmit={handleSaveUser} className="space-y-3.5 text-xs font-semibold">
                
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl h-10 px-3.5 text-xs text-slate-800 outline-none transition font-medium"
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
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl h-10 px-3.5 text-xs text-slate-800 outline-none transition font-medium"
                  />
                </div>

                {/* INITIAL PASSWORD */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Initial Access Password *
                  </label>
                  <div className="relative flex items-center">
                    <input
                      required
                      type="text"
                      placeholder="Enter access password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl h-10 pl-3.5 pr-10 text-xs text-slate-800 outline-none font-mono font-medium transition"
                    />
                    <KeyRound className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                {/* Modal Footer Buttons */}
                <div className="flex items-center justify-end space-x-2.5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-semibold text-xs transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-[#004f90] hover:bg-[#003c6e] text-white rounded-xl font-semibold text-xs transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <Check className="h-4 w-4" />
                    <span>Add Trainer</span>
                  </button>
                </div>

              </form>
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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[2000] cursor-pointer"
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
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl py-2 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-xl py-2 font-semibold text-xs transition cursor-pointer shadow-2xs"
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
