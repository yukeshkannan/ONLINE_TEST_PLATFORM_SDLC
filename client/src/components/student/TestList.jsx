import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Calendar, Clock, Award, BookOpen, AlertCircle, RefreshCw, ArrowRight, CheckCircle2, ChevronRight, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const TestList = ({ onStartTest, onViewResult }) => {
  const { user, isAuthenticated } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchTests = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get('/tests');
      setTests(data);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error('Failed to retrieve test assignments.');
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

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-5">
        <div className="h-14 w-14 border-4 border-[#004f90] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-base text-slate-500 font-bold font-sans">Loading assessment schedule...</p>
      </div>
    );
  }

  const now = new Date();
  
  const activeTests = tests.filter((t) => {
    const isStatusActive = t.status === 'active';
    const isWithinWindow = now >= new Date(t.startTime) && now <= new Date(t.endTime);
    return isStatusActive && isWithinWindow && !t.attempted;
  });
  
  const completedTests = tests.filter((t) => t.attempted);
  
  const endedTests = tests.filter((t) => {
    const hasEndedStatus = t.status === 'ended';
    const isPastWindow = now > new Date(t.endTime);
    return (hasEndedStatus || isPastWindow) && !t.attempted;
  });

  return (
    <div className="space-y-8 py-8 font-sans text-left pb-16">
      
      {/* Redesigned Hero Welcome Section */}
      <div className="relative overflow-hidden bg-white border border-slate-100 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
        <div className="absolute inset-0 grid-texture opacity-60 pointer-events-none"></div>
        <div className="relative z-10 space-y-2.5">
          <span className="text-[10px] text-[#004f90] font-black uppercase tracking-widest bg-[#004f90]/10 border border-[#004f90]/20 px-3.5 py-1.5 rounded-full inline-block">
            Student Portal Hub
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 font-poppins tracking-tight mt-1 leading-none">
            {getGreeting()}, <span className="text-[#004f90] font-black">{user?.name}</span>!
          </h1>
          {user?.portalType === 'sdlc' ? (
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              Welcome back. SDLC Candidate Enrollment ID: <span className="font-extrabold text-[#F7931A] font-mono bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-100/50">{user?.enrollmentId}</span>
            </p>
          ) : (
            <p className="text-sm text-slate-500 font-semibold leading-relaxed">
              Welcome back. Enrolled in <span className="font-extrabold text-slate-800 underline decoration-[#004f90] decoration-2">{user?.department}</span> (Batch {user?.batch}, {user?.year}).
            </p>
          )}
        </div>
        <button
          onClick={fetchTests}
          className="relative z-10 flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 hover:text-[#004f90] border border-slate-200 hover:border-[#004f90]/30 px-5 py-3.5 rounded-2xl text-sm font-bold shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer shrink-0"
        >
          <RefreshCw className="h-4 w-4 text-[#004f90]" />
          <span>Sync Assessments</span>
        </button>
      </div>

      {/* Redesigned 3-Card Summary Overview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {/* Card 1: Available Exams */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#004f90]"></div>
          <div className="h-14 w-14 bg-[#004f90]/5 text-[#004f90] rounded-2xl flex items-center justify-center border border-[#004f90]/10 shrink-0 group-hover:scale-110 transition-transform duration-305">
            <BookOpen className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Available Exams</span>
            <span className="text-3xl font-black text-slate-900 block leading-none mt-2 font-poppins">{activeTests.length}</span>
          </div>
        </div>

        {/* Card 2: Completed Attempts */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-emerald-500"></div>
          <div className="h-14 w-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100/60 shrink-0 group-hover:scale-110 transition-transform duration-305">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Completed Exams</span>
            <span className="text-3xl font-black text-slate-900 block leading-none mt-2 font-poppins">{completedTests.length}</span>
          </div>
        </div>

        {/* Card 3: Avg Accuracy */}
        <div className="bg-white border border-slate-100 rounded-3xl p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 bottom-0 w-1.5 bg-[#F7931A]"></div>
          <div className="h-14 w-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100/60 shrink-0 group-hover:scale-110 transition-transform duration-305">
            <Award className="h-7 w-7" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-widest block">Average Accuracy</span>
            <span className="text-3xl font-black text-slate-900 block leading-none mt-2 font-poppins text-amber-600">
              {completedTests.filter(t => t.showResultsToStudents !== false).length > 0
                ? `${(completedTests.filter(t => t.showResultsToStudents !== false).reduce((sum, t) => sum + t.percentage, 0) / completedTests.filter(t => t.showResultsToStudents !== false).length).toFixed(0)}%`
                : 'N/A'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mt-8">
        
        {/* Left Column: Active & Closed Tests List (Spans 8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Active Assessments Title Header */}
          <div className="flex items-center justify-between pl-1">
            <div className="flex items-center space-x-3">
              <span className="h-5 w-1.5 bg-[#004f90] rounded-full"></span>
              <div className="text-xl font-bold text-slate-800 tracking-tight font-poppins">Active Assessments</div>
            </div>
            <span className="bg-[#004f90]/5 border border-[#004f90]/20 text-[#004f90] px-3.5 py-1.5 rounded-full font-bold text-xs">
              {activeTests.length} Available
            </span>
          </div>

          {activeTests.length === 0 ? (
            <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center space-y-5 shadow-sm">
              <div className="h-16 w-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                <AlertCircle className="h-8 w-8" />
              </div>
              <div className="space-y-1.5">
                <div className="text-lg font-bold text-slate-800">No Active Exams</div>
                <p className="text-sm text-slate-400 font-medium max-w-sm mx-auto">There are no live question papers scheduled at this hour.</p>
              </div>
              <button 
                onClick={fetchTests}
                className="border border-slate-200 text-slate-600 px-5 py-3 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer inline-flex items-center gap-2 shadow-sm"
              >
                <RefreshCw className="h-4 w-4 text-[#004f90]" />
                <span>Check for updates</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeTests.map((test) => (
                <motion.div
                  key={test._id}
                  whileHover={!test.locked ? { y: -5, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.05)' } : {}}
                  className={`bg-white border rounded-3xl p-6.5 flex flex-col justify-between shadow-sm relative overflow-hidden transition-all duration-300 min-h-[300px] ${
                    test.locked ? 'opacity-85 border-slate-200 bg-slate-50/50' : 'border-slate-105 hover:border-[#004f90]/35'
                  }`}
                >
                  <div className={`absolute top-0 left-0 right-0 h-[5px] ${test.locked ? 'bg-slate-350' : 'bg-[#004f90]'}`}></div>
                  
                  <div className="space-y-4.5">
                    {/* Card Header Tag */}
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] border px-3 py-1.5 rounded-xl font-black uppercase tracking-widest ${
                        test.locked ? 'bg-slate-100 text-slate-400 border-slate-200' : 'bg-[#004f90]/10 text-[#004f90] border-[#004f90]/20'
                      }`}>
                        {test.subject}
                      </span>
                      <div className="flex items-center text-xs text-slate-500 font-bold gap-1 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                        <Clock className="h-4 w-4 text-[#F7931A]" />
                        <span>{test.duration} Mins</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="space-y-2">
                      <div className="flex items-start gap-2">
                        {test.locked && <Lock className="h-5 w-5 text-slate-400 mt-1 shrink-0" />}
                        <h3 className={`text-lg font-extrabold tracking-tight leading-snug font-sans ${test.locked ? 'text-slate-500' : 'text-slate-800'}`}>
                          {test.title}
                        </h3>
                      </div>
                      <p className="text-xs text-slate-450 text-slate-550 leading-relaxed font-medium line-clamp-2">
                        {test.description}
                      </p>
                    </div>

                    {test.locked && (
                      <div className="bg-amber-50/60 border border-amber-200/50 rounded-2xl p-4 text-[11px] font-bold text-amber-800 flex items-start gap-2.5 leading-relaxed">
                        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>Locked: Prerequisite module <span className="underline font-extrabold">{test.prerequisiteModuleName}</span> must be completed first.</span>
                      </div>
                    )}
                    
                    {/* Time Window Box */}
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex flex-col space-y-2 text-xs font-semibold text-slate-500">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">Starts At:</span>
                        <span className="text-slate-700 font-extrabold font-mono">{new Date(test.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 font-bold">Ends At:</span>
                        <span className="text-slate-700 font-extrabold font-mono">{new Date(test.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: true})}</span>
                      </div>
                    </div>
                  </div>

                  {test.locked ? (
                    <button
                      disabled
                      className="mt-6 w-full bg-slate-200 text-slate-400 font-black py-4 rounded-2xl text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-slate-250 cursor-not-allowed"
                    >
                      <Lock className="h-4 w-4" />
                      <span>Locked Assessment</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => onStartTest(test)}
                      className="mt-6 w-full bg-[#004f90] hover:bg-[#003c6e] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-wider shadow-sm hover:shadow transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <span>Start Assessment</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              ))}
            </div>
          )}

          {/* Missed / Closed Assessments */}
          {endedTests.length > 0 && (
            <div className="pt-4 space-y-4">
              <div className="text-xs font-bold text-slate-450 uppercase tracking-widest pl-2 border-l-2 border-slate-300">
                Closed / Missed Tests
              </div>
              <div className="bg-white border border-slate-100 rounded-3xl divide-y divide-slate-100 overflow-hidden shadow-sm">
                {endedTests.map((test) => (
                  <div key={test._id} className="p-5 flex items-center justify-between text-sm hover:bg-slate-50/30 transition-colors">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 leading-snug">{test.title}</p>
                      <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold">
                        <span>{test.subject}</span>
                        <span>•</span>
                        <span>Closed on {new Date(test.endTime).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <span className="bg-red-50 border border-red-100 text-red-600 px-3.5 py-1.5 rounded-full text-[10px] uppercase font-black tracking-wider flex items-center gap-1 shrink-0">
                      <Lock className="h-3.5 w-3.5" />
                      <span>CLOSED</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Performance Summary Profile & Roster History (Spans 4 cols) */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* Student Profile Card details */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
            <div className="flex items-center space-x-4">
              <div className="h-14 w-14 bg-gradient-to-tr from-[#004f90] to-blue-500 text-white rounded-2xl flex items-center justify-center border border-white shadow-md font-extrabold text-lg shrink-0 uppercase">
                {getInitials(user?.name)}
              </div>
              <div className="text-left space-y-1 min-w-0">
                <div className="text-lg font-black text-slate-800 tracking-tight leading-tight truncate">{user?.name}</div>
                <div className="text-xs text-slate-400 font-bold font-mono tracking-wider bg-slate-50 px-2.5 py-1 border border-slate-100 rounded-xl inline-block">
                  {user?.portalType === 'sdlc' ? user?.enrollmentId : user?.rollNumber}
                </div>
              </div>
            </div>

            {/* Assessment Roster Statistics */}
            <div className="border-t border-slate-100 pt-5 grid grid-cols-2 gap-4 text-center">
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Exams Taken</span>
                <span className="text-2xl font-black text-slate-800 mt-1 block font-poppins">{completedTests.length}</span>
              </div>
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Score</span>
                <span className="text-2xl font-black text-emerald-600 mt-1 block font-poppins">
                  {completedTests.filter(t => t.showResultsToStudents !== false).length > 0
                    ? `${(completedTests.filter(t => t.showResultsToStudents !== false).reduce((sum, t) => sum + t.percentage, 0) / completedTests.filter(t => t.showResultsToStudents !== false).length).toFixed(0)}%`
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Roster attempt list */}
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5 text-left">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest pl-2 border-l-2 border-[#004f90]">
              Attempt History
            </h3>
            
            {completedTests.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 font-medium leading-relaxed">
                No attempts recorded yet. Your scores and review papers will appear here.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {completedTests.map((test) => (
                  <div key={test._id} className="py-4.5 first:pt-0 last:pb-0 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-slate-800 line-clamp-1 leading-snug">{test.title}</h4>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest block">{test.subject}</span>
                      </div>
                      
                      {test.showResultsToStudents !== false ? (
                        <span className={`text-[10px] font-extrabold px-3 py-1 rounded-full border shrink-0 ${
                          test.passed
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-red-50 text-red-750 border-red-200'
                        }`}>
                          {test.passed ? 'PASS' : 'FAIL'} • {test.percentage}%
                        </span>
                      ) : (
                        <span className="text-[10px] font-extrabold px-3 py-1 rounded-full bg-slate-50 text-slate-500 border border-slate-200 uppercase shrink-0">
                          Graded
                        </span>
                      )}
                    </div>

                    <button
                      onClick={() => onViewResult(test.resultId)}
                      disabled={test.showResultsToStudents === false}
                      className={`w-full py-3 rounded-2xl text-[10px] font-extrabold tracking-widest transition-all uppercase cursor-pointer flex items-center justify-center gap-1.5 border ${
                        test.showResultsToStudents === false
                          ? 'bg-slate-50 text-slate-400 border-slate-100 cursor-not-allowed'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 hover:border-slate-350 active:scale-97'
                      }`}
                    >
                      {test.showResultsToStudents === false ? 'Review Locked' : 'Review Exam Paper'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default TestList;
