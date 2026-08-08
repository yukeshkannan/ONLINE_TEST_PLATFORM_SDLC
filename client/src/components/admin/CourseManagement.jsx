import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { 
  Plus, Search, Edit3, Trash2, RefreshCw, X, ChevronDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ClockLoader from '../shared/ClockLoader.jsx';

const CourseManagement = () => {
  // Category Tab: 'college' | 'institute'
  const [activeTab, setActiveTab] = useState('college');

  // Data States
  const [departments, setDepartments] = useState([]);
  const [batches, setBatches] = useState([]);
  const [centers, setCenters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search terms
  const [collegeSearch, setCollegeSearch] = useState('');
  const [sdlcSearch, setSdlcSearch] = useState('');

  // Department Modal / Drawer
  const [showDeptModal, setShowDeptModal] = useState(false);
  const [deptToEdit, setDeptToEdit] = useState(null);
  const [deptCode, setDeptCode] = useState('');
  const [deptName, setDeptName] = useState('');
  const [deptDesc, setDeptDesc] = useState('');

  // Course / Batch Modal / Drawer
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [courseCategory, setCourseCategory] = useState('college');
  const [courseName, setCourseName] = useState('');
  const [courseCode, setCourseCode] = useState('');
  const [courseDept, setCourseDept] = useState('All Departments');
  const [courseDesc, setCourseDesc] = useState('');

  // Center / Branch Modal / Drawer
  const [showCenterModal, setShowCenterModal] = useState(false);
  const [centerToEdit, setCenterToEdit] = useState(null);
  const [centerName, setCenterName] = useState('');
  const [centerCode, setCenterCode] = useState('');
  const [centerLocation, setCenterLocation] = useState('');

  // Delete Confirmation State
  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'dept'|'course'|'center', item }

  // Fetch all dynamic data from server
  const fetchAllCatalogData = async () => {
    setLoading(true);
    try {
      const [deptRes, batchRes, centerRes] = await Promise.all([
        api.get('/cohorts/departments'),
        api.get('/cohorts/batches'),
        api.get('/cohorts/centers')
      ]);

      setDepartments(deptRes.data || []);
      setBatches(batchRes.data || []);
      setCenters(centerRes.data || []);
    } catch (err) {
      toast.error('Unable to load course catalog data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllCatalogData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32">
        <ClockLoader size="lg" color="#004f90" text="Loading course catalog & tracks..." />
      </div>
    );
  }

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

  const handleSaveDept = async (e) => {
    e.preventDefault();
    if (!deptCode.trim() || !deptName.trim()) {
      return toast.error('Please enter department code and name.');
    }

    const loader = toast.loading(deptToEdit ? 'Updating department...' : 'Adding department...');
    try {
      const payload = {
        code: deptCode.trim().toUpperCase(),
        name: deptName.trim(),
        description: deptDesc.trim()
      };

      if (deptToEdit) {
        await api.put(`/cohorts/departments/${deptToEdit._id}`, payload);
        toast.success('Department updated successfully.', { id: loader });
      } else {
        await api.post('/cohorts/departments', payload);
        toast.success('Department added successfully.', { id: loader });
      }

      setShowDeptModal(false);
      fetchAllCatalogData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save department.', { id: loader });
    }
  };

  // Course Handlers
  const handleOpenCourseModal = (course = null, cat = 'college') => {
    setCourseCategory(cat);
    if (course) {
      setCourseToEdit(course);
      setCourseName(course.name || '');
      setCourseCode(course.code || '');
      setCourseDept(course.department || 'All Departments');
      setCourseDesc(course.description || '');
    } else {
      setCourseToEdit(null);
      setCourseName('');
      setCourseCode('');
      setCourseDept('All Departments');
      setCourseDesc('');
    }
    setShowCourseModal(true);
  };

  const handleSaveCourse = async (e) => {
    e.preventDefault();
    if (!courseName.trim()) {
      return toast.error('Please enter course/track name.');
    }

    const loader = toast.loading(courseToEdit ? 'Updating course...' : 'Adding course...');
    try {
      const payload = {
        name: courseName.trim(),
        code: courseCode.trim().toUpperCase(),
        category: courseCategory,
        department: courseDept,
        description: courseDesc.trim()
      };

      if (courseToEdit) {
        await api.put(`/cohorts/batches/${courseToEdit._id}`, payload);
        toast.success('Course track updated.', { id: loader });
      } else {
        await api.post('/cohorts/batches', payload);
        toast.success('Course track added.', { id: loader });
      }

      setShowCourseModal(false);
      fetchAllCatalogData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save course.', { id: loader });
    }
  };

  // Center Handlers
  const handleOpenCenterModal = (center = null) => {
    if (center) {
      setCenterToEdit(center);
      setCenterName(center.name || '');
      setCenterCode(center.code || '');
      setCenterLocation(center.location || '');
    } else {
      setCenterToEdit(null);
      setCenterName('');
      setCenterCode('');
      setCenterLocation('');
    }
    setShowCenterModal(true);
  };

  const handleSaveCenter = async (e) => {
    e.preventDefault();
    if (!centerName.trim() || !centerCode.trim()) {
      return toast.error('Please enter branch name and district code.');
    }

    const loader = toast.loading(centerToEdit ? 'Updating district branch...' : 'Adding district branch...');
    try {
      const payload = {
        name: centerName.trim(),
        code: centerCode.trim().toUpperCase(),
        location: centerLocation.trim()
      };

      if (centerToEdit) {
        await api.put(`/cohorts/centers/${centerToEdit._id}`, payload);
        toast.success('District branch updated.', { id: loader });
      } else {
        await api.post('/cohorts/centers', payload);
        toast.success('District branch added.', { id: loader });
      }

      setShowCenterModal(false);
      fetchAllCatalogData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save branch.', { id: loader });
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const { type, item } = deleteTarget;
    setDeleteTarget(null);
    const loader = toast.loading('Deleting record...');

    try {
      if (type === 'dept') {
        await api.delete(`/cohorts/departments/${item._id}`);
      } else if (type === 'course') {
        await api.delete(`/cohorts/batches/${item._id}`);
      } else if (type === 'center') {
        await api.delete(`/cohorts/centers/${item._id}`);
      }
      toast.success('Record deleted successfully.', { id: loader });
      fetchAllCatalogData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record.', { id: loader });
    }
  };

  // Filtered lists
  const filteredDepartments = departments.filter(d => 
    (d.name || '').toLowerCase().includes(collegeSearch.toLowerCase()) ||
    (d.code || '').toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const collegeTracks = batches.filter(b => b.category === 'college');
  const filteredCollegeTracks = collegeTracks.filter(b =>
    (b.name || '').toLowerCase().includes(collegeSearch.toLowerCase()) ||
    (b.code || '').toLowerCase().includes(collegeSearch.toLowerCase())
  );

  const sdlcCourses = batches.filter(b => b.category !== 'college');
  const filteredSdlcCourses = sdlcCourses.filter(b =>
    (b.name || '').toLowerCase().includes(sdlcSearch.toLowerCase()) ||
    (b.code || '').toLowerCase().includes(sdlcSearch.toLowerCase())
  );

  const filteredCenters = centers.filter(c =>
    (c.name || '').toLowerCase().includes(sdlcSearch.toLowerCase()) ||
    (c.code || '').toLowerCase().includes(sdlcSearch.toLowerCase())
  );

  return (
    <div className="space-y-6 text-left pb-12 font-sans">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
            Course & Category Catalog
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Configure dynamic departments, specialized tracks, professional courses, and district branches.
          </p>
        </div>

        <button
          onClick={fetchAllCatalogData}
          className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 self-start sm:self-auto"
        >
          <RefreshCw className={`h-4 w-4 text-slate-500 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Catalog</span>
        </button>
      </div>

      {/* Segmented Underline Category Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setActiveTab('college')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'college'
                ? 'border-[#004f90] text-[#004f90]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>College Management</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeTab === 'college' ? 'bg-blue-100 text-[#004f90]' : 'bg-slate-100 text-slate-600'
            }`}>
              {departments.length} Depts
            </span>
          </button>

          <button
            onClick={() => setActiveTab('institute')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2.5 ${
              activeTab === 'institute'
                ? 'border-[#004f90] text-[#004f90]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <span>SDLC Course Management</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              activeTab === 'institute' ? 'bg-blue-100 text-[#004f90]' : 'bg-slate-100 text-slate-600'
            }`}>
              {sdlcCourses.length} Courses
            </span>
          </button>
        </div>

        <div className="hidden sm:block text-xs font-semibold text-slate-500">
          {activeTab === 'college' ? `${departments.length} Departments | ${collegeTracks.length} Tracks` : `${sdlcCourses.length} Courses | ${centers.length} Branches`}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COLLEGE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'college' && (
        <div className="space-y-8">
          
          {/* Section 1: Academic Departments */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-poppins">Academic Departments</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Manage college engineering & degree departments.</p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search departments..."
                    value={collegeSearch}
                    onChange={(e) => setCollegeSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg h-8.5 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-[#004f90]"
                  />
                </div>

                <button
                  onClick={() => handleOpenDeptModal(null)}
                  className="bg-[#004f90] hover:bg-[#003c6e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Dept</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 w-28">CODE</th>
                    <th className="py-3 px-4">DEPARTMENT NAME</th>
                    <th className="py-3 px-4">DESCRIPTION</th>
                    <th className="py-3 px-4 text-right w-24">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredDepartments.length > 0 ? (
                    filteredDepartments.map((dept) => (
                      <tr key={dept._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#004f90]">
                          {dept.code}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {dept.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-normal">
                          {dept.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleOpenDeptModal(dept)}
                              title="Edit Department"
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'dept', item: dept })}
                              title="Delete Department"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md cursor-pointer transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400 text-xs font-medium">
                        No academic departments configured yet. Click "+ Add Dept" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 2: College Course Tracks */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-poppins">Specialized College Course Tracks</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Configure specialized course tracks for specific engineering departments (e.g. SolidWorks for MECH).</p>
              </div>

              <button
                onClick={() => handleOpenCourseModal(null, 'college')}
                className="bg-[#004f90] hover:bg-[#003c6e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add College Track</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 w-28">CODE</th>
                    <th className="py-3 px-4">TRACK NAME</th>
                    <th className="py-3 px-4">TARGET DEPARTMENT</th>
                    <th className="py-3 px-4">DESCRIPTION</th>
                    <th className="py-3 px-4 text-right w-24">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredCollegeTracks.length > 0 ? (
                    filteredCollegeTracks.map((track) => (
                      <tr key={track._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-700">
                          {track.code || 'N/A'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {track.name}
                        </td>
                        <td className="py-3 px-4 font-semibold">
                          <span className="px-2 py-0.5 rounded-md bg-blue-50 text-[#004f90] border border-blue-100 text-[11px]">
                            {track.department || 'All Departments'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-normal">
                          {track.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleOpenCourseModal(track, 'college')}
                              title="Edit Track"
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'course', item: track })}
                              title="Delete Track"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md cursor-pointer transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-10 text-center text-slate-400 text-xs font-medium">
                        No specialized college tracks added. Click "+ Add College Track" to add one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: SDLC COURSE MANAGEMENT */}
      {/* ========================================================================= */}
      {activeTab === 'institute' && (
        <div className="space-y-8">
          
          {/* Section 1: SDLC Professional Certification Courses */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-poppins">SDLC Professional Courses</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Manage professional tech stack courses for institute cohorts.</p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search courses..."
                    value={sdlcSearch}
                    onChange={(e) => setSdlcSearch(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-lg h-8.5 pl-8 pr-3 text-xs text-slate-800 outline-none focus:border-[#004f90]"
                  />
                </div>

                <button
                  onClick={() => handleOpenCourseModal(null, 'institute')}
                  className="bg-[#004f90] hover:bg-[#003c6e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer flex items-center gap-1.5 shrink-0 shadow-2xs transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Course</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                    <th className="py-3 px-4 w-28">CODE</th>
                    <th className="py-3 px-4">COURSE NAME</th>
                    <th className="py-3 px-4">MODULE DESCRIPTION</th>
                    <th className="py-3 px-4 text-right w-24">ACTIONS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredSdlcCourses.length > 0 ? (
                    filteredSdlcCourses.map((course) => (
                      <tr key={course._id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-[#004f90]">
                          {course.code || 'SDLC'}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-900">
                          {course.name}
                        </td>
                        <td className="py-3 px-4 text-slate-500 font-normal">
                          {course.description || '-'}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleOpenCourseModal(course, 'institute')}
                              title="Edit Course"
                              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md cursor-pointer transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setDeleteTarget({ type: 'course', item: course })}
                              title="Delete Course"
                              className="p-1 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md cursor-pointer transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-slate-400 text-xs font-medium">
                        No SDLC professional courses configured yet. Click "+ Add Course" to create one.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* ADD / EDIT DEPARTMENT DRAWER */}
      <AnimatePresence>
        {showDeptModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeptModal(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[999]"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 h-screen w-full max-w-[460px] bg-white z-[1000] shadow-2xl flex flex-col overflow-hidden text-xs"
            >
              <div className="flex-1 overflow-y-auto p-7 space-y-6 scrollbar-none text-left">
                
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-2.5">
                    <img src="/logo.png" alt="SDLC Logo" className="h-9 w-auto object-contain max-w-[160px]" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-poppins">
                        {deptToEdit ? 'Edit Department' : 'Add New Department'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Configure college academic department details.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowDeptModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveDept} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department Code *</label>
                    <input
                      type="text"
                      required
                      value={deptCode}
                      onChange={(e) => setDeptCode(e.target.value)}
                      placeholder="e.g. CSE, IT, ECE"
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs font-mono uppercase text-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department Full Name *</label>
                    <input
                      type="text"
                      required
                      value={deptName}
                      onChange={(e) => setDeptName(e.target.value)}
                      placeholder="e.g. Computer Science & Engineering"
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                      rows={3}
                      value={deptDesc}
                      onChange={(e) => setDeptDesc(e.target.value)}
                      placeholder="Department overview and details..."
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg p-3 text-xs text-slate-800 outline-none resize-none"
                    />
                  </div>

                  <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowDeptModal(false)}
                      className="px-4 h-9 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 h-9 bg-[#004f90] hover:bg-[#003c6e] text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                    >
                      Save Department
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ADD / EDIT COURSE DRAWER */}
      <AnimatePresence>
        {showCourseModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCourseModal(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[999]"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 h-screen w-full max-w-[460px] bg-white z-[1000] shadow-2xl flex flex-col overflow-hidden text-xs"
            >
              <div className="flex-1 overflow-y-auto p-7 space-y-6 scrollbar-none text-left">
                
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-2.5">
                    <img src="/logo.png" alt="SDLC Logo" className="h-9 w-auto object-contain max-w-[160px]" />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-poppins">
                        {courseToEdit ? 'Edit Course / Track' : 'Add Course / Track'}
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">Configure course details for {courseCategory === 'college' ? 'College' : 'SDLC'} cohorts.</p>
                    </div>
                  </div>
                  <button onClick={() => setShowCourseModal(false)} className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer">
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course Name *</label>
                    <input
                      type="text"
                      required
                      value={courseName}
                      onChange={(e) => setCourseName(e.target.value)}
                      placeholder="e.g. Full Stack Web Dev (MERN) or SolidWorks"
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs font-semibold text-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course Code</label>
                    <input
                      type="text"
                      value={courseCode}
                      onChange={(e) => setCourseCode(e.target.value)}
                      placeholder="e.g. MERN, CAD, SW"
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs font-mono uppercase text-slate-800 outline-none"
                    />
                  </div>

                  {courseCategory === 'college' && (
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                      <div className="relative flex items-center">
                        <select
                          value={courseDept}
                          onChange={(e) => setCourseDept(e.target.value)}
                          className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                        >
                          <option value="All Departments">All Departments</option>
                          {departments.map(d => (
                            <option key={d.code} value={d.code}>{d.code} - {d.name}</option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Description</label>
                    <textarea
                      rows={3}
                      value={courseDesc}
                      onChange={(e) => setCourseDesc(e.target.value)}
                      placeholder="Course overview, modules, technologies covered..."
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg p-3 text-xs text-slate-800 outline-none resize-none"
                    />
                  </div>

                  <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowCourseModal(false)}
                      className="px-4 h-9 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 h-9 bg-[#004f90] hover:bg-[#003c6e] text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                    >
                      Save Course
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOG */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-xl max-w-sm w-full p-5 space-y-3.5 shadow-xl text-left border border-slate-200"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-poppins">
                  Delete Record
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900 font-semibold">{deleteTarget.item.name || deleteTarget.item.code}</strong>?
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDeleteTarget(null)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDelete}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CourseManagement;
