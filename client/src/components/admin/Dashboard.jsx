import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { 
  FileText, Users, Award, Download, Clock, Trash2, AlertTriangle, X, 
  ChevronDown, Check, GraduationCap, BookOpen, FileSpreadsheet, Eye, 
  Search, ChevronLeft, ChevronRight, Filter, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [allTestsList, setAllTestsList] = useState([]);
  
  // Track Filter: 'all' | 'college' | 'institute'
  const [selectedTrack, setSelectedTrack] = useState('all');

  // Export Specific Test Modal states
  const [showExportTestModal, setShowExportTestModal] = useState(false);
  const [exportTestId, setExportTestId] = useState('all');

  // Export Student Directory Modal states
  const [showExportStudentModal, setShowExportStudentModal] = useState(false);
  const [exportStudentCategory, setExportStudentCategory] = useState('all');
  const [exportDept, setExportDept] = useState('all');

  // Delete submission target
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Departments list for filter
  const depts = ['ALL', 'CSE', 'ECE', 'MECH', 'EEE', 'IT', 'CIVIL', 'AI&DS'];

  // All Submissions Modal states
  const [showAllRecordsModal, setShowAllRecordsModal] = useState(false);
  const [allSubmissionsList, setAllSubmissionsList] = useState([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [recordsSearch, setRecordsSearch] = useState('');
  const [recordsCategoryFilter, setRecordsCategoryFilter] = useState('all');
  const [recordsStatusFilter, setRecordsStatusFilter] = useState('all');
  const [recordsPage, setRecordsPage] = useState(1);
  const recordsPerPage = 10;

  useEffect(() => {
    fetchDashboardData();
    fetchTestsList();
    fetchAllSubmissions();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/reports/dashboard');
      setData(response.data);
    } catch (err) {
      toast.error('Unable to load system statistics.');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestsList = async () => {
    try {
      const { data } = await api.get('/tests');
      setAllTestsList(data || []);
    } catch (err) {}
  };

  const fetchAllSubmissions = async () => {
    setLoadingSubmissions(true);
    try {
      const { data } = await api.get('/reports/submissions');
      setAllSubmissionsList(data || []);
    } catch (err) {
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Perform specific test export
  const confirmExportSpecificTest = async () => {
    const loader = toast.loading('Compiling test assessment results...');
    try {
      const { data: allSubmissions } = await api.get('/reports/submissions');
      
      if (!allSubmissions || allSubmissions.length === 0) {
        return toast.error('No exam submissions available to export.', { id: loader });
      }

      let filteredSubmissions = allSubmissions;
      if (exportTestId !== 'all') {
        filteredSubmissions = allSubmissions.filter(s => s.testId && s.testId._id === exportTestId);
      }

      if (filteredSubmissions.length === 0) {
        return toast.error('No submissions found for the selected test assessment.', { id: loader });
      }

      const selectedTestObj = allTestsList.find(t => t._id === exportTestId);
      const testTitleName = selectedTestObj ? selectedTestObj.title : 'All_Assessments';

      const headers = ['Candidate Name', 'Roll / Enrollment ID', 'Department / Track', 'Year', 'Assessment Title', 'Subject', 'Score', 'Total Marks', 'Percentage %', 'Result Status', 'Submitted At'];
      const csvRows = [
        headers.join(','),
        ...filteredSubmissions.map(attempt => [
          `"${attempt.studentId?.name || 'N/A'}"`,
          `"${attempt.studentId?.rollNumber || attempt.studentId?.enrollmentId || 'N/A'}"`,
          `"${attempt.studentId?.department || attempt.studentId?.courseTrack || 'N/A'}"`,
          `"${attempt.studentId?.year || 'N/A'}"`,
          `"${attempt.testId?.title || 'Unknown'}"`,
          `"${attempt.testId?.subject || 'N/A'}"`,
          attempt.score,
          attempt.totalMarks,
          `${attempt.percentage || 0}%`,
          attempt.passed ? 'PASSED' : 'FAILED',
          `"${new Date(attempt.submittedAt).toLocaleString()}"`
        ].join(','))
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      const safeFilename = testTitleName.toLowerCase().replace(/[^a-z0-9]+/g, '_');
      a.setAttribute('download', `results_${safeFilename}_${new Date().toISOString().slice(0, 10)}.csv`);
      a.click();
      
      setShowExportTestModal(false);
      toast.success(`Exported ${filteredSubmissions.length} candidate results successfully.`, { id: loader });
    } catch (err) {
      toast.error('Failed to compile test results report.', { id: loader });
    }
  };

  // Export full submissions list
  const exportSubmissionsToCsv = (customList = null) => {
    const listToExport = customList || allSubmissionsList;
    if (listToExport.length === 0) return toast.error('No submission records to export.');

    const headers = ['Candidate Name', 'Category', 'Roll / Enrollment ID', 'Department / Track', 'Year / Branch', 'Assessment Title', 'Subject', 'Score', 'Total Marks', 'Percentage %', 'Result Status', 'Submitted At'];
    const csvRows = [
      headers.join(','),
      ...listToExport.map(attempt => [
        `"${attempt.studentId?.name || 'N/A'}"`,
        `"${attempt.studentId?.studentType === 'institute' ? 'SDLC Institute' : 'College'}"`,
        `"${attempt.studentId?.rollNumber || attempt.studentId?.enrollmentId || 'N/A'}"`,
        `"${attempt.studentId?.department || attempt.studentId?.courseTrack || 'N/A'}"`,
        `"${attempt.studentId?.studentType === 'institute' ? (attempt.studentId?.center || 'Karur') : (attempt.studentId?.year || 'N/A')}"`,
        `"${attempt.testId?.title || 'Unknown'}"`,
        `"${attempt.testId?.subject || 'N/A'}"`,
        attempt.score,
        attempt.totalMarks,
        `${attempt.percentage || 0}%`,
        attempt.passed ? 'PASSED' : 'FAILED',
        `"${new Date(attempt.submittedAt).toLocaleString()}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', `all_exam_submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    a.click();
    toast.success(`Exported ${listToExport.length} submission records.`);
  };

  // Perform candidate directory export
  const confirmExportStudents = async () => {
    const loader = toast.loading('Generating candidate roster report...');
    try {
      const { data: allStudents } = await api.get('/auth/students');
      if (!allStudents || allStudents.length === 0) {
        toast.error('No candidate records found.', { id: loader });
        return;
      }

      let filteredStudents = allStudents;
      if (exportStudentCategory === 'college') {
        filteredStudents = allStudents.filter(s => s.studentType !== 'institute');
      } else if (exportStudentCategory === 'institute') {
        filteredStudents = allStudents.filter(s => s.studentType === 'institute');
      }

      if (exportDept !== 'all' && exportDept !== 'ALL') {
        filteredStudents = filteredStudents.filter(s => s.department === exportDept || s.courseTrack === exportDept);
      }

      if (filteredStudents.length === 0) {
        return toast.error('No candidates match the selected export filter.', { id: loader });
      }

      const headers = ['Candidate Name', 'Category', 'Roll / Enrollment ID', 'Department / Track', 'Batch', 'Year', 'Email Address'];
      const csvRows = [
        headers.join(','),
        ...filteredStudents.map(s => [
          `"${s.name}"`,
          `"${s.studentType === 'institute' ? 'SDLC Institute' : 'College'}"`,
          `"${s.rollNumber || s.enrollmentId || 'N/A'}"`,
          `"${s.department || s.courseTrack || 'N/A'}"`,
          `"${s.batch || 'N/A'}"`,
          `"${s.year || 'N/A'}"`,
          `"${s.email}"`
        ].join(','))
      ];

      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', `candidates_roster_${exportStudentCategory}_${new Date().toISOString().slice(0, 10)}.csv`);
      a.click();
      
      setShowExportStudentModal(false);
      toast.success(`Exported ${filteredStudents.length} candidate records successfully.`, { id: loader });
    } catch (err) {
      toast.error('Failed to export candidate roster.', { id: loader });
    }
  };

  const handleDeleteClick = (attempt) => {
    if (!attempt._id) return toast.error('Unable to identify submission record ID.');
    setDeleteTarget({
      id: attempt._id,
      testTitle: attempt.testId?.title || 'Unknown Exam',
      studentName: attempt.studentId?.name || 'Unknown Student',
      rollNumber: attempt.studentId?.rollNumber || attempt.studentId?.enrollmentId || 'N/A'
    });
  };

  const confirmDeleteSubmission = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);

    const loadToastId = toast.loading('Deleting submission record...');
    try {
      await api.delete(`/results/${id}`);
      toast.success('Submission record deleted successfully.', { id: loadToastId });
      fetchDashboardData();
      fetchAllSubmissions();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete submission record.', { id: loadToastId });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4 font-sans">
        <div className="h-8 w-8 border-3 border-[#004f90] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-semibold">Loading platform telemetry...</p>
      </div>
    );
  }

  const { recentActivity = [] } = data || {};

  // Dynamic metrics computed based on selectedTrack
  const currentMetrics = {
    totalTests: selectedTrack === 'college' 
      ? (data?.collegeStats?.totalTests ?? 0) 
      : selectedTrack === 'institute' 
      ? (data?.instituteStats?.totalTests ?? 0) 
      : (data?.stats?.totalTests ?? 0),
    totalStudents: selectedTrack === 'college' 
      ? (data?.collegeStats?.totalStudents ?? 0) 
      : selectedTrack === 'institute' 
      ? (data?.instituteStats?.totalStudents ?? 0) 
      : (data?.stats?.totalStudents ?? 0),
    todaysAttempts: selectedTrack === 'college' 
      ? (data?.collegeStats?.todaysAttempts ?? 0) 
      : selectedTrack === 'institute' 
      ? (data?.instituteStats?.todaysAttempts ?? 0) 
      : (data?.stats?.todaysAttempts ?? 0),
    overallPassRate: selectedTrack === 'college' 
      ? (data?.collegeStats?.overallPassRate ?? 0) 
      : selectedTrack === 'institute' 
      ? (data?.instituteStats?.overallPassRate ?? 0) 
      : (data?.stats?.overallPassRate ?? 0),
  };

  // Filter recent activity based on selectedTrack
  const filteredRecentActivity = recentActivity.filter(attempt => {
    if (selectedTrack === 'college') {
      return attempt.studentId?.studentType !== 'institute';
    } else if (selectedTrack === 'institute') {
      return attempt.studentId?.studentType === 'institute';
    }
    return true;
  });

  // Filter all submissions for the modal
  const filteredAllSubmissions = allSubmissionsList.filter(attempt => {
    const stType = attempt.studentId?.studentType || 'college';
    if (recordsCategoryFilter === 'college' && stType === 'institute') return false;
    if (recordsCategoryFilter === 'institute' && stType !== 'institute') return false;

    if (recordsStatusFilter === 'passed' && !attempt.passed) return false;
    if (recordsStatusFilter === 'failed' && attempt.passed) return false;

    if (recordsSearch.trim()) {
      const q = recordsSearch.toLowerCase();
      const name = (attempt.studentId?.name || '').toLowerCase();
      const email = (attempt.studentId?.email || '').toLowerCase();
      const roll = (attempt.studentId?.rollNumber || attempt.studentId?.enrollmentId || '').toLowerCase();
      const testName = (attempt.testId?.title || '').toLowerCase();
      const dept = (attempt.studentId?.department || attempt.studentId?.courseTrack || '').toLowerCase();
      return name.includes(q) || email.includes(q) || roll.includes(q) || testName.includes(q) || dept.includes(q);
    }
    return true;
  });

  const totalRecordPages = Math.ceil(filteredAllSubmissions.length / recordsPerPage) || 1;
  const paginatedRecords = filteredAllSubmissions.slice(
    (recordsPage - 1) * recordsPerPage,
    recordsPage * recordsPerPage
  );

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-left pb-8">
      
      {/* Title Header & Track Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight font-poppins">
            System Telemetry & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            {selectedTrack === 'college' && 'Filtered to College Engineering Departments & Academic Programs.'}
            {selectedTrack === 'institute' && 'Filtered to SDLC Training Institute Centers & Skill Tracks.'}
            {selectedTrack === 'all' && 'Combined real-time statistics across College & SDLC Institute.'}
          </p>
        </div>

        {/* Track Segmented Control */}
        <div className="bg-slate-100/80 p-1 rounded-xl border border-slate-200 flex items-center gap-1 self-start md:self-auto">
          <button
            onClick={() => setSelectedTrack('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
              selectedTrack === 'all'
                ? 'bg-white text-slate-900 shadow-2xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Telemetry
          </button>
          <button
            onClick={() => setSelectedTrack('college')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              selectedTrack === 'college'
                ? 'bg-[#004f90] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>College Track</span>
          </button>
          <button
            onClick={() => setSelectedTrack('institute')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              selectedTrack === 'institute'
                ? 'bg-[#F7931A] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>SDLC Track</span>
          </button>
        </div>
      </div>

      {/* Dynamic Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Assessments */}
        <div 
          onClick={() => navigate('/admin/tests')}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {selectedTrack === 'college' ? 'College Assessments' : selectedTrack === 'institute' ? 'SDLC Assessments' : 'Active Assessments'}
            </span>
            <FileText className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 font-poppins">{currentMetrics.totalTests}</span>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {selectedTrack === 'college' ? 'Department exams' : selectedTrack === 'institute' ? 'Institute skill exams' : 'Active and draft test papers'}
            </p>
          </div>
        </div>

        {/* Registered Candidates */}
        <div 
          onClick={() => navigate('/admin/students')}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:shadow-xs transition cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {selectedTrack === 'college' ? 'College Students' : selectedTrack === 'institute' ? 'SDLC Candidates' : 'Registered Candidates'}
            </span>
            <Users className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 font-poppins">{currentMetrics.totalStudents}</span>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">
              {selectedTrack === 'college' ? 'College roster count' : selectedTrack === 'institute' ? 'Institute enrolled count' : 'Enrolled student accounts'}
            </p>
          </div>
        </div>

        {/* Today's Attempts */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Today's Attempts</span>
            <Clock className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 font-poppins">{currentMetrics.todaysAttempts}</span>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Exams turned in today</p>
          </div>
        </div>

        {/* Overall Pass Rate */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              {selectedTrack === 'college' ? 'College Pass Rate' : selectedTrack === 'institute' ? 'SDLC Pass Rate' : 'Overall Pass Rate'}
            </span>
            <Award className="h-4 w-4 text-slate-400" />
          </div>
          <div className="mt-3">
            <span className="text-3xl font-extrabold text-slate-900 font-poppins">{currentMetrics.overallPassRate}%</span>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Evaluation success percentage</p>
          </div>
        </div>

      </div>

      {/* Reports Export Hub */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-[#004f90]" />
            <span>Reports Export Control</span>
          </h3>
          <p className="text-xs text-slate-500 font-medium">Export specific test assessment scores or filtered candidate rosters.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Card 1: Specific Test Export */}
          <div className="border border-slate-200 rounded-xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Test Assessment Results</h4>
              <p className="text-xs text-slate-500 font-medium">Export specific exam marks, candidate scores, and pass/fail records.</p>
            </div>
            
            <button 
              onClick={() => setShowExportTestModal(true)}
              className="bg-[#004f90] hover:bg-[#003c6e] text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Test Marks</span>
            </button>
          </div>

          {/* Card 2: Student Directory Export */}
          <div className="border border-slate-200 rounded-xl p-4.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-50/50">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-800 text-xs sm:text-sm">Student Directory Roster</h4>
              <p className="text-xs text-slate-500 font-medium">Export candidate list filtered by College Department or SDLC Track.</p>
            </div>
            
            <button 
              onClick={() => setShowExportStudentModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Candidates</span>
            </button>
          </div>

        </div>
      </div>

      {/* Recent Submissions Feed */}
      <div className="bg-white border border-slate-200 shadow-2xs rounded-xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#004f90]" />
              <span>Recent Exam Submissions</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Live feed of test submissions turned in by candidates.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-md">
              Showing {filteredRecentActivity.length} submissions
            </span>
            <button
              onClick={() => {
                setShowAllRecordsModal(true);
                fetchAllSubmissions();
              }}
              className="bg-white hover:bg-slate-50 text-[#004f90] border border-[#004f90]/30 hover:border-[#004f90] px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-[#004f90]" />
              <span>View All Records ({allSubmissionsList.length})</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200/80 rounded-lg">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                <th className="py-3 px-4">Candidate Details</th>
                <th className="py-3 px-4">Category & Track</th>
                <th className="py-3 px-4">Test Title</th>
                <th className="py-3 px-4">Score</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecentActivity.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-semibold text-xs">
                    No recent test submissions logged for this view.
                  </td>
                </tr>
              ) : (
                filteredRecentActivity.map((attempt) => {
                  const isInst = attempt.studentId?.studentType === 'institute';
                  return (
                    <tr key={attempt._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-left">
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-800 text-xs">{attempt.studentId?.name || 'Unknown Student'}</p>
                          <p className="text-[10px] font-mono text-slate-400">{attempt.studentId?.rollNumber || attempt.studentId?.enrollmentId || attempt.studentId?.email || 'N/A'}</p>
                        </div>
                      </td>

                      <td className="py-3 px-4 text-left">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isInst ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-[#004f90] border border-blue-200'
                        }`}>
                          {isInst ? `SDLC (${attempt.studentId?.center || 'Karur'})` : `College (${attempt.studentId?.department || 'CSE'})`}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-left font-semibold text-slate-700">
                        {attempt.testId?.title || 'Assessment Exam'}
                      </td>

                      <td className="py-3 px-4 text-left font-mono font-bold text-slate-800">
                        {attempt.score} / {attempt.totalMarks} <span className="text-slate-400 text-[10px]">({attempt.percentage}%)</span>
                      </td>

                      <td className="py-3 px-4 text-left">
                        <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                          attempt.passed
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {attempt.passed ? 'PASSED' : 'FAILED'}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDeleteClick(attempt)}
                          className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-md transition cursor-pointer"
                          title="Delete submission record"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Export Specific Test Modal */}
      <AnimatePresence>
        {showExportTestModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportTestModal(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 m-auto max-w-md h-fit bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 z-[2100] text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
                  <Download className="w-4 h-4 text-[#004f90]" />
                  <span>Export Test Results</span>
                </h4>
                <button 
                  onClick={() => setShowExportTestModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-500 font-medium leading-relaxed">
                  Select whether to export results for all test assessments combined or a specific test exam.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Select Test Assessment *
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={exportTestId}
                      onChange={(e) => setExportTestId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl h-10 pl-3.5 pr-10 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                    >
                      <option value="all">📊 All Test Assessments (Combined)</option>
                      {allTestsList.map(t => (
                        <option key={t._id} value={t._id}>📝 {t.title} ({t.subject})</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowExportTestModal(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-4 py-2 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExportSpecificTest}
                  className="bg-[#004f90] hover:bg-[#003c6e] text-white rounded-lg px-5 py-2 font-semibold text-xs transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Report</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Export Student Directory Modal */}
      <AnimatePresence>
        {showExportStudentModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowExportStudentModal(false)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 m-auto max-w-md h-fit bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-4 z-[2100] text-left"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h4 className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
                  <Download className="w-4 h-4 text-emerald-600" />
                  <span>Export Candidate Directory</span>
                </h4>
                <button 
                  onClick={() => setShowExportStudentModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <p className="text-slate-500 font-medium leading-relaxed">
                  Choose candidate category and department filters for exporting the roster CSV.
                </p>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Candidate Classification *
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={exportStudentCategory}
                      onChange={(e) => setExportStudentCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl h-10 pl-3.5 pr-10 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                    >
                      <option value="all">👥 All Enrolled Candidates</option>
                      <option value="college">🎓 College Students Only</option>
                      <option value="institute">🚀 SDLC Institute Students Only</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                  </div>
                </div>

                {exportStudentCategory === 'college' && (
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      Department Filter *
                    </label>
                    <div className="relative flex items-center">
                      <select
                        value={exportDept}
                        onChange={(e) => setExportDept(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-600 rounded-xl h-10 pl-3.5 pr-10 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                      >
                        {depts.map(d => (
                          <option key={d} value={d}>{d === 'ALL' ? 'All College Departments' : d}</option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setShowExportStudentModal(false)}
                  className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-4 py-2 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmExportStudents}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-5 py-2 font-semibold text-xs transition cursor-pointer shadow-2xs flex items-center gap-1.5"
                >
                  <Download className="h-4 w-4" />
                  <span>Download Candidates</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete Submission Confirmation Modal */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-0 m-auto max-w-sm h-fit bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 flex flex-col items-center text-center space-y-4 z-[2100]"
            >
              <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100 shrink-0">
                <AlertTriangle className="h-6 w-6 text-rose-600" />
              </div>
              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-slate-900 font-poppins">Delete Submission Log?</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Delete exam submission for <span className="font-bold text-slate-800">{deleteTarget.studentName}</span> in <span className="font-bold text-slate-800">{deleteTarget.testTitle}</span>?
                </p>
              </div>
              <div className="flex items-center gap-2.5 w-full pt-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg py-2 font-semibold text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteSubmission}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg py-2 font-semibold text-xs transition cursor-pointer shadow-2xs"
                >
                  Delete Record
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* All Examination Submission Records Log Modal */}
      <AnimatePresence>
        {showAllRecordsModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAllRecordsModal(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="fixed inset-4 sm:inset-8 md:inset-12 m-auto max-w-5xl max-h-[90vh] bg-white rounded-2xl shadow-2xl border border-slate-200 z-[2100] flex flex-col text-left overflow-hidden"
            >
              {/* Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                <div className="space-y-0.5">
                  <h3 className="text-base sm:text-lg font-bold text-slate-900 font-poppins flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#004f90]" />
                    <span>All Examination Submission Records</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Comprehensive log of all candidate test completions and evaluations ({filteredAllSubmissions.length} total records).
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => exportSubmissionsToCsv(filteredAllSubmissions)}
                    disabled={filteredAllSubmissions.length === 0}
                    className="bg-[#004f90] hover:bg-[#003c6e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold shadow-2xs transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download CSV ({filteredAllSubmissions.length})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowAllRecordsModal(false)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="p-4 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shrink-0">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search candidate name, email, roll number, test title, department..."
                    value={recordsSearch}
                    onChange={(e) => { setRecordsSearch(e.target.value); setRecordsPage(1); }}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-xl pl-9 pr-3.5 py-2 text-xs text-slate-800 outline-none"
                  />
                </div>

                {/* Filters */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="relative flex items-center">
                    <select
                      value={recordsCategoryFilter}
                      onChange={(e) => { setRecordsCategoryFilter(e.target.value); setRecordsPage(1); }}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-8 h-9 focus:outline-none focus:border-[#004f90] cursor-pointer appearance-none"
                    >
                      <option value="all">All Categories</option>
                      <option value="college">College Students</option>
                      <option value="institute">SDLC Institute</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>

                  <div className="relative flex items-center">
                    <select
                      value={recordsStatusFilter}
                      onChange={(e) => { setRecordsStatusFilter(e.target.value); setRecordsPage(1); }}
                      className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl pl-3 pr-8 h-9 focus:outline-none focus:border-[#004f90] cursor-pointer appearance-none"
                    >
                      <option value="all">All Statuses</option>
                      <option value="passed">Passed Only</option>
                      <option value="failed">Failed Only</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>

                  <button
                    type="button"
                    onClick={fetchAllSubmissions}
                    title="Refresh submission records"
                    className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition cursor-pointer border border-slate-200"
                  >
                    <RefreshCw className={`w-4 h-4 ${loadingSubmissions ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Table Container */}
              <div className="flex-1 overflow-y-auto overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 bg-slate-50 z-10">
                    <tr className="border-b border-slate-200 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                      <th className="py-3 px-3 text-center w-12">S.NO</th>
                      <th className="py-3 px-4">Candidate Details</th>
                      <th className="py-3 px-4">Category & Department</th>
                      <th className="py-3 px-4">Test Title & Subject</th>
                      <th className="py-3 px-4">Score / Marks</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Submitted At</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAllSubmissions.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="py-16 text-center text-slate-400 font-semibold text-xs">
                          {loadingSubmissions ? 'Fetching submissions list...' : 'No matching submission records found.'}
                        </td>
                      </tr>
                    ) : (
                      paginatedRecords.map((attempt, index) => {
                        const serialNo = (recordsPage - 1) * recordsPerPage + index + 1;
                        const isInst = attempt.studentId?.studentType === 'institute';
                        return (
                          <tr key={attempt._id} className="hover:bg-slate-50/70 transition-colors">
                            <td className="py-3 px-3 text-center font-mono text-slate-400 font-semibold text-xs">
                              {String(serialNo).padStart(2, '0')}
                            </td>

                            <td className="py-3 px-4 text-left">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-900 text-xs">
                                  {attempt.studentId?.name || 'Unknown Candidate'}
                                </p>
                                <p className="text-[11px] text-slate-400 font-mono">
                                  {attempt.studentId?.rollNumber || attempt.studentId?.enrollmentId || attempt.studentId?.email || 'N/A'}
                                </p>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-left">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                isInst ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-blue-50 text-[#004f90] border border-blue-200'
                              }`}>
                                {isInst 
                                  ? `SDLC: ${attempt.studentId?.center || 'Karur'} (${attempt.studentId?.courseTrack || 'Track'})`
                                  : `College: ${attempt.studentId?.department || 'CSE'} (${attempt.studentId?.batch || attempt.studentId?.year || 'Batch'})`
                                }
                              </span>
                            </td>

                            <td className="py-3 px-4 text-left">
                              <div className="space-y-0.5">
                                <p className="font-semibold text-slate-800 text-xs">
                                  {attempt.testId?.title || 'Assessment Exam'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  {attempt.testId?.subject || 'General'}
                                </p>
                              </div>
                            </td>

                            <td className="py-3 px-4 text-left font-mono font-bold text-slate-800">
                              {attempt.score} / {attempt.totalMarks} 
                              <span className="text-slate-400 text-[10px] ml-1 font-sans">
                                ({attempt.percentage}%)
                              </span>
                            </td>

                            <td className="py-3 px-4 text-left">
                              <span className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] uppercase tracking-wider ${
                                attempt.passed
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 border border-rose-200'
                              }`}>
                                {attempt.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </td>

                            <td className="py-3 px-4 text-left text-slate-500 text-[11px] font-medium whitespace-nowrap">
                              {new Date(attempt.submittedAt).toLocaleString('en-IN', {
                                day: '2-digit',
                                month: 'short',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </td>

                            <td className="py-3 px-4 text-right">
                              <button
                                onClick={() => handleDeleteClick(attempt)}
                                className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 p-1.5 rounded-md transition cursor-pointer"
                                title="Delete submission record"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Footer */}
              {totalRecordPages > 1 && (
                <div className="px-6 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500 shrink-0">
                  <span>Page {recordsPage} of {totalRecordPages}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setRecordsPage(p => Math.max(1, p - 1))}
                      disabled={recordsPage === 1}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setRecordsPage(p => Math.min(totalRecordPages, p + 1))}
                      disabled={recordsPage === totalRecordPages}
                      className="p-1.5 rounded-lg border border-slate-200 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Dashboard;
