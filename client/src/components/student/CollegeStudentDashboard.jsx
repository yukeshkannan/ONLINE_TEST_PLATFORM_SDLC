import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  GraduationCap, BookOpen, Clock, Award, Calendar, RefreshCw, 
  CheckCircle2, AlertCircle, ArrowRight, ShieldCheck, FileText, 
  ChevronRight, BarChart2, BookMarked, UserCheck, AlertTriangle, 
  CheckCircle, Sparkles, HelpCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ClockLoader from '../shared/ClockLoader.jsx';

const CollegeStudentDashboard = ({ onStartTest, onViewResult }) => {
  const { user, isAuthenticated } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'completed' | 'guidelines'

  const fetchTests = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get('/tests');
      setTests(data);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error('Unable to retrieve assigned department assessments.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchTests();
    }
  }, [isAuthenticated]);

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return 'Good Morning';
    if (hr < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const now = new Date();

  // Active / Available Assessments
  const activeTests = tests.filter((t) => {
    if (t.attempted) return false;
    const isPastEnd = t.endTime && now > new Date(t.endTime);
    if (isPastEnd && t.status !== 'active') return false;
    return true;
  });

  // Completed Assessments
  const completedTests = tests.filter((t) => t.attempted);

  // Performance calculations
  const totalCompleted = completedTests.length;
  const passedCount = completedTests.filter(t => t.passed || (t.userPercentage >= (t.passingMarks || 50))).length;
  const passRate = totalCompleted > 0 ? Math.round((passedCount / totalCompleted) * 100) : 0;
  
  const avgPercentage = totalCompleted > 0 
    ? Math.round(completedTests.reduce((acc, curr) => acc + (curr.userPercentage || 0), 0) / totalCompleted)
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <ClockLoader size="lg" color="#004f90" text="Loading college examination registry..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 font-sans text-left pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* ========================================================================= */}
      {/* 1. ACADEMIC HERO HEADER BANNER                                            */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#002f57] via-[#004f90] to-[#006bbd] rounded-3xl p-6 sm:p-9 text-white shadow-xl shadow-blue-900/10 border border-blue-800/40">
        
        {/* Subtle decorative watermark/grid */}
        <div 
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle, #ffffff 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest bg-white/15 backdrop-blur-md border border-white/20 px-3 py-1 rounded-full text-white inline-flex items-center gap-1.5 shadow-xs">
                <GraduationCap className="w-3.5 h-3.5" />
                <span>College Academic Portal</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-400/20 border border-blue-300/30 px-2.5 py-1 rounded-full text-blue-100">
                {user?.department || 'Department Exam Cell'}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-poppins tracking-tight text-white leading-tight">
              {getGreeting()}, <span className="text-sky-200">{user?.name}</span>
            </h1>

            {/* Academic Credentials Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-blue-100 font-medium pt-1">
              <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-slate-300 font-semibold">Roll No:</span>
                <span className="font-mono font-bold text-white tracking-wider">{user?.rollNumber || 'N/A'}</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-slate-300 font-semibold">Year & Batch:</span>
                <span className="font-bold text-white">{user?.year || '3rd Year'} ({user?.batch || '2023-2027'})</span>
              </div>

              <div className="bg-white/10 backdrop-blur-sm border border-white/15 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-slate-300 font-semibold">Dept:</span>
                <span className="font-bold text-white">{user?.department || 'CSE'}</span>
              </div>
            </div>
          </div>

          {/* Sync Button */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <button
              onClick={fetchTests}
              className="flex items-center gap-2 bg-white hover:bg-slate-50 text-[#004f90] px-4.5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-black/10 transition-all active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-[#004f90]" />
              <span>Sync Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. ACADEMIC PERFORMANCE SUMMARY TILES                                     */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Available Exams */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Scheduled Exams</span>
            <p className="text-3xl font-extrabold text-slate-900 font-poppins">{activeTests.length}</p>
            <span className="text-[11px] text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live & Upcoming
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#004f90]">
            <BookOpen className="h-6 w-6" />
          </div>
        </div>

        {/* Completed Exams */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed Papers</span>
            <p className="text-3xl font-extrabold text-slate-900 font-poppins">{completedTests.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">Evaluated Submissions</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Internal Avg Score */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Academic Score Avg</span>
            <p className="text-3xl font-extrabold text-slate-900 font-poppins">{avgPercentage}%</p>
            <span className="text-[11px] text-slate-500 font-medium">Cumulative Score</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <BarChart2 className="h-6 w-6" />
          </div>
        </div>

        {/* Semester Pass Rate */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Pass Rate</span>
            <p className="text-3xl font-extrabold text-slate-900 font-poppins">{passRate}%</p>
            <span className="text-[11px] text-slate-500 font-medium">{passedCount} of {totalCompleted} Cleared</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Award className="h-6 w-6" />
          </div>
        </div>

      </div>

      {/* ========================================================================= */}
      {/* 3. SECTION TABS CONTROLLER                                                */}
      {/* ========================================================================= */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex space-x-6 sm:space-x-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('available')}
            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'available'
                ? 'border-[#004f90] text-[#004f90]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <BookMarked className="w-4 h-4" />
            <span>Available Examinations</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'available' ? 'bg-blue-100 text-[#004f90]' : 'bg-slate-100 text-slate-600'
            }`}>
              {activeTests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'completed'
                ? 'border-[#004f90] text-[#004f90]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Past Exam Submissions</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'completed' ? 'bg-blue-100 text-[#004f90]' : 'bg-slate-100 text-slate-600'
            }`}>
              {completedTests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'guidelines'
                ? 'border-[#004f90] text-[#004f90]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Exam Rules & Guidelines</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB 1: AVAILABLE EXAMS                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'available' && (
        <div className="space-y-4">
          {activeTests.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-2xs">
              <div className="h-16 w-16 bg-blue-50 text-[#004f90] rounded-2xl flex items-center justify-center mx-auto border border-blue-100">
                <CheckCircle className="h-8 w-8 text-[#004f90]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-poppins">No Pending Department Exams</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                You are all caught up! There are currently no active internal or semester assessment papers assigned to your department cohort.
              </p>
              <button
                onClick={fetchTests}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Check for New Papers
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeTests.map((test) => (
                <motion.div
                  key={test._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white border border-slate-200 rounded-2xl p-6 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* Top Header */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider bg-blue-50 text-[#004f90] px-2.5 py-1 rounded-md border border-blue-100">
                        {test.subject || 'Engineering Subject'}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Now
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 font-poppins group-hover:text-[#004f90] transition-colors line-clamp-2">
                        {test.title}
                      </h3>
                      {test.description && (
                        <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                          {test.description}
                        </p>
                      )}
                    </div>

                    {/* Metadata Badges */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="w-4 h-4 text-slate-400" />
                        <span><strong>{test.duration}</strong> Minutes</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span><strong>{test.questions?.length || 0}</strong> Questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Award className="w-4 h-4 text-slate-400" />
                        <span><strong>{test.totalMarks || (test.questions?.length || 0)}</strong> Marks</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        <span>AI Proctoring</span>
                      </div>
                    </div>
                  </div>

                  {/* Start Exam Action */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 font-medium">
                      Passing: <strong className="text-slate-700">{test.passingMarks || 50}%</strong>
                    </div>

                    <button
                      onClick={() => onStartTest(test)}
                      className="bg-[#004f90] hover:bg-[#003c6e] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm shadow-blue-900/10 flex items-center gap-2 transition cursor-pointer active:scale-[0.98]"
                    >
                      <span>Enter Examination</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 2: COMPLETED EXAMS                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'completed' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          {completedTests.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <FileText className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No Evaluated Submissions Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Once you complete your assigned internal or semester tests, your marks and scorecards will be archived here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-5">Assessment Paper</th>
                    <th className="py-3.5 px-5">Subject</th>
                    <th className="py-3.5 px-5">Score Secured</th>
                    <th className="py-3.5 px-5">Percentage</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {completedTests.map((t) => {
                    const isPassed = t.passed || (t.userPercentage >= (t.passingMarks || 50));
                    return (
                      <tr key={t._id} className="hover:bg-slate-50/60 transition">
                        <td className="py-4 px-5">
                          <p className="font-bold text-slate-900 text-xs">{t.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{new Date(t.submittedAt || t.updatedAt || Date.now()).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-5 text-slate-600 font-semibold">
                          {t.subject || 'General'}
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-slate-800">
                          {t.userScore ?? t.score ?? '-'} / {t.totalMarks || t.questions?.length || '-'}
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-slate-800">
                          {t.userPercentage ?? t.percentage ?? 0}%
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isPassed ? 'PASSED' : 'NEEDS REVISION'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => onViewResult(t.resultId || t._id)}
                            className="text-[#004f90] hover:text-[#003866] hover:bg-blue-50 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Analysis</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 6. TAB 3: EXAM RULES & GUIDELINES                                         */}
      {/* ========================================================================= */}
      {activeTab === 'guidelines' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-poppins flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#004f90]" />
              <span>College Examination Board • Code of Conduct</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Please strictly adhere to the university and department online examination regulations before starting any test paper.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#004f90]" />
                <span>Proctored Environment</span>
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                Assessments require continuous fullscreen operation. Do not switch tabs, minimize the browser, or open unauthorized applications during test execution.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-[#004f90]" />
                <span>Timer & Auto-Submission</span>
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                The assessment timer counts down automatically. In the event of timer expiry, your marked answers will be submitted immediately without data loss.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Violation Logs</span>
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                All suspicious actions, window blurs, and keypress attempts (e.g., Ctrl+C, Ctrl+V, Alt+Tab) are logged and reported directly to the Faculty Admin.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Score Release & Evaluation</span>
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                Objective MCQ scores and performance breakdowns are calculated instantly upon submission and accessible under your Past Exam Submissions tab.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default CollegeStudentDashboard;
