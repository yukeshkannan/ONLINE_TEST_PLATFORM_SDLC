import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { 
  Code2, Terminal, Cpu, Award, Zap, RefreshCw, CheckCircle2, 
  Clock, ShieldAlert, ArrowRight, ChevronRight, FileCode, CheckCircle, 
  Flame, Compass, Laptop, MapPin, Layers, Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import ClockLoader from '../shared/ClockLoader.jsx';

const SdlcStudentDashboard = ({ onStartTest, onViewResult }) => {
  const { user, isAuthenticated } = useAuth();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('challenges'); // 'challenges' | 'milestones' | 'guidelines'

  const fetchTests = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const { data } = await api.get('/tests');
      setTests(data);
    } catch (err) {
      if (err?.response?.status !== 401) {
        toast.error('Unable to retrieve SDLC technical assessments.');
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

  // Active / Available Technical Challenges
  const activeTests = tests.filter((t) => {
    if (t.attempted) return false;
    const isPastEnd = t.endTime && now > new Date(t.endTime);
    if (isPastEnd && t.status !== 'active') return false;
    return true;
  });

  // Completed Technical Milestones
  const completedTests = tests.filter((t) => t.attempted);

  // Performance calculations
  const totalCompleted = completedTests.length;
  const passedCount = completedTests.filter(t => t.passed || (t.userPercentage >= (t.passingMarks || 50))).length;
  const certificationReadiness = totalCompleted > 0 ? Math.min(100, Math.round((passedCount / Math.max(totalCompleted, 3)) * 100)) : 0;
  
  const avgPercentage = totalCompleted > 0 
    ? Math.round(completedTests.reduce((acc, curr) => acc + (curr.userPercentage || 0), 0) / totalCompleted)
    : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <ClockLoader size="lg" color="#F7931A" text="Connecting to SDLC Developer Cloud..." />
      </div>
    );
  }

  return (
    <div className="space-y-8 py-6 font-sans text-left pb-16 max-w-7xl mx-auto px-4 sm:px-6">
      
      {/* ========================================================================= */}
      {/* 1. HIGH-TECH SDLC DEVELOPER HERO HEADER                                   */}
      {/* ========================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0b1120] via-[#0f172a] to-[#1e293b] rounded-3xl p-6 sm:p-9 text-white shadow-2xl shadow-amber-500/5 border border-slate-700/80">
        
        {/* Glow ambient background effect */}
        <div className="absolute top-0 right-0 -mr-24 -mt-24 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-24 -mb-24 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-mono font-black uppercase tracking-widest bg-amber-500/15 border border-amber-500/30 px-3 py-1 rounded-full text-amber-400 inline-flex items-center gap-1.5 shadow-xs">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>SDLC DEVELOPER HQ</span>
              </span>
              
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 border border-slate-700 px-2.5 py-1 rounded-full text-slate-300 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-400" />
                <span>{user?.center || 'Karur'} Center</span>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-poppins tracking-tight text-white leading-tight">
              {getGreeting()}, <span className="text-[#F7931A]">{user?.name}</span>
            </h1>

            {/* Candidate Tech Credentials Badges */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-medium pt-1">
              <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">ENROLLMENT ID:</span>
                <span className="font-mono font-extrabold text-[#F7931A] tracking-wider">{user?.enrollmentId || 'SDLC-KRR-001'}</span>
              </div>

              <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
                <span className="text-slate-400 font-mono text-[11px]">TRACK:</span>
                <span className="font-bold text-white flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>{user?.courseTrack || 'Full Stack Web Dev'}</span>
                </span>
              </div>

              {user?.batchTime && (
                <div className="bg-slate-800/80 backdrop-blur-sm border border-slate-700 px-3 py-1.5 rounded-xl flex items-center gap-2">
                  <span className="text-slate-400 font-mono text-[11px]">BATCH:</span>
                  <span className="font-bold text-white">{user?.batchTime}</span>
                </div>
              )}
            </div>
          </div>

          {/* Sync Button */}
          <div className="flex items-center gap-3 shrink-0 self-start lg:self-center">
            <button
              onClick={fetchTests}
              className="flex items-center gap-2 bg-[#F7931A] hover:bg-[#e48310] text-slate-950 px-4.5 py-3 rounded-2xl text-xs sm:text-sm font-bold shadow-lg shadow-amber-500/20 transition-all active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw className="h-4 w-4 text-slate-950" />
              <span>Sync Assessment Server</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. DEVELOPER METRICS SUMMARY GRID                                         */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        
        {/* Active Tech Challenges */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Active Challenges</span>
            <p className="text-3xl font-extrabold text-slate-900 font-poppins">{activeTests.length}</p>
            <span className="text-[11px] text-amber-600 font-bold flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Terminal Ready
            </span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-[#F7931A]">
            <Code2 className="h-6 w-6" />
          </div>
        </div>

        {/* Completed Tech Milestones */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Completed Modules</span>
            <p className="text-3xl font-extrabold text-slate-900 font-poppins">{completedTests.length}</p>
            <span className="text-[11px] text-slate-500 font-medium">Evaluated Skill Tests</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        {/* Tech Proficiency Score */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Skill Proficiency Index</span>
            <p className="text-3xl font-extrabold text-slate-900 font-poppins">{avgPercentage}%</p>
            <span className="text-[11px] text-slate-500 font-medium">Cumulative Benchmarks</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-50 border border-cyan-200 flex items-center justify-center text-cyan-600">
            <Cpu className="h-6 w-6" />
          </div>
        </div>

        {/* Certification Readiness */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:shadow-xs transition flex items-center justify-between">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Industry Ready Score</span>
            <p className="text-3xl font-extrabold text-slate-900 font-poppins">{certificationReadiness}%</p>
            <span className="text-[11px] text-slate-500 font-medium">{passedCount} Milestones Verified</span>
          </div>
          <div className="h-12 w-12 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-center text-orange-600">
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
            onClick={() => setActiveTab('challenges')}
            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'challenges'
                ? 'border-[#F7931A] text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Terminal className="w-4 h-4 text-[#F7931A]" />
            <span>Active Skill Challenges</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'challenges' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {activeTests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('milestones')}
            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'milestones'
                ? 'border-[#F7931A] text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Award className="w-4 h-4 text-[#F7931A]" />
            <span>Completed Milestones & Reports</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeTab === 'milestones' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'
            }`}>
              {completedTests.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('guidelines')}
            className={`py-3.5 text-xs sm:text-sm font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'guidelines'
                ? 'border-[#F7931A] text-slate-900'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldAlert className="w-4 h-4 text-slate-500" />
            <span>Assessment Code of Conduct</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 4. TAB 1: ACTIVE SKILL CHALLENGES                                         */}
      {/* ========================================================================= */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {activeTests.length === 0 ? (
            <div className="bg-white border border-slate-200/90 rounded-3xl p-12 text-center max-w-xl mx-auto space-y-4 shadow-2xs">
              <div className="h-16 w-16 bg-amber-50 text-[#F7931A] rounded-2xl flex items-center justify-center mx-auto border border-amber-200">
                <CheckCircle className="h-8 w-8 text-[#F7931A]" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 font-poppins">No Pending Skill Assessments</h3>
              <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
                Great job! You have cleared all live assessments scheduled for your course track at your district center.
              </p>
              <button
                onClick={fetchTests}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Refresh Server
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
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider bg-slate-900 text-amber-400 px-2.5 py-1 rounded-md border border-slate-800">
                        {test.subject || 'TECHNICAL TRACK'}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        Live Terminal
                      </span>
                    </div>

                    <div>
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 font-poppins group-hover:text-[#F7931A] transition-colors line-clamp-2">
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
                        <span><strong>{test.duration}</strong> Mins Duration</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <FileCode className="w-4 h-4 text-slate-400" />
                        <span><strong>{test.questions?.length || 0}</strong> Tech Questions</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Award className="w-4 h-4 text-slate-400" />
                        <span><strong>{test.totalMarks || (test.questions?.length || 0)}</strong> Total Marks</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <Cpu className="w-4 h-4 text-amber-500" />
                        <span>Sandbox Evaluator</span>
                      </div>
                    </div>
                  </div>

                  {/* Launch Terminal Action */}
                  <div className="pt-5 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[11px] text-slate-400 font-medium">
                      Benchmark: <strong className="text-slate-700">{test.passingMarks || 50}%</strong>
                    </div>

                    <button
                      onClick={() => onStartTest(test)}
                      className="bg-slate-900 hover:bg-slate-800 text-[#F7931A] hover:text-amber-300 border border-slate-800 hover:border-amber-500/50 px-5 py-2.5 rounded-xl text-xs font-mono font-bold shadow-sm flex items-center gap-2 transition cursor-pointer active:scale-[0.98]"
                    >
                      <span>Launch Terminal</span>
                      <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TAB 2: COMPLETED MILESTONES                                            */}
      {/* ========================================================================= */}
      {activeTab === 'milestones' && (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
          {completedTests.length === 0 ? (
            <div className="p-12 text-center space-y-3">
              <Code2 className="h-10 w-10 text-slate-300 mx-auto" />
              <h4 className="text-sm font-bold text-slate-700">No Evaluated Milestones Yet</h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Once you complete your technical assessments, your code scores and module benchmarks will be archived here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-[11px] uppercase font-bold tracking-wider">
                    <th className="py-3.5 px-5">Module / Assessment</th>
                    <th className="py-3.5 px-5">Tech Domain</th>
                    <th className="py-3.5 px-5">Score Secured</th>
                    <th className="py-3.5 px-5">Proficiency %</th>
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
                          <p className="text-[10px] text-slate-400 font-mono mt-0.5">{new Date(t.submittedAt || t.updatedAt || Date.now()).toLocaleDateString()}</p>
                        </td>
                        <td className="py-4 px-5 text-slate-600 font-mono font-semibold">
                          {t.subject || 'Full Stack'}
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
                            {isPassed ? 'CLEARED' : 'RETEST REQUIRED'}
                          </span>
                        </td>
                        <td className="py-4 px-5 text-right">
                          <button
                            onClick={() => onViewResult(t.resultId || t._id)}
                            className="text-[#F7931A] hover:text-[#e48310] font-bold px-3 py-1.5 rounded-lg transition inline-flex items-center gap-1 cursor-pointer"
                          >
                            <span>Report</span>
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
      {/* 6. TAB 3: SDLC CODE OF CONDUCT                                            */}
      {/* ========================================================================= */}
      {activeTab === 'guidelines' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6 shadow-2xs">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 font-poppins flex items-center gap-2">
              <Terminal className="w-5 h-5 text-[#F7931A]" />
              <span>SDLC Technical Academy • Assessment Code of Conduct</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">
              Maintain developer integrity and adhere strictly to SDLC Assessment guidelines during test execution.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <CheckCircle2 className="w-4 h-4 text-[#F7931A]" />
                <span>Single Device Focus</span>
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                Assessments must be taken in dedicated fullscreen mode. Navigating away from the browser or launching auxiliary apps will trigger automated infraction logs.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <Clock className="w-4 h-4 text-[#F7931A]" />
                <span>Real-Time Code Execution Timer</span>
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                Your remaining session time is tracked in real-time. Ensure all answers and coding options are saved prior to timer expiration.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                <span>Proctoring Telemetry</span>
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                System telemetry actively records window blurs, tab switching, and copy/paste keystroke events directly to your SDLC trainer’s audit console.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-2">
              <h4 className="font-bold text-slate-800 flex items-center gap-1.5 text-xs sm:text-sm">
                <Award className="w-4 h-4 text-emerald-600" />
                <span>Verified Certification Badges</span>
              </h4>
              <p className="text-slate-600 font-medium leading-relaxed">
                High scores on milestone tests contribute directly to your SDLC Industry Certification Scorecard and placement recommendations.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default SdlcStudentDashboard;
