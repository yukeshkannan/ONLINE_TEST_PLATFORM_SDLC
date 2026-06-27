import React, { useState, useEffect } from 'react';
import api, { getAccessToken } from '../../utils/api.js';
import { Award, Clock, CheckCircle, XCircle, AlertCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

const ResultScreen = ({ resultId, onBack }) => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!resultId || !getAccessToken()) {
      setLoading(false);
      return;
    }

    const fetchResultDetails = async () => {
      try {
        const { data } = await api.get(`/results/${resultId}`);
        setResult(data);
      } catch (err) {
        toast.error('Failed to load scorecard details.');
      } finally {
        setLoading(false);
      }
    };
    fetchResultDetails();
  }, [resultId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <div className="h-12 w-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-softgrey">Analyzing scorecard metrics...</p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="text-center py-20 space-y-4">
        <AlertCircle className="h-12 w-12 text-danger mx-auto" />
        <p className="text-white font-bold">Failed to load scorecard.</p>
        <button onClick={onBack} className="text-accent underline text-xs font-semibold">
          Return to Dashboard
        </button>
      </div>
    );
  }

  const { testId, score, totalMarks, percentage, passed, timeTaken, answers, studentId } = result;

  const correctCount = answers.filter((a) => a.isCorrect && a.selectedOption !== '').length;
  const wrongCount = answers.filter((a) => !a.isCorrect && a.selectedOption !== '').length;
  const skippedCount = answers.filter((a) => a.selectedOption === '').length;

  const durationMins = Math.floor(timeTaken / 60);
  const durationSecs = timeTaken % 60;

  const radius = 70;
  const strokeWidth = 10;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const showResults = testId?.showResultsToStudents !== false;

  return (
    <div className="space-y-10 py-6 max-w-4xl mx-auto">
      
      {/* Return button */}
      <button
        onClick={onBack}
        className="flex items-center space-x-2 text-softgrey hover:text-[#004f90] text-xs font-bold transition-colors group"
      >
        <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
        <span>Return to Dashboard</span>
      </button>

      {showResults ? (
        <>
          {/* Main Score Overview Card */}
          <div className="gold-border-highlight bg-charcoal-surface rounded-2xl p-6 md:p-8 shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className={`absolute top-0 left-0 right-0 h-[3px] ${passed ? 'bg-success' : 'bg-danger'}`}></div>

            {/* SVG Circular Progress Gauge */}
            <div className="relative flex items-center justify-center shrink-0">
              <svg className="w-40 h-40 transform -rotate-90">
                {/* Background Track */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className="stroke-charcoal-light fill-transparent"
                  strokeWidth={strokeWidth}
                />
                {/* Colored Progress Ring */}
                <motion.circle
                  cx="80"
                  cy="80"
                  r={radius}
                  className={`fill-transparent ${passed ? 'stroke-success' : 'stroke-danger'}`}
                  strokeWidth={strokeWidth}
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset: strokeDashoffset }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  strokeLinecap="round"
                />
              </svg>
              {/* Inner Percentage value */}
              <div className="absolute text-center">
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight">{percentage}%</span>
                <span className="text-[9px] text-softgrey block mt-0.5 uppercase tracking-widest">Score Obtained</span>
              </div>
            </div>

            {/* Text Stats and Badge */}
            <div className="flex-1 space-y-4 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-3 justify-center md:justify-start">
                <h2 className="text-xl md:text-2xl font-black text-slate-800">{testId?.title || 'Assessment Result'}</h2>
                
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className={`inline-block text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider border ${
                    passed 
                      ? 'bg-success/15 text-success border-success/40' 
                      : 'bg-danger/15 text-danger border-danger/40'
                  }`}
                >
                  {passed ? 'PASSED (QUALIFIED)' : 'FAILED (NOT QUALIFIED)'}
                </motion.span>
              </div>

              <p className="text-xs text-softgrey leading-relaxed max-w-[600px] w-full mx-auto md:mx-0">
                This sheet details the performance aggregates compiled for candidate <span className="text-slate-800 font-bold">{studentId?.name || 'Student'}</span> ({studentId?.rollNumber}). Individual answer analytics are reviewable below.
              </p>

              {/* Quick Metrics Columns */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-2">
                <div className="bg-charcoal-light p-3 rounded-xl border border-accent/5">
                  <span className="text-[9px] text-softgrey uppercase block font-semibold">Marks Secured</span>
                  <span className="text-base font-extrabold text-slate-800 mt-1 block">{score} / {totalMarks}</span>
                </div>
                
                <div className="bg-charcoal-light p-3 rounded-xl border border-accent/5">
                  <span className="text-[9px] text-softgrey uppercase block font-semibold">Accuracy</span>
                  <span className="text-base font-extrabold text-slate-800 mt-1 block">
                    {totalMarks > 0 ? `${((score / totalMarks) * 100).toFixed(0)}%` : 'N/A'}
                  </span>
                </div>

                <div className="bg-charcoal-light p-3 rounded-xl border border-accent/5">
                  <span className="text-[9px] text-softgrey uppercase block font-semibold">Time Spent</span>
                  <span className="text-base font-extrabold text-slate-800 mt-1 block flex items-center justify-center md:justify-start space-x-1">
                    <Clock className="h-4 w-4 text-accent" />
                    <span>{durationMins > 0 ? `${durationMins}m ${durationSecs}s` : `${durationSecs}s`}</span>
                  </span>
                </div>

                <div className="bg-charcoal-light p-3 rounded-xl border border-accent/5">
                  <span className="text-[9px] text-softgrey uppercase block font-semibold">Required Pass</span>
                  <span className="text-base font-extrabold text-accent mt-1 block">{testId?.passMark || 0} Marks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Numerical Breakdown Counters */}
          <div className="grid grid-cols-3 gap-3 md:gap-4">
            <div className="bg-charcoal-surface border border-success/20 p-3.5 md:p-4 rounded-xl text-center">
              <CheckCircle className="h-5 w-5 text-success mx-auto mb-1.5" />
              <span className="text-[10px] text-softgrey block uppercase font-bold">Correct</span>
              <span className="text-xl font-extrabold text-success mt-1 block">{correctCount}</span>
            </div>
            <div className="bg-charcoal-surface border border-danger/20 p-3.5 md:p-4 rounded-xl text-center">
              <XCircle className="h-5 w-5 text-danger mx-auto mb-1.5" />
              <span className="text-[10px] text-softgrey block uppercase font-bold">Wrong</span>
              <span className="text-xl font-extrabold text-danger mt-1 block">{wrongCount}</span>
            </div>
            <div className="bg-charcoal-surface border border-accent/15 p-3.5 md:p-4 rounded-xl text-center">
              <AlertCircle className="h-5 w-5 text-accent mx-auto mb-1.5" />
              <span className="text-[10px] text-softgrey block uppercase font-bold">Skipped</span>
              <span className="text-xl font-extrabold text-softgrey mt-1 block">{skippedCount}</span>
            </div>
          </div>

          {/* Question paper review section */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider pl-2 border-l-2 border-accent">
              Detailed Question Review
            </h3>

            <div className="space-y-6">
              {answers.map((ans, idx) => {
                const q = ans.questionId;
                if (!q) return null;

                const isSkipped = ans.selectedOption === '';
                const isCorrect = ans.isCorrect;

                return (
                  <div
                    key={ans._id || idx}
                    className={`bg-charcoal-surface border rounded-xl p-5 space-y-4 relative ${
                      isSkipped
                        ? 'border-accent/10'
                        : isCorrect
                        ? 'border-success/30'
                        : 'border-danger/30'
                    }`}
                  >
                    {/* Visual indicator corner */}
                    <div className={`absolute top-0 bottom-0 left-0 w-[4px] rounded-l-xl ${
                      isSkipped ? 'bg-softgrey/30' : isCorrect ? 'bg-success' : 'bg-danger'
                    }`}></div>

                    {/* Question index & marks */}
                    <div className="flex items-center justify-between text-xs border-b border-accent/5 pb-2.5">
                      <span className="font-bold text-softgrey">Question {q.order || idx + 1}</span>
                      <span className={`font-semibold ${isCorrect ? 'text-success' : 'text-danger'}`}>
                        {isCorrect ? `+${q.marks || 1} Marks` : '0 Marks'}
                      </span>
                    </div>

                    {/* Question Text */}
                    <p className="text-sm md:text-base font-semibold text-slate-800 leading-relaxed">{q.questionText}</p>

                    {/* Choice list */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
                      {q.options.map((opt) => {
                        const isStudentPick = ans.selectedOption === opt.label;
                        const isRightKey = q.correctAnswer === opt.label;

                        let choiceStyle = 'bg-charcoal-light border-accent/5 text-softgrey';
                        if (isRightKey) {
                          choiceStyle = 'bg-success/15 border-success text-success font-semibold';
                        } else if (isStudentPick && !isCorrect) {
                          choiceStyle = 'bg-danger/15 border-danger text-danger font-semibold';
                        }

                        return (
                          <div
                            key={opt.label}
                            className={`flex items-center space-x-3 p-3 rounded-lg border text-xs leading-normal ${choiceStyle}`}
                          >
                            <span className={`w-6 h-6 rounded flex items-center justify-center text-[10px] font-bold ${
                              isRightKey
                                ? 'bg-success text-white'
                                : isStudentPick && !isCorrect
                                ? 'bg-danger text-white'
                                : 'bg-charcoal-surface text-softgrey border border-accent/10'
                            }`}>
                              {opt.label}
                            </span>
                            <span>{opt.text}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Explanatory summary text */}
                    <div className="text-[11px] text-softgrey flex flex-wrap gap-x-4 pt-1">
                      <span>
                        Your Answer: {isSkipped ? (
                          <span className="text-accent font-bold">SKIPPED</span>
                        ) : (
                          <span className={isCorrect ? 'text-success font-bold' : 'text-danger font-bold'}>
                            Option {ans.selectedOption}
                          </span>
                        )}
                      </span>
                      <span>•</span>
                      <span>
                        Correct Answer: <span className="text-success font-bold">Option {q.correctAnswer}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div className="bg-white border border-slate-100 rounded-3xl p-10 text-center max-w-2xl mx-auto space-y-8 shadow-2xl relative overflow-hidden my-6">
          <div className="absolute top-0 left-0 right-0 h-[4px] bg-gradient-to-r from-emerald-500 to-teal-400"></div>
          
          <div className="flex justify-center">
            <div className="h-16 w-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center border border-emerald-100 shadow-inner">
              <CheckCircle className="h-9 w-9" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">Assessment Submitted Successfully!</h2>
            <p className="text-sm text-slate-600 font-medium leading-relaxed px-4">
              Thank you, <span className="text-slate-800 font-black">{studentId?.name || 'Student'}</span>! Your attempt for <span className="font-extrabold text-slate-800">"{testId?.title}"</span> has been securely recorded.
            </p>
             <p className="text-xs text-slate-500 leading-relaxed max-w-[600px] w-full mx-auto px-2">
              The grades, marks scorecard, and correct answers analysis for this assessment will be released by your faculty or administrator at a later date. Please check your dashboard attempt history for updates.
            </p>
          </div>
          
          <div className="pt-6 border-t border-slate-100 max-w-md mx-auto flex flex-col gap-3 w-full text-left">
            <div className="flex items-center justify-between bg-slate-50 px-5 py-4 rounded-xl border border-slate-100">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Duration Spent</span>
              <span className="text-sm font-extrabold text-slate-800 font-mono">
                {durationMins > 0 ? `${durationMins}m ${durationSecs}s` : `${durationSecs}s`}
              </span>
            </div>
            
            <div className="flex items-center justify-between bg-emerald-50/40 px-5 py-4 rounded-xl border border-emerald-100/40">
              <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Submission Status</span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 uppercase tracking-wide">
                Submitted
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultScreen;
