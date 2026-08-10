import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  FileText, Clock, Award, CheckCircle2, ChevronRight, 
  RefreshCw, ArrowRight, ShieldCheck, GraduationCap
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import ClockLoader from '../shared/ClockLoader.jsx';

const CollegeStudentDashboard = ({ onStartTest, onViewResult }) => {
  const { user, isAuthenticated } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available'); // 'available' | 'results'

  const fetchTests = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get('/tests');
      setTests(data || []);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error('Unable to retrieve assessments.');
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

  const now = new Date();

  // Active / Available Tests
  const activeTests = tests.filter((t) => {
    if (t.attempted) return false;
    const isPastEnd = t.endTime && now > new Date(t.endTime);
    if (isPastEnd && t.status !== 'active') return false;
    return true;
  });

  // Completed Tests
  const completedTests = tests.filter((t) => t.attempted);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-28">
        <ClockLoader size="md" color="#004f90" text="Loading assessments..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6 text-left font-sans">
      
      {/* ========================================================================= */}
      {/* 1. CLEAN COLLEGE STUDENT PROFILE HEADER                                   */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-5">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#004f90] bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1.5">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>College Portal</span>
            </span>
            {user?.department && (
              <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md">
                Dept: {user.department}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-poppins tracking-tight">
            Welcome, {user?.name}
          </h1>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
            <div>
              Roll Number: <strong className="text-slate-800 font-mono">{user?.rollNumber || 'N/A'}</strong>
            </div>
            {user?.year && (
              <div>
                Academic Year: <strong className="text-slate-800">{user.year}</strong>
              </div>
            )}
            {user?.batch && (
              <div>
                Batch: <strong className="text-slate-800">{user.batch}</strong>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={fetchTests}
          className="self-start sm:self-center flex items-center gap-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 px-3.5 py-2 rounded-xl transition cursor-pointer shrink-0"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#004f90]" />
          <span>Refresh</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. MINIMALIST SEGMENTED TABS                                              */}
      {/* ========================================================================= */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('available')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'available'
              ? 'border-[#004f90] text-[#004f90]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Available Exams</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'available' ? 'bg-blue-100 text-[#004f90]' : 'bg-slate-100 text-slate-600'
          }`}>
            {activeTests.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('results')}
          className={`pb-3 px-1 text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ml-4 ${
            activeTab === 'results'
              ? 'border-[#004f90] text-[#004f90]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <span>Past Submissions</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            activeTab === 'results' ? 'bg-blue-100 text-[#004f90]' : 'bg-slate-100 text-slate-600'
          }`}>
            {completedTests.length}
          </span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 3. TAB CONTENT: AVAILABLE TESTS                                           */}
      {/* ========================================================================= */}
      {activeTab === 'available' && (
        <div>
          {activeTests.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center space-y-3">
              <div className="h-12 w-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto text-slate-400">
                <CheckCircle2 className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-base font-bold text-slate-800">No Exams Scheduled</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                There are currently no active internal or semester examinations assigned to your department.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeTests.map((test) => (
                <div
                  key={test._id}
                  className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#004f90] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                        {test.subject || 'Engineering Subject'}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base font-bold text-slate-900 font-poppins">
                        {test.title}
                      </h3>
                      {test.description && (
                        <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                          {test.description}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">Duration</span>
                        <strong>{test.duration} mins</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">Questions</span>
                        <strong>{test.questions?.length || 0}</strong>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase block font-semibold">Pass Mark</span>
                        <strong>{test.passingMarks || 50}%</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 font-medium flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Proctored Exam</span>
                    </span>

                    <button
                      onClick={() => onStartTest(test)}
                      className="bg-[#004f90] hover:bg-[#003d70] text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-[0.98]"
                    >
                      <span>Start Exam</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TAB CONTENT: PAST RESULTS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'results' && (
        <div className="bg-white border border-slate-200/90 rounded-2xl shadow-2xs overflow-hidden">
          {completedTests.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />
              <h3 className="text-sm font-bold text-slate-700">No Past Submissions</h3>
              <p className="text-xs text-slate-400">You haven't completed any examinations yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-3.5 px-5">Examination Paper</th>
                    <th className="py-3.5 px-5">Subject</th>
                    <th className="py-3.5 px-5">Score</th>
                    <th className="py-3.5 px-5">Percentage</th>
                    <th className="py-3.5 px-5">Status</th>
                    <th className="py-3.5 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {completedTests.map((t) => {
                    const isPassed = t.passed || (t.userPercentage >= (t.passingMarks || 50));
                    return (
                      <tr key={t._id} className="hover:bg-slate-50/50 transition">
                        <td className="py-4 px-5">
                          <p className="font-bold text-slate-900 text-xs">{t.title}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {new Date(t.submittedAt || t.updatedAt || Date.now()).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                        </td>
                        <td className="py-4 px-5 text-slate-600 font-medium">
                          {t.subject || 'General'}
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-slate-800">
                          {t.userScore ?? t.score ?? '-'} / {t.totalMarks || t.questions?.length || '-'}
                        </td>
                        <td className="py-4 px-5 font-mono font-bold text-slate-800">
                          {t.userPercentage ?? t.percentage ?? 0}%
                        </td>
                        <td className="py-4 px-5">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                            isPassed 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}>
                            {isPassed ? 'PASSED' : 'FAILED'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => onViewResult(t.resultId || t._id)}
                            className="text-[#004f90] hover:text-[#003866] hover:bg-blue-50 font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>View Result</span>
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

    </div>
  );
};

export default CollegeStudentDashboard;
