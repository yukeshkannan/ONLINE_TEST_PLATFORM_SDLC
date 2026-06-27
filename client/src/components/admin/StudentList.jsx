import React, { useState, useEffect } from 'react';
import { Search, Download, ChevronLeft, ChevronRight, X, UserPlus, Check, Trash2, Key, Calendar, GraduationCap, AlertTriangle, FileSpreadsheet, Upload, Mail, Edit3 } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api.js';

const StudentList = () => {
  const adminPortalContext = 'college';
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Custom confirmation dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showExportConfirm, setShowExportConfirm] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [studentForCredentials, setStudentForCredentials] = useState(null);
  const [showSendAllConfirm, setShowSendAllConfirm] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    department: 'Computer Science',
    batch: '2023-2027',
    year: '3rd Year'
  });

  // Edit student states
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    rollNumber: '',
    email: '',
    department: 'Computer Science',
    batch: '2023-2027',
    year: '3rd Year'
  });

  const handleEditClick = (student) => {
    setStudentToEdit(student);
    setEditFormData({
      name: student.name,
      rollNumber: student.rollNumber,
      email: student.email,
      department: student.department || 'Computer Science',
      batch: student.batch || '2023-2027',
      year: student.year || '3rd Year'
    });
    setShowEditModal(true);
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    const loader = toast.loading('Updating student profile...');
    try {
      const payload = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim().toLowerCase(),
        rollNumber: editFormData.rollNumber.trim().toUpperCase(),
        department: editFormData.department,
        batch: editFormData.batch.trim(),
        year: editFormData.year
      };

      await api.put(`/auth/students/${studentToEdit._id}`, payload);
      toast.success('Student profile updated successfully.', { id: loader });
      setShowEditModal(false);
      setStudentToEdit(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student profile.', { id: loader });
    }
  };

  // Fetch student roster from the server
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/students');
      setStudents(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Reset page to 1 if search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter students based on search term (strictly checking name and roll number only as requested)
  const filteredStudents = students.filter(student =>
    (student.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.rollNumber || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  // Get current page students
  const indexOfLastStudent = currentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

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

  // Bulk upload modal states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [notepadText, setNotepadText] = useState('');
  const [parsedStudents, setParsedStudents] = useState([]);

  const parseCsvToStudents = (text) => {
    if (!text) return [];
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length <= 1) return [];

    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
    const parsed = [];
    const nameIdx = header.findIndex(h => h.includes('name') || h.includes('student'));
    const rollIdx = header.findIndex(h => h.includes('roll') || h.includes('register') || h.includes('number'));
    const emailIdx = header.findIndex(h => h.includes('email') || h.includes('mail'));
    const deptIdx = header.findIndex(h => h.includes('dept') || h.includes('department'));
    const batchIdx = header.findIndex(h => h.includes('batch'));
    const yearIdx = header.findIndex(h => h.includes('year'));

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(item => item.trim().replace(/^"|"$/g, ''));
      if (row.length < 3) continue;

      const name = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : '';
      const rollNumber = rollIdx !== -1 && row[rollIdx] ? row[rollIdx] : '';
      const email = emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : '';
      const department = deptIdx !== -1 && row[deptIdx] ? row[deptIdx] : 'Computer Science';
      const batch = batchIdx !== -1 && row[batchIdx] ? row[batchIdx] : '2023-2027';
      const year = yearIdx !== -1 && row[yearIdx] ? row[yearIdx] : '3rd Year';

      if (name && rollNumber && email) {
        parsed.push({
          name,
          rollNumber: rollNumber.toUpperCase(),
          email: email.toLowerCase(),
          department,
          batch,
          year
        });
      }
    }
    return parsed;
  };

  const handleBulkFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isCsv = file.name.endsWith('.csv') || file.type === 'text/csv';
    const isTxt = file.name.endsWith('.txt') || file.type === 'text/plain';
    
    if (!isCsv && !isTxt) {
      return toast.error('Please upload a valid CSV (.csv) or plain text (.txt) file.');
    }

    const loader = toast.loading('Reading student roster file...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        setNotepadText(text);
        
        const parsed = parseCsvToStudents(text);
        setParsedStudents(parsed);
        toast.success(`Successfully parsed ${parsed.length} student records from file.`, { id: loader });
      } catch (err) {
        console.error(err);
        toast.error('Failed to parse file.', { id: loader });
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file.', { id: loader });
    };
    reader.readAsText(file);
  };

  const handleBulkImportSubmit = async () => {
    if (parsedStudents.length === 0) {
      return toast.error('No students parsed to import.');
    }

    // Validation
    for (let i = 0; i < parsedStudents.length; i++) {
      const s = parsedStudents[i];
      if (!s.name.trim() || !s.rollNumber.trim() || !s.email.trim() || !s.batch.trim()) {
        return toast.error(`Student #${i + 1} is missing required details (Name, Roll, Email, Batch).`);
      }
    }

    const loader = toast.loading('Uploading student directory...');
    try {
      const { data } = await api.post('/auth/students/bulk', parsedStudents);
      toast.success(
        `Successfully registered ${data.insertedCount} students.${
          data.skippedCount > 0 ? ` Skipped ${data.skippedCount} duplicates.` : ''
        }`,
        { id: loader }
      );
      
      setNotepadText('');
      setParsedStudents([]);
      setShowBulkModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload student records.', { id: loader });
    }
  };

  const downloadSampleCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Email', 'Department', 'Batch', 'Year'];
    const sampleRows = [
      headers.join(','),
      ['Jane Doe', 'CS23001', 'jane.doe@example.com', 'Computer Science', '2023-2027', '3rd Year'].join(','),
      ['John Smith', 'IT23002', 'john.smith@example.com', 'Information Technology', '2023-2027', '3rd Year'].join(',')
    ];
    const blob = new Blob([sampleRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'college_bulk_students_template.csv');
    a.click();
    toast.success('Sample student CSV template downloaded.');
  };

  const handlePreviewChange = (index, field, value) => {
    const updated = [...parsedStudents];
    updated[index][field] = value;
    setParsedStudents(updated);
  };

  const handleRemovePreviewStudent = (index) => {
    const updated = parsedStudents.filter((_, i) => i !== index);
    setParsedStudents(updated);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    
    const loader = toast.loading('Registering student...');
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        rollNumber: formData.rollNumber.trim().toUpperCase(),
        department: formData.department,
        batch: formData.batch.trim(),
        year: formData.year
      };

      await api.post('/auth/students', payload);

      toast.success('Student registered successfully.', { id: loader });
      setShowAddModal(false);
      setFormData({
        name: '',
        rollNumber: '',
        email: '',
        department: 'Computer Science',
        batch: '2023-2027',
        year: '3rd Year'
      });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to register student.', { id: loader });
    }
  };

  const handleDeleteStudent = (id, name) => {
    setStudentToDelete({ id, name });
    setShowDeleteConfirm(true);
  };

  const confirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    const { id } = studentToDelete;
    setShowDeleteConfirm(false);
    
    const loader = toast.loading('Deleting student...');
    try {
      await api.delete(`/auth/students/${id}`);
      toast.success('Student deleted successfully.', { id: loader });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete student.', { id: loader });
    } finally {
      setStudentToDelete(null);
    }
  };

  const handleSendCredentials = (student) => {
    setStudentForCredentials(student);
    setShowSendConfirm(true);
  };

  const confirmSendCredentials = async () => {
    if (!studentForCredentials) return;
    const { _id, email } = studentForCredentials;
    setShowSendConfirm(false);

    const loader = toast.loading(`Sending credentials to ${email}...`);
    setSendingEmail(true);
    try {
      await api.post(`/auth/students/${_id}/send-credentials`);
      toast.success('Credentials emailed successfully.', { id: loader });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to email credentials.', { id: loader });
    } finally {
      setStudentForCredentials(null);
      setSendingEmail(false);
    }
  };

  const handleSendAllCredentials = () => {
    setShowSendAllConfirm(true);
  };

  const confirmSendAllCredentials = async () => {
    setShowSendAllConfirm(false);

    const loader = toast.loading('Sending credentials to all students...');
    setSendingEmail(true);
    try {
      const { data } = await api.post('/auth/students/send-credentials/all');
      toast.success(
        `Emails completed. Sent: ${data.successCount}${
          data.failureCount > 0 ? `, Failed: ${data.failureCount}` : ''
        }`,
        { id: loader }
      );
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to email credentials to all.', { id: loader });
    } finally {
      setSendingEmail(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getDeptColor = (dept) => {
    switch (dept) {
      case 'Computer Science':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Information Technology':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Electronics':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Mechanical':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  // Click handler for Export CSV
  const handleExportCSV = () => {
    if (students.length === 0) {
      toast.error('No student data available to export.');
      return;
    }
    setShowExportConfirm(true);
  };

  // Execution handler for confirmed Export CSV download
  const confirmExportCSV = () => {
    setShowExportConfirm(false);
    const headers = ['Student Name', 'Roll Number', 'Department', 'Batch', 'Year'];
    const csvRows = [
      headers.join(','),
      ...students.map(s => [
        `"${s.name}"`,
        `"${s.rollNumber}"`,
        `"${s.department}"`,
        `"${s.batch}"`,
        `"${s.year}"`
      ].join(','))
    ];
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'students_roster.csv');
    a.click();
    toast.success('Student roster exported successfully.');
  };

  return (
    <div className="space-y-8 font-sans text-left pb-8 relative overflow-hidden">
      
      {/* Title block with brand primary deep blue "+ Add Student" button */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-5">
        <div>
          <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight font-poppins">
            Student Management Directory
          </h2>
          <p className="text-base text-slate-500 mt-2 font-medium">
            Manage student enrollment, department allocations, and view academic records.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <button
            onClick={handleSendAllCredentials}
            disabled={students.length === 0 || sendingEmail}
            className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-5 py-3 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shrink-0 bg-white disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Key className="h-4 w-4 text-amber-500" />
            <span>Email Credentials to All</span>
          </button>

          <button
            onClick={() => setShowBulkModal(true)}
            className="border border-slate-200 text-slate-650 hover:bg-slate-50 px-5 py-3 rounded-xl font-bold text-sm shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shrink-0 bg-white"
          >
            <Upload className="h-4 w-4 text-[#004f90]" />
            <span>Bulk Import (Excel/CSV)</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#004f90] hover:bg-[#003c6e] text-white px-5 py-3 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2 shrink-0"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Main card panel */}
      <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.015)] rounded-[24px] p-6 sm:p-8 space-y-6">
        
        {/* Search, filters, and export bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          {/* Enlarged search bar with Search students placeholder */}
          <div className="relative w-full sm:max-w-3xl">
            <Search className="absolute left-5 top-5 h-6 w-6 text-slate-400" />
            <input
              type="text"
              placeholder="Search by student name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#f8fafc] border border-slate-200/80 hover:border-slate-350 focus:border-[#004f90] focus:bg-white rounded-2xl py-5 pl-15 pr-5 text-slate-800 text-lg focus:outline-none transition-all placeholder:text-slate-400 font-medium"
            />
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto shrink-0 justify-end">
            <button 
              onClick={handleExportCSV}
              className="border border-slate-200 text-slate-650 px-6 py-4.5 rounded-xl text-base font-semibold flex items-center justify-center gap-2.5 hover:bg-slate-50 transition-all cursor-pointer shadow-sm"
            >
              <Download className="h-5 w-5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Dynamic student list table */}
        <div className="overflow-x-auto border border-slate-100 rounded-2xl">
          {loading ? (
            <div className="py-24 text-center space-y-4">
              <div className="h-12 w-12 border-4 border-[#004f90] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-base text-slate-400 font-bold font-sans">Loading student records...</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-base">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-sm uppercase font-bold tracking-wider">
                  <th className="py-6 px-6">Student Name</th>
                  <th className="py-6 px-6">Roll Number</th>
                  <th className="py-6 px-6">Department</th>
                  <th className="py-6 px-6">Batch</th>
                  <th className="py-6 px-6">Year</th>
                  <th className="py-6 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-24 text-center text-slate-400 font-extrabold text-base">
                      No students found.
                    </td>
                  </tr>
                ) : (
                  currentStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-50/30 transition-colors">
                      {/* Student Name */}
                      <td className="py-5.5 px-6 text-left">
                        <div className="flex items-center space-x-4">
                          <div className="h-12 w-12 rounded-full bg-gradient-to-tr from-[#004f90] to-blue-500 text-white font-bold text-base flex items-center justify-center border border-white shadow-sm shrink-0 uppercase">
                            {getInitials(student.name)}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-800 text-lg tracking-tight leading-tight">{student.name}</span>
                            <span className="text-xs text-slate-400 font-medium font-mono">{student.email}</span>
                          </div>
                        </div>
                      </td>
                      {/* Register Number */}
                      <td className="py-5.5 px-6 text-left">
                        <span className="font-bold text-slate-600 font-mono tracking-wide text-base bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">{student.rollNumber}</span>
                      </td>
                      {/* Department, Batch, Year */}
                      <td className="py-5.5 px-6 text-left">
                        <span className={`inline-block border font-bold px-3.5 py-1.5 rounded-xl text-sm uppercase tracking-wide ${getDeptColor(student.department)}`}>
                          {student.department}
                        </span>
                      </td>
                      <td className="py-5.5 px-6 text-left">
                        <span className="text-slate-650 font-semibold text-base">{student.batch}</span>
                      </td>
                      <td className="py-5.5 px-6 text-left">
                        <span className="text-slate-700 font-bold text-base bg-slate-50 border border-slate-100 px-3 py-1 rounded-xl">{student.year}</span>
                      </td>
                      {/* Actions */}
                      <td className="py-4.5 px-6 text-right">
                        <div className="flex justify-end items-center gap-1">
                          {/* Send Credentials (Mail) */}
                          <button
                            onClick={() => handleSendCredentials(student)}
                            disabled={sendingEmail}
                            className="p-2.5 text-blue-600 hover:bg-blue-50 hover:border-blue-100 border border-transparent rounded-full transition-all cursor-pointer disabled:opacity-50"
                            title="Send login credentials via email"
                          >
                            <Mail className="h-4.5 w-4.5" />
                          </button>
                          
                          {/* Edit Details (Edit3) */}
                          <button
                            onClick={() => handleEditClick(student)}
                            disabled={sendingEmail}
                            className="p-2.5 text-slate-600 hover:bg-slate-50 hover:border-slate-200 border border-transparent rounded-full transition-all cursor-pointer disabled:opacity-50"
                            title="Edit student details"
                          >
                            <Edit3 className="h-4.5 w-4.5" />
                          </button>

                          {/* Delete candidate (Trash2) */}
                          <button
                            onClick={() => handleDeleteStudent(student._id, student.name)}
                            disabled={sendingEmail}
                            className="p-2.5 text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent rounded-full transition-all cursor-pointer disabled:opacity-50"
                            title="Remove student account"
                          >
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>

        {/* Table footer with exact pagination layout */}
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
            {/* Dark semi-transparent blur backdrop */}
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
              
              {/* Header scroll container to keep it perfect */}
              <div className="flex-1 overflow-y-auto px-9 sm:px-11 py-10 space-y-8 scrollbar-none text-left">
                
                {/* SDLC Logo inside the Add Student Page/Drawer */}
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <img 
                      src="/logo.png" 
                      alt="SDLC Logo" 
                      className="h-11 w-auto object-contain max-w-[190px] self-start"
                    />
                    
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-800 font-poppins leading-tight">
                        Add Student Profile
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
                        Create a student profile to grant portal access.
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

                {/* Form fields styled in capsule shapes matching the mockup */}
                <form onSubmit={handleSaveStudent} className="space-y-6 pt-2">
                  
                  {/* STUDENT NAME */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      STUDENT NAME
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter full name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-850 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* ROLL NUMBER */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      ROLL NUMBER
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter roll number (e.g. CS23001)"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-855 text-base focus:outline-none transition-all outline-none font-semibold uppercase placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* BATCH */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      BATCH
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter batch (e.g. 2023-2027)"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-855 text-base focus:outline-none transition-all outline-none font-semibold placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* STUDENT EMAIL */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      EMAIL ADDRESS
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="Enter registered email address"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-855 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* Department & Year selects */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 flex flex-col">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 leading-none mb-1.5">
                        DEPARTMENT
                      </label>
                      <div className="relative">
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                          className="w-full bg-white border border-slate-200/80 hover:border-slate-350 focus:border-[#004f90] rounded-full py-4.5 px-5 text-slate-800 text-sm focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm"
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Mechanical">Mechanical</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-1 text-slate-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 flex flex-col">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 leading-none mb-1.5">
                        YEAR
                      </label>
                      <div className="relative">
                        <select
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="w-full bg-white border border-slate-200/80 hover:border-slate-350 focus:border-[#004f90] rounded-full py-4.5 px-5 text-slate-800 text-sm focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-1 text-slate-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pill buttons row at the bottom matching image style */}
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                    <button
                      type="submit"
                      className="flex-1 bg-[#004f90] hover:bg-[#003c6e] text-white font-extrabold py-4.5 px-8 rounded-full text-base transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check className="h-5 w-5" />
                      <span>Create Profile</span>
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

        {showEditModal && studentToEdit && (
          <>
            {/* Dark semi-transparent blur backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => { setShowEditModal(false); setStudentToEdit(null); }}
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
              
              {/* Header scroll container */}
              <div className="flex-1 overflow-y-auto px-9 sm:px-11 py-10 space-y-8 scrollbar-none text-left">
                
                {/* SDLC Logo inside the Edit Student Page/Drawer */}
                <div className="flex justify-between items-start">
                  <div className="space-y-4">
                    <img 
                      src="/logo.png" 
                      alt="SDLC Logo" 
                      className="h-11 w-auto object-contain max-w-[190px] self-start"
                    />
                    
                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-slate-800 font-poppins leading-tight">
                        Edit Student Profile
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-400 font-semibold leading-relaxed">
                        Modify student information and update system records.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => { setShowEditModal(false); setStudentToEdit(null); }}
                    className="p-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Form fields styled in capsule shapes matching the mockup */}
                <form onSubmit={handleUpdateStudent} className="space-y-6 pt-2">
                  
                  {/* STUDENT NAME */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      STUDENT NAME
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter full name"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-850 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* ROLL NUMBER */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      ROLL NUMBER
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter roll number"
                      value={editFormData.rollNumber}
                      onChange={(e) => setEditFormData({ ...editFormData, rollNumber: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-855 text-base focus:outline-none transition-all outline-none font-semibold uppercase placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* BATCH */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      BATCH
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="Enter batch (e.g. 2023-2027)"
                      value={editFormData.batch}
                      onChange={(e) => setEditFormData({ ...editFormData, batch: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-855 text-base focus:outline-none transition-all outline-none font-semibold placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* STUDENT EMAIL */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      EMAIL ADDRESS
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="Enter email address"
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-white border border-slate-200/80 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-855 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* Department & Year selects */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2 flex flex-col">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 leading-none mb-1.5">
                        DEPARTMENT
                      </label>
                      <div className="relative">
                        <select
                          value={editFormData.department}
                          onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                          className="w-full bg-white border border-slate-200/80 hover:border-slate-350 focus:border-[#004f90] rounded-full py-4.5 px-5 text-slate-800 text-sm focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm"
                        >
                          <option value="Computer Science">Computer Science</option>
                          <option value="Information Technology">Information Technology</option>
                          <option value="Electronics">Electronics</option>
                          <option value="Mechanical">Mechanical</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-1 text-slate-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 flex flex-col">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1 leading-none mb-1.5">
                        YEAR
                      </label>
                      <div className="relative">
                        <select
                          value={editFormData.year}
                          onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                          className="w-full bg-white border border-slate-200/80 hover:border-slate-350 focus:border-[#004f90] rounded-full py-4.5 px-5 text-slate-800 text-sm focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm"
                        >
                          <option value="1st Year">1st Year</option>
                          <option value="2nd Year">2nd Year</option>
                          <option value="3rd Year">3rd Year</option>
                          <option value="4th Year">4th Year</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-1 text-slate-500">
                          <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pill buttons row at the bottom */}
                  <div className="flex items-center gap-3 pt-6 border-t border-slate-100">
                    <button
                      type="submit"
                      className="flex-1 bg-[#004f90] hover:bg-[#003c6e] text-white font-extrabold py-4.5 px-8 rounded-full text-base transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <Check className="h-5 w-5" />
                      <span>Save Changes</span>
                    </button>
                    
                    <button
                      type="button"
                      onClick={() => { setShowEditModal(false); setStudentToEdit(null); }}
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

      {/* -------------------- CUSTOM CONFIRMATION MODALS -------------------- */}
      <AnimatePresence>
        {/* 1. Custom Premium Delete Candidate Confirmation Modal */}
        {showDeleteConfirm && studentToDelete && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[2000] cursor-pointer"
            />
            {/* Dialog Content */}
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
                <h4 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Delete Student Account?</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                  Are you sure you want to delete the account for <span className="font-semibold text-slate-800">{studentToDelete.name}</span>? This action cannot be undone and will revoke all portal access.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  onClick={confirmDeleteStudent}
                  className="flex-1 bg-red-600 hover:bg-red-750 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Delete Account
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

        {/* 2. Custom Premium Export CSV Confirmation Modal */}
        {showExportConfirm && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportConfirm(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[2000] cursor-pointer"
            />
            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed inset-0 m-auto max-w-[420px] h-fit bg-white/95 backdrop-blur-[12px] rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100/80 flex flex-col items-center text-center space-y-5 z-[2100]"
            >
              <div className="h-14 w-14 bg-blue-50 text-[#004f90] rounded-full flex items-center justify-center border border-blue-100 shrink-0">
                <FileSpreadsheet className="h-7 w-7 text-blue-600" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Export Student Directory?</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                  This will generate and download a CSV spreadsheet containing the complete student roster with names, departments, batches, and years.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  onClick={confirmExportCSV}
                  className="flex-1 bg-[#004f90] hover:bg-[#003c6e] text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Download className="h-4.5 w-4.5" />
                  <span>Download CSV</span>
                </button>
                <button
                  onClick={() => setShowExportConfirm(false)}
                  className="flex-1 border border-slate-200 text-slate-655 font-semibold py-3 px-5 rounded-xl text-sm hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* 4. Custom Single Student Credentials Email Confirmation Modal */}
        {showSendConfirm && studentForCredentials && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSendConfirm(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed inset-0 m-auto max-w-[420px] h-fit bg-white/95 backdrop-blur-[12px] rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100/80 flex flex-col items-center text-center space-y-5 z-[2100]"
            >
              <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100 shrink-0">
                <Key className="h-7 w-7 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Email Credentials?</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                  This will email the login username and default password (roll number) to <span className="font-semibold text-slate-800">{studentForCredentials.name}</span> at <span className="font-semibold text-slate-800">{studentForCredentials.email}</span>.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  onClick={confirmSendCredentials}
                  className="flex-1 bg-[#004f90] hover:bg-[#003c6e] text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Send Email
                </button>
                <button
                  onClick={() => setShowSendConfirm(false)}
                  className="flex-1 border border-slate-200 text-slate-655 font-semibold py-3 px-5 rounded-xl text-sm hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* 5. Custom Bulk Credentials Email Confirmation Modal */}
        {showSendAllConfirm && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSendAllConfirm(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed inset-0 m-auto max-w-[420px] h-fit bg-white/95 backdrop-blur-[12px] rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100/80 flex flex-col items-center text-center space-y-5 z-[2100]"
            >
              <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center border border-amber-100 shrink-0">
                <Key className="h-7 w-7 text-amber-500" />
              </div>
              <div className="space-y-2">
                <h4 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Email All Students?</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                  This will email credentials to all registered candidates in the database.
                </p>
                <p className="text-xs text-red-500 font-bold leading-normal">
                  Caution: This may take a moment to complete depending on total student count.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  onClick={confirmSendAllCredentials}
                  className="flex-1 bg-[#004f90] hover:bg-[#003c6e] text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Send to All
                </button>
                <button
                  onClick={() => setShowSendAllConfirm(false)}
                  className="flex-1 border border-slate-200 text-slate-655 font-semibold py-3 px-5 rounded-xl text-sm hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </>
        )}

        {/* 3. Custom Bulk Import Students Modal */}
        {showBulkModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[999] flex items-center justify-center p-4">
            <div className="bg-white border border-slate-150 rounded-3xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-poppins">Bulk Import Students</h3>
                  <p className="text-xs text-slate-400 font-medium">Add multiple students at once using a CSV spreadsheet</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setParsedStudents([]);
                    setNotepadText('');
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-655 transition-all cursor-pointer border border-transparent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left Column: Input Source */}
                <div className="w-full md:w-5/12 border-r border-slate-100 p-6 overflow-y-auto space-y-6 flex flex-col justify-start">
                  {/* Download Template */}
                  <div className="flex justify-between items-center bg-blue-50/50 border border-blue-100 rounded-2xl p-4.5">
                    <div className="space-y-0.5">
                      <span className="text-xs font-bold text-slate-700">Need a starting template?</span>
                      <p className="text-[10px] text-slate-400">Download a pre-formatted Excel/CSV spreadsheet.</p>
                    </div>
                    <button
                      type="button"
                      onClick={downloadSampleCSV}
                      className="bg-[#004f90] hover:bg-[#003c6e] text-white px-3.5 py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer shrink-0"
                    >
                      Download Template
                    </button>
                  </div>

                  {/* File Upload Area */}
                  <div className="space-y-2 flex-1 flex flex-col justify-start">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Upload CSV Spreadsheet</span>
                    <label className="border-2 border-dashed border-slate-200 hover:border-[#004f90] rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50 min-h-[280px] justify-center">
                      <Upload className="h-10 w-10 text-[#004f90]" />
                      <span className="text-sm font-bold text-slate-700">Choose a .csv file</span>
                      <span className="text-xs text-slate-400">or drag and drop it here</span>
                      <input
                        type="file"
                        accept=".csv"
                        onChange={handleBulkFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Right Column: Live Preview & Editor */}
                <div className="w-full md:w-7/12 p-6 overflow-y-auto space-y-4 bg-slate-50/30 flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                    Parsed Candidates Preview ({parsedStudents.length})
                  </span>

                  {parsedStudents.length === 0 ? (
                    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-2 bg-slate-50/50">
                      <GraduationCap className="h-12 w-12 text-slate-350" />
                      <h4 className="text-sm font-bold text-slate-700 mt-2 text-center" style={{ width: '100%', minWidth: '280px', display: 'block' }}>No candidates parsed yet</h4>
                      <p className="text-xs text-slate-400 px-4 leading-relaxed mt-1 text-center" style={{ width: '100%', minWidth: '280px', maxWidth: '400px', display: 'block', margin: '4px auto 0' }}>
                        Upload a candidate CSV roster file on the left to review and import students in bulk.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1">
                      {parsedStudents.map((s, idx) => (
                        <div key={idx} className="bg-white border border-slate-200/60 rounded-xl p-4 shadow-sm space-y-3 relative text-left">
                          {/* Student Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-bold text-[#004f90]">Candidate #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePreviewStudent(idx)}
                              className="text-slate-400 hover:text-red-655 p-1 hover:bg-slate-50 rounded cursor-pointer"
                              title="Remove candidate from import list"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Student Inputs */}
                          {adminPortalContext === 'sdlc' ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Student Name</span>
                                <input
                                  type="text"
                                  value={s.name}
                                  onChange={(e) => handlePreviewChange(idx, 'name', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#004f90]"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Enrollment ID</span>
                                <input
                                  type="text"
                                  value={s.enrollmentId || ''}
                                  onChange={(e) => handlePreviewChange(idx, 'enrollmentId', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#004f90] uppercase font-semibold"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Email Address</span>
                                <input
                                  type="email"
                                  value={s.email}
                                  onChange={(e) => handlePreviewChange(idx, 'email', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#004f90]"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Enrolled Course</span>
                                <select
                                  value={s.enrolledCourses?.[0] || ''}
                                  onChange={(e) => handlePreviewChange(idx, 'enrolledCourses', [e.target.value])}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-slate-800 text-xs focus:outline-none focus:border-[#004f90] font-semibold"
                                >
                                  <option value="">Select Course</option>
                                  {courses.map(c => (
                                    <option key={c._id} value={c._id}>{c.name}</option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Student Name</span>
                                <input
                                  type="text"
                                  value={s.name}
                                  onChange={(e) => handlePreviewChange(idx, 'name', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#004f90]"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Roll Number</span>
                                <input
                                  type="text"
                                  value={s.rollNumber}
                                  onChange={(e) => handlePreviewChange(idx, 'rollNumber', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#004f90] uppercase font-semibold"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Email Address</span>
                                <input
                                  type="email"
                                  value={s.email}
                                  onChange={(e) => handlePreviewChange(idx, 'email', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#004f90]"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Batch</span>
                                <input
                                  type="text"
                                  value={s.batch}
                                  onChange={(e) => handlePreviewChange(idx, 'batch', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#004f90]"
                                />
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Department</span>
                                <select
                                  value={s.department}
                                  onChange={(e) => handlePreviewChange(idx, 'department', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-slate-800 text-xs focus:outline-none focus:border-[#004f90] font-semibold"
                                >
                                  <option value="Computer Science">Computer Science</option>
                                  <option value="Information Technology">Information Technology</option>
                                  <option value="Electronics">Electronics</option>
                                  <option value="Mechanical">Mechanical</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <span className="text-[9px] font-bold text-slate-400 uppercase">Academic Year</span>
                                <select
                                  value={s.year}
                                  onChange={(e) => handlePreviewChange(idx, 'year', e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2 text-slate-800 text-xs focus:outline-none focus:border-[#004f90] font-semibold"
                                >
                                  <option value="1st Year">1st Year</option>
                                  <option value="2nd Year">2nd Year</option>
                                  <option value="3rd Year">3rd Year</option>
                                  <option value="4th Year">4th Year</option>
                                </select>
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setParsedStudents([]);
                    setNotepadText('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-550 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkImportSubmit}
                  disabled={parsedStudents.length === 0}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    parsedStudents.length > 0
                      ? 'bg-[#004f90] hover:bg-[#003c6e] text-white cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  }`}
                >
                  Register {parsedStudents.length} Students
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StudentList;
