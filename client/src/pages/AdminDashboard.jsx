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
import api from '../utils/api.js';
import { parsePdfToText } from '../utils/pdfParser.js';
import { Calendar, Clock, Edit3, Trash2, Copy, HelpCircle, GraduationCap, Eye, FileSpreadsheet, PlusCircle, AlertCircle, AlertTriangle, RefreshCw, Upload, X, FileText } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const parseTextToQuestions = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const parsedQuestions = [];
  let currentQuestion = null;
  let lastLineWasOption = false;

  for (let line of lines) {
    const optMatch = line.match(/^([A-Da-d])[\s\.\)]+(.*)$/);
    
    if (optMatch) {
      if (currentQuestion) {
        const label = optMatch[1].toUpperCase();
        const optText = optMatch[2].trim();
        const opt = currentQuestion.options.find(o => o.label === label);
        if (opt) {
          opt.text = optText;
        }
      }
      lastLineWasOption = true;
    } else {
      const isNewQuestion = lastLineWasOption || !currentQuestion || line.match(/^(Question|Q)?\s*\d+[\s\.\)\-:]+/i) || line.toLowerCase().startsWith('question:');
      
      if (isNewQuestion) {
        if (currentQuestion && currentQuestion.questionText.trim()) {
          parsedQuestions.push(currentQuestion);
        }
        
        let cleanText = line.replace(/^(Question|Q)?\s*\d+[\s\.\)\-:]+/i, '').replace(/^question:\s*/i, '').trim();
        currentQuestion = {
          questionText: cleanText,
          options: [
            { label: 'A', text: '' },
            { label: 'B', text: '' },
            { label: 'C', text: '' },
            { label: 'D', text: '' }
          ],
          correctAnswer: 'A',
          marks: 1
        };
        lastLineWasOption = false;
      } else {
        if (currentQuestion) {
          currentQuestion.questionText += ' ' + line;
        }
      }
    }
  }

  if (currentQuestion && currentQuestion.questionText.trim()) {
    parsedQuestions.push(currentQuestion);
  }

  return parsedQuestions.filter(q => q.options[0].text !== '' || q.options[1].text !== '');
};

