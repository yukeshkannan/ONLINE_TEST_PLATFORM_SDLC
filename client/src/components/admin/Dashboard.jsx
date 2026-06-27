import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api.js';
import { FileText, Users, Award, FileSpreadsheet, Download, Clock, Trash2, AlertTriangle, ShieldAlert, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext.jsx';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/reports/dashboard');
        setData(response.data);
      } catch (err) {
        toast.error('Failed to load dashboard statistics.');
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const handleExportStudents = async () => {
    const loader = toast.loading('Generating student directory report...');
    try {
      const { data } = await api.get('/auth/students');
      if (data.length === 0) {
        toast.error('No student records found.', { id: loader });
        return;
      }
      
      const headers = ['Student Name', 'Register Number', 'Department', 'Year', 'Batch'];
      const csvRows = [
        headers.join(','),
        ...data.map(s => [
          `"${s.name}"`,
          `"${s.rollNumber}"`,
          `"${s.department}"`,
          `"${s.year}"`,
          `"${s.batch}"`
        ].join(','))
      ];
      
      const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.setAttribute('href', url);
      a.setAttribute('download', 'college_students_roster.csv');
      a.click();
      toast.success('Roster downloaded successfully!', { id: loader });
    } catch (err) {
      toast.error('Failed to export students.', { id: loader });
    }
  };

  const handleDeleteClick = (attempt) => {
    if (!attempt._id) return toast.error('Cannot identify this submission record.');
    setDeleteTarget({
      id: attempt._id,
      testTitle: attempt.testId?.title || 'Unknown Exam',
      studentName: attempt.studentId?.name || 'Unknown Student',
      rollNumber: attempt.studentId?.rollNumber || 'N/A'
    });
  };

  const confirmDeleteSubmission = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);

    const loadToastId = toast.loading('Deleting submission record...');
    try {
      await api.delete(`/results/${id}`);
      toast.success('Submission deleted successfully!', { id: loadToastId });
      // Refresh dashboard data (bypass cache)
      const response = await api.get('/reports/dashboard', { headers: { 'Cache-Control': 'no-cache' } });
      setData(response.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete submission.', { id: loadToastId });
    }
  };

  const handleExportSubmissions = (recentActivity) => {
    if (!recentActivity || recentActivity.length === 0) return toast.error('No exam submissions available to export.');
    
    const headers = ['Candidate Name', 'Roll Number', 'Department', 'Assessment Title', 'Score', 'Total Marks', 'Passed', 'Submitted At'];
    const csvRows = [
      headers.join(','),
      ...recentActivity.map(attempt => [
        `"${attempt.studentId?.name || 'N/A'}"`,
        `"${attempt.studentId?.rollNumber || 'N/A'}"`,
        `"${attempt.studentId?.department || 'N/A'}"`,
        `"${attempt.testId?.title || 'Unknown'}"`,
        attempt.score,
        attempt.totalMarks,
        attempt.passed ? 'Yes' : 'No',
        `"${new Date(attempt.submittedAt).toLocaleDateString()}"`
      ].join(','))
    ];

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'sdlc_exam_submissions_report.csv');
    a.click();
    toast.success('Submissions report downloaded successfully!');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-10 w-10 border-4 border-[#004f90] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-400 font-bold font-sans">Assembling Academic Registers...</p>
      </div>
    );
  }

  const { stats, recentActivity } = data || {
    stats: { totalTests: 0, totalStudents: 0, todaysAttempts: 0, overallPassRate: 0 },
    recentActivity: []
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans text-left pb-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-poppins">
            Welcome back, {user?.name || (user?.role === 'admin' ? 'Admin' : user?.role === 'trainer' ? 'Trainer' : 'User')}
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Monitor student registrations, test schedules, and performance logs for the online test platform.
          </p>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        
        {/* Total Exams Card */}
        <div 
          onClick={() => navigate('/admin/tests')}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-blue-300/80 hover:-translate-y-0.5 cursor-pointer transition-all duration-300 text-left flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Exams</span>
              <div className="p-2.5 bg-blue-50 text-[#004f90] rounded-xl">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
                {stats.totalTests}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400 font-medium">
            Active and draft test papers
          </div>
        </div>

        {/* Total Students Card */}
        <div 
          onClick={() => navigate('/admin/students')}
          className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-emerald-300/80 hover:-translate-y-0.5 cursor-pointer transition-all duration-300 text-left flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Students</span>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
                {stats.totalStudents}
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400 font-medium">
            Enrolled student accounts
          </div>
        </div>

        {/* Average Pass Rate Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-300 text-left flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Average Pass Rate</span>
              <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
                <Award className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-1">
              <span className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-sans tracking-tight">
                {stats.overallPassRate}%
              </span>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-400 font-medium">
            Overall student success rate
          </div>
        </div>

      </div>

      {/* Reports Center */}
      <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.008)] rounded-[20px] p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 pl-3 border-l-4 border-[#004f90] leading-none">
            Download Reports
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1.5 ml-3">Export system data directly to CSV format.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Student Roster Report */}
          <div className="border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl shrink-0">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="text-left space-y-0.5">
                <h4 className="font-bold text-slate-800 text-sm">Student Directory Report</h4>
                <p className="text-xs text-slate-400">Export student list with registration numbers and departments.</p>
              </div>
            </div>
            
            <button 
              onClick={handleExportStudents}
              disabled={stats.totalStudents === 0}
              className={`font-bold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center space-x-2 shrink-0 justify-center ${
                stats.totalStudents === 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-[#004f90] hover:bg-[#003c6e] text-white cursor-pointer'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>

          {/* Card 2: Exam Submission Report */}
          <div className="border border-slate-100 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/30 transition-all">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl shrink-0">
                <FileSpreadsheet className="h-6 w-6" />
              </div>
              <div className="text-left space-y-0.5">
                <h4 className="font-bold text-slate-800 text-sm">Exam Submissions Report</h4>
                <p className="text-xs text-slate-400">Export completed exam marks, durations, and pass/fail records.</p>
              </div>
            </div>
            
            <button 
              onClick={() => handleExportSubmissions(recentActivity)}
              disabled={!recentActivity || recentActivity.length === 0}
              className={`font-bold text-xs px-4 py-2.5 rounded-lg transition-all flex items-center space-x-2 shrink-0 justify-center ${
                !recentActivity || recentActivity.length === 0
                  ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
              }`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Recent Exam Submissions */}
      <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.008)] rounded-[20px] p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 pl-3 border-l-4 border-[#004f90] leading-none">
            Recent Exam Submissions
          </h2>
          <p className="text-xs text-slate-400 font-medium mt-1.5 ml-3">Live feed of completed tests turned in by students.</p>
        </div>

        <div className="overflow-x-auto border border-slate-100 rounded-xl">
          {recentActivity.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <Clock className="h-8 w-8 text-slate-200 mx-auto" />
              <p className="text-sm font-bold text-slate-500">No recent exam submissions found.</p>
              <p className="text-xs text-slate-400 font-medium">Submissions will appear here as students complete their exams.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                  <th className="py-4 px-5 font-bold">Exam Name</th>
                  <th className="py-4 px-5 font-bold">Candidate</th>
                  <th className="py-4 px-5 font-bold text-center">Score</th>
                  <th className="py-4 px-5 font-bold text-center">Status</th>
                  <th className="py-4 px-5 text-right">Time</th>
                  <th className="py-4 px-5 text-right"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentActivity.map((attempt) => (
                  <tr key={attempt._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-5 font-semibold text-slate-800">{attempt.testId?.title || 'Unknown'}</td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-slate-800">{attempt.studentId?.name || 'Unknown'}</div>
                      <div className="text-[10px] text-slate-400 font-medium font-mono uppercase">{attempt.studentId?.rollNumber || 'N/A'}</div>
                    </td>
                    <td className="py-4 px-5 text-center font-bold text-slate-800">{attempt.score} / {attempt.totalMarks} ({attempt.percentage}%)</td>
                    <td className="py-4 px-5 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-md font-bold text-[9px] uppercase ${
                        attempt.passed
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                          : 'bg-red-50 text-red-600 border border-red-100'
                      }`}>
                        {attempt.passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right text-slate-400 font-medium font-mono">
                      {new Date(attempt.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={() => handleDeleteClick(attempt)}
                        title="Delete this submission"
                        className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-100"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Custom Confirmation Modal for Deleting Recent Submission */}
      <AnimatePresence>
        {deleteTarget && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[2000] cursor-pointer"
            />
            {/* Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed inset-0 m-auto max-w-[420px] w-[90%] h-fit bg-white/95 backdrop-blur-[12px] rounded-3xl p-7 shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100/80 flex flex-col items-center text-center space-y-5 z-[2100]"
            >
              <div className="h-14 w-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100 shrink-0">
                <AlertTriangle className="h-7 w-7 text-red-500" />
              </div>
              <div className="space-y-2 w-full text-center">
                <h4 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Delete Submission?</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                  This will permanently delete the exam submission and proctoring violation logs for:
                </p>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 mt-2 text-center">
                  <p className="text-xs font-bold text-slate-850">{deleteTarget.studentName}</p>
                  <p className="text-[10px] text-slate-500 font-medium font-mono uppercase mt-0.5">{deleteTarget.rollNumber}</p>
                  <p className="text-[10px] text-[#004f90] font-bold mt-1">Test: {deleteTarget.testTitle}</p>
                </div>
                <p className="text-xs text-red-600 font-semibold mt-2.5 flex items-center justify-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                  <span>The student will be allowed to re-take the test from scratch.</span>
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  onClick={confirmDeleteSubmission}
                  className="flex-1 bg-red-600 hover:bg-red-750 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Delete Submission</span>
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 border border-slate-200 text-slate-655 font-semibold py-3 px-5 rounded-xl text-sm hover:bg-slate-50 transition-all cursor-pointer"
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

export default Dashboard;
