import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { 
  Building2, Plus, Search, Edit3, Trash2, RefreshCw, AlertTriangle, CheckCircle2, 
  Grid, List, Layers, ShieldCheck, BookOpen, Filter, Sparkles, X, ChevronRight, 
  Info, FolderKanban, Check, SlidersHorizontal, ArrowUpRight, GraduationCap, XCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CohortManagement = () => {
  // Main Tab State: 'departments' | 'tracks'
  const [activeTab, setActiveTab] = useState('departments');

  // Data States
  const [departments, setDepartments] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'inactive'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Department Modal State
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState(null);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptIsActive, setDeptIsActive] = useState(true);

  // Specialization Track Modal State
  const [showTrackModal, setShowTrackModal] = useState(false);
  const [trackToEdit, setTrackToEdit] = useState(null);
  const [trackCode, setTrackCode] = useState('');
  const [trackName, setTrackName] = useState('');
  const [trackDept, setTrackDept] = useState('All Departments');
  const [trackDesc, setTrackDesc] = useState('');
  const [trackIsActive, setTrackIsActive] = useState(true);

  // Delete Confirmation State: { type: 'dept'|'track', id, code, name }
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch Departments & Tracks
  const fetchData = async () => {
    setLoading(true);
    try {
      const [deptRes, trackRes] = await Promise.all([
        api.get('/cohorts/departments'),
        api.get('/cohorts/batches')
      ]);
      setDepartments(deptRes.data || []);
      setTracks(trackRes.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Unable to load department roster or specialization tracks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Handlers for Department
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
      return toast.error('Department code and full name are required.');
    }

    const payload = {
      code: deptCode.trim().toUpperCase(),
      name: deptName.trim(),
      description: deptDesc.trim(),
      isActive: deptIsActive
    };

    const loader = toast.loading(deptToEdit ? 'Updating department record...' : 'Adding department...');
    try {
      if (deptToEdit) {
        const { data } = await api.put(`/cohorts/departments/${deptToEdit._id}`, payload);
        setDepartments(prev => prev.map(d => d._id === deptToEdit._id ? data : d));
        toast.success(`Department '${data.code}' updated successfully.`, { id: loader });
      } else {
        const { data } = await api.post('/cohorts/departments', payload);
        setDepartments(prev => [...prev, data]);
        toast.success(`Department '${data.code}' registered successfully.`, { id: loader });
      }
      setShowDeptModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save department details.', { id: loader });
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

  // Handlers for Specialization Tracks
  const handleOpenTrackModal = (track = null) => {
    if (track) {
      setTrackToEdit(track);
      setTrackCode(track.code || '');
      setTrackName(track.name || '');
      setTrackDept(track.department || 'All Departments');
      setTrackDesc(track.description || '');
      setTrackIsActive(track.isActive !== undefined ? track.isActive : true);
    } else {
      setTrackToEdit(null);
      setTrackCode('');
      setTrackName('');
      setTrackDept(departments[0]?.code || 'All Departments');
      setTrackDesc('');
      setTrackIsActive(true);
    }
    setShowTrackModal(true);
  };

  const handleSaveTrack = async (e) => {
    e.preventDefault();
    if (!trackName.trim()) {
      return toast.error('Track name is required.');
    }

    const payload = {
      name: trackName.trim(),
      code: trackCode.trim().toUpperCase(),
      department: trackDept,
      description: trackDesc.trim(),
      isActive: trackIsActive
    };

    const loader = toast.loading(trackToEdit ? 'Updating track details...' : 'Creating track...');
    try {
      if (trackToEdit) {
        const { data } = await api.put(`/cohorts/batches/${trackToEdit._id}`, payload);
        setTracks(prev => prev.map(t => t._id === trackToEdit._id ? data : t));
        toast.success(`Track '${data.name}' updated successfully.`, { id: loader });
      } else {
        const { data } = await api.post('/cohorts/batches', payload);
        setTracks(prev => [...prev, data]);
        toast.success(`Specialization track '${data.name}' created.`, { id: loader });
      }
      setShowTrackModal(false);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save specialization track.', { id: loader });
    }
  };

  const handleToggleTrackActive = async (track) => {
    const loader = toast.loading(`${track.isActive ? 'Deactivating' : 'Activating'} ${track.name}...`);
    try {
      const { data } = await api.put(`/cohorts/batches/${track._id}`, { isActive: !track.isActive });
      setTracks(prev => prev.map(t => t._id === track._id ? data : t));
      toast.success(`Track '${track.name}' is now ${data.isActive ? 'Active' : 'Inactive'}.`, { id: loader });
    } catch (err) {
      toast.error('Failed to update track status.', { id: loader });
    }
  };

  // Delete Handler
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, id, code, name } = deleteTarget;
    setDeleteTarget(null);

    const displayName = code || name;
    const endpoint = type === 'dept' ? `/cohorts/departments/${id}` : `/cohorts/batches/${id}`;
    const loader = toast.loading(`Deleting ${type === 'dept' ? 'department' : 'track'} '${displayName}'...`);

    try {
      await api.delete(endpoint);
      if (type === 'dept') {
        setDepartments(prev => prev.filter(d => d._id !== id));
      } else {
        setTracks(prev => prev.filter(t => t._id !== id));
      }
      toast.success(`Record '${displayName}' deleted successfully.`, { id: loader });
    } catch (err) {
      toast.error('Failed to delete target record.', { id: loader });
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

  const filteredTracks = tracks.filter(t => {
    const matchesSearch = 
      t.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = 
      statusFilter === 'all' ? true :
      statusFilter === 'active' ? t.isActive === true :
      t.isActive === false;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const activeDeptCount = departments.filter(d => d.isActive).length;
  const inactiveDeptCount = departments.length - activeDeptCount;
  const activeTrackCount = tracks.filter(t => t.isActive).length;

  return (
    <div className="space-y-7 animate-fadeIn font-sans text-left pb-20">
      
      {/* BRAND HERO HEADER BANNER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#004f90] via-[#003d70] to-[#00264d] text-white p-7 sm:p-8 shadow-xl shadow-blue-900/10 border border-blue-800/30">
        {/* Decorative Grid & Glow Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none" />
        <div className="absolute -right-10 -bottom-10 opacity-10 pointer-events-none">
          <Building2 className="w-80 h-80 text-white" />
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-wider text-blue-100">
              <Sparkles className="h-3.5 w-3.5 text-amber-300" />
              <span>Academic Directory Engine</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-poppins tracking-tight text-white">
              Department & Specialization Roster
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/90 font-medium leading-relaxed">
              Configure academic faculties, short codes, and specialization tracks. Configured metadata dynamically drives student registration, assessment targeting, and analytical reports.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={fetchData}
              className="p-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-2xl text-white transition-all cursor-pointer backdrop-blur-md active:scale-95"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            
            <button
              onClick={() => handleOpenDeptModal()}
              className="bg-white text-[#004f90] hover:bg-blue-50 font-black text-xs px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-black/10 transition-all cursor-pointer active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span>Add Department</span>
            </button>

            <button
              onClick={() => handleOpenTrackModal()}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all cursor-pointer active:scale-95"
            >
              <Layers className="h-4 w-4" />
              <span>Add Specialization</span>
            </button>
          </div>
        </div>
      </div>

      {/* OVERVIEW STAT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Departments */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Total Departments</p>
            <h3 className="text-2xl font-black text-slate-900 font-mono tracking-tight">{departments.length}</h3>
            <p className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
              <span className="text-[#004f90]">Faculty codes</span>
            </p>
          </div>
          <div className="p-3.5 bg-blue-50 text-[#004f90] border border-blue-100 rounded-2xl group-hover:scale-105 transition-transform">
            <Building2 className="h-6 w-6" />
          </div>
        </div>

        {/* Active Departments */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Active Status</p>
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-black text-emerald-600 font-mono tracking-tight">{activeDeptCount}</h3>
              <span className="text-[11px] font-bold text-slate-400">({departments.length ? Math.round((activeDeptCount/departments.length)*100) : 0}%)</span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-600 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Ready for enrollment
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-2xl group-hover:scale-105 transition-transform">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Specialization Tracks */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Specialization Tracks</p>
            <h3 className="text-2xl font-black text-amber-600 font-mono tracking-tight">{tracks.length}</h3>
            <p className="text-[11px] font-semibold text-amber-700 flex items-center gap-1">
              <span>{activeTrackCount} active tracks</span>
            </p>
          </div>
          <div className="p-3.5 bg-amber-50 text-amber-600 border border-amber-100 rounded-2xl group-hover:scale-105 transition-transform">
            <FolderKanban className="h-6 w-6" />
          </div>
        </div>

        {/* Inactive / Suspended */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest">Inactive Units</p>
            <h3 className="text-2xl font-black text-slate-700 font-mono tracking-tight">{inactiveDeptCount}</h3>
            <p className="text-[11px] font-semibold text-slate-400">
              Hidden from selection
            </p>
          </div>
          <div className="p-3.5 bg-slate-100 text-slate-500 border border-slate-200 rounded-2xl group-hover:scale-105 transition-transform">
            <AlertTriangle className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* CONTROLS & TABS TOOLBAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        
        {/* Tab Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl gap-1 shrink-0">
          <button
            onClick={() => setActiveTab('departments')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'departments'
                ? 'bg-white text-[#004f90] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Academic Departments</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'departments' ? 'bg-blue-50 text-[#004f90]' : 'bg-slate-200 text-slate-600'
            }`}>
              {departments.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('tracks')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-black transition-all cursor-pointer ${
              activeTab === 'tracks'
                ? 'bg-white text-[#004f90] shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderKanban className="h-4 w-4" />
            <span>Specialization Tracks</span>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono ${
              activeTab === 'tracks' ? 'bg-amber-50 text-amber-700' : 'bg-slate-200 text-slate-600'
            }`}>
              {tracks.length}
            </span>
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Search Box */}
          <div className="relative flex-1 md:w-64">
            <input
              type="text"
              placeholder={activeTab === 'departments' ? "Search department code or title..." : "Search specialization track..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#004f90] rounded-xl py-2 pl-9 pr-8 text-xs font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
            />
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Status Filter */}
          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-[#004f90] rounded-xl py-2 px-3 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer appearance-none pr-8"
            >
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="inactive">Inactive Only</option>
            </select>
            <SlidersHorizontal className="absolute right-2.5 top-2.5 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl gap-1 shrink-0">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'grid' ? 'bg-white text-[#004f90] shadow-sm' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Grid View"
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                viewMode === 'table' ? 'bg-white text-[#004f90] shadow-sm' : 'text-slate-400 hover:text-slate-700'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>

      {/* MAIN CONTENT AREA */}
      {loading ? (
        <div className="bg-white border border-slate-200 rounded-3xl py-24 text-center text-xs font-bold text-slate-400 flex flex-col items-center gap-3 shadow-sm">
          <div className="h-8 w-8 border-3 border-[#004f90] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-slate-600 font-semibold">Synchronizing academic data registry...</span>
        </div>
      ) : activeTab === 'departments' ? (
        
        /* DEPARTMENT TAB CONTENT */
        filteredDepartments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl py-20 px-4 text-center text-slate-400 space-y-3 shadow-sm">
            <div className="h-16 w-16 bg-blue-50 text-[#004f90] rounded-3xl flex items-center justify-center mx-auto border border-blue-100">
              <Building2 className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No departments match your filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try updating your search query or status filter, or add a new academic department code.
            </p>
            <button
              onClick={() => handleOpenDeptModal()}
              className="inline-flex items-center gap-2 bg-[#004f90] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:bg-[#003d70] transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add Department</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          
          /* DEPARTMENT GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredDepartments.map((dept) => {
              const linkedTracks = tracks.filter(t => t.department === dept.code || t.department === 'All Departments');

              return (
                <motion.div
                  key={dept._id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white border border-slate-200 hover:border-[#004f90]/40 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
                >
                  {/* Top Gradient Accent */}
                  <div className={`h-1.5 w-full ${dept.isActive ? 'bg-gradient-to-r from-[#004f90] to-blue-400' : 'bg-slate-300'}`} />

                  <div className="p-6 space-y-4">
                    {/* Header: Code Badge & Status Toggle */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-50 border border-blue-150 text-[#004f90] font-mono font-black px-3 py-1 rounded-xl text-sm tracking-wide shadow-xs">
                          {dept.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider bg-slate-100 px-2 py-0.5 rounded-md">
                          Faculty
                        </span>
                      </div>

                      <button
                        onClick={() => handleToggleDeptActive(dept)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                          dept.isActive
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                            : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                        }`}
                      >
                        <span className={`h-1.5 w-1.5 rounded-full ${dept.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></span>
                        <span>{dept.isActive ? 'Active' : 'Inactive'}</span>
                      </button>
                    </div>

                    {/* Department Title */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-[#004f90] transition-colors leading-snug">
                        {dept.name}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 min-h-[32px]">
                        {dept.description || <span className="text-slate-300 italic">No description provided for this department.</span>}
                      </p>
                    </div>

                    {/* Associated Tracks Pill */}
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                      <span className="text-slate-400 font-semibold text-[11px]">Associated Tracks</span>
                      <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-lg text-[11px]">
                        {linkedTracks.length} specializations
                      </span>
                    </div>
                  </div>

                  {/* Card Bottom Toolbar */}
                  <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-slate-400 font-medium">
                      Registered {new Date(dept.createdAt || Date.now()).toLocaleDateString()}
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenDeptModal(dept)}
                        className="p-2 text-slate-500 hover:text-[#004f90] hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                        title="Edit Department Details"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>

                      <button
                        onClick={() => setDeleteTarget({ type: 'dept', id: dept._id, code: dept.code, name: dept.name })}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                        title="Delete Department"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (

          /* DEPARTMENT TABLE VIEW */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 uppercase font-extrabold text-[10px] tracking-widest bg-slate-50/80">
                    <th className="py-4 px-6">Dept Code</th>
                    <th className="py-4 px-6">Department Full Title</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDepartments.map((dept) => (
                    <tr key={dept._id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="inline-block bg-blue-50 border border-blue-150 text-[#004f90] font-mono font-black px-3 py-1 rounded-xl text-xs">
                          {dept.code}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-[#004f90] transition-colors">
                          {dept.name}
                        </div>
                      </td>

                      <td className="py-4 px-6 text-slate-500 font-medium max-w-xs truncate">
                        {dept.description || <span className="text-slate-300 italic">No description</span>}
                      </td>

                      <td className="py-4 px-6 text-center">
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

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenDeptModal(dept)}
                            className="p-2 text-slate-400 hover:text-[#004f90] hover:bg-blue-50 rounded-xl transition-all cursor-pointer"
                            title="Edit Department"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setDeleteTarget({ type: 'dept', id: dept._id, code: dept.code, name: dept.name })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
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

        )

      ) : (

        /* TRACKS TAB CONTENT */
        filteredTracks.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl py-20 px-4 text-center text-slate-400 space-y-3 shadow-sm">
            <div className="h-16 w-16 bg-amber-50 text-amber-600 rounded-3xl flex items-center justify-center mx-auto border border-amber-100">
              <FolderKanban className="h-8 w-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No specialization tracks found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Create specialization tracks (e.g. Web Design, UI/UX, Full Stack) and map them to departments.
            </p>
            <button
              onClick={() => handleOpenTrackModal()}
              className="inline-flex items-center gap-2 bg-amber-500 text-slate-950 font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-sm hover:bg-amber-400 transition-all cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Create Specialization Track</span>
            </button>
          </div>
        ) : viewMode === 'grid' ? (
          
          /* TRACKS GRID VIEW */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredTracks.map((track) => (
              <motion.div
                key={track._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white border border-slate-200 hover:border-amber-400/50 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className={`h-1.5 w-full ${track.isActive ? 'bg-gradient-to-r from-amber-500 to-orange-400' : 'bg-slate-300'}`} />

                <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="bg-amber-50 border border-amber-200 text-amber-800 font-mono font-black px-3 py-1 rounded-xl text-xs">
                      {track.code || 'TRACK'}
                    </span>

                    <button
                      onClick={() => handleToggleTrackActive(track)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                        track.isActive
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                          : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                      }`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full ${track.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                      <span>{track.isActive ? 'Active' : 'Inactive'}</span>
                    </button>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      {track.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 min-h-[32px]">
                      {track.description || <span className="text-slate-300 italic">No description specified</span>}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-semibold text-[11px]">Mapped Department</span>
                    <span className="font-extrabold text-[#004f90] bg-blue-50 px-2.5 py-0.5 rounded-lg text-[11px] border border-blue-100">
                      {track.department || 'All Departments'}
                    </span>
                  </div>
                </div>

                <div className="px-6 py-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Specialization Track</span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenTrackModal(track)}
                      className="p-2 text-slate-500 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                      title="Edit Track"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setDeleteTarget({ type: 'track', id: track._id, code: track.code, name: track.name })}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                      title="Delete Track"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (

          /* TRACKS TABLE VIEW */
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-150 text-slate-400 uppercase font-extrabold text-[10px] tracking-widest bg-slate-50/80">
                    <th className="py-4 px-6">Track Code</th>
                    <th className="py-4 px-6">Specialization Title</th>
                    <th className="py-4 px-6">Target Department</th>
                    <th className="py-4 px-6">Description</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTracks.map((track) => (
                    <tr key={track._id} className="hover:bg-slate-50/60 transition-colors group">
                      <td className="py-4 px-6">
                        <span className="inline-block bg-amber-50 border border-amber-200 text-amber-800 font-mono font-black px-3 py-1 rounded-xl text-xs">
                          {track.code || 'N/A'}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-slate-900 text-sm group-hover:text-amber-700 transition-colors">
                        {track.name}
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-extrabold text-[#004f90] bg-blue-50 px-2.5 py-1 rounded-lg text-xs border border-blue-100">
                          {track.department || 'All Departments'}
                        </span>
                      </td>

                      <td className="py-4 px-6 text-slate-500 font-medium max-w-xs truncate">
                        {track.description || <span className="text-slate-300 italic">No description</span>}
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          onClick={() => handleToggleTrackActive(track)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border transition-all cursor-pointer ${
                            track.isActive
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100'
                              : 'bg-slate-100 border-slate-200 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full ${track.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}></span>
                          <span>{track.isActive ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleOpenTrackModal(track)}
                            className="p-2 text-slate-400 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-all cursor-pointer"
                            title="Edit Track"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>

                          <button
                            onClick={() => setDeleteTarget({ type: 'track', id: track._id, code: track.code, name: track.name })}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all cursor-pointer"
                            title="Delete Track"
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

        )
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
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="fixed inset-0 m-auto max-w-lg w-[92%] h-fit bg-white rounded-3xl p-7 shadow-2xl border border-slate-200 z-[2100] space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-50 text-[#004f90] rounded-2xl flex items-center justify-center border border-blue-100">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {deptToEdit ? 'Edit Department' : 'Register New Department'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Define short faculty code and full department name.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDeptModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveDepartment} className="space-y-4 text-left">
                {/* Department Code */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                    <span>Department Code *</span>
                    <span className="text-slate-400 lowercase text-[10px] font-normal">e.g. CSE, IT, AIDS, ECE</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSE"
                    value={deptCode}
                    onChange={(e) => setDeptCode(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-3 px-4 text-xs font-bold text-slate-900 focus:outline-none uppercase tracking-wider font-mono"
                  />
                </div>

                {/* Department Full Title */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Full Department Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Computer Science & Engineering"
                    value={deptName}
                    onChange={(e) => setDeptName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-3 px-4 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Description (Optional)
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Brief description of department scope or specialization..."
                    value={deptDesc}
                    onChange={(e) => setDeptDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl py-3 px-4 text-xs font-medium text-slate-800 focus:outline-none resize-none"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-800">Active Enrollment Status</span>
                    <p className="text-[11px] text-slate-500 font-medium">When active, students can register under this department.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeptIsActive(!deptIsActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      deptIsActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        deptIsActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Live Preview Card */}
                <div className="p-3.5 bg-blue-50/60 border border-blue-100 rounded-2xl space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#004f90] flex items-center gap-1">
                    <Info className="h-3 w-3" /> Live Badge Preview
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="bg-blue-50 border border-blue-200 text-[#004f90] font-mono font-black px-3 py-1 rounded-lg text-xs">
                      {deptCode.toUpperCase() || 'CODE'}
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      {deptName || 'Department Name Preview'}
                    </span>
                  </div>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 bg-[#004f90] hover:bg-[#003d70] text-white font-black py-3 rounded-xl text-xs transition-all shadow-md shadow-blue-900/10 active:scale-95 cursor-pointer"
                  >
                    {deptToEdit ? 'Save Changes' : 'Register Department'}
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

      {/* ADD / EDIT TRACK MODAL */}
      <AnimatePresence>
        {showTrackModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTrackModal(false)}
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              className="fixed inset-0 m-auto max-w-lg w-[92%] h-fit bg-white rounded-3xl p-7 shadow-2xl border border-slate-200 z-[2100] space-y-6"
            >
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900">
                      {trackToEdit ? 'Edit Specialization Track' : 'Create Specialization Track'}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      Map targeted skill tracks to academic departments.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTrackModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-700 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTrack} className="space-y-4 text-left">
                {/* Track Name */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Track Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Full Stack Java, Data Science & ML"
                    value={trackName}
                    onChange={(e) => setTrackName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 focus:outline-none"
                  />
                </div>

                {/* Track Code & Target Department */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      Track Code
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. FSWD"
                      value={trackCode}
                      onChange={(e) => setTrackCode(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-3 px-4 text-xs font-bold text-slate-900 focus:outline-none uppercase font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                      Target Department
                    </label>
                    <select
                      value={trackDept}
                      onChange={(e) => setTrackDept(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-3 px-3 text-xs font-extrabold text-slate-800 focus:outline-none cursor-pointer"
                    >
                      <option value="All Departments">All Departments</option>
                      {departments.map(d => (
                        <option key={d._id} value={d.code}>{d.code} - {d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-extrabold text-slate-700 uppercase tracking-wider">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Scope and syllabus focus for this track..."
                    value={trackDesc}
                    onChange={(e) => setTrackDesc(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-amber-500 rounded-xl py-3 px-4 text-xs font-medium text-slate-800 focus:outline-none resize-none"
                  />
                </div>

                {/* Status Toggle */}
                <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                  <div className="space-y-0.5">
                    <span className="text-xs font-extrabold text-slate-800">Track Active Status</span>
                    <p className="text-[11px] text-slate-500 font-medium">Available for batch assignment.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTrackIsActive(!trackIsActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                      trackIsActive ? 'bg-emerald-500' : 'bg-slate-300'
                    }`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                        trackIsActive ? 'translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>

                {/* Modal Action Buttons */}
                <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                  <button
                    type="submit"
                    className="flex-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black py-3 rounded-xl text-xs transition-all shadow-md shadow-amber-500/10 active:scale-95 cursor-pointer"
                  >
                    {trackToEdit ? 'Save Track' : 'Create Specialization'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowTrackModal(false)}
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
              className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="fixed inset-0 m-auto max-w-[400px] w-[90%] h-fit bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 flex flex-col items-center text-center space-y-4 z-[2100]"
            >
              <div className="h-14 w-14 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center border border-red-100">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-lg font-black text-slate-900">
                  Delete {deleteTarget.type === 'dept' ? 'Department' : 'Specialization Track'}?
                </h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to remove <span className="font-extrabold text-slate-900">'{deleteTarget.code || deleteTarget.name}'</span>? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-2">
                <button
                  onClick={confirmDelete}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-3 rounded-xl text-xs transition-all shadow-md shadow-red-600/20 active:scale-95 cursor-pointer"
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-slate-200 text-slate-700 font-bold py-3 rounded-xl text-xs hover:bg-slate-50 transition-all cursor-pointer"
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

