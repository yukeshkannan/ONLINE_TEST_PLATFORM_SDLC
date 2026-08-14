import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Download } from 'lucide-react';
import ClockLoader from '../shared/ClockLoader.jsx';
import toast from 'react-hot-toast';
import api from '../../utils/api.js';
import { normalizeBatch, normalizeDept } from '../../utils/constants.js';

import StudentTable from './students/StudentTable.jsx';
import StudentAddModal from './students/StudentAddModal.jsx';
import StudentEditModal from './students/StudentEditModal.jsx';
import StudentBulkModal from './students/StudentBulkModal.jsx';
import { 
  DeleteStudentModal, 
  SendCredentialsModal, 
  SendAllCredentialsModal 
} from './students/StudentActionModals.jsx';

const StudentList = ({ initialTrack }) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Category Tab: 'college' | 'institute'
  const getInitialTab = () => {
    const track = searchParams.get('track') || searchParams.get('category') || searchParams.get('type') || initialTrack;
    if (track === 'institute' || track === 'sdlc') return 'institute';
    if (track === 'college') return 'college';
    return 'college';
  };

  const [categoryTab, setCategoryTab] = useState(getInitialTab);

  useEffect(() => {
    const track = searchParams.get('track') || searchParams.get('category') || searchParams.get('type') || initialTrack;
    if (track === 'institute' || track === 'sdlc') {
      setCategoryTab('institute');
    } else if (track === 'college') {
      setCategoryTab('college');
    }
  }, [searchParams, initialTrack]);

  // Filters
  const [deptFilter, setDeptFilter] = useState('All');
  const [courseFilter, setCourseFilter] = useState('All');
  const [centerFilter, setCenterFilter] = useState('All');
  
  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showSendAllConfirm, setShowSendAllConfirm] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);

  const [dobError, setDobError] = useState('');
  const [editDobError, setEditDobError] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [deptList, setDeptList] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [centersList, setCentersList] = useState([]);

  const [studentToDelete, setStudentToDelete] = useState(null);
  const [studentForCredentials, setStudentForCredentials] = useState(null);
  const [studentToEdit, setStudentToEdit] = useState(null);

  const getInitialFormData = (type = 'college', dept = '', center = '') => ({
    name: '',
    email: '',
    dob: '',
    rollNumber: '',
    department: dept || deptList[0] || 'CSE',
    batch: '',
    year: '3rd Year',
    enrollmentId: '',
    courseTrack: '',
    center: center || centersList[0]?.name || 'Karur'
  });

  // Add Form state
  const [addStudentType, setAddStudentType] = useState('college');
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dob: '',
    rollNumber: '',
    department: '',
    batch: '',
    year: '3rd Year',
    enrollmentId: '',
    courseTrack: '',
    center: ''
  });

  // Edit Form state
  const [editFormData, setEditFormData] = useState({
    name: '',
    email: '',
    dob: '',
    studentType: 'college',
    rollNumber: '',
    department: '',
    batch: '',
    year: '3rd Year',
    enrollmentId: '',
    courseTrack: '',
    center: ''
  });

  // Bulk Upload states
  const [bulkStudentType, setBulkStudentType] = useState('college');
  const [selectedFile, setSelectedFile] = useState(null);
  const [parsedStudents, setParsedStudents] = useState([]);

  const fetchMetadataCatalog = () => {
    Promise.all([
      api.get('/cohorts/departments'),
      api.get('/cohorts/batches'),
      api.get('/cohorts/centers')
    ])
      .then(([deptRes, batchRes, centerRes]) => {
        if (Array.isArray(deptRes.data)) {
          const dCodes = deptRes.data.filter(d => d.isActive !== false).map(d => d.code);
          setDeptList(dCodes);
          setFormData(prev => ({ ...prev, department: dCodes.includes(prev.department) ? prev.department : (dCodes[0] || '') }));
        }
        if (Array.isArray(batchRes.data)) {
          const activeBatches = batchRes.data.filter(b => b.isActive !== false);
          setAllBatches(activeBatches);
        }
        if (Array.isArray(centerRes.data)) {
          const validCenters = centerRes.data.filter(c => c.isActive !== false).map(c => ({ name: c.name, code: c.code }));
          setCentersList(validCenters);
          setFormData(prev => ({ ...prev, center: validCenters.some(c => c.name === prev.center) ? prev.center : (validCenters[0]?.name || '') }));
        }
      })
      .catch(() => {});
  };

  // Specialized College Tracks dynamically from Database
  const collegeCourseTracks = allBatches
    .filter(b => b.isActive !== false && b.category === 'college' && (b.department === 'All Departments' || !formData.department || b.department === formData.department))
    .map(b => b.name);

  const collegeEditCourseTracks = allBatches
    .filter(b => b.isActive !== false && b.category === 'college' && (b.department === 'All Departments' || !editFormData.department || b.department === editFormData.department))
    .map(b => b.name);

  // 100% Dynamic SDLC Institute Courses directly from Database (SDLC Course Management)
  const instituteCourseTracks = Array.from(
    new Set(
      allBatches
        .filter(b => b.isActive !== false && (b.category === 'institute' || b.category !== 'college'))
        .map(b => (b.name || '').trim())
        .filter(Boolean)
    )
  );

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
    fetchMetadataCatalog();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (showAddModal || showEditModal) {
      fetchMetadataCatalog();
    }
  }, [showAddModal, showEditModal]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryTab, deptFilter, courseFilter, centerFilter]);

  const getLiveSdclIdPreview = (centerName, dobStr) => {
    const centerObj = centersList.find(c => c.name === centerName) || centersList[0] || { code: (centerName || 'CBE').slice(0, 3).toUpperCase() };
    const code = centerObj.code || (centerName || 'CBE').slice(0, 3).toUpperCase();
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
    const isInstitute = editFormData.studentType === 'institute';
    if (isInstitute) {
      if (!editFormData.courseTrack || editFormData.courseTrack.trim() === '' || editFormData.courseTrack === 'General') {
        return toast.error('Please select an SDLC Course Track for this student.');
      }
    }

    const loader = toast.loading('Updating student profile...');
    try {
      const payload = {
        name: editFormData.name.trim(),
        email: editFormData.email.trim().toLowerCase(),
        studentType: editFormData.studentType,
        ...(isInstitute ? {
          dob: editFormData.dob ? editFormData.dob.trim() : '',
          enrollmentId: editFormData.enrollmentId.trim().toUpperCase(),
          courseTrack: editFormData.courseTrack.trim(),
          center: editFormData.center || 'Karur'
        } : {
          rollNumber: editFormData.rollNumber.trim().toUpperCase(),
          department: editFormData.department,
          batch: editFormData.batch ? editFormData.batch.trim() : (editFormData.year ? `${editFormData.year} Batch` : 'General'),
          year: editFormData.year,
          courseTrack: editFormData.courseTrack ? editFormData.courseTrack.trim() : ''
        })
      };

      const { data } = await api.put(`/auth/students/${studentToEdit._id}`, payload);
      
      // Update local state immediately so UI updates in real-time without delay!
      const updatedDoc = data?.student || { ...studentToEdit, ...payload };
      setStudents(prev => prev.map(s => s._id === studentToEdit._id ? { ...s, ...updatedDoc } : s));

      toast.success('Student profile updated successfully.', { id: loader });
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

    const term = searchTerm.toLowerCase().trim();
    const matchesSearch = !term || (
      (student.name || '').toLowerCase().includes(term) ||
      (student.rollNumber || '').toLowerCase().includes(term) ||
      (student.enrollmentId || '').toLowerCase().includes(term) ||
      (student.email || '').toLowerCase().includes(term) ||
      (student.courseTrack || '').toLowerCase().includes(term) ||
      (student.center || '').toLowerCase().includes(term) ||
      (student.department || '').toLowerCase().includes(term)
    );

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

  const handleOpenAddModal = () => {
    const type = categoryTab;
    setAddStudentType(type);
    setDobError('');
    setFormData(getInitialFormData(type, '', '', type === 'institute' ? (instituteCourseTracks[0] || '') : ''));
    setShowAddModal(true);
  };

  const handleCloseAddModal = () => {
    setShowAddModal(false);
    setDobError('');
    setFormData(getInitialFormData(addStudentType));
  };

  const handleSwitchAddStudentType = (newType) => {
    setAddStudentType(newType);
    setDobError('');
    setFormData(getInitialFormData(newType, '', '', newType === 'institute' ? (instituteCourseTracks[0] || '') : ''));
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    const isInstitute = addStudentType === 'institute';
    if (isInstitute) {
      if (!formData.courseTrack || formData.courseTrack.trim() === '' || formData.courseTrack === 'General') {
        return toast.error('Please select an SDLC Course Track for this student.');
      }
    }

    const loader = toast.loading('Adding student...');
    try {
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        studentType: addStudentType,
        ...(isInstitute ? {
          dob: formData.dob ? formData.dob.trim() : '',
          enrollmentId: formData.enrollmentId ? formData.enrollmentId.trim().toUpperCase() : '',
          courseTrack: formData.courseTrack.trim(),
          center: formData.center || 'Karur'
        } : {
          rollNumber: formData.rollNumber.trim().toUpperCase(),
          department: formData.department,
          batch: formData.batch ? formData.batch.trim() : (formData.year ? `${formData.year} Batch` : 'General'),
          year: formData.year,
          courseTrack: formData.courseTrack ? formData.courseTrack.trim() : ''
        })
      };

      const { data } = await api.post('/auth/students', payload);
      toast.success(`${isInstitute ? 'SDLC' : 'College'} student added successfully.`, { id: loader });
      handleCloseAddModal();
      if (data?.student) {
        setStudents(prev => [data.student, ...prev]);
      }
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
    const clean = raw.toString().trim();
    const matched = allBatches.find(b => b.name.toLowerCase() === clean.toLowerCase());
    if (matched) return matched.name;
    return clean;
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
        const rawYear = yearIdx !== -1 && row[yearIdx] ? row[yearIdx] : '';
        const year = normalizeYearStr(rawYear);
        const rawBatch = batchIdx !== -1 && row[batchIdx] ? row[batchIdx] : '';
        const rawCourse = courseIdx !== -1 && row[courseIdx] ? row[courseIdx] : '';
        
        let batch = rawBatch ? normalizeBatch(rawBatch) : `${year || '1st Year'} Batch`;
        let courseTrack = normalizeCourseTrackName(rawCourse);

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

  const handleExportFilteredStudents = () => {
    if (filteredStudents.length === 0) {
      return toast.error('No students matching current filters to export.');
    }

    const isInst = categoryTab === 'institute';
    const headers = isInst
      ? ['Candidate Name', 'Category', 'SDLC Enrollment ID', 'Course Track', 'District Center / Branch', 'Date of Birth', 'Email Address']
      : ['Candidate Name', 'Category', 'Roll / Enrollment ID', 'Department / Track', 'Batch', 'Year', 'Email Address'];

    const csvRows = [
      headers.join(','),
      ...filteredStudents.map(s => isInst ? [
        `"${s.name}"`,
        `"SDLC Institute"`,
        `"${s.enrollmentId || s.rollNumber || 'N/A'}"`,
        `"${s.courseTrack || 'N/A'}"`,
        `"${s.center || 'Karur'}"`,
        `"${s.dob || 'N/A'}"`,
        `"${s.email}"`
      ].join(',') : [
        `"${s.name}"`,
        `"College"`,
        `"${s.rollNumber || s.enrollmentId || 'N/A'}"`,
        `"${s.department || s.courseTrack || 'N/A'}"`,
        `"${s.batch || 'N/A'}"`,
        `"${s.year || 'N/A'}"`,
        `"${s.email}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    const suffix = isInst 
      ? (centerFilter !== 'All' ? `SDLC_${centerFilter}` : 'SDLC_All_Branches')
      : (deptFilter !== 'All' ? `College_${deptFilter}` : 'College_All_Depts');
    a.setAttribute('download', `student_roster_${suffix}_${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
    toast.success(`Exported ${filteredStudents.length} student records.`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <ClockLoader 
          size="lg" 
          color="#004f90" 
          text="Retrieving student directory and category rosters..." 
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-left pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
            Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Manage college students and SDLC institute candidates.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleExportFilteredStudents}
            disabled={filteredStudents.length === 0}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Export filtered roster to CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Roster ({filteredStudents.length})</span>
          </button>
        </div>
      </div>

      {/* Subcomponent: StudentTable */}
      <StudentTable
        categoryTab={categoryTab}
        setCategoryTab={setCategoryTab}
        collegeCount={collegeCount}
        instituteCount={instituteCount}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        deptFilter={deptFilter}
        setDeptFilter={setDeptFilter}
        courseFilter={courseFilter}
        setCourseFilter={setCourseFilter}
        centerFilter={centerFilter}
        setCenterFilter={setCenterFilter}
        deptList={deptList}
        instituteCourseTracks={instituteCourseTracks}
        centersList={centersList}
        currentStudents={currentStudents}
        filteredStudents={filteredStudents}
        totalItems={totalItems}
        currentPage={currentPage}
        totalPages={totalPages}
        setCurrentPage={setCurrentPage}
        getPageNumbers={getPageNumbers}
        onAddClick={handleOpenAddModal}
        onBulkClick={() => {
          setBulkStudentType(categoryTab);
          setSelectedFile(null);
          setParsedStudents([]);
          setShowBulkModal(true);
        }}
        onSendAllClick={() => setShowSendAllConfirm(true)}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteStudent}
        onSendCredentialsClick={handleSendCredentials}
        getCollegeCourseTrack={getCollegeCourseTrack}
      />

      {/* Subcomponent: StudentAddModal */}
      <StudentAddModal
        isOpen={showAddModal}
        onClose={handleCloseAddModal}
        addStudentType={addStudentType}
        setAddStudentType={handleSwitchAddStudentType}
        formData={formData}
        setFormData={setFormData}
        handleAddDobChange={handleAddDobChange}
        dobError={dobError}
        deptList={deptList}
        collegeCourseTracks={collegeCourseTracks}
        instituteCourseTracks={instituteCourseTracks}
        centersList={centersList}
        handleSaveStudent={handleSaveStudent}
      />

      {/* Subcomponent: StudentEditModal */}
      <StudentEditModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setStudentToEdit(null);
        }}
        studentToEdit={studentToEdit}
        editFormData={editFormData}
        setEditFormData={setEditFormData}
        handleEditDobInputChange={handleEditDobInputChange}
        editDobError={editDobError}
        handleEditCenterChange={handleEditCenterChange}
        deptList={deptList}
        collegeEditCourseTracks={collegeEditCourseTracks}
        instituteCourseTracks={instituteCourseTracks}
        centersList={centersList}
        handleUpdateStudent={handleUpdateStudent}
      />

      {/* Subcomponent: StudentBulkModal */}
      <StudentBulkModal
        isOpen={showBulkModal}
        onClose={() => {
          setSelectedFile(null);
          setParsedStudents([]);
          setShowBulkModal(false);
        }}
        bulkStudentType={bulkStudentType}
        setBulkStudentType={setBulkStudentType}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        parsedStudents={parsedStudents}
        setParsedStudents={setParsedStudents}
        handleBulkFileUpload={handleBulkFileUpload}
        handleBulkImportSubmit={handleBulkImportSubmit}
        downloadSampleCSV={downloadSampleCSV}
      />

      {/* Subcomponents: Action Modals */}
      <DeleteStudentModal
        isOpen={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setStudentToDelete(null);
        }}
        studentToDelete={studentToDelete}
        onConfirm={confirmDeleteStudent}
      />

      <SendCredentialsModal
        isOpen={showSendConfirm}
        onClose={() => {
          setShowSendConfirm(false);
          setStudentForCredentials(null);
        }}
        studentForCredentials={studentForCredentials}
        sendingEmail={sendingEmail}
        onConfirm={confirmSendCredentials}
      />

      <SendAllCredentialsModal
        isOpen={showSendAllConfirm}
        onClose={() => setShowSendAllConfirm(false)}
        targetCount={filteredStudents.length}
        sendingEmail={sendingEmail}
        onConfirm={confirmSendAllCredentials}
      />
    </div>
  );
};

export default StudentList;
