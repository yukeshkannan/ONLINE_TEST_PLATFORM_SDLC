import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../components/shared/Sidebar.jsx';
import Dashboard from '../components/admin/Dashboard.jsx';
import CreateTest from '../components/admin/CreateTest.jsx';
import AddQuestions from '../components/admin/AddQuestions.jsx';
import ViewResults from '../components/admin/ViewResults.jsx';
import StudentList from '../components/admin/StudentList.jsx';
import UserList from '../components/admin/UserList.jsx';
import ProctoringLogs from '../components/admin/ProctoringLogs.jsx';
import CourseManagement from '../components/admin/CourseManagement.jsx';
import api from '../utils/api.js';
import { parsePdfToText } from '../utils/pdfParser.js';
import { parseTextToQuestions } from '../utils/questionParser.js';
import { calculateAcademicYear } from '../utils/academicYearHelper.js';
import { normalizeBatch, normalizeDept } from '../utils/constants.js';
import { Calendar, Clock, Edit3, Trash2, Copy, HelpCircle, GraduationCap, BookOpen, Eye, FileSpreadsheet, PlusCircle, AlertCircle, AlertTriangle, RefreshCw, Upload, X, FileText, ChevronDown, Search, Filter, CheckCircle2, Layers, Award, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import ClockLoader from '../components/shared/ClockLoader.jsx';

const AdminDashboard = ({ tab }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(tab || 'dashboard');
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);
  const [testsTrackFilter, setTestsTrackFilter] = useState('all'); // 'all' | 'college' | 'institute'
  const [testsSearch, setTestsSearch] = useState('');
  const [testsStatusFilter, setTestsStatusFilter] = useState('all');
  const [testsPage, setTestsPage] = useState(1);
  const testsPerPage = 8;

  // Helper to format short date times cleanly
  const formatDateTimeShort = (dateStr) => {
    if (!dateStr) return 'N/A';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'N/A';
    return `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })}, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}`;
  };

  // Helper to compute live test status
  const computeLiveTestStatus = (t) => {
    if (!t) return 'draft';
    if (t.status === 'draft') return 'draft';
    if (t.status === 'ended') return 'ended';
    const now = new Date();
    if (t.endTime && now > new Date(t.endTime)) return 'ended';
    return 'active';
  };

  // Helper to identify College vs SDLC tests
  const isCollegeTest = (t) => {
    if (!t) return true;
    if (t.categoryMode === 'college') return true;
    if (t.categoryMode === 'institute') return false;

    if (t.assignedTo && t.assignedTo.length > 0) {
      // 1. If explicitly SDLC department, it is SDLC
      const isSdlcDept = t.assignedTo.some(a => a.department === 'SDLC');
      if (isSdlcDept) return false;

      // 2. If year is a specific Institute Branch Center, it is SDLC
      const isSdlcBranch = t.assignedTo.some(a => 
        ['Karur', 'Coimbatore', 'Namakkal', 'Dindigul', 'Chennai'].includes(a.year)
      );
      if (isSdlcBranch) return false;

      // 3. If department is a College department or 'All Departments', it is College
      const isCollegeDept = t.assignedTo.some(a => 
        ['CSE', 'ECE', 'MECH', 'EEE', 'IT', 'CIVIL', 'AI&DS', 'All Departments'].includes(a.department)
      );
      if (isCollegeDept) return true;

      // 4. If year is a College academic year, it is College
      const isCollegeYear = t.assignedTo.some(a => 
        ['1st Year', '2nd Year', '3rd Year', '4th Year', 'All Years'].includes(a.year)
      );
      if (isCollegeYear) return true;
    }

    return true;
  };

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkDuration, setBulkDuration] = useState('30');
  const [bulkDept, setBulkDept] = useState('All Departments');
  const [bulkYear, setBulkYear] = useState('All Years');
  const [bulkBatch, setBulkBatch] = useState('Web Design');
  const [bulkNotepadText, setBulkNotepadText] = useState('');
  const [bulkStatus, setBulkStatus] = useState('active');
  const [bulkPassMark, setBulkPassMark] = useState('');
  const [parsedBulkQuestions, setParsedBulkQuestions] = useState([]);
  const [deptList, setDeptList] = useState([]);
  const [batchList, setBatchList] = useState([]);

  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getTomorrowStr = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [bulkStartDate, setBulkStartDate] = useState(getTodayStr);
  const [bulkStartHour, setBulkStartHour] = useState('00');
  const [bulkStartMinute, setBulkStartMinute] = useState('00');
  const [bulkStartAmpm, setBulkStartAmpm] = useState('AM');

  const [bulkEndDate, setBulkEndDate] = useState(getTomorrowStr);
  const [bulkEndHour, setBulkEndHour] = useState('00');
  const [bulkEndMinute, setBulkEndMinute] = useState('00');
  const [bulkEndAmpm, setBulkEndAmpm] = useState('AM');

  useEffect(() => {
    api.get('/cohorts/departments')
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setDeptList(data.filter(d => d.isActive !== false).map(d => d.code));
        }
      })
      .catch(() => {});

    api.get('/cohorts/batches')
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setBatchList(data.filter(b => b.isActive !== false).map(b => b.name));
        }
      })
      .catch(() => {});
  }, []);

  const hourOptions = ['00', ...Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'))];
  const minuteOptions = ['00', '15', '30', '45', '59'];

  const constructDateTime = (dateStr, hourStr, minuteStr, ampmStr) => {
    if (!dateStr) return new Date();
    let hour = parseInt(hourStr, 10);
    const minute = parseInt(minuteStr, 10);
    if (hour === 0) {
      hour = ampmStr === 'PM' ? 12 : 0;
    } else {
      if (ampmStr === 'PM' && hour < 12) hour += 12;
      if (ampmStr === 'AM' && hour === 12) hour = 0;
    }
    
    const d = new Date(dateStr);
    d.setHours(hour, minute, 0, 0);
    return d;
  };

  const handleBulkFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    
    if (!isTxt && !isPdf) {
      return toast.error('Please upload a valid plain text (.txt) or PDF (.pdf) document.');
    }

    const loader = toast.loading('Reading document file...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let text = '';
        if (isPdf) {
          toast.loading('Parsing document text content...', { id: loader });
          text = await parsePdfToText(event.target.result);
        } else {
          text = event.target.result;
        }

        setBulkNotepadText(text);
        const parsed = parseTextToQuestions(text);
        setParsedBulkQuestions(parsed);
        toast.success(`Successfully extracted ${parsed.length} questions from document.`, { id: loader });
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Unable to parse document content.', { id: loader });
      }
    };
    reader.onerror = () => {
      toast.error('Unable to read document file.', { id: loader });
    };

    if (isPdf) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handleBulkPreviewChange = (index, field, value) => {
    const updated = [...parsedBulkQuestions];
    updated[index][field] = value;
    setParsedBulkQuestions(updated);
  };

  const handleBulkPreviewOptionChange = (qIndex, optLabel, value) => {
    const updated = [...parsedBulkQuestions];
    const opt = updated[qIndex].options.find(o => o.label === optLabel);
    if (opt) {
      opt.text = value;
    }
    setParsedBulkQuestions(updated);
  };

  const handleRemoveBulkPreviewQuestion = (index) => {
    const updated = parsedBulkQuestions.filter((_, i) => i !== index);
    setParsedBulkQuestions(updated);
  };

  const handleBulkCreateSubmit = async (e) => {
    e.preventDefault();

    if (!bulkTitle.trim() || !bulkSubject.trim() || !bulkDuration || !bulkBatch.trim()) {
      return toast.error('Please fill in all required assessment details.');
    }

    if (parsedBulkQuestions.length === 0) {
      return toast.error('No valid questions found to import.');
    }

    // Auto-clean: keep only questions that have question text and at least options A & B
    const validQuestions = parsedBulkQuestions.filter(q => {
      const hasText = q.questionText && q.questionText.trim().length > 0;
      const optA = q.options.find(o => o.label === 'A')?.text.trim();
      const optB = q.options.find(o => o.label === 'B')?.text.trim();
      return hasText && optA && optB;
    });

    if (validQuestions.length === 0) {
      return toast.error('No valid questions found. Every question must contain question text and at least Option A and Option B.');
    }

    if (validQuestions.length < parsedBulkQuestions.length) {
      toast(`Filtered out ${parsedBulkQuestions.length - validQuestions.length} incomplete question fragments.`);
    }

    const questionsPayload = validQuestions.map(q => {
      const options = [
        { label: 'A', text: q.options.find(o => o.label === 'A')?.text.trim() || '' },
        { label: 'B', text: q.options.find(o => o.label === 'B')?.text.trim() || '' }
      ];
      const optC = q.options.find(o => o.label === 'C')?.text.trim();
      if (optC) options.push({ label: 'C', text: optC });
      const optD = q.options.find(o => o.label === 'D')?.text.trim();
      if (optD) options.push({ label: 'D', text: optD });

      let correct = q.correctAnswer;
      const selected = options.find(o => o.label === correct);
      if (!selected || !selected.text.trim()) {
        correct = 'A';
      }

      return {
        questionText: q.questionText.trim(),
        options,
        correctAnswer: correct,
        marks: 1
      };
    });

    const calculatedTotalMarks = questionsPayload.length;
    const calculatedPassMark = bulkPassMark !== '' && !isNaN(Number(bulkPassMark))
      ? Math.max(1, Math.min(calculatedTotalMarks, Number(bulkPassMark)))
      : Math.ceil(calculatedTotalMarks * 0.4);

    const startTime = constructDateTime(bulkStartDate, bulkStartHour, bulkStartMinute, bulkStartAmpm);
    const endTime = constructDateTime(bulkEndDate, bulkEndHour, bulkEndMinute, bulkEndAmpm);

    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
      return toast.error('Please select valid start and end dates.');
    }
    if (endTime <= startTime) {
      return toast.error('End time (closing) must be after start time (opening).');
    }

    const testPayload = {
      title: bulkTitle.trim(),
      subject: bulkSubject.trim(),
      description: `Bulk imported test on ${bulkSubject}`,
      instructions: '1. Do not switch tabs. 2. Attempts will close automatically.',
      duration: Number(bulkDuration),
      totalMarks: calculatedTotalMarks,
      passMark: calculatedPassMark,
      assignedTo: [
        {
          department: bulkDept,
          batch: bulkBatch.trim(),
          year: bulkYear
        }
      ],
      startTime,
      endTime,
      status: bulkStatus,
      categoryMode: 'college',
      showResultsToStudents: true
    };

    const loader = toast.loading('Creating assessment paper and uploading questions...');
    try {
      const { data } = await api.post('/tests/create', testPayload);
      const testId = data._id;

      await api.post(`/questions/sync/${testId}`, questionsPayload);

      toast.success('Assessment and question bank created successfully.', { id: loader });
      
      setBulkTitle('');
      setBulkSubject('');
      setBulkDuration('30');
      setBulkDept('All Departments');
      setBulkYear('All Years');
      setBulkBatch('Web Design');
      setBulkNotepadText('');
      setBulkStatus('draft');
      setBulkStartDate(getTodayStr());
      setBulkStartHour('09');
      setBulkStartMinute('00');
      setBulkStartAmpm('AM');
      setBulkEndDate(getTomorrowStr());
      setBulkEndHour('11');
      setBulkEndMinute('59');
      setBulkEndAmpm('PM');
      setParsedBulkQuestions([]);
      setShowBulkCreateModal(false);
      fetchTestsList();
    } catch (err) {
      console.error(err);
      if (err.isAuthExpired || err.response?.status === 401) {
        if (loader) toast.dismiss(loader);
      } else {
        toast.error(err.response?.data?.message || 'Failed to create bulk assessment.', { id: loader });
      }
    }
  };

  useEffect(() => {
    if (tab) {
      setActiveTab(tab);
    }
  }, [tab]);

  useEffect(() => {
    if (!loading && (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'trainer'))) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, user, loading, navigate]);

  const fetchTestsList = async () => {
    setLoadingTests(true);
    try {
      const { data } = await api.get('/tests');
      setTests(data);
    } catch (err) {
      toast.error('Unable to update assessment registries.');
    } finally {
      setLoadingTests(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'admin' || user?.role === 'trainer')) {
      fetchTestsList();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    const tId = searchParams.get('testId');
    const subTab = searchParams.get('subTab');
    if (subTab) setActiveTab(subTab);
    if (tId && !selectedTest && isAuthenticated) {
      api.get(`/tests/${tId}`)
        .then(({ data }) => setSelectedTest(data))
        .catch(() => {});
    }
  }, [searchParams, isAuthenticated]);

  const handleDuplicate = async (testId) => {
    const loader = toast.loading('Duplicating assessment paper...');
    try {
      await api.post(`/tests/${testId}/duplicate`);
      toast.success('Assessment paper duplicated successfully as a draft.', { id: loader });
      fetchTestsList();
    } catch (err) {
      toast.error('Failed to duplicate assessment paper.', { id: loader });
    }
  };

  const handleDelete = (testId) => {
    const test = tests.find(t => t._id === testId);
    if (test) {
      setTestToDelete(test);
      setShowDeleteConfirm(true);
    }
  };

  const confirmDeleteTest = async () => {
    if (!testToDelete) return;
    const testId = testToDelete._id;
    setShowDeleteConfirm(false);
    
    const loader = toast.loading('Deleting assessment paper...');
    try {
      await api.delete(`/tests/${testId}`);
      toast.success('Assessment paper deleted successfully.', { id: loader });
      fetchTestsList();
    } catch (err) {
      toast.error('Failed to delete assessment paper.', { id: loader });
    } finally {
      setTestToDelete(null);
    }
  };

  if (loading || !isAuthenticated || (user?.role !== 'admin' && user?.role !== 'trainer')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <ClockLoader size="lg" color="#004f90" text="Securing faculty credentials..." />
      </div>
    );
  }

  // Header titles mapping
  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'students': return 'Student Management';
      case 'courses':
      case 'cohorts': return 'Course Catalog & Track Management';
      case 'users': return 'User Account Directory';
      case 'tests': return 'Assessment Manager';
      case 'proctoring': return 'Proctoring Monitor';
      case 'create': return 'Create Assessment';
      case 'edit': return 'Modify Assessment';
      case 'questions': return 'Question Manager';
      case 'results': return 'Submission Analytics';
      default: return 'Faculty Control Center';
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45 }}
      className="min-h-screen bg-[#f8fafc] flex font-sans overflow-hidden"
    >
      
      {/* Sidebar Column (Full Height) */}
      <aside className="shrink-0 hidden md:block h-screen sticky top-0 z-50">
        <Sidebar />
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        
        {/* Dynamic Header Bar matching mockup */}
        <header className="bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 w-full px-6 sm:px-8 flex items-center justify-between shrink-0 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center space-x-3">
            <span className="h-4.5 w-1.5 bg-[#004f90] rounded-full"></span>
            <h1 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight font-poppins">
              {getHeaderTitle()}
            </h1>
          </div>

          <div className="flex items-center space-x-4">
            {user?.role === 'admin' ? (
              <span className="font-extrabold text-sm sm:text-base tracking-widest text-[#004f90] uppercase font-mono select-none">
                ADMIN
              </span>
            ) : user?.role === 'trainer' ? (
              <span className="font-bold text-sm sm:text-base text-slate-800 tracking-tight select-none">
                <span className="text-[#004f90] font-black">{user?.name || 'Trainer'}</span>{' '}
                <span className="text-slate-500 font-semibold">(Trainer)</span>
              </span>
            ) : (
              <span className="font-bold text-sm sm:text-base text-slate-800 select-none">
                {user?.name} ({user?.role || 'Faculty'})
              </span>
            )}
          </div>
        </header>

        {/* Content Workspace Panel */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-4rem)] bg-[#f8fafc]">
          
          {/* Subview Swappers */}
          {activeTab === 'dashboard' && (
            <Dashboard
              onNavigate={(tab) => {
                if (tab === 'create') {
                  setSelectedTest(null);
                  setActiveTab('create');
                }
              }}
            />
          )}

          {activeTab === 'students' && (
            user?.role === 'admin' ? (
              <StudentList />
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-2xl mx-auto my-12 space-y-4 shadow-sm">
                <AlertTriangle className="h-14 w-14 text-rose-500 mx-auto" />
                <h3 className="text-xl font-bold text-slate-800 font-poppins">Access Denied</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  You do not have administrative privileges to manage student directories. This section is restricted to Master Administrators only.
                </p>
              </div>
            )
          )}

          {(activeTab === 'courses' || activeTab === 'cohorts') && (
            <CourseManagement />
          )}

          {activeTab === 'users' && (
            user?.role === 'admin' ? (
              <UserList />
            ) : (
              <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center max-w-2xl mx-auto my-12 space-y-4 shadow-sm">
                <AlertTriangle className="h-14 w-14 text-rose-500 mx-auto" />
                <h3 className="text-xl font-bold text-slate-800 font-poppins">Access Denied</h3>
                <p className="text-sm text-slate-500 font-medium leading-relaxed">
                  You do not have administrative privileges to manage faculty roster profiles. This section is restricted to Master Administrators only.
                </p>
              </div>
            )
          )}

          {activeTab === 'proctoring' && (
            <ProctoringLogs />
          )}

          {activeTab === 'tests' && (() => {
            const collegeCount = tests.filter(isCollegeTest).length;
            const instituteCount = tests.filter(t => !isCollegeTest(t)).length;

            const filteredTests = tests.filter(test => {
              if (testsTrackFilter === 'college' && !isCollegeTest(test)) return false;
              if (testsTrackFilter === 'institute' && isCollegeTest(test)) return false;

              const liveStatus = computeLiveTestStatus(test);
              if (testsStatusFilter !== 'all' && liveStatus !== testsStatusFilter) return false;

              if (testsSearch.trim()) {
                const q = testsSearch.toLowerCase();
                const titleMatch = (test.title || '').toLowerCase().includes(q);
                const subjectMatch = (test.subject || '').toLowerCase().includes(q);
                const cohortMatch = (test.assignedTo || []).some(a => 
                  (a.department || '').toLowerCase().includes(q) ||
                  (a.batch || '').toLowerCase().includes(q) ||
                  (a.year || '').toLowerCase().includes(q)
                );
                return titleMatch || subjectMatch || cohortMatch;
              }
              return true;
            });

            const totalTestPages = Math.ceil(filteredTests.length / testsPerPage) || 1;
            const currentPageTests = filteredTests.slice((testsPage - 1) * testsPerPage, testsPage * testsPerPage);

            return (
              <div className="space-y-5 animate-fadeIn font-sans text-left pb-10">
                
                {/* Clean Header Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
                  <div>
                    <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-poppins flex items-center gap-2">
                      <span>Manage Assessments</span>
                    </h2>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
                      Create, configure, schedule, and evaluate exam papers for College and SDLC candidates.
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2.5 shrink-0">
                    <button
                      onClick={fetchTestsList}
                      className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-600 p-2.5 rounded-xl transition cursor-pointer shadow-2xs"
                      title="Refresh Assessments List"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => {
                        setSelectedTest(null);
                        setActiveTab('create');
                      }}
                      className="bg-[#004f90] hover:bg-[#003c6e] text-white font-semibold px-4 py-2.5 rounded-xl text-xs sm:text-sm shadow-2xs hover:shadow-xs transition active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                    >
                      <PlusCircle className="h-4 w-4" />
                      <span>Create Test</span>
                    </button>
                  </div>
                </div>

                {/* Quick Telemetry Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Tests</span>
                      <p className="text-2xl font-extrabold text-slate-900 font-poppins mt-0.5">{tests.length}</p>
                    </div>
                    <div className="h-10 w-10 bg-slate-50 text-slate-600 rounded-xl flex items-center justify-center border border-slate-100">
                      <Layers className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">College Exams</span>
                      <p className="text-2xl font-extrabold text-[#004f90] font-poppins mt-0.5">{collegeCount}</p>
                    </div>
                    <div className="h-10 w-10 bg-blue-50 text-[#004f90] rounded-xl flex items-center justify-center border border-blue-100">
                      <GraduationCap className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex items-center justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SDLC Exams</span>
                      <p className="text-2xl font-extrabold text-[#F7931A] font-poppins mt-0.5">{instituteCount}</p>
                    </div>
                    <div className="h-10 w-10 bg-orange-50 text-[#F7931A] rounded-xl flex items-center justify-center border border-orange-100">
                      <BookOpen className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                {/* Search & Filter Toolbar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-3.5 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3">
                  {/* Track Segmented Pills */}
                  <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 shrink-0 overflow-x-auto">
                    <button
                      onClick={() => { setTestsTrackFilter('all'); setTestsPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer shrink-0 ${
                        testsTrackFilter === 'all'
                          ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      All ({tests.length})
                    </button>
                    <button
                      onClick={() => { setTestsTrackFilter('college'); setTestsPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        testsTrackFilter === 'college'
                          ? 'bg-[#004f90] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span>College ({collegeCount})</span>
                    </button>
                    <button
                      onClick={() => { setTestsTrackFilter('institute'); setTestsPage(1); }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shrink-0 ${
                        testsTrackFilter === 'institute'
                          ? 'bg-[#F7931A] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5" />
                      <span>SDLC ({instituteCount})</span>
                    </button>
                  </div>

                  {/* Search and Status filter */}
                  <div className="flex items-center gap-2.5 flex-1 max-w-xl">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={testsSearch}
                        onChange={(e) => { setTestsSearch(e.target.value); setTestsPage(1); }}
                        placeholder="Search assessments by title, subject, cohort..."
                        className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl text-xs font-medium text-slate-800 outline-none transition"
                      />
                      {testsSearch && (
                        <button
                          onClick={() => setTestsSearch('')}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="relative shrink-0">
                      <select
                        value={testsStatusFilter}
                        onChange={(e) => { setTestsStatusFilter(e.target.value); setTestsPage(1); }}
                        className="bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl h-9 pl-3 pr-8 text-xs font-semibold text-slate-700 outline-none cursor-pointer appearance-none"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="draft">Draft</option>
                        <option value="ended">Ended</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Table Container */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
                  {loadingTests ? (
                    <div className="py-24 text-center flex flex-col items-center justify-center">
                      <ClockLoader size="lg" color="#004f90" text="Loading assessments schedule..." />
                    </div>
                  ) : tests.length === 0 ? (
                    <div className="py-20 text-center text-xs text-slate-400 space-y-3">
                      <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-800 text-sm">No assessments found.</p>
                      <p className="text-xs text-slate-400">Click "Create Test" above to build your first examination paper.</p>
                    </div>
                  ) : filteredTests.length === 0 ? (
                    <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                      <Search className="h-8 w-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700">No assessments match your active filter.</p>
                      <button
                        onClick={() => { setTestsSearch(''); setTestsTrackFilter('all'); setTestsStatusFilter('all'); }}
                        className="text-xs font-semibold text-[#004f90] hover:underline cursor-pointer"
                      >
                        Clear Search & Filters
                      </button>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                            <th className="py-3 px-4">Assessment Details</th>
                            <th className="py-3 px-4">Target Cohort</th>
                            <th className="py-3 px-4 text-center">Specs</th>
                            <th className="py-3 px-4 text-center">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                          {currentPageTests.map((test) => {
                            const isCollege = isCollegeTest(test);
                            const liveStatus = computeLiveTestStatus(test);

                            return (
                              <tr key={test._id} className="hover:bg-slate-50/60 transition-colors group">
                                
                                {/* Assessment Title, Subject & Time window */}
                                <td className="py-3.5 px-4">
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {/* Subject badge */}
                                      <span className="inline-block bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                        {test.subject}
                                      </span>

                                      {/* Track Classification badge */}
                                      {isCollege ? (
                                        <span className="inline-flex items-center gap-1 bg-blue-50 border border-blue-200/80 text-[#004f90] font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                          <GraduationCap className="w-3 h-3" />
                                          <span>College</span>
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 bg-orange-50 border border-orange-200/80 text-[#F7931A] font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
                                          <BookOpen className="w-3 h-3" />
                                          <span>SDLC</span>
                                        </span>
                                      )}
                                    </div>

                                    <h4 className="font-bold text-slate-900 text-sm leading-snug group-hover:text-[#004f90] transition">
                                      {test.title}
                                    </h4>

                                    <p className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                                      <Clock className="h-3 w-3 text-slate-400 shrink-0" />
                                      <span>Window: {formatDateTimeShort(test.startTime)} – {formatDateTimeShort(test.endTime)}</span>
                                    </p>
                                  </div>
                                </td>

                                {/* Target Cohorts */}
                                <td className="py-3.5 px-4">
                                  {test.assignedTo?.length > 0 ? (
                                    <div className="flex flex-wrap gap-1 max-w-[280px]">
                                      {test.assignedTo.slice(0, 3).map((item, idx) => (
                                        <span 
                                          key={idx} 
                                          className="inline-block bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-semibold px-2 py-0.5 rounded-md"
                                        >
                                          {item.department === 'SDLC' 
                                            ? `${item.batch} (${item.year})` 
                                            : `${item.department} (${item.year})`}
                                        </span>
                                      ))}
                                      {test.assignedTo.length > 3 && (
                                        <span className="inline-block bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded">
                                          +{test.assignedTo.length - 3} more
                                        </span>
                                      )}
                                    </div>
                                  ) : (
                                    <span className="text-amber-600 text-[11px] font-semibold">Unassigned</span>
                                  )}
                                </td>

                                {/* Specs: Duration & Marks */}
                                <td className="py-3.5 px-4 text-center">
                                  <div className="space-y-0.5">
                                    <span className="font-bold text-slate-800 text-xs">{test.duration} mins</span>
                                    <p className="text-[11px] text-slate-400 font-medium">
                                      {test.totalMarks} pts <span className="text-slate-400">({test.passMark} pass)</span>
                                    </p>
                                  </div>
                                </td>

                                {/* Status Pill */}
                                <td className="py-3.5 px-4 text-center">
                                  {liveStatus === 'active' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                      <span>Active</span>
                                    </span>
                                  ) : liveStatus === 'draft' ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/80">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                      <span>Draft</span>
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                                      <span>Ended</span>
                                    </span>
                                  )}
                                </td>

                                {/* Action Buttons */}
                                <td className="py-3.5 px-4 text-right">
                                  <div className="flex items-center justify-end gap-1">
                                    {/* Questions */}
                                    <button
                                      onClick={() => {
                                        setSelectedTest(test);
                                        setActiveTab('questions');
                                        setSearchParams({ subTab: 'questions', testId: test._id });
                                      }}
                                      title="Manage Questions"
                                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition border border-transparent hover:border-emerald-100 cursor-pointer"
                                    >
                                      <HelpCircle className="h-4 w-4" />
                                    </button>
                                    
                                    {/* Results / Analytics */}
                                    <button
                                      onClick={() => {
                                        setSelectedTest(test);
                                        setActiveTab('results');
                                        setSearchParams({ subTab: 'results', testId: test._id });
                                      }}
                                      title="View Candidate Submissions"
                                      className="p-1.5 text-slate-400 hover:text-[#004f90] hover:bg-blue-50 rounded-lg transition border border-transparent hover:border-blue-100 cursor-pointer"
                                    >
                                      <Eye className="h-4 w-4" />
                                    </button>

                                    {/* Edit */}
                                    <button
                                      onClick={() => {
                                        setSelectedTest(test);
                                        setActiveTab('edit');
                                        setSearchParams({ subTab: 'edit', testId: test._id });
                                      }}
                                      title="Edit Assessment Details"
                                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition border border-transparent hover:border-slate-200 cursor-pointer"
                                    >
                                      <Edit3 className="h-4 w-4" />
                                    </button>

                                    {/* Duplicate */}
                                    <button
                                      onClick={() => handleDuplicate(test._id)}
                                      title="Duplicate Assessment Paper"
                                      className="p-1.5 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition border border-transparent hover:border-purple-100 cursor-pointer"
                                    >
                                      <Copy className="h-4 w-4" />
                                    </button>

                                    {/* Delete */}
                                    <button
                                      onClick={() => handleDelete(test._id)}
                                      title="Delete Assessment"
                                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition border border-transparent hover:border-rose-100 cursor-pointer"
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Pagination Footer */}
                  {!loadingTests && filteredTests.length > 0 && (
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 py-3 border-t border-slate-100 bg-slate-50/50 text-xs">
                      <span className="text-slate-500 font-medium">
                        Showing <strong className="text-slate-800">{Math.min((testsPage - 1) * testsPerPage + 1, filteredTests.length)}</strong> to <strong className="text-slate-800">{Math.min(testsPage * testsPerPage, filteredTests.length)}</strong> of <strong className="text-slate-800">{filteredTests.length}</strong> assessment papers
                      </span>

                      {totalTestPages > 1 && (
                        <div className="flex items-center gap-1.5 self-end sm:self-auto">
                          <button
                            onClick={() => setTestsPage(p => Math.max(1, p - 1))}
                            disabled={testsPage === 1}
                            className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          
                          <span className="px-2 font-bold text-slate-700">
                            Page {testsPage} of {totalTestPages}
                          </span>

                          <button
                            onClick={() => setTestsPage(p => Math.min(totalTestPages, p + 1))}
                            disabled={testsPage === totalTestPages}
                            className="p-1.5 border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {activeTab === 'create' && (
            <CreateTest
              testToEdit={null}
              onSave={() => {
                setSearchParams({});
                setActiveTab('tests');
                fetchTestsList();
              }}
              onCancel={() => {
                setSearchParams({});
                setActiveTab('tests');
              }}
            />
          )}

          {activeTab === 'edit' && selectedTest && (
            <CreateTest
              testToEdit={selectedTest}
              onSave={() => {
                setSearchParams({});
                setActiveTab('tests');
                fetchTestsList();
              }}
              onCancel={() => {
                setSearchParams({});
                setActiveTab('tests');
              }}
            />
          )}

          {activeTab === 'questions' && selectedTest && (
            <AddQuestions
              test={selectedTest}
              onFinished={() => {
                setSelectedTest(null);
                setSearchParams({});
                setActiveTab('tests');
                fetchTestsList();
              }}
            />
          )}

          {activeTab === 'results' && selectedTest && (
            <ViewResults
              test={selectedTest}
              onBack={() => {
                setSelectedTest(null);
                setSearchParams({});
                setActiveTab('tests');
                fetchTestsList();
              }}
            />
          )}
          
          {/* Mobile Navigation overlay drawer support if they click Sidebar items */}
          <div className="md:hidden mt-6 bg-white rounded-2xl p-3 border border-slate-100 flex flex-wrap justify-around items-center gap-2 text-xs text-slate-500 font-bold shadow-sm">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`transition-all px-2.5 py-1.5 rounded-lg cursor-pointer ${activeTab === 'dashboard' ? 'text-[#004f90] bg-[#eef2f6]' : ''}`}
            >
              Dashboard
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('students')}
                className={`transition-all px-2.5 py-1.5 rounded-lg cursor-pointer ${activeTab === 'students' ? 'text-[#004f90] bg-[#eef2f6]' : ''}`}
              >
                Students
              </button>
            )}
            <button
              onClick={() => setActiveTab('tests')}
              className={`transition-all px-2.5 py-1.5 rounded-lg cursor-pointer ${activeTab === 'tests' || activeTab === 'create' || activeTab === 'edit' || activeTab === 'questions' || activeTab === 'results' ? 'text-[#004f90] bg-[#eef2f6]' : ''}`}
            >
              Tests
            </button>
            <button
              onClick={() => setActiveTab('proctoring')}
              className={`transition-all px-2.5 py-1.5 rounded-lg cursor-pointer ${activeTab === 'proctoring' ? 'text-[#004f90] bg-[#eef2f6]' : ''}`}
            >
              Proctoring
            </button>
            {user?.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`transition-all px-2.5 py-1.5 rounded-lg cursor-pointer ${activeTab === 'users' ? 'text-[#004f90] bg-[#eef2f6]' : ''}`}
              >
                Users
              </button>
            )}
          </div>

        </main>
      </div>

      {/* -------------------- CUSTOM CONFIRMATION MODALS -------------------- */}
      <AnimatePresence>
        {showDeleteConfirm && testToDelete && (
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
                <h4 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Delete Assessment?</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                  Are you sure you want to delete the exam paper <span className="font-semibold text-slate-800">"{testToDelete.title}"</span>? This will permanently wipe all associated questions and student submissions.
                </p>
              </div>
              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  onClick={confirmDeleteTest}
                  className="flex-1 bg-red-600 hover:bg-red-750 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer"
                >
                  Delete Test
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

        {showBulkCreateModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[999] flex items-center justify-center p-4">
            <form onSubmit={handleBulkCreateSubmit} className="bg-white border border-slate-150 rounded-3xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-poppins">Bulk Import Test</h3>
                  <p className="text-xs text-slate-400 font-medium">Create a test and upload all questions at once using Notepad text or PDF</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkCreateModal(false);
                    setParsedBulkQuestions([]);
                    setBulkNotepadText('');
                    setBulkStatus('draft');
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-655 transition-all cursor-pointer border border-transparent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                
                {/* Left Column: Test Settings Form */}
                <div className="w-full lg:w-4/12 border-r border-slate-100 p-6 overflow-y-auto space-y-5 bg-slate-50/30">
                  <h4 className="text-xs font-bold text-[#004f90] uppercase tracking-wider pl-2 border-l-2 border-[#004f90]">
                    1. Test Configuration
                  </h4>

                  {/* Title */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Test Title</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. MCQ Evaluation on Core React"
                      value={bulkTitle}
                      onChange={(e) => setBulkTitle(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* Subject */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Subject</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. CSE"
                      value={bulkSubject}
                      onChange={(e) => setBulkSubject(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
                    />
                  </div>

                  {/* Duration */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Duration (Minutes)</label>
                    <input
                      required
                      type="number"
                      min="1"
                      placeholder="e.g. 30"
                      value={bulkDuration}
                      onChange={(e) => setBulkDuration(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-355 focus:border-[#004f90] rounded-xl py-2.5 px-4 text-slate-805 text-sm focus:outline-none transition-all outline-none font-semibold shadow-sm"
                    />
                  </div>

                  {/* Pass Mark Threshold Input & Presets */}
                  <div className="space-y-1.5 flex flex-col">
                    <div className="flex items-center justify-between pl-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Pass Mark Threshold</label>
                      <span className="text-[10px] font-extrabold text-[#004f90] bg-[#004f90]/10 px-1.5 py-0.5 rounded">
                        {parsedBulkQuestions.length > 0
                          ? `${Math.round(((bulkPassMark !== '' ? Number(bulkPassMark) : Math.ceil(parsedBulkQuestions.length * 0.4)) / parsedBulkQuestions.length) * 100)}%`
                          : '40%'}
                      </span>
                    </div>
                    <input
                      type="number"
                      min="1"
                      placeholder={`e.g. ${Math.ceil(parsedBulkQuestions.length * 0.4) || 40}`}
                      value={bulkPassMark}
                      onChange={(e) => setBulkPassMark(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-xl py-2.5 px-4 text-[#004f90] text-sm focus:outline-none transition-all outline-none font-extrabold shadow-sm"
                    />
                    <div className="flex items-center gap-1 pt-0.5">
                      {[35, 40, 50, 60].map(pct => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => {
                            const val = Math.ceil((parsedBulkQuestions.length || 100) * (pct / 100));
                            setBulkPassMark(String(val));
                          }}
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-[#004f90]/10 hover:text-[#004f90] text-slate-600 transition cursor-pointer"
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status & Result Visibility */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Status</label>
                      <div className="relative flex items-center">
                        <select
                          value={bulkStatus}
                          onChange={(e) => setBulkStatus(e.target.value)}
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/10 rounded-xl py-2.5 px-3.5 pr-10 text-slate-800 text-xs font-semibold focus:outline-none transition-all outline-none cursor-pointer appearance-none shadow-2xs"
                        >
                          <option value="draft">Draft (In Preparation)</option>
                          <option value="active">Active (Available for Candidates)</option>
                          <option value="ended">Ended (Completed/Closed)</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                      </div>
                    </div>

                    <div className="space-y-1.5 flex flex-col">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Result Visibility</label>
                      <div className="relative flex items-center">
                        <select
                          defaultValue="true"
                          className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/10 rounded-xl py-2.5 px-3.5 pr-10 text-slate-800 text-xs font-semibold focus:outline-none transition-all outline-none cursor-pointer appearance-none shadow-2xs"
                        >
                          <option value="true">Visible to Students</option>
                          <option value="false">Invisible to Students</option>
                        </select>
                        <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-[#004f90] uppercase tracking-wider pl-2 border-l-2 border-[#004f90] pt-2">
                    2. Target Cohort
                  </h4>

                  {/* Department */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Department</label>
                    <div className="relative flex items-center">
                      <select
                        value={bulkDept}
                        onChange={(e) => setBulkDept(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/10 rounded-xl py-2.5 px-3.5 pr-10 text-slate-800 text-xs font-semibold focus:outline-none transition-all outline-none cursor-pointer appearance-none shadow-2xs"
                      >
                        <option value="All Departments">All Departments (Any Dept)</option>
                        {deptList.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Year */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Academic Year</label>
                    <div className="relative flex items-center">
                      <select
                        value={bulkYear}
                        onChange={(e) => setBulkYear(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/10 rounded-xl py-2.5 px-3.5 pr-10 text-slate-800 text-xs font-semibold focus:outline-none transition-all outline-none cursor-pointer appearance-none shadow-2xs"
                      >
                        <option value="All Years">All Years (Any Year)</option>
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Batch */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Batch / Track</label>
                    <div className="relative flex items-center">
                      <select
                        value={bulkBatch}
                        onChange={(e) => setBulkBatch(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/10 rounded-xl py-2.5 px-3.5 pr-10 text-slate-800 text-xs font-semibold focus:outline-none transition-all outline-none cursor-pointer appearance-none shadow-2xs"
                      >
                        <option value="All Batches">All Batches (Every Student)</option>
                        {batchList.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-[#004f90] uppercase tracking-wider pl-2 border-l-2 border-[#004f90] pt-2">
                    3. Exam Schedule & Timings
                  </h4>

                  {/* Start Date & Time */}
                  <div className="space-y-1.5 flex flex-col bg-white border border-slate-200/80 p-3 rounded-xl shadow-xs">
                    <label className="text-[10px] font-extrabold text-[#004f90] uppercase tracking-wider">Start Time (Opens)</label>
                    <input
                      required
                      type="date"
                      value={bulkStartDate}
                      onChange={(e) => setBulkStartDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#004f90]"
                    />
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="relative flex-1 flex items-center">
                        <select
                          value={bulkStartHour}
                          onChange={(e) => setBulkStartHour(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-2 pr-6 text-slate-800 text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                        >
                          {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                      </div>
                      <span className="font-bold text-slate-400 text-xs">:</span>
                      <div className="relative flex-1 flex items-center">
                        <select
                          value={bulkStartMinute}
                          onChange={(e) => setBulkStartMinute(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-2 pr-6 text-slate-800 text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                        >
                          {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                      </div>
                      <div className="relative flex items-center shrink-0">
                        <select
                          value={bulkStartAmpm}
                          onChange={(e) => setBulkStartAmpm(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-2 pr-6 text-slate-800 text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* End Date & Time */}
                  <div className="space-y-1.5 flex flex-col bg-white border border-slate-200/80 p-3 rounded-xl shadow-xs">
                    <label className="text-[10px] font-extrabold text-rose-600 uppercase tracking-wider">End Time (Closes)</label>
                    <input
                      required
                      type="date"
                      value={bulkEndDate}
                      onChange={(e) => setBulkEndDate(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 px-3 text-slate-800 text-xs font-semibold focus:outline-none focus:border-[#004f90]"
                    />
                    <div className="flex items-center gap-1.5 pt-1">
                      <div className="relative flex-1 flex items-center">
                        <select
                          value={bulkEndHour}
                          onChange={(e) => setBulkEndHour(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-2 pr-6 text-slate-800 text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                        >
                          {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                      </div>
                      <span className="font-bold text-slate-400 text-xs">:</span>
                      <div className="relative flex-1 flex items-center">
                        <select
                          value={bulkEndMinute}
                          onChange={(e) => setBulkEndMinute(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-2 pr-6 text-slate-800 text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                        >
                          {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                      </div>
                      <div className="relative flex items-center shrink-0">
                        <select
                          value={bulkEndAmpm}
                          onChange={(e) => setBulkEndAmpm(e.target.value)}
                          className="bg-slate-50 border border-slate-200 rounded-lg py-1.5 pl-2 pr-6 text-slate-800 text-xs font-bold focus:outline-none appearance-none cursor-pointer"
                        >
                          <option value="AM">AM</option>
                          <option value="PM">PM</option>
                        </select>
                        <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Question Import Console */}
                <div className="w-full lg:w-8/12 flex flex-col overflow-hidden">
                  {/* Tab Body */}
                  <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                    {/* Input Area */}
                    <div className="w-full md:w-6/12 border-r border-slate-100 p-5 overflow-y-auto space-y-4 flex flex-col">
                      {/* File Upload Area */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Upload Notepad (.txt) / PDF File</span>
                        <label className="border border-dashed border-slate-200 hover:border-[#004f90] rounded-2xl p-4 flex flex-col items-center justify-center gap-1.5 cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50">
                          <Upload className="h-6 w-6 text-[#004f90]" />
                          <span className="text-xs font-bold text-slate-700">Choose a .txt or .pdf file</span>
                          <input
                            type="file"
                            accept=".txt,.pdf"
                            onChange={handleBulkFileUpload}
                            className="hidden"
                          />
                        </label>
                      </div>

                      {/* Or Paste Area */}
                      <div className="space-y-1 flex-1 flex flex-col">
                        <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Or Paste Raw Text</span>
                        <textarea
                          value={bulkNotepadText}
                          onChange={(e) => setBulkNotepadText(e.target.value)}
                          placeholder="1. Which CSS property is used to make text bold?&#13;&#10;A) font-style&#13;&#10;B) font-weight&#13;&#10;C) text-transform&#13;&#10;D) font-variant&#13;&#10;&#13;&#10;2. What is the standard port number for local HTTP development servers?&#13;&#10;A) 80&#13;&#10;B) 443&#13;&#10;C) 3000&#13;&#10;D) 8080"
                          className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#004f90] resize-none min-h-[140px]"
                        />
                      </div>

                      {/* Parse Button */}
                      <button
                        type="button"
                        onClick={() => {
                          const parsed = parseTextToQuestions(bulkNotepadText);
                          setParsedBulkQuestions(parsed);
                          if (parsed.length > 0) {
                            toast.success(`Successfully parsed ${parsed.length} questions!`);
                          } else {
                            toast.error('No questions found. Please check the formatting.');
                          }
                        }}
                        className="w-full bg-[#004f90] hover:bg-[#003c6e] text-white py-2 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                      >
                        Parse & Load Preview
                      </button>
                    </div>

                    {/* Preview Area */}
                    <div className="w-full md:w-6/12 p-5 overflow-y-auto space-y-3 bg-slate-50/30 flex flex-col">
                      <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                        Parsed Questions Preview ({parsedBulkQuestions.length})
                      </span>

                      {parsedBulkQuestions.length === 0 ? (
                        <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-6 text-center space-y-2">
                          <HelpCircle className="h-8 w-8 text-slate-300" />
                          <span className="text-xs font-bold text-slate-700 text-center" style={{ width: '100%', minWidth: '260px', display: 'block' }}>No questions parsed yet</span>
                          <span className="text-[10px] text-slate-400 leading-relaxed mt-1 text-center" style={{ width: '100%', minWidth: '260px', maxWidth: '340px', display: 'block', margin: '4px auto 0' }}>Upload a notepad file or paste text on the left, then click "Parse & Load Preview".</span>
                        </div>
                      ) : (
                        <div className="space-y-3 flex-1">
                          {parsedBulkQuestions.map((q, qIndex) => (
                            <div key={qIndex} className="bg-white border border-slate-200/60 rounded-xl p-3.5 shadow-sm space-y-2.5 relative text-left">
                              {/* Question Header */}
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                <span className="text-[10px] font-bold text-[#004f90]">Question #{qIndex + 1}</span>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveBulkPreviewQuestion(qIndex)}
                                  className="text-slate-400 hover:text-red-650 p-1 hover:bg-slate-50 rounded cursor-pointer"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </div>

                              {/* Question Text */}
                              <textarea
                                value={q.questionText}
                                onChange={(e) => handleBulkPreviewChange(qIndex, 'questionText', e.target.value)}
                                rows="2"
                                className="w-full bg-slate-50 border border-slate-205 rounded-lg p-1.5 text-slate-800 text-xs focus:outline-none focus:border-[#004f90] resize-none"
                              />

                              {/* Options */}
                              <div className="grid grid-cols-1 gap-1.5">
                                {['A', 'B', 'C', 'D'].map((label) => {
                                  const opt = q.options.find(o => o.label === label);
                                  return (
                                    <div key={label} className="flex items-center space-x-1.5">
                                      <span className="w-5 h-5 rounded bg-slate-100 text-[9px] font-bold text-slate-500 flex items-center justify-center shrink-0">{label}</span>
                                      <input
                                        type="text"
                                        value={opt?.text || ''}
                                        onChange={(e) => handleBulkPreviewOptionChange(qIndex, label, e.target.value)}
                                        placeholder={`Option ${label}`}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg py-0.5 px-2 text-slate-800 text-xs focus:outline-none focus:border-[#004f90]"
                                      />
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Correct Option */}
                              <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-slate-100 text-[10px]">
                                <div className="flex items-center space-x-1.5">
                                  <span className="font-bold text-slate-500">Correct Answer:</span>
                                  <div className="flex items-center gap-1">
                                    {['A', 'B', 'C', 'D'].map((label) => (
                                      <button
                                        key={label}
                                        type="button"
                                        onClick={() => handleBulkPreviewChange(qIndex, 'correctAnswer', label)}
                                        className={`h-5 w-5 rounded font-bold text-[9px] transition-all cursor-pointer ${
                                          q.correctAnswer === label
                                            ? 'bg-emerald-600 text-white shadow-sm'
                                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                        }`}
                                      >
                                        {label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50 shrink-0">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkCreateModal(false);
                    setParsedBulkQuestions([]);
                    setBulkNotepadText('');
                    setBulkStatus('draft');
                  }}
                  className="px-4 py-2 border border-slate-205 text-slate-555 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={parsedBulkQuestions.length === 0}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    parsedBulkQuestions.length > 0
                      ? 'bg-[#004f90] hover:bg-[#003c6e] text-white cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  }`}
                >
                  Create Test & Import {parsedBulkQuestions.length} Questions
                </button>
              </div>

            </form>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AdminDashboard;
