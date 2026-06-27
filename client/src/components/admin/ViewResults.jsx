import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { Award, FileSpreadsheet, Filter, Search, ArrowLeft, Clock, CheckCircle, XCircle, ChevronRight, Eye, AlertCircle, RotateCcw, AlertTriangle, ShieldAlert } from 'lucide-react';
import ResultScreen from '../student/ResultScreen.jsx';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const ViewResults = ({ test, onBack }) => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedBatch, setSelectedBatch] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [activeScorecardId, setActiveScorecardId] = useState('');
  const [resetTarget, setResetTarget] = useState(null);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/results/test/${test._id}`);
      setResults(data);
    } catch (err) {
      toast.error('Failed to retrieve test candidate attempts.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetAttempt = (studentId, studentName) => {
    if (!studentId) return;
    setResetTarget({ studentId, studentName });
  };

  const confirmResetAttempt = async () => {
    if (!resetTarget) return;
    const { studentId, studentName } = resetTarget;
    setResetTarget(null);

    const loadToastId = toast.loading(`Resetting test attempt for ${studentName}...`);
    try {
      await api.delete(`/results/student/${studentId}/test/${test._id}`);
      toast.success(`Exam attempt reset successfully! ${studentName} can now re-take the test.`, { id: loadToastId });
      fetchResults();
    } catch (err) {
      toast.error(err.response?.data?.message || `Failed to reset test attempt for ${studentName}.`, { id: loadToastId });
    }
  };

  useEffect(() => {
    fetchResults();
  }, [test]);

  const handleDownloadExcel = async () => {
    const loader = toast.loading('Compiling multi-sheet Excel workbook from server...');
    try {
      const response = await api.get(`/reports/excel/${test._id}`, {
        responseType: 'blob'
      });

      const blob = new Blob([response.data], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      
      const safeTitle = test.title.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      link.download = `excel-report-${safeTitle}-${test._id.slice(-4)}.xlsx`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast.success('Spreadsheet downloaded successfully!', { id: loader });
    } catch (error) {
      console.error(error);
      toast.error('Failed to generate Excel report.', { id: loader });
    }
  };

  const uniqueDepts = Array.from(new Set(results.map((r) => r.studentId?.department).filter(Boolean)));
  const uniqueBatches = Array.from(new Set(results.map((r) => r.studentId?.batch).filter(Boolean)));

  const filteredResults = results.filter((res) => {
    const student = res.studentId;
    if (!student) return false;

    const matchSearch =
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.rollNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchDept = selectedDept === 'ALL' || student.department === selectedDept;
    const matchBatch = selectedBatch === 'ALL' || student.batch === selectedBatch;
    
    let matchStatus = true;
    if (selectedStatus === 'PASS') matchStatus = res.passed;
    if (selectedStatus === 'FAIL') matchStatus = !res.passed;

    return matchSearch && matchDept && matchBatch && matchStatus;
  });

  if (activeScorecardId) {
    // Sub-route: Show full scorecard details
    return (
      <div className="animate-fadeIn">
        <ResultScreen
          resultId={activeScorecardId}
          onBack={() => setActiveScorecardId('')}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-accent/15 pb-4 gap-4">
        <div className="space-y-1">
          <button
            onClick={onBack}
            className="flex items-center space-x-1.5 text-xs text-softgrey hover:text-[#004f90] transition-colors mb-1.5"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Test Manager</span>
          </button>
          
          <span className="text-[10px] text-accent font-bold tracking-widest uppercase">Grading & Score sheets</span>
          <h2 className="text-xl font-black text-white">{test.title}</h2>
          <p className="text-xs text-softgrey">
            Pass Marks Threshold: <span className="text-white font-bold">{test.passMark}</span> out of {test.totalMarks}
          </p>
        </div>

        {results.length > 0 && (
          <button
            onClick={handleDownloadExcel}
            className="gold-shimmer-hover bg-gradient-to-r from-success to-success hover:from-green-500 hover:to-success text-charcoal hover:text-white font-extrabold px-4 py-2.5 rounded-lg text-xs flex items-center space-x-2 border border-accent/20 shadow-md transition-all duration-300 shrink-0"
          >
            <FileSpreadsheet className="h-4.5 w-4.5" />
            <span>Download Excel Report</span>
          </button>
        )}
      </div>

      {/* Filter panel console */}
      <div className="bg-charcoal-surface border border-accent/10 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-md">
        
        {/* Search bar */}
        <div className="relative w-full md:flex-1">
          <input
            type="text"
            placeholder="Search by candidate name or roll number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-charcoal-light border border-accent/5 rounded-lg py-2.5 pl-9 pr-4 text-white text-xs placeholder-softgrey/35 focus:outline-none focus:border-accent/40"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-softgrey/40" />
        </div>

        {/* Filter items */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          
          {/* Department */}
          <div className="flex items-center space-x-1.5 text-xs text-softgrey">
            <Filter className="h-3.5 w-3.5 text-accent shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-charcoal-light border border-accent/5 rounded py-1.5 px-2 text-white text-[11px] focus:outline-none"
            >
              <option value="ALL">All Departments</option>
              {uniqueDepts.map(dept => <option key={dept} value={dept}>{dept}</option>)}
            </select>
          </div>

          {/* Batch */}
          <select
            value={selectedBatch}
            onChange={(e) => setSelectedBatch(e.target.value)}
            className="bg-charcoal-light border border-accent/5 rounded py-1.5 px-2 text-white text-[11px] focus:outline-none"
          >
            <option value="ALL">All Batches</option>
            {uniqueBatches.map(batch => <option key={batch} value={batch}>Batch {batch}</option>)}
          </select>

          {/* Result Status */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-charcoal-light border border-accent/5 rounded py-1.5 px-2 text-white text-[11px] focus:outline-none"
          >
            <option value="ALL">All Grades</option>
            <option value="PASS">Passes Only</option>
            <option value="FAIL">Fails Only</option>
          </select>
        </div>
      </div>

      {/* Main Leaderboard Table */}
      <div className="bg-charcoal-surface border border-accent/15 rounded-xl p-5 shadow-xl">
        {loading ? (
          <div className="py-20 text-center text-xs text-softgrey">Loading results ledger...</div>
        ) : filteredResults.length === 0 ? (
          <div className="py-12 text-center text-xs text-softgrey space-y-2">
            <AlertCircle className="h-8 w-8 text-softgrey/30 mx-auto" />
            <p className="font-semibold">No candidate entries found matching criteria.</p>
            <p className="text-[10px] text-softgrey/50">Ensure that candidates have finished their test attempts.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-accent/10 text-softgrey uppercase font-bold tracking-wider">
                  <th className="pb-3.5 pl-3">Rank</th>
                  <th className="pb-3.5">Candidate</th>
                  <th className="pb-3.5">Roll No</th>
                  <th className="pb-3.5">Department</th>
                  <th className="pb-3.5">Batch</th>
                  <th className="pb-3.5 text-center">Score Ratio</th>
                  <th className="pb-3.5 text-center">Percentage</th>
                  <th className="pb-3.5 text-center">Status</th>
                  <th className="pb-3.5 text-center">Duration</th>
                  <th className="pb-3.5 pr-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-accent/5">
                {filteredResults.map((res, index) => {
                  const s = res.studentId;
                  const mins = Math.floor(res.timeTaken / 60);
                  const secs = res.timeTaken % 60;
                  
                  return (
                    <tr key={res._id} className="hover:bg-charcoal-light/30 transition-colors">
                      <td className="py-3.5 pl-3 font-bold text-accent font-mono">#{index + 1}</td>
                      <td className="py-3.5 font-bold text-white">{s?.name || 'Unknown'}</td>
                      <td className="py-3.5 text-softgrey font-mono uppercase">{s?.rollNumber || 'N/A'}</td>
                      <td className="py-3.5 text-softgrey">{s?.department || 'N/A'}</td>
                      <td className="py-3.5 text-softgrey font-mono">{s?.batch || 'N/A'}</td>
                      <td className="py-3.5 text-center text-white font-bold">{res.score} / {res.totalMarks}</td>
                      <td className="py-3.5 text-center font-bold text-white font-mono">{res.percentage}%</td>
                      <td className="py-3.5 text-center">
                        <span className={`inline-block px-2.5 py-0.5 rounded-full font-bold text-[9px] border ${
                          res.passed
                            ? 'bg-success/15 border-success/30 text-success'
                            : 'bg-danger/15 border-danger/30 text-danger'
                        }`}>
                          {res.passed ? 'PASS' : 'FAIL'}
                        </span>
                      </td>
                      <td className="py-3.5 text-center text-softgrey/80 font-mono">
                        {mins > 0 ? `${mins}m ${secs}s` : `${secs}s`}
                      </td>
                      <td className="py-3.5 pr-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setActiveScorecardId(res._id)}
                            className="flex items-center space-x-1 text-accent hover:text-white bg-charcoal-light hover:bg-primary/20 border border-accent/15 hover:border-accent/40 px-2.5 py-1 rounded transition-colors text-[10px] font-bold"
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>Review Sheet</span>
                          </button>
                          
                          <button
                            onClick={() => handleResetAttempt(s?._id, s?.name)}
                            className="flex items-center space-x-1 text-red-500 hover:text-white bg-charcoal-light hover:bg-red-950/30 border border-red-500/20 hover:border-red-500 px-2.5 py-1 rounded transition-all text-[10px] font-bold cursor-pointer"
                            title="Reset candidate test attempt and violation history"
                          >
                            <RotateCcw className="h-3.5 w-3.5" />
                            <span>Reset Attempt</span>
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
                <h4 className="text-xl font-bold text-slate-900 font-sans tracking-tight">Reset Candidate Attempt?</h4>
                <p className="text-sm text-slate-500 font-medium leading-relaxed px-2">
                  This will permanently delete the grading/result sheet and proctoring logs for:
                </p>
                <div className="bg-slate-50 border border-slate-150 rounded-xl p-3 mt-2 text-center">
                  <p className="text-xs font-bold text-slate-850">{resetTarget.studentName}</p>
                  <p className="text-[10px] text-[#004f90] font-bold mt-1">Test: {test.title}</p>
                </div>
                <p className="text-xs text-red-600 font-semibold mt-2.5 flex items-center justify-center gap-1.5">
                  <ShieldAlert className="h-3.5 w-3.5 text-red-500" />
                  <span>This candidate will be allowed to re-take the test from scratch.</span>
                </p>
              </div>

              <div className="flex items-center gap-3 w-full pt-1">
                <button
                  onClick={confirmResetAttempt}
                  className="flex-1 bg-red-600 hover:bg-red-750 text-white font-semibold py-3 px-5 rounded-xl text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="h-4 w-4" />
                  <span>Reset Attempt</span>
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

export default ViewResults;