const AdminDashboard = ({ tab }) => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [activeTab, setActiveTab] = useState(tab || 'dashboard');
  const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(false);
  const [selectedTest, setSelectedTest] = useState(null);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [testToDelete, setTestToDelete] = useState(null);

  const [showBulkCreateModal, setShowBulkCreateModal] = useState(false);
  const [bulkTitle, setBulkTitle] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkDuration, setBulkDuration] = useState('30');
  const [bulkDept, setBulkDept] = useState('Computer Science');
  const [bulkYear, setBulkYear] = useState('3rd Year');
  const [bulkBatch, setBulkBatch] = useState('2023-2027');
  const [bulkNotepadText, setBulkNotepadText] = useState('');
  const [bulkStatus, setBulkStatus] = useState('draft');
  const [parsedBulkQuestions, setParsedBulkQuestions] = useState([]);

  const handleBulkFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    
    if (!isTxt && !isPdf) {
      return toast.error('Please upload a valid plain text (.txt) or PDF (.pdf) file.');
    }

    const loader = toast.loading('Reading file...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let text = '';
        if (isPdf) {
          toast.loading('Parsing PDF text content...', { id: loader });
          text = await parsePdfToText(event.target.result);
        } else {
          text = event.target.result;
        }

        setBulkNotepadText(text);
        const parsed = parseTextToQuestions(text);
        setParsedBulkQuestions(parsed);
        toast.success(`Successfully parsed ${parsed.length} questions from file.`, { id: loader });
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to parse file.', { id: loader });
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file.', { id: loader });
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
      return toast.error('Please fill out all required fields.');
    }

    if (parsedBulkQuestions.length === 0) {
      return toast.error('No questions parsed to import.');
    }

    for (let i = 0; i < parsedBulkQuestions.length; i++) {
      const q = parsedBulkQuestions[i];
      if (!q.questionText.trim()) {
        return toast.error(`Question #${i + 1} statement cannot be empty.`);
      }
      if (!q.options[0].text.trim() || !q.options[1].text.trim()) {
        return toast.error(`Question #${i + 1} must have at least Option A and Option B.`);
      }
      const correctOpt = q.options.find(o => o.label === q.correctAnswer);
      if (!correctOpt || !correctOpt.text.trim()) {
        return toast.error(`Question #${i + 1} has correct answer set to '${q.correctAnswer}', but that option has no text.`);
      }
    }

    const questionsPayload = parsedBulkQuestions.map(q => {
      const options = [
        { label: 'A', text: q.options.find(o => o.label === 'A')?.text.trim() || '' },
        { label: 'B', text: q.options.find(o => o.label === 'B')?.text.trim() || '' }
      ];
      const optC = q.options.find(o => o.label === 'C')?.text.trim();
      if (optC) options.push({ label: 'C', text: optC });
      const optD = q.options.find(o => o.label === 'D')?.text.trim();
      if (optD) options.push({ label: 'D', text: optD });
      return {
        questionText: q.questionText.trim(),
        options,
        correctAnswer: q.correctAnswer,
        marks: 1
      };
    });

    const calculatedTotalMarks = questionsPayload.length;
    const calculatedPassMark = Math.ceil(calculatedTotalMarks * 0.4);

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + 24 * 60 * 60 * 1000);

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
      showResultsToStudents: true
    };

    const loader = toast.loading('Creating test and uploading questions...');
    try {
      const { data } = await api.post('/tests/create', testPayload);
      const testId = data._id;

      await api.post(`/questions/sync/${testId}`, questionsPayload);

      toast.success('Bulk Test & Questions created successfully!', { id: loader });
      
      setBulkTitle('');
      setBulkSubject('');
      setBulkDuration('30');
      setBulkDept('Computer Science');
      setBulkYear('3rd Year');
      setBulkBatch('2023-2027');
      setBulkNotepadText('');
      setBulkStatus('draft');
      setParsedBulkQuestions([]);
      setShowBulkCreateModal(false);
      fetchTestsList();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to bulk publish test.', { id: loader });
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
      toast.error('Failed to update exam registries.');
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
      toast.success('Cloned successfully! New draft added.', { id: loader });
      fetchTestsList();
    } catch (err) {
      toast.error('Cloning failed.', { id: loader });
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
    
    const loader = toast.loading('Deleting exam sheet...');
    try {
      await api.delete(`/tests/${testId}`);
      toast.success('Test wiped successfully.', { id: loader });
      fetchTestsList();
    } catch (err) {
      toast.error('Failed to delete test.', { id: loader });
    } finally {
      setTestToDelete(null);
    }
  };

  if (loading || !isAuthenticated || (user?.role !== 'admin' && user?.role !== 'trainer')) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8fafc] space-y-4">
        <div className="h-12 w-12 border-4 border-[#004f90] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-medium font-sans">Securing faculty credentials...</p>
      </div>
    );
  }

  // Header titles mapping
  const getHeaderTitle = () => {
    switch(activeTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'students': return 'Student Management';
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
        <header className="bg-white border-b border-slate-100 h-16 w-full px-8 flex items-center justify-between shrink-0">
          <h3 className="text-base font-extrabold text-[#004f90] tracking-tight font-poppins capitalize">
            {getHeaderTitle()}
          </h3>

          <div className="flex items-center space-x-6">
            {/* Profile avatar with Dynamic Initials */}
            <div className="flex items-center space-x-3">
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-[#004f90] to-blue-500 text-white font-extrabold text-sm flex items-center justify-center border border-white shadow-sm shrink-0">
                {user?.name 
                  ? user.name.charAt(0).toUpperCase() 
                  : (user?.role === 'admin' ? 'A' : user?.role === 'trainer' ? 'T' : 'U')}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-slate-800 leading-none">
                  {user?.name || (user?.role === 'admin' ? 'Admin' : user?.role === 'trainer' ? 'Trainer' : 'Faculty')}
                </p>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5 uppercase leading-none">
                  {user?.role === 'admin' ? 'Admin' : user?.role === 'trainer' ? 'Trainer' : 'Faculty'}
                </p>
              </div>
            </div>
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

          {activeTab === 'tests' && (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-poppins">
                    Manage Assessments
                  </h2>
                  <p className="text-sm text-slate-500 font-medium">
                    Create, edit, duplicate, or configure exam papers and question cards.
                  </p>
                </div>
                
                <div className="flex items-center space-x-3 shrink-0">
                  <button
                    onClick={fetchTestsList}
                    className="border border-slate-200 text-slate-600 p-3 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
                    title="Refresh Tests List"
                  >
                    <RefreshCw className="h-4.5 w-4.5" />
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowBulkCreateModal(true)}
                    className="bg-white border border-slate-200 hover:border-[#004f90] hover:bg-slate-50 text-slate-700 font-bold px-5 py-3 rounded-xl text-sm shadow-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <Upload className="h-4 w-4 text-[#004f90]" />
                    <span>Bulk Import Test</span>
                  </button>

                  <button
                    onClick={() => {
                      setSelectedTest(null);
                      setActiveTab('create');
                    }}
                    className="bg-[#004f90] hover:bg-[#003c6e] text-white font-bold px-5 py-3 rounded-xl text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="h-4.5 w-4.5" />
                    <span>Create Test</span>
                  </button>
                </div>
              </div>

              {/* Tests list table inside beautiful white card */}
              <div className="bg-white border border-slate-100 shadow-md shadow-slate-100/50 rounded-[24px] p-6">
                {loadingTests ? (
                  <div className="py-20 text-center text-xs text-slate-400 font-semibold">Updating exam registries...</div>
                ) : tests.length === 0 ? (
                  <div className="py-16 text-center text-xs text-slate-400 space-y-2">
                    <AlertCircle className="h-10 w-10 text-slate-300 mx-auto" />
                    <p className="font-extrabold text-slate-800">Empty assessment catalog.</p>
                    <p className="text-[10px] text-slate-400 font-medium">Click "Create Test" above to build your first examination paper.</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                    <table className="w-full text-left text-base border-collapse">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 text-sm uppercase font-bold tracking-wider">
                          <th className="py-6 px-6">Subject</th>
                          <th className="py-6 px-6">Assessment Title</th>
                          <th className="py-6 px-6">Target Cohort</th>
                          <th className="py-6 px-6 text-center">Duration</th>
                          <th className="py-6 px-6 text-center">Marks</th>
                          <th className="py-6 px-6 text-center">Status</th>
                          <th className="py-6 px-6 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {tests.map((test) => (
                          <tr key={test._id} className="hover:bg-slate-50/30 transition-colors">
                            {/* Subject badge */}
                            <td className="py-6 px-6">
                              <span className="inline-block bg-blue-50 border border-blue-150 text-[#004f90] font-extrabold px-3.5 py-1.5 rounded-xl text-xs uppercase tracking-wider">
                                {test.subject}
                              </span>
                            </td>
                            {/* Title & Timing Window */}
                            <td className="py-6 px-6">
                              <p className="font-extrabold text-slate-800 text-lg tracking-tight leading-snug">{test.title}</p>
                              <p className="text-xs text-slate-500 font-semibold mt-1.5 flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span>Window: {new Date(test.startTime).toLocaleDateString()} {new Date(test.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })} - {new Date(test.endTime).toLocaleDateString()} {new Date(test.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</span>
                              </p>
                            </td>
                            {/* Assigned Cohorts - college view */}
                            <td className="py-6 px-6">
                              {test.assignedTo?.length > 0 ? (
                                <div className="flex flex-col gap-1.5 max-w-[280px]">
                                  {test.assignedTo.map((item, idx) => (
                                    <span key={idx} className="inline-block bg-slate-50 border border-slate-200/60 text-slate-655 font-bold text-xs px-3 py-1 rounded-lg shrink-0">
                                      {item.department} ({item.year}, Batch {item.batch})
                                    </span>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-red-500 font-bold text-xs uppercase tracking-wider">Unassigned</span>
                              )}
                            </td>
                            {/* Duration */}
                            <td className="py-6 px-6 text-center text-slate-700 font-bold text-base">{test.duration} min</td>
                            {/* Marks */}
                            <td className="py-6 px-6 text-center text-slate-850 font-extrabold text-base">
                              {test.totalMarks} <span className="text-xs text-slate-400 font-semibold block mt-0.5">({test.passMark} pass)</span>
                            </td>
                            {/* Status */}
                            <td className="py-6 px-6 text-center">
                              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                                test.status === 'active'
                                  ? 'bg-emerald-50 border-emerald-150 text-emerald-700'
                                  : test.status === 'ended'
                                  ? 'bg-red-50 border-red-150 text-red-700'
                                  : 'bg-amber-50 border-amber-150 text-amber-700'
                              }`}>
                                {test.status}
                              </span>
                            </td>
                            {/* Actions circular buttons */}
                            <td className="py-6 px-6 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                {/* Manage Questions */}
                                <button
                                  onClick={() => {
                                    setSelectedTest(test);
                                    setActiveTab('questions');
                                    setSearchParams({ subTab: 'questions', testId: test._id });
                                  }}
                                  title="Manage Exam Questions"
                                  className="p-2.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-full transition-colors border border-transparent hover:border-emerald-100 cursor-pointer"
                                >
                                  <HelpCircle className="h-5 w-5" />
                                </button>
                                
                                {/* View Results */}
                                <button
                                  onClick={() => {
                                    setSelectedTest(test);
                                    setActiveTab('results');
                                    setSearchParams({ subTab: 'results', testId: test._id });
                                  }}
                                  title="Review Submission Analytics"
                                  className="p-2.5 text-slate-400 hover:text-blue-650 hover:bg-blue-50 rounded-full transition-colors border border-transparent hover:border-blue-100 cursor-pointer"
                                >
                                  <Eye className="h-5 w-5" />
                                </button>

                                {/* Edit */}
                                <button
                                  onClick={() => {
                                    setSelectedTest(test);
                                    setActiveTab('edit');
                                    setSearchParams({ subTab: 'edit', testId: test._id });
                                  }}
                                  title="Modify Details"
                                  className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors border border-transparent hover:border-slate-200 cursor-pointer"
                                >
                                  <Edit3 className="h-5 w-5" />
                                </button>

                                {/* Duplicate */}
                                <button
                                  onClick={() => handleDuplicate(test._id)}
                                  title="Clone Test"
                                  className="p-2.5 text-slate-400 hover:text-purple-650 hover:bg-purple-50 rounded-full transition-colors border border-transparent hover:border-purple-100 cursor-pointer"
                                >
                                  <Copy className="h-5 w-5" />
                                </button>

                                {/* Delete */}
                                <button
                                  onClick={() => handleDelete(test._id)}
                                  title="Delete Assessment"
                                  className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors border border-transparent hover:border-red-100 cursor-pointer"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

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
                      placeholder="e.g. Computer Science"
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

                  {/* Status Selection */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Status</label>
                    <div className="relative">
                      <select
                        value={bulkStatus}
                        onChange={(e) => setBulkStatus(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-xl py-2.5 px-4 pr-10 text-slate-800 text-sm focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm"
                      >
                        <option value="draft">Draft (In Preparation)</option>
                        <option value="active">Active (Available for Candidates)</option>
                        <option value="ended">Ended (Completed/Closed)</option>
                      </select>
                      <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center px-1 text-slate-500">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>

                  <h4 className="text-xs font-bold text-[#004f90] uppercase tracking-wider pl-2 border-l-2 border-[#004f90] pt-2">
                    2. Target Cohort
                  </h4>

                  {/* Department */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Department</label>
                    <select
                      value={bulkDept}
                      onChange={(e) => setBulkDept(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none transition-all outline-none font-bold cursor-pointer"
                    >
                      <option value="Computer Science">Computer Science</option>
                      <option value="Information Technology">Information Technology</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Mechanical">Mechanical</option>
                    </select>
                  </div>

                  {/* Year */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Academic Year</label>
                    <select
                      value={bulkYear}
                      onChange={(e) => setBulkYear(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none transition-all outline-none font-bold cursor-pointer"
                    >
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>

                  {/* Batch */}
                  <div className="space-y-1.5 flex flex-col">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest pl-1">Academic Batch</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 2023-2027"
                      value={bulkBatch}
                      onChange={(e) => setBulkBatch(e.target.value)}
                      className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-xl py-2.5 px-4 text-slate-800 text-sm focus:outline-none transition-all outline-none font-semibold shadow-sm"
                    />
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
