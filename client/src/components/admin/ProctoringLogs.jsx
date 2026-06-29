import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api.js';
import { ShieldAlert, RefreshCw, AlertTriangle, Search, Filter, Clock, User, BookOpen, Wifi, Layers, Maximize } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const statusConfig = (log) => {
  if (log.autoSubmitted) {
    return { label: 'Auto-Submitted', color: 'bg-red-50 text-red-700 border-red-200', dot: 'bg-red-500' };
  }
  return { label: `Warning (${log.count}/3)`, color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' };
};

const ProctoringLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all | warning | autosubmit
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/violations');
      setLogs(data);
      setLastRefreshed(new Date());
    } catch (err) {
      toast.error('Failed to load proctoring data.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchLogs(true), 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const handleResetAccess = (log) => {
    const studentId = typeof log.studentId === 'object' ? log.studentId?._id : log.studentId;
    const testId = typeof log.testId === 'object' ? log.testId?._id : log.testId;
    const studentName = log.studentId?.name || 'Student';
    const testTitle = log.testId?.title || 'Assessment';
    const violationId = log._id;

    if (!studentId && !violationId) {
      toast.error('Cannot identify student or violation record ID.');
      return;
    }
    setResetTarget({ studentId, studentName, testId, testTitle, violationId });
  };

  const confirmResetAccess = async () => {
    if (!resetTarget) return;
    const { studentId, studentName, testId, testTitle, violationId } = resetTarget;
    setResetTarget(null);

    const loadToastId = toast.loading(`Resetting exam clearance for ${studentName}...`);
    let cleared = false;

    if (studentId && testId) {
      try {
        await api.delete(`/results/student/${studentId}/test/${testId}`);
        cleared = true;
      } catch (err) {}
    }

    if (violationId) {
      try {
        await api.delete(`/violations/${violationId}`);
        cleared = true;
      } catch (err) {}
    }

    if (cleared) {
      toast.success(`Exam access & violation log cleared for ${studentName}!`, { id: loadToastId });
      fetchLogs();
    } else {
      toast.error(`Record not found or already cleared for ${studentName}.`, { id: loadToastId });
    }
  };

  // Summary stats
  const totalViolations = logs.reduce((sum, l) => sum + l.count, 0);
  const autoSubmitted = logs.filter(l => l.autoSubmitted).length;
  const uniqueStudents = new Set(logs.map(l => l.studentId?._id)).size;

  // Filter + Search
  const filteredLogs = logs.filter(log => {
    const name = log.studentId?.name?.toLowerCase() || '';
    const roll = log.studentId?.rollNumber?.toLowerCase() || '';
    const test = log.testId?.title?.toLowerCase() || '';
    const matchSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || roll.includes(searchQuery.toLowerCase()) || test.includes(searchQuery.toLowerCase());

    let matchFilter = true;
    if (filterStatus === 'warning') matchFilter = !log.autoSubmitted;
    if (filterStatus === 'autosubmit') matchFilter = log.autoSubmitted;

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight font-poppins flex items-center gap-3">
            
            Proctoring Monitor
          </h2>
          <p className="text-sm text-slate-500 font-medium mt-0.5">
            Live violation feed — tab switches and integrity breach alerts during assessments.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {lastRefreshed && (
            <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
              Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchLogs()}
            className="border border-slate-200 text-slate-600 p-2.5 rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            title="Refresh Now"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Violations', value: totalViolations, icon: AlertTriangle, color: 'text-orange-500 bg-orange-50 border-orange-100' },
          { label: 'Students Flagged', value: uniqueStudents, icon: User, color: 'text-blue-600 bg-blue-50 border-blue-100' },
          { label: 'Auto-Submitted', value: autoSubmitted, icon: Clock, color: 'text-red-700 bg-red-50 border-red-100' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className={`bg-white border rounded-2xl p-4 flex items-center gap-4 shadow-sm border-slate-100`}>
            <div className={`h-10 w-10 rounded-xl flex items-center justify-center border ${color}`}>
              <Icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">{label}</p>
              <p className="text-2xl font-extrabold text-slate-900 leading-none mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters Row */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center gap-3 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by student name, roll number, or test..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 font-medium placeholder:text-slate-300 focus:outline-none focus:border-[#004f90] transition-all"
          />
        </div>
        {/* Status Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { key: 'all', label: 'All Activities' },
            { key: 'warning', label: 'Active Warnings' },
            { key: 'autosubmit', label: 'Auto-Submitted Only' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                filterStatus === f.key
                  ? 'bg-[#004f90] text-white border-[#004f90]'
                  : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Violations Table */}
      <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <div className="h-10 w-10 border-4 border-[#004f90] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-sm text-slate-400 font-medium">Fetching proctoring data...</p>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ShieldAlert className="h-12 w-12 text-slate-200 mx-auto" />
            <p className="text-sm font-bold text-slate-700">
              {logs.length === 0 ? 'No violations recorded yet.' : 'No violations match your filters.'}
            </p>
            <p className="text-xs text-slate-400 font-medium">
              {logs.length === 0 ? 'Violation events will appear here as students take exams.' : 'Try adjusting your search or filter criteria.'}
            </p>
          </div>
        ) : (
          <>
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Showing {filteredLogs.length} violation {filteredLogs.length === 1 ? 'record' : 'records'}
              </p>
            </div>
            <div className="divide-y divide-slate-50">
              <AnimatePresence>
                {filteredLogs.map((log, i) => {
                  const status = statusConfig(log);
                  const isExpanded = expandedLog === log._id;

                  return (
                    <motion.div
                      key={log._id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.03 }}
                    >
                      {/* Main Row */}
                      <div
                        className="px-6 py-4 hover:bg-slate-50/60 transition-colors cursor-pointer"
                        onClick={() => setExpandedLog(isExpanded ? null : log._id)}
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* Student Info */}
                          <div className="flex items-center gap-4 min-w-0">
                            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                              log.autoSubmitted ? 'bg-red-100' : 'bg-amber-100'
                            }`}>
                              <User className={`h-4 w-4 ${
                                log.autoSubmitted ? 'text-red-600' : 'text-amber-600'
                              }`} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-bold text-slate-900 truncate">
                                {log.studentId?.name || 'Unknown Student'}
                              </p>
                              <p className="text-[10px] text-slate-400 font-medium">
                                {log.studentId?.rollNumber} · {log.studentId?.department}
                              </p>
                            </div>
                          </div>

                          {/* Test Name */}
                          <div className="hidden md:block min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <p className="text-xs font-semibold text-slate-600 truncate">
                                {log.testId?.title || 'Unknown Test'}
                              </p>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">{log.testId?.subject}</p>
                          </div>

                          {/* Right side */}
                          <div className="flex items-center gap-3 shrink-0">
                            {/* Tab Switch Count */}
                            <div className="text-center hidden sm:block">
                              <p className="text-xl font-extrabold text-slate-900 leading-none">{log.count}</p>
                              <p className="text-[9px] text-slate-400 uppercase font-bold mt-0.5">Switches</p>
                            </div>

                            {/* Status Badge */}
                            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border ${status.color} flex items-center gap-1.5`}>
                              <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                              {status.label}
                            </span>

                            {/* Expand chevron */}
                            <svg
                              className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                              fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* Expanded: Event Timeline */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 pb-6 pt-4 bg-slate-50 border-t border-slate-150 space-y-6">
                              {/* Sleek Timeline Container */}
                              <div className="space-y-4">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
                                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                                  Violation Timeline ({log.events?.length || 0} events)
                                </p>
                                
                                <div className="relative pl-6 border-l-2 border-slate-200/60 ml-3.5 space-y-4 max-h-64 overflow-y-auto pr-2">
                                  {log.events && log.events.length > 0 ? (
                                    log.events.map((ev, idx) => {
                                      const isTab = ev.type === 'tab_switch';
                                      return (
                                        <div key={idx} className="relative flex items-start gap-4 text-xs">
                                          {/* Timeline Card */}
                                          <div className="flex-1 bg-white border border-slate-100 rounded-xl p-3.5 shadow-sm space-y-1 text-left">
                                            <div className="flex items-center justify-between">
                                              <span className={`font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${
                                                isTab 
                                                  ? 'bg-amber-50 text-amber-800' 
                                                  : 'bg-red-50 text-red-800'
                                              }`}>
                                                {ev.type?.replace('_', ' ')}
                                              </span>
                                              <span className="text-[10px] text-slate-400 font-semibold font-mono">
                                                {new Date(ev.timestamp).toLocaleString([], {
                                                  month: 'short', day: 'numeric',
                                                  hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                                                })}
                                              </span>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                              {isTab 
                                                ? 'Candidate switched away from assessment tab / minimized browser window.' 
                                                : 'Candidate left strict full-screen exam proctoring window mode.'
                                              }
                                            </p>
                                          </div>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="text-xs text-slate-400 pl-2">No detailed event timestamps recorded.</p>
                                  )}
                                </div>
                              </div>

                              {/* Action Panel for Resetting Access */}
                              <div className="pt-5 border-t border-slate-200/80 flex flex-col gap-4 text-left">
                                <div className="space-y-1.5">
                                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Administrative Access Clearance</h4>
                                  <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-2xl">
                                    Grant this candidate clearance to re-take the assessment. Resetting permanently deletes their current answers, proctoring metrics, and grade record.
                                  </p>
                                </div>
                                <div className="flex justify-end">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleResetAccess(log);
                                    }}
                                    className="flex items-center justify-center gap-2 text-xs text-red-600 hover:text-white bg-white hover:bg-red-600 border border-red-200 hover:border-red-600 px-4.5 py-2.5 rounded-xl transition-all font-extrabold shadow-sm cursor-pointer"
                                  >
                                    <RefreshCw className="h-3.5 w-3.5" />
                                    <span>Clear Violations & Grant Re-take</span>
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </>
        )}
      </div>

      {/* Custom Confirmation Modal */}
      <AnimatePresence>
        {resetTarget && (
          <>
            {/* Backdrop overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResetTarget(null)}
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
                <h4 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Reset Exam Access?</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                  This will permanently delete <strong className="text-slate-800">"{resetTarget.studentName}"</strong>'s current proctoring violations and grading sheet for the assessment:
                </p>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 mt-2 text-center">
                  <p className="text-xs font-bold text-[#004f90]">{resetTarget.testTitle}</p>
                </div>
                <p className="text-xs text-red-600 font-semibold mt-2.5 flex items-center justify-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                  <span>This action is permanent and cannot be undone.</span>
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  onClick={confirmResetAccess}
                  className="flex-1 bg-red-600 hover:bg-red-750 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="h-4 w-4 animate-spin-hover" />
                  <span>Confirm Reset</span>
                </button>
                <button
                  onClick={() => setResetTarget(null)}
                  className="flex-1 border border-slate-200 text-slate-650 font-semibold py-3 px-5 rounded-xl text-sm hover:bg-slate-50 transition-all cursor-pointer"
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

export default ProctoringLogs;
