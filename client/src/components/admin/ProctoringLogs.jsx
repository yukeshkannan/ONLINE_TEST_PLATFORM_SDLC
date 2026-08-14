import React, { useState, useEffect, useCallback } from 'react';
import api from '../../utils/api.js';
import { 
  ShieldAlert, RefreshCw, AlertTriangle, Search, Filter, Clock, User, BookOpen, 
  Wifi, Layers, Maximize, CheckCircle, XCircle, Award, ArrowRight, ChevronDown, 
  RotateCcw, Sparkles, FileText, Check, Shield
} from 'lucide-react';
import ClockLoader from '../shared/ClockLoader.jsx';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ProctoringLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrigger, setFilterTrigger] = useState('all'); // all | esc | timer | warning
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [expandedLog, setExpandedLog] = useState(null);
  const [resetTarget, setResetTarget] = useState(null);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const { data } = await api.get('/violations');
      setLogs(Array.isArray(data) ? data : []);
      setLastRefreshed(new Date());
    } catch (err) {
      if (!silent) {
        toast.error('Unable to load proctoring audit logs.');
      }
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLogs();
    // Auto-refresh every 30 seconds silently
    const interval = setInterval(() => fetchLogs(true), 30000);
    return () => clearInterval(interval);
  }, [fetchLogs]);

  const handleResetAccess = (log) => {
    const studentId = typeof log.studentId === 'object' ? log.studentId?._id : log.studentId;
    const testId = typeof log.testId === 'object' ? log.testId?._id : log.testId;
    const studentName = log.studentId?.name || 'Candidate';
    const testTitle = log.testId?.title || 'Assessment';
    const violationId = log._id;

    if (!studentId && !violationId) {
      toast.error('Unable to identify candidate or violation record ID.');
      return;
    }
    setResetTarget({ studentId, studentName, testId, testTitle, violationId });
  };

  const confirmResetAccess = async () => {
    if (!resetTarget) return;
    const { studentId, studentName, testId, testTitle, violationId } = resetTarget;
    setResetTarget(null);

    const loadToastId = toast.loading(`Resetting exam clearance for candidate ${studentName}...`);
    let cleared = false;

    if (studentId && testId) {
      try {
        await api.delete(`/results/student/${studentId}/test/${testId}`);
        cleared = true;
      } catch (err) {
        // Fallback: if clearing by student & test fails, try deleting the violation log directly
        if (violationId) {
          try {
            await api.delete(`/violations/${violationId}`);
            cleared = true;
          } catch (vErr) {
            console.error('Failed to delete violation log directly:', vErr);
          }
        }
      }
    } else if (violationId) {
      try {
        await api.delete(`/violations/${violationId}`);
        cleared = true;
      } catch (err) {
        console.error('Failed to delete violation log:', err);
      }
    }

    if (cleared) {
      toast.success(`Assessment clearance granted and violation log reset for ${studentName}.`, { id: loadToastId });
      fetchLogs();
    } else {
      toast.error(`Record not found or already cleared for ${studentName}.`, { id: loadToastId });
    }
  };

  // Helper to determine exact submission trigger
  const getTriggerType = (log) => {
    const subType = log.result?.submissionType;
    const hasFullscreen = log.events?.some(e => e.type === 'fullscreen_exit');
    
    // 1. Explicit timer expiration takes absolute priority
    if (subType === 'timer_expired' || log.violationType === 'timer_expired') {
      return 'timer_expired'; // Clock ran out automatically
    }

    // 2. ESC / Fullscreen exit / 3 Tab Switches security violation
    if (subType === 'security_violation' || hasFullscreen || log.violationType === 'fullscreen_exit' || (log.autoSubmitted && log.count >= 3)) {
      return 'esc_security'; // ESC / Fullscreen exit / 3 Tab Switches
    }

    // 3. Active Warning (< 3 switches)
    return 'warning';
  };

  // Summary Metrics
  const totalViolations = logs.reduce((sum, l) => sum + (l.count || 0), 0);
  const escAutoSubmits = logs.filter(l => getTriggerType(l) === 'esc_security').length;
  const timerAutoSubmits = logs.filter(l => getTriggerType(l) === 'timer_expired').length;
  const activeWarnings = logs.filter(l => getTriggerType(l) === 'warning').length;
  const uniqueStudents = new Set(logs.map(l => l.studentId?._id)).size;

  // Filter + Search
  const filteredLogs = logs.filter(log => {
    const name = log.studentId?.name?.toLowerCase() || '';
    const roll = log.studentId?.rollNumber?.toLowerCase() || '';
    const dept = log.studentId?.department?.toLowerCase() || '';
    const test = log.testId?.title?.toLowerCase() || '';
    const subj = log.testId?.subject?.toLowerCase() || '';
    const q = searchQuery.toLowerCase();

    const matchSearch = !searchQuery || name.includes(q) || roll.includes(q) || dept.includes(q) || test.includes(q) || subj.includes(q);

    const trigger = getTriggerType(log);
    let matchFilter = true;
    if (filterTrigger === 'esc') matchFilter = trigger === 'esc_security';
    if (filterTrigger === 'timer') matchFilter = trigger === 'timer_expired';
    if (filterTrigger === 'warning') matchFilter = trigger === 'warning';

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6 text-left font-sans pb-16">
      
      {/* Top Banner Matching Dashboard Aesthetic */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins flex items-center gap-2.5">
            <ShieldAlert className="w-6 h-6 text-[#004f90]" />
            <span>Proctoring & Violation Monitor</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-0.5">
            Live candidate proctoring audit — ESC key triggers, full-screen breaches, timer expirations, and evaluated marks.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-start sm:self-auto">
          {lastRefreshed && (
            <span className="text-xs text-slate-400 font-semibold hidden md:block">
              Auto-Synced {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
          )}
          <button
            onClick={() => fetchLogs()}
            className="flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold transition cursor-pointer shadow-2xs"
            title="Refresh Live Audit Feed"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#004f90] ${loading ? 'animate-spin' : ''}`} />
            <span>Sync Records</span>
          </button>
        </div>
      </div>

      {/* KPI Cards: Categorized Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Security Breaches */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-orange-50 border border-orange-200/80 text-orange-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Violations</p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">{totalViolations}</p>
            <p className="text-[10px] text-slate-500 font-medium">{uniqueStudents} Candidate{uniqueStudents === 1 ? '' : 's'} Flagged</p>
          </div>
        </div>

        {/* Card 2: ESC / Fullscreen Breaches */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-rose-50 border border-rose-200/80 text-rose-600 flex items-center justify-center shrink-0">
            <Maximize className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ESC / Security Auto-Submits</p>
            <p className="text-2xl font-extrabold text-rose-600 leading-tight mt-0.5">{escAutoSubmits}</p>
            <p className="text-[10px] text-slate-500 font-medium">Fullscreen Exit / 3 Switches</p>
          </div>
        </div>

        {/* Card 3: Timer Expired Auto-Submits */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Timer Auto-Submits</p>
            <p className="text-2xl font-extrabold text-amber-700 leading-tight mt-0.5">{timerAutoSubmits}</p>
            <p className="text-[10px] text-slate-500 font-medium">Clock Ran Out Automatically</p>
          </div>
        </div>

        {/* Card 4: Active Warnings */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4.5 shadow-2xs flex items-center gap-4">
          <div className="h-11 w-11 rounded-xl bg-blue-50 border border-blue-200/80 text-[#004f90] flex items-center justify-center shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Warnings</p>
            <p className="text-2xl font-extrabold text-slate-900 leading-tight mt-0.5">{activeWarnings}</p>
            <p className="text-[10px] text-slate-500 font-medium">Under 3 Tab Switches</p>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3.5 shadow-2xs">
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search candidate name, roll number, department, or test title..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/10 transition-all outline-none"
          />
        </div>

        {/* Trigger Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap w-full md:w-auto">
          {[
            { key: 'all', label: 'All Audit Records', count: logs.length },
            { key: 'esc', label: 'ESC / Fullscreen Breaches', count: escAutoSubmits },
            { key: 'timer', label: 'Timer Auto-Submitted', count: timerAutoSubmits },
            { key: 'warning', label: 'Active Warnings', count: activeWarnings }
          ].map(tab => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setFilterTrigger(tab.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                filterTrigger === tab.key
                  ? 'bg-[#004f90] text-white shadow-2xs'
                  : 'bg-slate-100/80 hover:bg-slate-200 text-slate-600'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-extrabold ${
                filterTrigger === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Audit Feed List */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-2xs overflow-hidden">
        {loading ? (
          <div className="py-24 text-center">
            <ClockLoader size="lg" color="#004f90" text="Synchronizing proctoring audit logs..." />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ShieldAlert className="h-12 w-12 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-800">
              {logs.length === 0 ? 'No proctoring violations recorded yet.' : 'No records match your selected filter.'}
            </p>
            <p className="text-xs text-slate-400 font-medium max-w-sm mx-auto">
              {logs.length === 0 
                ? 'Candidate exam integrity events, tab switches, and ESC exits will be logged here in real-time.' 
                : 'Try adjusting your search keywords or switching filter tabs.'}
            </p>
          </div>
        ) : (
          <div>
            <div className="px-6 py-3.5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
              <span>Candidate & Assessment Details</span>
              <span className="hidden sm:inline">Score & Trigger Classification</span>
            </div>

            <div className="divide-y divide-slate-100">
              <AnimatePresence>
                {filteredLogs.map((log, i) => {
                  const trigger = getTriggerType(log);
                  const isExpanded = expandedLog === log._id;
                  const res = log.result;

                  return (
                    <motion.div
                      key={log._id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.02 }}
                      className="transition-colors"
                    >
                      {/* Row Item */}
                      <div
                        onClick={() => setExpandedLog(isExpanded ? null : log._id)}
                        className={`p-5 sm:px-6 hover:bg-slate-50/80 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                          isExpanded ? 'bg-slate-50/60' : ''
                        }`}
                      >
                        {/* Candidate & Test Info */}
                        <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 border ${
                            trigger === 'esc_security'
                              ? 'bg-rose-50 border-rose-200 text-rose-600'
                              : trigger === 'timer_expired'
                              ? 'bg-amber-50 border-amber-200 text-amber-700'
                              : 'bg-blue-50 border-blue-200 text-[#004f90]'
                          }`}>
                            {trigger === 'esc_security' ? (
                              <Maximize className="w-5 h-5" />
                            ) : trigger === 'timer_expired' ? (
                              <Clock className="w-5 h-5" />
                            ) : (
                              <ShieldAlert className="w-5 h-5" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h4 className="text-sm font-bold text-slate-900 truncate">
                                {log.studentId?.name || 'Unknown Candidate'}
                              </h4>
                              <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-mono">
                                {log.studentId?.rollNumber || 'No ID'}
                              </span>
                              {log.studentId?.department && (
                                <span className="text-[10px] font-semibold text-slate-500">
                                  · {log.studentId.department}
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1 flex-wrap">
                              <BookOpen className="w-3.5 h-3.5 text-[#004f90] shrink-0" />
                              <span className="font-semibold text-slate-700 truncate max-w-xs">
                                {log.testId?.title || 'Assessment Paper'}
                              </span>
                              {log.testId?.subject && (
                                <span className="text-[11px] text-slate-400 font-medium">({log.testId.subject})</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Middle: Evaluated Marks & Scores (If Submitted) */}
                        <div className="flex items-center gap-6 shrink-0 w-full md:w-auto justify-between md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
                          {res ? (
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="flex items-center gap-1.5 justify-end">
                                  <span className="text-sm font-black text-slate-900 font-mono">
                                    {res.score} / {res.totalMarks}
                                  </span>
                                  <span className="text-[11px] font-bold text-slate-500">Marks</span>
                                </div>
                                <p className="text-[10px] text-slate-400 font-medium">
                                  {res.answeredCount} answered · {res.percentage}%
                                </p>
                              </div>

                              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border ${
                                res.passed 
                                  ? 'bg-emerald-50 border-emerald-200 text-emerald-700' 
                                  : 'bg-rose-50 border-rose-200 text-rose-700'
                              }`}>
                                {res.passed ? 'PASSED' : 'FAILED'}
                              </span>
                            </div>
                          ) : (
                            <div className="text-right">
                              <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
                                Exam In Progress
                              </span>
                            </div>
                          )}

                          {/* Trigger Classification Badge */}
                          <div className="shrink-0">
                            {trigger === 'esc_security' ? (
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 flex items-center gap-1.5 shadow-2xs">
                                <AlertTriangle className="w-3 h-3 text-rose-500" />
                                <span>ESC / Fullscreen Auto-Submit</span>
                              </span>
                            ) : trigger === 'timer_expired' ? (
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-1.5 shadow-2xs">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>Timer Expired Auto-Submit</span>
                              </span>
                            ) : (
                              <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-xl bg-blue-50 border border-blue-200 text-[#004f90] flex items-center gap-1.5">
                                <ShieldAlert className="w-3 h-3 text-[#004f90]" />
                                <span>{log.count} Warning{log.count === 1 ? '' : 's'} (Active)</span>
                              </span>
                            )}
                          </div>

                          {/* Expand Icon */}
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-slate-700' : ''
                          }`} />
                        </div>
                      </div>

                      {/* Expanded Details & Timeline */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.25, ease: 'easeInOut' }}
                            className="overflow-hidden"
                          >
                            <div className="px-6 py-5 bg-slate-50 border-t border-slate-200/80 space-y-6">
                              
                              {/* Candidate Evaluation Summary Card */}
                              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-wrap items-center justify-between gap-4">
                                <div className="space-y-1">
                                  <h5 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                                    <Award className="w-4 h-4 text-[#004f90]" />
                                    <span>Evaluated Submission Performance</span>
                                  </h5>
                                  <p className="text-xs text-slate-500 font-medium">
                                    Final evaluated marks recorded at the exact moment of submission.
                                  </p>
                                </div>

                                {res ? (
                                  <div className="flex items-center gap-4 text-xs">
                                    <div className="text-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Attained Score</span>
                                      <span className="text-sm font-extrabold text-[#004f90]">{res.score} Marks</span>
                                    </div>
                                    <div className="text-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Criteria</span>
                                      <span className="text-sm font-extrabold text-slate-700">{res.totalMarks} Marks</span>
                                    </div>
                                    <div className="text-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Percentage</span>
                                      <span className="text-sm font-extrabold text-emerald-700">{res.percentage}%</span>
                                    </div>
                                    <div className="text-center px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg">
                                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Time Spent</span>
                                      <span className="text-sm font-extrabold text-slate-700">
                                        {Math.floor((res.timeTaken || 0) / 60)}m {(res.timeTaken || 0) % 60}s
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-xs font-semibold text-slate-500">
                                    Candidate has not submitted responses yet.
                                  </span>
                                )}
                              </div>

                              {/* Timeline of Recorded Events */}
                              <div className="space-y-3">
                                <p className="text-[11px] font-extrabold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
                                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Violation Audit Timeline ({log.events?.length || 0} Event{(log.events?.length || 0) === 1 ? '' : 's'})</span>
                                </p>

                                <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                                  {log.events && log.events.length > 0 ? (
                                    log.events.map((ev, idx) => {
                                      const isTab = ev.type === 'tab_switch';
                                      return (
                                        <div
                                          key={idx}
                                          className="bg-white border border-slate-200/80 rounded-xl p-3 shadow-2xs flex items-center justify-between gap-3 text-xs"
                                        >
                                          <div className="flex items-center gap-2.5">
                                            <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded ${
                                              isTab ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                                            }`}>
                                              {isTab ? 'Tab Switch' : 'ESC / Fullscreen Exit'}
                                            </span>
                                            <span className="text-slate-600 font-medium">
                                              {isTab 
                                                ? 'Candidate minimized exam browser window or switched to an external tab.' 
                                                : 'Candidate pressed ESC key or exited proctored full-screen window mode.'}
                                            </span>
                                          </div>
                                          <span className="text-[10px] text-slate-400 font-mono font-semibold shrink-0">
                                            {new Date(ev.timestamp).toLocaleString([], {
                                              month: 'short', day: 'numeric',
                                              hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true
                                            })}
                                          </span>
                                        </div>
                                      );
                                    })
                                  ) : (
                                    <p className="text-xs text-slate-400 font-medium">No individual timeline events logged.</p>
                                  )}
                                </div>
                              </div>

                              {/* Reset Clearance Actions */}
                              <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                <div>
                                  <h6 className="text-xs font-bold text-slate-800">Clear Violations & Grant Exam Re-take</h6>
                                  <p className="text-[11px] text-slate-500 font-medium">
                                    Resets candidate security lockout and clears previous submission to allow an authorized fresh attempt.
                                  </p>
                                </div>

                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleResetAccess(log);
                                  }}
                                  className="px-4 py-2 bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-rose-200 hover:border-rose-300 rounded-xl text-xs font-bold transition cursor-pointer shadow-2xs flex items-center gap-1.5 shrink-0 self-start sm:self-auto"
                                >
                                  <RotateCcw className="w-3.5 h-3.5" />
                                  <span>Clear Violations & Reset Access</span>
                                </button>
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
          </div>
        )}
      </div>

      {/* Confirmation Modal for Resetting Access */}
      <AnimatePresence>
        {resetTarget && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setResetTarget(null)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-[2000] cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 400 }}
              className="fixed inset-0 m-auto max-w-[440px] w-[92%] h-fit bg-white rounded-2xl p-6 shadow-2xl border border-slate-200 space-y-5 z-[2100] text-center"
            >
              <div className="h-12 w-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center border border-rose-100 mx-auto shrink-0">
                <RotateCcw className="w-6 h-6 text-rose-500" />
              </div>

              <div className="space-y-2">
                <h4 className="text-lg font-bold text-slate-900 font-poppins">Grant Exam Re-take Clearance?</h4>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  This will permanently reset security violation logs and clear the current grading sheet for candidate <strong className="text-slate-800">"{resetTarget.studentName}"</strong> on assessment:
                </p>
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-center">
                  <p className="text-xs font-bold text-[#004f90]">{resetTarget.testTitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setResetTarget(null)}
                  className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold py-2.5 rounded-xl text-xs transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={confirmResetAccess}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-semibold py-2.5 rounded-xl text-xs transition shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm Reset</span>
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
