import React, { useState, useEffect } from 'react';
import { 
  Search, Download, ChevronLeft, ChevronRight, X, UserPlus, Check, Trash2, Key, 
  Upload, Mail, Edit3, ChevronDown, GraduationCap, Building2, FileText, CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api.js';
import { calculateAcademicYear } from '../../utils/academicYearHelper.js';
import { DEPARTMENTS, BATCH_TRACKS, normalizeBatch, normalizeDept } from '../../utils/constants.js';

const COURSE_TRACKS = [];

export const INSTITUTE_CENTERS = [
  { name: 'Karur', code: 'KRR' },
  { name: 'Coimbatore', code: 'CBE' },
  { name: 'Namakkal', code: 'NKL' },
  { name: 'Dindigul', code: 'DGL' }
];

const StudentList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category Tab: 'college' | 'institute'
  const [categoryTab, setCategoryTab] = useState('college');

  // Filters
  const [deptFilter, setDeptFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [centerFilter, setCenterFilter] = useState('All');
  
  const [showAddModal, setShowAddModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [deptList, setDeptList] = useState(DEPARTMENTS);
  const [courseTracksList, setCourseTracksList] = useState(COURSE_TRACKS);
  const [centersList, setCentersList] = useState(INSTITUTE_CENTERS);

  useEffect(() => {
    Promise.all([
      api.get('/cohorts/departments'),
      api.get('/cohorts/batches'),
      api.get('/cohorts/centers')
    ])
      .then(([deptRes, batchRes, centerRes]) => {
        if (Array.isArray(deptRes.data)) {
          setDeptList(deptRes.data.filter(d => d.isActive !== false).map(d => d.code));
        }
        if (Array.isArray(batchRes.data)) {
          setCourseTracksList(batchRes.data.filter(b => b.isActive !== false).map(b => b.name));
        }
        if (Array.isArray(centerRes.data)) {
          setCentersList(centerRes.data.filter(c => c.isActive !== false).map(c => ({ name: c.name, code: c.code })));
        }
      })
      .catch(() => {});
  }, []);

  // Confirmation dialog states
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [studentForCredentials, setStudentForCredentials] = useState(null);
  const [showSendAllConfirm, setShowSendAllConfirm] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  // Add Form state
  const [addStudentType, setAddStudentType] = useState('college');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    rollNumber: '',
    department: 'CSE',
    batch: '2023-2027',
    year: '3rd Year',
    enrollmentId: '',
    courseTrack: 'Full Stack Web Dev (MERN)',
    center: 'Karur'
  });

  // Edit Form state
  const [showEditModal, setShowEditModal] = useState(false);
  const [studentToEdit, setStudentToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    dob: '',
    studentType: 'college',
    rollNumber: '',
    department: 'CSE',
    batch: '2023-2027',
    year: '3rd Year',
    enrollmentId: '',
    courseTrack: 'Full Stack Web Dev (MERN)',
    center: 'Karur'
  });

  // Bulk Upload states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkStudentType, setBulkStudentType] = useState('college');
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);

  // Fetch student roster from server
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/auth/students');
      setStudents(data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch student roster.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryTab, deptFilter, courseFilter, centerFilter]);

  const getLiveSdclIdPreview = (centerName, dobStr) => {
    const centerObj = INSTITUTE_CENTERS.find(c => c.name === centerName) || INSTITUTE_CENTERS[0];
    const code = centerObj.code;
    let dobClean = '';
    if (dobStr) {
      if (dobStr.includes('-') && dobStr.indexOf('-') === 4) {
        const parts = dobStr.split('-');
        if (parts.length === 3) dobClean = `${parts[2].padStart(2, '0')}${parts[1].padStart(2, '0')}${parts[0]}`;
      } else {
        dobClean = dobStr.replace(/\D/g, '');
      }
    }
    if (dobClean.length === 8) {
      return `SDLC-${code}-${dobClean}`;
    }
    return `SDLC-${code}-04092003`;
  };

  const getCollegeCourseTrack = (student) => {
    if (student.courseTrack && student.courseTrack.trim() !== '' && student.courseTrack !== '-') {
      return student.courseTrack;
    }
    if (student.batch && !/\d{4}/.test(student.batch)) {
      return student.batch;
    }
    return '-';
  };

  const handleEditClick = (student) => {
    const isInstitute = student.studentType === 'institute';
    
    let cleanBatch = student.batch || '2023-2027';
    let cleanCourse = student.courseTrack || '';

    if (!isInstitute) {
      if (student.batch && !/\d{4}/.test(student.batch)) {
        if (!cleanCourse || cleanCourse === '-') {
          cleanCourse = student.batch;
        }
        const yr = student.year || '';
        if (yr.includes('4th')) cleanBatch = '2020-2024';
        else if (yr.includes('3rd')) cleanBatch = '2021-2025';
        else if (yr.includes('2nd')) cleanBatch = '2022-2026';
        else if (yr.includes('1st')) cleanBatch = '2023-2027';
        else cleanBatch = '2023-2027';
      }
    }

    setStudentToEdit(student);
    setEditFormData({
      name: student.name || '',
      email: student.email || '',
      dob: student.dob || '',
      studentType: student.studentType || 'college',
      rollNumber: student.rollNumber || '',
      department: student.department || 'CSE',
      batch: cleanBatch,
      year: student.year || '4th Year',
      enrollmentId: student.enrollmentId || student.rollNumber || '',
      courseTrack: cleanCourse,
      center: student.center || 'Karur'
    });
    setShowEditModal(true);
  };

  // DOB validation states
  const [dobError, setDobError] = useState('');
  const [editDobError, setEditDobError] = useState('');

  const handleEditDobChange = (newDob) => {
    const isInstitute = editFormData.studentType === 'institute';
    if (isInstitute) {
      const newPreviewId = getLiveSdclIdPreview(editFormData.center, newDob);
      setEditFormData(prev => ({
        ...prev,
        dob: newDob,
        enrollmentId: newPreviewId
      }));
    } else {
      setEditFormData(prev => ({ ...prev, dob: newDob }));
    }
  };

  const handleAddDobChange = (val) => {
    if (/[a-zA-Z]/.test(val)) {
      setDobError('Letters not supported');
      toast.error('Letters not supported in Date of Birth (DOB).', { id: 'dob-letter-err' });
      const cleanVal = val.replace(/[a-zA-Z]/g, '');
      setFormData(prev => ({ ...prev, dob: cleanVal }));
      return;
    }
    setDobError('');
    setFormData(prev => ({ ...prev, dob: val }));
  };

  const handleEditDobInputChange = (val) => {
    if (/[a-zA-Z]/.test(val)) {
      setEditDobError('Letters not supported');
      toast.error('Letters not supported in Date of Birth (DOB).', { id: 'edit-dob-letter-err' });
      const cleanVal = val.replace(/[a-zA-Z]/g, '');
      handleEditDobChange(cleanVal);
      return;
    }
    setEditDobError('');
    handleEditDobChange(val);
  };

  const handleEditCenterChange = (newCenter) => {
    const newPreviewId = getLiveSdclIdPreview(newCenter, editFormData.dob);
    setEditFormData(prev => ({
      ...prev,
      center: newCenter,
      enrollmentId: newPreviewId
    }));
  };

  const handleUpdateStudent = async (e) => {
    e.preventDefault();
    const loader = toast.loading('Updating student profile...');
    try {
      const isInstitute = editFormData.studentType === 'institute';
      const payload = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim().toLowerCase(),
        studentType: editFormData.studentType,
        ...(isInstitute ? {
          dob: editFormData.dob ? editFormData.dob.trim() : '',
          enrollmentId: editFormData.enrollmentId.trim().toUpperCase(),
          courseTrack: editFormData.courseTrack,
          center: editFormData.center || 'Karur'
        } : {
          rollNumber: editFormData.rollNumber.trim().toUpperCase(),
          department: editFormData.department,
          batch: editFormData.batch ? editFormData.batch.trim() : '2023-2027',
          year: editFormData.year,
          courseTrack: editFormData.courseTrack
        })
      };

      await api.put(`/auth/students/${studentToEdit._id}`, payload);
      toast.success('Student profile updated.', { id: loader });
      setShowEditModal(false);
      setStudentToEdit(null);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update student profile.', { id: loader });
    }
  };

  const filteredStudents = students.filter(student => {
    const stType = student.studentType || 'college';
    
    if (categoryTab === 'college' && stType !== 'college') return false;
    if (categoryTab === 'institute' && stType !== 'institute') return false;

    const term = searchTerm.toLowerCase();
    const matchesSearch = 
      (student.name || '').toLowerCase().includes(term) ||
      (student.rollNumber || '').toLowerCase().includes(term) ||
      (student.enrollmentId || '').toLowerCase().includes(term) ||
      (student.email || '').toLowerCase().includes(term) ||
      (student.center || '').toLowerCase().includes(term);

    if (!matchesSearch) return false;

    if (categoryTab === 'college' && deptFilter !== 'All' && student.department !== deptFilter) {
      return false;
    }

    if (categoryTab === 'institute' && courseFilter !== 'All') {
      const sTrack = student.courseTrack || student.department;
      if (sTrack !== courseFilter) return false;
    }

    if (categoryTab === 'institute' && centerFilter !== 'All') {
      const sCenter = student.center || 'Karur';
      if (sCenter !== centerFilter) return false;
    }

    return true;
  });

  const collegeCount = students.filter(s => (s.studentType || 'college') === 'college').length;
  const instituteCount = students.filter(s => s.studentType === 'institute').length;

  const totalItems = filteredStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;

  const indexOfLastStudent = currentPage * itemsPerPage;
  const indexOfFirstStudent = indexOfLastStudent - itemsPerPage;
  const currentStudents = filteredStudents.slice(indexOfFirstStudent, indexOfLastStudent);

  const getPageNumbers = () => {
    if (totalPages <= 7) {
      const pages = [];
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    const pages = [];
    pages.push(1);

    if (currentPage > 3) {
      pages.push('dots-start');
    }

    let start = Math.max(2, currentPage - 1);
    let end = Math.min(totalPages - 1, currentPage + 1);

    if (currentPage <= 3) {
      end = 4;
    } else if (currentPage >= totalPages - 2) {
      start = totalPages - 3;
    }

    for (let i = start; i <= end; i++) {
      if (i > 1 && i < totalPages) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push('dots-end');
    }

    pages.push(totalPages);

    return pages;
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const loader = toast.loading('Adding student...');
    try {
      const isInstitute = addStudentType === 'institute';
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        studentType: addStudentType,
        dob: formData.dob ? formData.dob.trim() : '',
        ...(isInstitute ? {
          enrollmentId: formData.enrollmentId ? formData.enrollmentId.trim().toUpperCase() : '',
          courseTrack: formData.courseTrack,
          center: formData.center || 'Karur'
        } : {
          rollNumber: formData.rollNumber.trim().toUpperCase(),
          department: formData.department,
          batch: formData.batch ? formData.batch.trim() : '2023-2027',
          year: formData.year,
          courseTrack: formData.courseTrack
        })
      };

      await api.post('/auth/students', payload);
      toast.success(`${isInstitute ? 'SDLC' : 'College'} student added.`, { id: loader });
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        dob: '',
        rollNumber: '',
        department: 'CSE',
        batch: '2023-2027',
        year: '3rd Year',
        enrollmentId: '',
        courseTrack: 'Full Stack Web Dev (MERN)',
        center: 'Karur'
      });
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add student.', { id: loader });
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
      toast.success('Student deleted.', { id: loader });
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

    const loader = toast.loading(`Sending email to ${email}...`);
    setSendingEmail(true);
    try {
      await api.post(`/auth/students/${_id}/send-credentials`);
      toast.success('Credentials emailed successfully.', { id: loader });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to email credentials.', { id: loader });
    } finally {
      setSendingEmail(false);
      setStudentForCredentials(null);
    }
  };

  const confirmSendAllCredentials = async () => {
    setShowSendAllConfirm(false);
    const count = filteredStudents.length;
    if (count === 0) return toast.error('No students to email.');

    const loader = toast.loading(`Sending credentials to ${count} students...`);
    setSendingEmail(true);
    try {
      const studentIds = filteredStudents.map(s => s._id);
      await api.post('/auth/students/send-credentials-bulk', { studentIds });
      toast.success(`Credentials sent to ${count} students.`, { id: loader });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send emails.', { id: loader });
    } finally {
      setSendingEmail(false);
    }
  };

  const capitalizeName = (raw) => {
    if (!raw) return '';
    return raw.trim().replace(/\s+/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const normalizeYearStr = (raw) => {
    if (!raw) return '4th Year';
    const clean = raw.toString().trim().toLowerCase();
    if (clean.includes('1')) return '1st Year';
    if (clean.includes('2')) return '2nd Year';
    if (clean.includes('3')) return '3rd Year';
    if (clean.includes('4')) return '4th Year';
    return '4th Year';
  };

  const normalizeCourseTrackName = (raw) => {
    if (!raw) return '';
    const clean = raw.toString().trim().toLowerCase();
    if (clean.includes('solid')) return 'SolidWorks';
    if (clean.includes('autocad') || clean.includes('cad')) return 'AutoCAD';
    if (clean.includes('mern') || clean.includes('full stack web') || clean.includes('web dev')) return 'Full Stack Web Dev (MERN)';
    if (clean.includes('data science') || clean.includes('ai') || clean === 'ds') return 'Data Science & AI';
    if (clean.includes('python')) return 'Python Full Stack';
    if (clean.includes('java')) return 'Java Full Stack';
    if (clean.includes('ui') || clean.includes('ux') || clean.includes('figma')) return 'UI/UX Design & Figma';
    if (clean.includes('devops') || clean.includes('cloud')) return 'Cloud & DevOps Engineering';
    if (clean.includes('cyber') || clean.includes('network')) return 'Cybersecurity & Networking';
    
    return raw.trim().split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
  };

  const parseCsvToStudents = (text, type) => {
    if (!text) return [];
    const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length <= 1) return [];

    const header = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/["']/g, ''));
    const parsed = [];

    const nameIdx = header.findIndex(h => h.includes('name') || h.includes('student'));
    const emailIdx = header.findIndex(h => h.includes('email') || h.includes('mail'));
    const dobIdx = header.findIndex(h => h.includes('dob') || h.includes('birth') || h.includes('date'));
    const rollIdx = header.findIndex(h => h.includes('roll') || h.includes('register') || h.includes('number'));
    const enrollIdx = header.findIndex(h => h.includes('enroll') || h.includes('reg') || h.includes('id'));
    const deptIdx = header.findIndex(h => h.includes('dept') || h.includes('department'));
    const courseIdx = header.findIndex(h => h.includes('course') || h.includes('track'));
    const batchIdx = header.findIndex(h => h.includes('batch'));
    const yearIdx = header.findIndex(h => h.includes('year'));
    const centerIdx = header.findIndex(h => h.includes('center') || h.includes('district') || h.includes('branch') || h.includes('location'));

    for (let i = 1; i < lines.length; i++) {
      const row = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(item => item.trim().replace(/^"|"$/g, ''));
      if (row.length < 2) continue;

      const rawName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : '';
      const rawEmail = emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : '';
      const dob = dobIdx !== -1 && row[dobIdx] ? row[dobIdx] : '';

      const name = capitalizeName(rawName);
      const email = rawEmail.trim().toLowerCase();

      if (type === 'college') {
        const rollNumber = rollIdx !== -1 && row[rollIdx] ? row[rollIdx] : '';
        const department = deptIdx !== -1 && row[deptIdx] ? normalizeDept(row[deptIdx]) : 'CSE';
        const rawBatch = batchIdx !== -1 && row[batchIdx] ? row[batchIdx] : '';
        const rawCourse = courseIdx !== -1 && row[courseIdx] ? row[courseIdx] : '';
        
        let batch = '2023-2027';
        let courseTrack = normalizeCourseTrackName(rawCourse);

        if (rawBatch) {
          if (/\d{4}/.test(rawBatch)) {
            batch = normalizeBatch(rawBatch);
          } else if (!courseTrack) {
            courseTrack = normalizeCourseTrackName(rawBatch);
          }
        }
        
        const rawYear = yearIdx !== -1 && row[yearIdx] ? row[yearIdx] : '';
        const year = normalizeYearStr(rawYear);

        if (name && email && rollNumber) {
          parsed.push({
            name,
            email,
            dob,
            studentType: 'college',
            rollNumber: rollNumber.trim().toUpperCase(),
            department,
            batch,
            year,
            courseTrack
          });
        }
      } else {
        const rawEnrollmentId = (enrollIdx !== -1 && row[enrollIdx]) ? row[enrollIdx] : (rollIdx !== -1 && row[rollIdx] ? row[rollIdx] : '');
        const rawCourse = courseIdx !== -1 && row[courseIdx] ? row[courseIdx] : '';
        const courseTrack = normalizeCourseTrackName(rawCourse);
        const rawCenter = centerIdx !== -1 && row[centerIdx] ? row[centerIdx] : 'Karur';
        
        let center = 'Karur';
        if (/coimbatore|cbe/i.test(rawCenter)) center = 'Coimbatore';
        else if (/namakkal|nkl|nmk/i.test(rawCenter)) center = 'Namakkal';
        else if (/dindigul|dgl|dnd/i.test(rawCenter)) center = 'Dindigul';
        else if (/karur|krr/i.test(rawCenter)) center = 'Karur';

        let centerCode = 'KRR';
        if (center === 'Coimbatore') centerCode = 'CBE';
        else if (center === 'Namakkal') centerCode = 'NKL';
        else if (center === 'Dindigul') centerCode = 'DGL';

        let finalEnrollmentId = rawEnrollmentId ? rawEnrollmentId.trim().toUpperCase() : '';
        if (!finalEnrollmentId && dob) {
          let dobClean = '';
          if (dob.includes('-') && dob.indexOf('-') === 4) {
            const parts = dob.split('-');
            if (parts.length === 3) dobClean = `${parts[2].padStart(2, '0')}${parts[1].padStart(2, '0')}${parts[0]}`;
          } else {
            dobClean = dob.replace(/\D/g, '');
          }
          if (dobClean.length === 8) {
            finalEnrollmentId = `SDLC-${centerCode}-${dobClean}`;
          }
        }

        if (name && email) {
          parsed.push({
            name,
            email,
            dob,
            studentType: 'institute',
            enrollmentId: finalEnrollmentId,
            courseTrack,
            center
          });
        }
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

    setSelectedFile(file);
    const loader = toast.loading(`Parsing ${file.name}...`);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const text = event.target.result;
        const parsed = parseCsvToStudents(text, bulkStudentType);
        setParsedStudents(parsed);
        if (parsed.length === 0) {
          toast.error('No valid records found in file.', { id: loader });
        } else {
          toast.success(`Parsed ${parsed.length} student record(s).`, { id: loader });
        }
      } catch (err) {
        toast.error('Failed to parse file.', { id: loader });
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImportSubmit = async () => {
    if (parsedStudents.length === 0) {
      return toast.error('No valid students to import.');
    }

    const loader = toast.loading(`Importing ${parsedStudents.length} students...`);
    try {
      const { data } = await api.post('/auth/students/bulk', parsedStudents);
      toast.success(
        `Imported ${data.insertedCount} student(s).${data.skippedCount > 0 ? ` Skipped ${data.skippedCount} duplicate(s).` : ''}`,
        { id: loader }
      );
      setSelectedFile(null);
      setParsedStudents([]);
      setShowBulkModal(false);
      fetchStudents();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to import students.', { id: loader });
    }
  };

  const downloadSampleCSV = (type = 'college') => {
    let content = '';
    let filename = '';
    if (type === 'college') {
      content = 'Student Name,Roll Number,Email,Department,Year,Course\n' +
                'Jane Doe,21CS001,jane.doe@example.com,CSE,3rd Year,Full Stack Web Dev (MERN)\n' +
                'John Smith,21ME002,john.smith@example.com,MECH,4th Year,SolidWorks';
      filename = 'college_students_template.csv';
    } else {
      content = 'Student Name,Date of Birth (DOB),Email,District Center,Course\n' +
                'Alice Vance,04-09-2003,alice.vance@example.com,Coimbatore,Full Stack Web Dev (MERN)\n' +
                'Robert Paul,15-08-2004,robert.paul@example.com,Namakkal,Data Science & AI';
      filename = 'sdlc_students_template.csv';
    }

    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', filename);
    a.click();
    toast.success(`Downloaded ${type === 'college' ? 'College' : 'SDLC'} student sample CSV.`);
  };

  const resetBulkState = () => {
    setSelectedFile(null);
    setParsedStudents([]);
    setShowBulkModal(false);
  };

  const openBulkModal = () => {
    setBulkStudentType(categoryTab);
    setSelectedFile(null);
    setParsedStudents([]);
    setShowBulkModal(true);
  };

  const openAddModal = () => {
    setAddStudentType(categoryTab);
    setShowAddModal(true);
  };

  return (
    <div className="space-y-6 text-left pb-12 font-sans">
      
      {/* Simple Clean Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
            Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Manage college students and SDLC institute candidates.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {filteredStudents.length > 0 && (
            <button
              onClick={() => setShowSendAllConfirm(true)}
              className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm transition cursor-pointer flex items-center gap-2"
            >
              <Mail className="h-4 w-4 text-slate-500" />
              <span>Email Credentials ({filteredStudents.length})</span>
            </button>
          )}

          <button
            onClick={openBulkModal}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-2 rounded-lg font-medium text-xs sm:text-sm transition cursor-pointer flex items-center gap-2"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Bulk Import</span>
          </button>

          <button
            onClick={openAddModal}
            className="bg-[#004f90] hover:bg-[#003c6e] text-white px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition cursor-pointer flex items-center gap-2 shadow-xs"
          >
            <UserPlus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Clean Segmented Tab Switcher (Senior Developer Style) */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-8">
          <button
            onClick={() => setCategoryTab('college')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2.5 ${
              categoryTab === 'college'
                ? 'border-[#004f90] text-[#004f90]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <GraduationCap className="w-4.5 h-4.5" />
            <span>College Students</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              categoryTab === 'college' ? 'bg-blue-100 text-[#004f90]' : 'bg-slate-100 text-slate-600'
            }`}>
              {collegeCount}
            </span>
          </button>

          <button
            onClick={() => setCategoryTab('institute')}
            className={`py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2.5 ${
              categoryTab === 'institute'
                ? 'border-[#004f90] text-[#004f90]'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Building2 className="w-4.5 h-4.5" />
            <span>SDLC Candidates</span>
            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              categoryTab === 'institute' ? 'bg-blue-100 text-[#004f90]' : 'bg-slate-100 text-slate-600'
            }`}>
              {instituteCount}
            </span>
          </button>
        </div>

        <div className="hidden sm:block text-xs font-semibold text-slate-500">
          Showing {totalItems} candidates
        </div>
      </div>

      {/* Main Roster Panel */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        
        {/* Search & Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder={categoryTab === 'college' ? "Search name, email, roll no..." : "Search name, email, SDLC ID..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white border border-slate-200 rounded-lg h-9 pl-9 pr-8 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#004f90] transition font-medium"
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

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-end">
            {categoryTab === 'college' && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-500">Department:</span>
                <div className="relative flex items-center">
                  <select
                    value={deptFilter}
                    onChange={(e) => setDeptFilter(e.target.value)}
                    className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg pl-3 pr-8 h-9 focus:outline-none focus:border-[#004f90] cursor-pointer appearance-none"
                  >
                    <option value="All">All Departments</option>
                    {deptList.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                </div>
              </div>
            )}

            {categoryTab === 'institute' && (
              <>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Branch:</span>
                  <div className="relative flex items-center">
                    <select
                      value={centerFilter}
                      onChange={(e) => setCenterFilter(e.target.value)}
                      className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg pl-3 pr-8 h-9 focus:outline-none focus:border-[#004f90] cursor-pointer appearance-none"
                    >
                      <option value="All">All Centers</option>
                      {centersList.map(c => (
                        <option key={c.name} value={c.name}>{c.name} ({c.code})</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-slate-500">Course:</span>
                  <div className="relative flex items-center">
                    <select
                      value={courseFilter}
                      onChange={(e) => setCourseFilter(e.target.value)}
                      className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg pl-3 pr-8 h-9 focus:outline-none focus:border-[#004f90] cursor-pointer appearance-none"
                    >
                      <option value="All">All Courses</option>
                      {courseTracksList.map(track => (
                        <option key={track} value={track}>{track}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <div className="h-7 w-7 border-2 border-[#004f90] border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-xs text-slate-500 font-medium">Loading roster data...</p>
            </div>
          ) : currentStudents.length === 0 ? (
            <div className="py-14 text-center space-y-1.5 px-4">
              <p className="text-sm font-semibold text-slate-800">No candidates found</p>
              <p className="text-xs text-slate-500">Try adjusting your search or active filters.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold text-[11px] uppercase tracking-wider">
                  <th className="py-3 px-3.5 text-center w-14">S.NO</th>
                  <th className="py-3 px-4">STUDENT DETAILS</th>
                  {categoryTab === 'college' ? (
                    <>
                      <th className="py-3 px-4">DEPARTMENT</th>
                      <th className="py-3 px-4">ROLL NUMBER</th>
                      <th className="py-3 px-4">YEAR</th>
                      <th className="py-3 px-4">COURSE</th>
                    </>
                  ) : (
                    <>
                      <th className="py-3 px-4">BRANCH</th>
                      <th className="py-3 px-4">SDLC ID</th>
                      <th className="py-3 px-4">COURSE</th>
                      <th className="py-3 px-4">CENTER</th>
                    </>
                  )}
                  <th className="py-3 px-4 text-right">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {currentStudents.map((student, index) => {
                  const serialNo = indexOfFirstStudent + index + 1;
                  const isInstitute = student.studentType === 'institute';
                  const identifier = isInstitute ? (student.enrollmentId || student.rollNumber) : student.rollNumber;
                  const trackDisplay = isInstitute ? (student.courseTrack || student.department) : getCollegeCourseTrack(student);

                  return (
                    <tr key={student._id} className="hover:bg-slate-50 transition-colors">
                      {/* S.NO */}
                      <td className="py-3 px-3.5 text-center font-semibold text-xs text-slate-400 font-mono">
                        {String(serialNo).padStart(2, '0')}
                      </td>

                      {/* Student Details */}
                      <td className="py-3 px-4">
                        <div>
                          <div className="font-semibold text-slate-900 text-sm">
                            {student.name}
                          </div>
                          <div className="text-xs text-slate-500 font-normal mt-0.5">
                            {student.email}
                          </div>
                        </div>
                      </td>

                      {/* Category Specific Columns */}
                      {categoryTab === 'college' ? (
                        <>
                          {/* Department */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-[#004f90] border border-blue-100">
                              {student.department}
                            </span>
                          </td>

                          {/* Roll Number */}
                          <td className="py-3 px-4 font-mono text-xs font-medium text-slate-800">
                            {student.rollNumber || 'N/A'}
                          </td>

                          {/* Year */}
                          <td className="py-3 px-4 text-xs font-medium text-slate-700">
                            {student.year || '4th Year'}
                          </td>

                          {/* Course */}
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {trackDisplay}
                          </td>
                        </>
                      ) : (
                        <>
                          {/* Branch Badge */}
                          <td className="py-3 px-4">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              {student.center || 'Karur'} Branch
                            </span>
                          </td>

                          {/* SDLC ID */}
                          <td className="py-3 px-4 font-mono text-xs font-medium text-slate-800">
                            {identifier || 'N/A'}
                          </td>

                          {/* Course */}
                          <td className="py-3 px-4 font-semibold text-slate-800">
                            {trackDisplay}
                          </td>

                          {/* Center */}
                          <td className="py-3 px-4 text-xs text-slate-600 font-medium">
                            {student.center || 'Karur'} Branch
                          </td>
                        </>
                      )}

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => handleSendCredentials(student)}
                            title="Send Login Email"
                            className="p-1.5 text-slate-400 hover:text-[#004f90] hover:bg-slate-100 rounded-md transition cursor-pointer"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          
                          <button
                            onClick={() => handleEditClick(student)}
                            title="Edit Profile"
                            className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDeleteStudent(student._id, student.name)}
                            title="Delete Account"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-md transition cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Dotted Ellipsis Pagination Bar */}
        {totalPages > 1 && (
          <div className="p-3.5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-center text-xs">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                title="Previous Page"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((item, idx) => {
                if (typeof item === 'string') {
                  return (
                    <span 
                      key={`dots-${idx}`} 
                      className="w-7 h-7 flex items-center justify-center text-slate-400 font-bold text-xs select-none"
                    >
                      ...
                    </span>
                  );
                }

                return (
                  <button
                    key={item}
                    onClick={() => setCurrentPage(item)}
                    className={`w-7 h-7 rounded-md text-xs font-semibold cursor-pointer transition ${
                      currentPage === item
                        ? 'bg-[#004f90] text-white shadow-2xs'
                        : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                    }`}
                  >
                    {item}
                  </button>
                );
              })}

              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-md border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition"
                title="Next Page"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* ADD STUDENT - SIMPLE CLEAN DRAWER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showAddModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[999]"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 h-screen w-full max-w-[460px] bg-white z-[1000] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-7 space-y-6 scrollbar-none text-left">
                
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-2.5">
                    <img 
                      src="/logo.png" 
                      alt="SDLC Logo" 
                      className="h-9 w-auto object-contain max-w-[160px]"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-poppins">
                        Add New Student
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Register candidate to roster.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleSaveStudent} className="space-y-4 text-xs">
                  
                  {/* Category Switcher */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Candidate Category</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setAddStudentType('college')}
                        className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          addStudentType === 'college'
                            ? 'bg-[#004f90] text-white shadow-sm ring-1 ring-[#004f90]'
                            : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/60'
                        }`}
                      >
                        <GraduationCap className="w-4 h-4" />
                        <span>College Student</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAddStudentType('institute')}
                        className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          addStudentType === 'institute'
                            ? 'bg-[#004f90] text-white shadow-sm ring-1 ring-[#004f90]'
                            : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/60'
                        }`}
                      >
                        <Building2 className="w-4 h-4" />
                        <span>SDLC Student</span>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Full Name"
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address *</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="student@example.com"
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none"
                    />
                  </div>

                  {addStudentType === 'college' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Roll Number *</label>
                        <input
                          type="text"
                          required
                          value={formData.rollNumber}
                          onChange={(e) => setFormData({ ...formData, rollNumber: e.target.value })}
                          placeholder="e.g. 21CS045"
                          className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs font-mono uppercase text-slate-800 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                          <div className="relative flex items-center">
                            <select
                              value={formData.department}
                              onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                              className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                            >
                              {deptList.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Year</label>
                          <div className="relative flex items-center">
                            <select
                              value={formData.year}
                              onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                              className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                            >
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Specialized Batch / Course Track *</label>
                        <div className="relative flex items-center">
                          <select
                            value={formData.courseTrack || ''}
                            onChange={(e) => setFormData({ ...formData, courseTrack: e.target.value })}
                            className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                          >
                            <option value="">-- None / Standard Department --</option>
                            {courseTracksList.map(ct => (
                              <option key={ct} value={ct}>{ct}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date of Birth (DOB)</label>
                        <input
                          type="text"
                          value={formData.dob}
                          onChange={(e) => handleAddDobChange(e.target.value)}
                          placeholder="e.g. 04092003 or 04/09/2003"
                          className={`w-full bg-white border rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none transition ${
                            dobError ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200' : 'border-slate-200 focus:border-[#004f90]'
                          }`}
                        />
                        {dobError && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-1">
                            ⚠️ Letters not supported. Numbers only.
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">District Branch</label>
                        <div className="relative flex items-center">
                          <select
                            value={formData.center || 'Karur'}
                            onChange={(e) => setFormData({ ...formData, center: e.target.value })}
                            className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                          >
                            {centersList.map(c => (
                              <option key={c.name} value={c.name}>{c.name} Branch ({c.code})</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SDLC Enrollment ID</label>
                        <input
                          type="text"
                          value={formData.enrollmentId}
                          onChange={(e) => setFormData({ ...formData, enrollmentId: e.target.value })}
                          placeholder={`Auto: ${getLiveSdclIdPreview(formData.center, formData.dob)}`}
                          className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs font-mono uppercase text-slate-800 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course *</label>
                        <div className="relative flex items-center">
                          <select
                            value={formData.courseTrack}
                            onChange={(e) => setFormData({ ...formData, courseTrack: e.target.value })}
                            className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                          >
                            {courseTracksList.map(ct => (
                              <option key={ct} value={ct}>{ct}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 h-9 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 h-9 bg-[#004f90] hover:bg-[#003c6e] text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                    >
                      Register Student
                    </button>
                  </div>

                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* EDIT STUDENT - SIMPLE CLEAN DRAWER */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showEditModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowEditModal(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[999]"
            />

            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 26, stiffness: 240 }}
              className="fixed right-0 top-0 bottom-0 h-screen w-full max-w-[460px] bg-white z-[1000] shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex-1 overflow-y-auto p-7 space-y-6 scrollbar-none text-left">
                
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div className="space-y-2.5">
                    <img 
                      src="/logo.png" 
                      alt="SDLC Logo" 
                      className="h-9 w-auto object-contain max-w-[160px]"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 font-poppins">
                        Edit Student Profile
                      </h3>
                      <p className="text-xs text-slate-500 font-medium">
                        Modify candidate profile information.
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowEditModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
                  
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Full Name</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input
                      type="email"
                      required
                      value={editFormData.email}
                      onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none"
                    />
                  </div>

                  {editFormData.studentType === 'college' ? (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Roll Number</label>
                        <input
                          type="text"
                          required
                          value={editFormData.rollNumber}
                          onChange={(e) => setEditFormData({ ...editFormData, rollNumber: e.target.value })}
                          className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs font-mono uppercase text-slate-800 outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Department</label>
                          <div className="relative flex items-center">
                            <select
                              value={editFormData.department}
                              onChange={(e) => setEditFormData({ ...editFormData, department: e.target.value })}
                              className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                            >
                              {deptList.map(d => (
                                <option key={d} value={d}>{d}</option>
                              ))}
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Year</label>
                          <div className="relative flex items-center">
                            <select
                              value={editFormData.year}
                              onChange={(e) => setEditFormData({ ...editFormData, year: e.target.value })}
                              className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                            >
                              <option value="1st Year">1st Year</option>
                              <option value="2nd Year">2nd Year</option>
                              <option value="3rd Year">3rd Year</option>
                              <option value="4th Year">4th Year</option>
                            </select>
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Specialized Batch / Course Track *</label>
                        <div className="relative flex items-center">
                          <select
                            value={editFormData.courseTrack || ''}
                            onChange={(e) => setEditFormData({ ...editFormData, courseTrack: e.target.value })}
                            className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                          >
                            <option value="">-- None / Standard Department --</option>
                            {courseTracksList.map(ct => (
                              <option key={ct} value={ct}>{ct}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Date of Birth (DOB)</label>
                        <input
                          type="text"
                          value={editFormData.dob}
                          onChange={(e) => handleEditDobInputChange(e.target.value)}
                          placeholder="e.g. 04092003 or 04/09/2003"
                          className={`w-full bg-white border rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none transition ${
                            editDobError ? 'border-rose-400 focus:border-rose-500 ring-1 ring-rose-200' : 'border-slate-200 focus:border-[#004f90]'
                          }`}
                        />
                        {editDobError && (
                          <p className="text-[11px] font-semibold text-rose-600 mt-1">
                            ⚠️ Letters not supported. Numbers only.
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">District Branch</label>
                        <div className="relative flex items-center">
                          <select
                            value={editFormData.center || 'Karur'}
                            onChange={(e) => handleEditCenterChange(e.target.value)}
                            className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                          >
                            {centersList.map(c => (
                              <option key={c.name} value={c.name}>{c.name} Branch ({c.code})</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">SDLC Enrollment ID</label>
                        <input
                          type="text"
                          value={editFormData.enrollmentId}
                          onChange={(e) => setEditFormData({ ...editFormData, enrollmentId: e.target.value })}
                          className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs font-mono uppercase text-slate-800 outline-none"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Course</label>
                        <div className="relative flex items-center">
                          <select
                            value={editFormData.courseTrack}
                            onChange={(e) => setEditFormData({ ...editFormData, courseTrack: e.target.value })}
                            className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3 pr-8 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                          >
                            {courseTracksList.map(ct => (
                              <option key={ct} value={ct}>{ct}</option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 pointer-events-none" />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="pt-5 border-t border-slate-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setShowEditModal(false)}
                      className="px-4 h-9 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 transition cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 h-9 bg-[#004f90] hover:bg-[#003c6e] text-white text-xs font-semibold rounded-lg shadow-2xs transition cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ========================================================================= */}
      {/* BULK IMPORT MODAL - MINIMAL SENIOR DEVELOPER DESIGN */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.97 }}
              className="bg-white border border-slate-200 rounded-xl max-w-md w-full overflow-hidden shadow-xl text-xs font-sans"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div>
                  <h2 className="text-base font-bold text-slate-900 font-poppins">
                    Bulk Import Students
                  </h2>
                  <p className="text-xs text-slate-500 font-medium mt-0.5">
                    Upload a CSV file to register candidate records.
                  </p>
                </div>

                <button
                  onClick={resetBulkState}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-4 text-left">
                
                {/* Category Switcher Tabs */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Target Category</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                    <button
                      type="button"
                      onClick={() => {
                        setBulkStudentType('college');
                        setSelectedFile(null);
                        setParsedStudents([]);
                      }}
                      className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        bulkStudentType === 'college'
                          ? 'bg-[#004f90] text-white shadow-sm ring-1 ring-[#004f90]'
                          : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/60'
                      }`}
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>College Students</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setBulkStudentType('institute');
                        setSelectedFile(null);
                        setParsedStudents([]);
                      }}
                      className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        bulkStudentType === 'institute'
                          ? 'bg-[#004f90] text-white shadow-sm ring-1 ring-[#004f90]'
                          : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/60'
                      }`}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>SDLC Students</span>
                    </button>
                  </div>
                </div>

                {/* File Dropzone */}
                {!selectedFile ? (
                  <div className="border border-dashed border-slate-300 hover:border-[#004f90] bg-slate-50/50 hover:bg-slate-50 rounded-xl p-6 text-center transition cursor-pointer relative">
                    <input
                      type="file"
                      accept=".csv, .txt"
                      onChange={handleBulkFileUpload}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                    />
                    <div className="space-y-1.5 pointer-events-none">
                      <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                      <p className="text-xs font-semibold text-slate-800">
                        Click to select or drag & drop CSV file
                      </p>
                      <p className="text-[11px] text-slate-400 font-normal">
                        Supported formats: .csv, .txt
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <FileText className="w-5 h-5 text-[#004f90] shrink-0" />
                      <div className="min-w-0 text-left">
                        <p className="text-xs font-semibold text-slate-900 truncate">
                          {selectedFile.name}
                        </p>
                        <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                          {parsedStudents.length} candidates ready
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        setParsedStudents([]);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 cursor-pointer shrink-0"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Download Sample CSV Action */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-slate-500">Need sample CSV template?</span>
                  <button
                    type="button"
                    onClick={() => downloadSampleCSV(bulkStudentType)}
                    className="text-[#004f90] font-semibold flex items-center gap-1 hover:underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download {bulkStudentType === 'college' ? 'College' : 'SDLC'} Template</span>
                  </button>
                </div>

              </div>

              {/* Footer */}
              <div className="px-6 py-3.5 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={resetBulkState}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-white border border-slate-200 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkImportSubmit}
                  disabled={parsedStudents.length === 0}
                  className="px-4 py-2 bg-[#004f90] hover:bg-[#003c6e] text-white text-xs font-semibold rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  Import {parsedStudents.length > 0 ? `(${parsedStudents.length})` : ''}
                </button>
              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* CONFIRMATION DIALOGS - SUPER CLEAN & SIMPLE */}
      <AnimatePresence>
        {showDeleteConfirm && studentToDelete && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-xl max-w-sm w-full p-5 space-y-3.5 shadow-xl text-left border border-slate-200"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-poppins">
                  Delete Student
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Are you sure you want to delete <strong className="text-slate-900 font-semibold">{studentToDelete.name}</strong>?
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmDeleteStudent}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSendConfirm && studentForCredentials && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-xl max-w-sm w-full p-5 space-y-3.5 shadow-xl text-left border border-slate-200"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-poppins">
                  Send Credentials
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Send login email to <strong className="text-slate-900 font-semibold">{studentForCredentials.email}</strong>?
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowSendConfirm(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSendCredentials}
                  disabled={sendingEmail}
                  className="px-3.5 py-1.5 bg-[#004f90] hover:bg-[#003c6e] text-white rounded-md cursor-pointer disabled:opacity-50"
                >
                  {sendingEmail ? 'Sending...' : 'Send'}
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showSendAllConfirm && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-xl max-w-sm w-full p-5 space-y-3.5 shadow-xl text-left border border-slate-200"
            >
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 font-poppins">
                  Send Bulk Credentials
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Send credentials to all <strong className="text-slate-900 font-semibold">{filteredStudents.length} student(s)</strong> in current view?
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowSendAllConfirm(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmSendAllCredentials}
                  disabled={sendingEmail}
                  className="px-3.5 py-1.5 bg-[#004f90] hover:bg-[#003c6e] text-white rounded-md cursor-pointer disabled:opacity-50"
                >
                  {sendingEmail ? 'Sending...' : `Send (${filteredStudents.length})`}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default StudentList;
