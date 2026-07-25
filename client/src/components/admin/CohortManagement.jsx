import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { Layers, GraduationCap, Plus, Search, Edit3, Trash2, CheckCircle2, XCircle, AlertCircle, RefreshCw, Sparkles, Building2, BookOpen, ToggleLeft, ToggleRight, AlertTriangle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CohortManagement = () => {
  const [activeTab, setActiveTab] = useState('departments'); // 'departments' | 'batches'
  
  // Data State
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState(null);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Batch Modal State
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchToEdit, setBatchToEdit] = useState(null);
  const [batchName, setBatchName] = useState('');
  const [batchCode, setBatchCode] = useState('');
  const [batchDept, setBatchDept] = useState('All Departments');
  const [batchDesc, setBatchDesc] = useState('');

  // Confirmation Modals State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'dept'|'batch', id, name }

  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, batchRes] = await Promise.all([
        api.get('/cohorts/departments'),
        api.get('/cohorts/batches')
      ]);
      setDepartments(deptRes.data);
      setBatches(batchRes.data);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load dynamic cohort registries.');
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
    } else {
      setDeptToEdit(null);
      setDeptCode('');
      setDeptName('');
      setDeptDesc('');
    }
    setShowDeptModal(true);
  };

  const handleSaveDepartment = async (e) => {
    e.preventDefault();
    if (!deptCode.trim() || !deptName.trim()) {
      return toast.error('Department code and name are required.');
    }

    const payload = {
      code: deptCode.trim(),
      name: deptName.trim(),
      description: deptDesc.trim()
    };

    const loader = toast.loading(deptToEdit ? 'Updating department record...' : 'Creating new department...');
    try {
      if (deptToEdit) {
        const { data } = await api.put(`/cohorts/departments/${deptToEdit._id}`, payload);
        setDepartments(prev => prev.map(d => d._id === deptToEdit._id ? data : d));
        toast.success(`Department '${data.code}' updated successfully.`, { id: loader });
      } else {
        const { data } = await api.post('/cohorts/departments', payload);
        setDepartments(prev => [...prev, data]);
        toast.success(`Department '${data.code}' added successfully.`, { id: loader });
      }
      setShowDeptModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save department details.', { id: loader });
    }
  };

  const handleToggleDeptActive = async (dept) => {
    const loader = toast.loading(`${dept.isActive ? 'Deactivating' : 'Activating'} department '${dept.code}'...`);
    try {
      const { data } = await api.put(`/cohorts/departments/${dept._id}`, { isActive: !dept.isActive });
      setDepartments(prev => prev.map(d => d._id === dept._id ? data : d));
      toast.success(`Department '${dept.code}' is now ${data.isActive ? 'Active' : 'Inactive'}.`, { id: loader });
    } catch (err) {
      toast.error('Failed to update department status.', { id: loader });
    }
  };

  // Batch Handlers
  const handleOpenBatchModal = (batch = null) => {
    if (batch) {
      setBatchToEdit(batch);
      setBatchName(batch.name || '');
      setBatchCode(batch.code || '');
      setBatchDept(batch.department || 'All Departments');
      setBatchDesc(batch.description || '');
    } else {
      setBatchToEdit(null);
      setBatchName('');
      setBatchCode('');
      setBatchDept('All Departments');
      setBatchDesc('');
    }
    setShowBatchModal(true);
  };

  const handleSaveBatch = async (e) => {
    e.preventDefault();
    if (!batchName.trim()) {
      return toast.error('Batch track name is required.');
    }

    const payload = {
      name: batchName.trim(),
      code: batchCode.trim(),
      department: batchDept,
      description: batchDesc.trim()
    };

    const loader = toast.loading(batchToEdit ? 'Updating batch track...' : 'Creating new batch track...');
    try {
      if (batchToEdit) {
        const { data } = await api.put(`/cohorts/batches/${batchToEdit._id}`, payload);
        setBatches(prev => prev.map(b => b._id === batchToEdit._id ? data : b));
        toast.success(`Batch track '${data.name}' updated successfully.`, { id: loader });
      } else {
        const { data } = await api.post('/cohorts/batches', payload);
        setBatches(prev => [...prev, data]);
        toast.success(`Batch track '${data.name}' created successfully.`, { id: loader });
      }
      setShowBatchModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save batch track.', { id: loader });
    }
  };

  const handleToggleBatchActive = async (batch) => {
    const loader = toast.loading(`${batch.isActive ? 'Deactivating' : 'Activating'} batch '${batch.name}'...`);
    try {
      const { data } = await api.put(`/cohorts/batches/${batch._id}`, { isActive: !batch.isActive });
      setBatches(prev => prev.map(b => b._id === batch._id ? data : b));
      toast.success(`Batch '${batch.name}' is now ${data.isActive ? 'Active' : 'Inactive'}.`, { id: loader });
    } catch (err) {
      toast.error('Failed to update batch track status.', { id: loader });
    }
  };

  // Delete Confirmation Handler
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, name } = deleteTarget;
    setDeleteTarget(null);

    const loader = toast.loading(`Deleting ${type === 'dept' ? 'department' : 'batch track'} '${name}'...`);
    try {
      if (type === 'dept') {
        await api.delete(`/cohorts/departments/${id}`);
        setDepartments(prev => prev.filter(d => d._id !== id));
      } else {
        await api.delete(`/cohorts/batches/${id}`);
        setBatches(prev => prev.filter(b => b._id !== id));
      }
      toast.success(`Record '${name}' deleted successfully.`, { id: loader });
    } catch (err) {
      toast.error(`Failed to delete record.`, { id: loader });
    }
  };

  // Filtered lists
  const filteredDepartments = departments.filter(d => 
    d.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    d.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredBatches = batches.filter(b => 
    b.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeDeptCount = departments.filter(d => d.isActive).length;
  const activeBatchCount = batches.filter(b => b.isActive).length;

  return (
    <div className="space-y-8 animate-fadeIn font-sans text-left pb-16">
      
      {/* Top Header Banner */}
      <div className="relative overflow-hidden bg-white border border-slate-150 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.015)]">
        <div className="relative z-10 space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#004f90] font-black uppercase tracking-widest bg-[#004f90]/10 border border-[#004f90]/20 px-3 py-1 rounded-full inline-block">
              Dynamic System Configurator
            </span>
            <span className="text-[10px] text-emerald-700 font-bold uppercase tracking-wider bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full inline-flex items-center gap-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live Sync
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-poppins tracking-tight">
            Departments & Specialization Batches
          </h1>
          <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
            Manage academic departments and training batch tracks dynamically. All changes update candidate registration forms and assessment targeting automatically.
          </p>
        </div>

        <button
          onClick={fetchData}
          className="relative z-10 flex items-center gap-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 px-4 py-3 rounded-2xl text-xs font-bold transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
        >
          <RefreshCw className="h-4 w-4 text-[#004f90]" />
          <span>Sync Metadata</span>
        </button>
      </div>

      {/* Summary Executive Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Card 1: Departments */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Academic Departments</p>
            <h3 className="text-3xl font-black text-slate-900 font-mono">
              {departments.length} <span className="text-xs text-emerald-600 font-sans font-extrabold ml-1">({activeDeptCount} Active)</span>
            </h3>
          </div>
          <div className="p-3 bg-blue-50 text-[#004f90] border border-blue-100 rounded-2xl">
            <GraduationCap className="h-6 w-6" />
          </div>
        </div>

        {/* Card 2: Batches */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Specialization Tracks</p>
            <h3 className="text-3xl font-black text-slate-900 font-mono">
              {batches.length} <span className="text-xs text-emerald-600 font-sans font-extrabold ml-1">({activeBatchCount} Active)</span>
            </h3>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl">
            <Layers className="h-6 w-6" />
          </div>
        </div>

        {/* Card 3: Auto Sync Status */}
        <div className="bg-white border border-slate-150 rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow transition-all">
          <div className="space-y-1">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">System Integration</p>
            <h3 className="text-base font-extrabold text-slate-800">Dynamic Forms</h3>
            <p className="text-xs text-slate-500 font-medium">Auto-populates UI selectors</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-600 border border-purple-100 rounded-2xl">
            <Sparkles className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation & Action Bar */}
      <div className="bg-white border border-slate-150 rounded-3xl p-6 shadow-sm space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-5">
          {/* Tab buttons */}
          <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setActiveTab('departments')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'departments'
                  ? 'bg-[#004f90] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              <span>Departments Ledger ({departments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('batches')}
              className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'batches'
                  ? 'bg-[#004f90] text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>Specialization Batches ({batches.length})</span>
            </button>
          </div>

          {/* Action & Search */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                placeholder={activeTab === 'departments' ? "Search department name or code..." : "Search batch track name..."}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-xl py-2.5 pl-9 pr-4 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            </div>

            {/* Add Button */}
            {activeTab === 'departments' ? (
              <button
                onClick={() => handleOpenDeptModal()}
                className="bg-[#004f90] hover:bg-[#003c6e] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add Department</span>
              </button>
            ) : (
              <button
                onClick={() => handleOpenBatchModal()}
                className="bg-[#004f90] hover:bg-[#003c6e] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer active:scale-95 shrink-0"
              >
                <Plus className="h-4 w-4" />
                <span>Add Batch Track</span>
              </button>
            )}
          </div>
        </div>

        {/* Content Views */}
        {loading ? (
          <div className="py-20 text-center text-sm font-bold text-slate-400 flex flex-col items-center gap-3">
            <div className="h-8 w-8 border-3 border-[#004f90] border-t-transparent rounded-full animate-spin"></div>
            <span>Loading metadata registries...</span>
          </div>
        ) : activeTab === 'departments' ? (
          // DEPARTMENTS TABLE
          filteredDepartments.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <Building2 className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">No departments found.</p>
              <p>Click "Add Department" above to create your first dynamic department entry.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 uppercase font-extrabold text-[10px] tracking-widest bg-slate-50/50">
                    <th className="py-3.5 px-4 rounded-l-xl">Code</th>
                    <th className="py-3.5 px-4">Department Full Name</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDepartments.map((dept) => (
                    <tr key={dept._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Code Badge */}
                      <td className="py-4 px-4 font-mono font-black text-slate-900">
                        <span className="inline-block bg-blue-50 border border-blue-150 text-[#004f90] px-3 py-1 rounded-lg text-xs">
                          {dept.code}
                        </span>
                      </td>

                      {/* Name */}
                      <td className="py-4 px-4 font-extrabold text-slate-800 text-sm">{dept.name}</td>

                      {/* Description */}
                      <td className="py-4 px-4 text-slate-500 max-w-md font-medium">
                        {dept.description || <span className="text-slate-300 italic">No description provided</span>}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleDeptActive(dept)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider transition-all cursor-pointer ${
                            dept.isActive
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 border-slate-250 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${dept.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{dept.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDeptModal(dept)}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                            title="Edit Department"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'dept', id: dept._id, name: dept.code })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-100"
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
          )
        ) : (
          // BATCHES TABLE
          filteredBatches.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <BookOpen className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-bold text-slate-700 text-sm">No batch tracks found.</p>
              <p>Click "Add Batch Track" above to create your first dynamic specialization batch.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 uppercase font-extrabold text-[10px] tracking-widest bg-slate-50/50">
                    <th className="py-3.5 px-4 rounded-l-xl">Batch Track Name</th>
                    <th className="py-3.5 px-4">Short Code</th>
                    <th className="py-3.5 px-4">Target Department</th>
                    <th className="py-3.5 px-4">Description</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right rounded-r-xl">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBatches.map((batch) => (
                    <tr key={batch._id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name */}
                      <td className="py-4 px-4 font-black text-slate-900 text-sm">{batch.name}</td>

                      {/* Code */}
                      <td className="py-4 px-4 font-mono text-slate-500 font-bold">
                        {batch.code ? (
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded font-mono text-[11px]">
                            {batch.code}
                          </span>
                        ) : (
                          <span className="text-slate-300">N/A</span>
                        )}
                      </td>

                      {/* Department Target */}
                      <td className="py-4 px-4">
                        <span className="inline-block bg-purple-50 border border-purple-150 text-purple-700 font-extrabold px-3 py-1 rounded-lg text-xs">
                          {batch.department}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="py-4 px-4 text-slate-500 max-w-md font-medium">
                        {batch.description || <span className="text-slate-300 italic">No description</span>}
                      </td>

                      {/* Status Toggle */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleBatchActive(batch)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-wider transition-all cursor-pointer ${
                            batch.isActive
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 border-slate-250 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${batch.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{batch.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenBatchModal(batch)}
                            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-slate-200"
                            title="Edit Batch Track"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ type: 'batch', id: batch._id, name: batch.name })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-red-100"
                            title="Delete Batch Track"
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
          )
        )}
      </div>

      {/* DEPARTMENT MODAL */}
      <AnimatePresence>
        {showDeptModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeptModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[4px] z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 m-auto max-w-lg w-[90%] h-fit bg-white rounded-3xl p-7 shadow-2xl border border-slate-150 z-[2100] space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {deptToEdit ? 'Edit Department' : 'Add New Department'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure department code and full name for dynamic platform targeting.
                  </p>
                </div>
                <button
                  onClick={() => setShowDeptModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveDepartment} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                    Department Short Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE, IT, AIDS, CYBER"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none uppercase"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                    Department Full Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Brief scope or details of department..."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-3 px-4 text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 bg-[#004f90] hover:bg-[#003c6e] text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {deptToEdit ? 'Save Department Changes' : 'Create Department'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeptModal(false)}
                    className="border border-slate-200 text-slate-600 font-bold py-3 px-5 rounded-xl text-xs hover:bg-slate-50 transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* BATCH MODAL */}
      <AnimatePresence>
        {showBatchModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBatchModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[4px] z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 m-auto max-w-lg w-[90%] h-fit bg-white rounded-3xl p-7 shadow-2xl border border-slate-150 z-[2100] space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="space-y-0.5">
                  <h3 className="text-xl font-extrabold text-slate-900">
                    {batchToEdit ? 'Edit Batch Track' : 'Add New Batch Track'}
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    Configure specialization track or batch name for candidate cohort targeting.
                  </p>
                </div>
                <button
                  onClick={() => setShowBatchModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveBatch} className="space-y-4 text-left">
                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                    Batch / Specialization Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Web Design, UI/UX, SolidWorks, Python Fullstack"
                    value={batchName}
                    onChange={(e) => setBatchName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-3 px-4 text-sm font-bold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                      Track Code (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. WEB, CAD"
                      value={batchCode}
                      onChange={(e) => setBatchCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-3 px-4 text-xs font-bold text-slate-800 focus:outline-none uppercase"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                      Target Department
                    </label>
                    <select
                      value={batchDept}
                      onChange={(e) => setBatchDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-3 px-3 text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="All Departments">All Departments</option>
                      {departments.map(d => (
                        <option key={d._id} value={d.code}>{d.code} - {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-extrabold text-slate-600 uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Brief description of training track..."
                    value={batchDesc}
                    onChange={(e) => setBatchDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-3 px-4 text-xs font-semibold text-slate-800 focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 bg-[#004f90] hover:bg-[#003c6e] text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                  >
                    {batchToEdit ? 'Save Batch Changes' : 'Create Batch Track'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowBatchModal(false)}
                    className="border border-slate-200 text-slate-600 font-bold py-3 px-5 rounded-xl text-xs hover:bg-slate-50 transition-all cursor-pointer"
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
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[4px] z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 m-auto max-w-[400px] w-[90%] h-fit bg-white rounded-3xl p-7 shadow-2xl border border-slate-150 flex flex-col items-center text-center space-y-4 z-[2100]"
            >
              <div className="h-14 w-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <div className="space-y-1 text-center">
                <h4 className="text-lg font-bold text-slate-900">
                  Delete {deleteTarget.type === 'dept' ? 'Department' : 'Batch Track'}?
                </h4>
                <p className="text-xs text-slate-500 font-medium">
                  Are you sure you want to delete <span className="font-extrabold text-slate-800">'{deleteTarget.name}'</span>?
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold py-3 rounded-xl text-xs transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Delete Record
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-slate-200 text-slate-600 font-bold py-3 rounded-xl text-xs hover:bg-slate-50 transition-all cursor-pointer"
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
