import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { 
  Building2, Plus, Search, Edit3, Trash2, RefreshCw, AlertTriangle, CheckCircle2, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CohortManagement = () => {
  // Data States
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'

  // Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState(null);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptIsActive, setDeptIsActive] = useState(true);

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/cohorts/departments');
      setDepartments(data || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load department roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Department Handlers
  const handleOpenDeptModal = (dept = null) => {
    if (dept) {
      setDeptToEdit(dept);
      setDeptCode(dept.code || '');
      setDeptName(dept.name || '');
      setDeptDesc(dept.description || '');
      setDeptIsActive(dept.isActive !== undefined ? dept.isActive : true);
    } else {
      setDeptToEdit(null);
      setDeptCode('');
      setDeptName('');
      setDeptDesc('');
      setDeptIsActive(true);
    }
    setShowDeptModal(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptCode.trim() || !deptName.trim()) {
      return toast.error('Department code and name are required.');
    }

    const payload = {
      code: deptCode.trim().toUpperCase(),
      name: deptName.trim(),
      description: deptDesc.trim(),
      isActive: deptIsActive
    };

    const loader = toast.loading(deptToEdit ? 'Updating department...' : 'Adding department...');
    try {
      if (deptToEdit) {
        const { data } = await api.put(`/cohorts/departments/${deptToEdit._id}`, payload);
        setDepartments(prev => prev.map(d => d._id === deptToEdit._id ? data : d));
        toast.success(`Department '${data.code}' updated.`, { id: loader });
      } else {
        const { data } = await api.post('/cohorts/departments', payload);
        setDepartments(prev => [...prev, data]);
        toast.success(`Department '${data.code}' added.`, { id: loader });
      }
      setShowDeptModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save department.', { id: loader });
    }
  };

  const handleToggleDeptActive = async (dept) => {
    const loader = toast.loading(`${dept.isActive ? 'Deactivating' : 'Activating'} ${dept.code}...`);
    try {
      const { data } = await api.put(`/cohorts/departments/${dept._id}`, { isActive: !dept.isActive });
      setDepartments(prev => prev.map(d => d._id === dept._id ? data : d));
      toast.success(`Department '${dept.code}' is now ${data.isActive ? 'Active' : 'Inactive'}.`, { id: loader });
    } catch (err) {
      toast.error('Failed to update department status.', { id: loader });
    }
  };

  // Delete Handler
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { id, code, name } = deleteTarget;
    setDeleteTarget(null);

    const displayName = code || name;
    const loader = toast.loading(`Deleting '${displayName}'...`);

    try {
      await api.delete(`/cohorts/departments/${id}`);
      setDepartments(prev => prev.filter(d => d._id !== id));
      toast.success(`Deleted department '${displayName}'.`, { id: loader });
    } catch (err) {
      toast.error('Failed to delete department.', { id: loader });
    }
  };

  // Filter Logic
  const filteredDepartments = departments.filter(d => {
    const matchesSearch = 
      d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? d.isActive === true :
      d.isActive === false;

    return matchesSearch && matchesStatus;
  });

  const activeDeptCount = departments.filter(d => d.isActive).length;
  const inactiveDeptCount = departments.filter(d => !d.isActive).length;

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-left pb-16">
      
      {/* CLEAN HEADER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 font-poppins">
              Department Management
            </h1>
            <span className="text-[10px] font-extrabold text-[#004f90] uppercase tracking-wider bg-blue-50 border border-blue-150 px-2.5 py-0.5 rounded-md">
              Academic Roster
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Manage active departments and course categories for student accounts and assessment targeting.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={fetchData}
            className="p-2.5 text-slate-500 hover:text-slate-800 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
            title="Refresh List"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          
          <button
            onClick={() => handleOpenDeptModal()}
            className="bg-[#004f90] hover:bg-[#003d70] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95"
          >
            <Plus className="h-4 w-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Departments</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono mt-0.5">{departments.length}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-[#004f90] border border-blue-100 rounded-xl">
            <Building2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active Departments</p>
            <h3 className="text-2xl font-black text-emerald-600 font-mono mt-0.5">{activeDeptCount}</h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-xl">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="space-y-0.5">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Inactive Departments</p>
            <h3 className="text-2xl font-black text-slate-500 font-mono mt-0.5">{inactiveDeptCount}</h3>
          </div>
          <div className="p-3 bg-slate-100 text-slate-500 border border-slate-200 rounded-xl">
            <XCircle className="h-5 w-5" />
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search department code, title or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-xs font-bold text-slate-800 focus:outline-none focus:border-[#004f90]"
          />
          <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
        </div>

        <div className="flex items-center gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#004f90] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer pr-8"
          >
            <option value="all">All Status</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* TABLE LIST VIEW */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-20 text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-2 shadow-sm">
          <div className="h-7 w-7 border-3 border-[#004f90] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading department roster...</span>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl py-16 text-center text-slate-400 space-y-2 shadow-sm">
          <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
          <p className="font-bold text-slate-700 text-sm">No departments found.</p>
          <p className="text-xs">Click "Add Department" above to create a new department.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-150 text-slate-400 uppercase font-extrabold text-[10px] tracking-widest bg-slate-50/70">
                  <th className="py-3.5 px-5">Dept Code</th>
                  <th className="py-3.5 px-5">Department Full Name</th>
                  <th className="py-3.5 px-5">Description</th>
                  <th className="py-3.5 px-5 text-center">Status</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDepartments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5">
                      <span className="inline-block bg-blue-50 border border-blue-150 text-[#004f90] font-mono font-black px-3 py-1 rounded-lg text-xs">
                        {dept.code}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-bold text-slate-800 text-sm">
                      {dept.name}
                    </td>

                    <td className="py-4 px-5 text-slate-500 font-medium max-w-md">
                      {dept.description || <span className="text-slate-300 italic">No description provided</span>}
                    </td>

                    <td className="py-4 px-5 text-center">
                      <button
                        onClick={() => handleToggleDeptActive(dept)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          dept.isActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${dept.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                        <span>{dept.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDeptModal(dept)}
                          className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                          title="Edit Department"
                        >
                          <Edit3 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget({ id: dept._id, code: dept.code, name: dept.name })}
                          className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Delete Department"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT DEPARTMENT MODAL */}
      <AnimatePresence>
        {showDeptModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeptModal(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="fixed inset-0 m-auto max-w-lg w-[90%] h-fit bg-white rounded-2xl p-6 shadow-xl border border-slate-200 z-[2100] space-y-5"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-3.5">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {deptToEdit ? 'Edit Department' : 'Add New Department'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure department short code and full title.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeptModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveDepartment} className="space-y-4 text-left">
                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    Department Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE, IT, FSWD, WEB"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 focus:outline-none uppercase font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    Department Full Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Web Development"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-2.5 px-3.5 text-xs font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Brief description of department or course track scope..."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-2.5 px-3.5 text-xs font-medium text-slate-800 focus:outline-none resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 bg-[#004f90] hover:bg-[#003d70] text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                  >
                    {deptToEdit ? 'Save Changes' : 'Create Department'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeptModal(false)}
                    className="border border-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* DELETE CONFIRMATION MODAL */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-[2px] z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 8 }}
              className="fixed inset-0 m-auto max-w-[380px] w-[90%] h-fit bg-white rounded-2xl p-6 shadow-xl border border-slate-200 flex flex-col items-center text-center space-y-3.5 z-[2100]"
            >
              <div className="h-12 w-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100">
                <AlertTriangle className="h-6 w-6 text-red-500" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-slate-900">
                  Delete Department?
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Are you sure you want to delete department <span className="font-extrabold text-slate-800">'{deleteTarget.code || deleteTarget.name}'</span>?
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-2.5 rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
                >
                  Delete
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-2.5 px-4 rounded-xl text-xs hover:bg-slate-50 transition-all cursor-pointer"
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

export default CohortManagement;
