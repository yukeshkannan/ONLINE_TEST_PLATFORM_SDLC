import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useTimer } from '../../hooks/useTimer.js';
import { useTest } from '../../hooks/useTest.js';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import QuestionCard from '../shared/QuestionCard.jsx';
import Timer from '../shared/Timer.jsx';
import { ShieldAlert, AlertTriangle, ChevronLeft, ChevronRight, Bookmark, CheckCircle2, Maximize, Lock, LayoutGrid } from 'lucide-react';
import toast from 'react-hot-toast';

const TestEngine = ({ test, onFinish }) => {
  const { user } = useAuth();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const submitLock = useRef(false);
  const hasStartedExam = useRef(false);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const { data } = await api.get(`/tests/${test._id}/questions`);
        
        let shuffled = [...data];
        const savedOrderKey = `assessment_order_${test._id}`;
        const savedOrder = localStorage.getItem(savedOrderKey);
        
        if (savedOrder) {
          try {
            const orderIds = JSON.parse(savedOrder);
            // Re-order data based on saved orderIds array
            const ordered = [];
            orderIds.forEach(id => {
              const q = data.find(item => item._id === id);
              if (q) ordered.push(q);
            });
            // Append any new questions that might have been added
            data.forEach(item => {
              if (!orderIds.includes(item._id)) {
                ordered.push(item);
              }
            });
            shuffled = ordered;
          } catch (e) {
            console.error('Error restoring question order', e);
          }
        } else {
          // Shuffle questions to prevent candidate collusion (randomized sequence per student)
          for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
          }
          // Save shuffled order of question IDs
          try {
            localStorage.setItem(savedOrderKey, JSON.stringify(shuffled.map(q => q._id)));
          } catch (e) {
            console.error('Error saving question order', e);
          }
        }
        
        setQuestions(shuffled);
      } catch (err) {
        toast.error(err.response?.data?.message || 'Failed to download exam questions.');
        onFinish();
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [test]);

  const {
    currentIdx,
    answers,
    flagged,
    selectOption,
    toggleFlag,
    nextQuestion,
    prevQuestion,
    navigateTo,
    getSubmissionPayload,
    timeTaken
  } = useTest(questions, test._id);

  const handleSubmit = async (isAuto = false) => {
    if (submitLock.current) return;
    
    if (!isAuto && isSubmitLocked) {
      return;
    }

    submitLock.current = true;
    setSubmitting(true);
    toast.loading(isAuto ? 'Time up! Auto-submitting...' : 'Submitting your exam sheets...', { id: 'submit-exam' });
    
    try {
      const payload = getSubmissionPayload();
      const maxSeconds = test.duration * 60;
      const secondsSpent = Math.max(0, maxSeconds - timeRemaining);

      const { data } = await api.post('/results/submit', {
        testId: test._id,
        answers: payload,
        timeTaken: secondsSpent
      });

      toast.success('Exam submitted and graded successfully!', { id: 'submit-exam' });
      
      // Clean up localStorage items upon successful submission
      localStorage.removeItem(`assessment_answers_${test._id}`);
      localStorage.removeItem(`assessment_flagged_${test._id}`);
      localStorage.removeItem(`assessment_order_${test._id}`);

      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
      
      onFinish(data.result._id);
    } catch (err) {
      submitLock.current = false;
      toast.error(err.response?.data?.message || 'Submission failed. Please check network.', { id: 'submit-exam' });
    } finally {
      setSubmitting(false);
    }
  };

  const autoSubmitRef = useRef(handleSubmit);
  useEffect(() => {
    autoSubmitRef.current = handleSubmit;
  });

  const { timeRemaining, formatTime } = useTimer(test.duration * 60, () => {
    autoSubmitRef.current(true);
  });

  const maxSeconds = test.duration * 60;
  const secondsSpent = Math.max(0, maxSeconds - timeRemaining);
  const minSecondsRequired = Math.ceil(maxSeconds * 0.5);
  const lockSecondsRemaining = Math.max(0, minSecondsRequired - secondsSpent);
  const isSubmitLocked = lockSecondsRemaining > 0;

  const formatLockTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    const pad = (n) => (n < 10 ? `0${n}` : n);
    return `${pad(mins)}:${pad(remainingSecs)}`;
  };

  const handleOpenSubmitModal = () => {
    if (isSubmitLocked) return;
    setShowSubmitModal(true);
  };

  const triggerFullscreen = () => {
    const docEl = document.documentElement;
    if (docEl.requestFullscreen) docEl.requestFullscreen();
    else if (docEl.webkitRequestFullscreen) docEl.webkitRequestFullscreen();
    else if (docEl.msRequestFullscreen) docEl.msRequestFullscreen();
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFull = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement);
      setIsFullscreen(isFull);

      if (submitLock.current) return;

      if (isFull) {
        hasStartedExam.current = true;
      } else if (hasStartedExam.current) {
        toast.error('VIOLATION: Fullscreen exited! Automatic exam submission triggered.', { duration: 6000 });

        api.post('/violations/log', {
          testId: test._id,
          violationType: 'fullscreen_exit',
          autoSubmitted: true
        }).catch(() => {});

        setTimeout(() => {
          autoSubmitRef.current(true);
        }, 500);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    
    toast('Enter fullscreen to start your assessment.', { icon: '🖥️' });
    
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
    };
  }, [test._id]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (submitLock.current) return;
      if (document.hidden) {
        setTabSwitches(prev => prev + 1);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (!submitLock.current) {
        e.preventDefault();
        e.returnValue = 'You are in the middle of an exam. Leaving will result in data loss or automatic submission!';
        return e.returnValue;
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, []);

  useEffect(() => {
    if (tabSwitches === 0 || submitLock.current) return;

    const isAutoSubmit = tabSwitches >= 3;

    api.post('/violations/log', {
      testId: test._id,
      violationType: 'tab_switch',
      autoSubmitted: isAutoSubmit
    }).catch(() => {});

    if (isAutoSubmit) {
      toast.error('Cheating violation limit reached. Automatic submission triggered!', { duration: 5000 });
      setTimeout(() => {
        autoSubmitRef.current(true);
      }, 500);
    } else {
      toast.error(
        `WARNING: Tab switch detected! Violations: ${tabSwitches}/3. Repeated attempts will auto-submit the exam!`,
        { duration: 6000 }
      );
    }
  }, [tabSwitches, test._id]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-charcoal space-y-4">
        <div className="h-12 w-12 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-softgrey">Downloading assessment paper securely...</p>
      </div>
    );
  }

  const getInitials = (name) => {
    if (!name) return 'S';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  if (!isFullscreen) {
    return createPortal(
      <div className="fixed inset-0 w-screen h-screen z-[9999] bg-[#F1F5F9] flex items-center justify-center p-4 md:p-6 overflow-y-auto font-sans">
        <div className="w-full max-w-[500px] bg-white border border-slate-200/80 rounded-[24px] p-6 md:p-7.5 shadow-2xl relative space-y-6 my-auto">
          
          <div className="flex flex-col items-center space-y-3">
            <img 
              src="/logo.png" 
              alt="SDLC Logo" 
              className="h-10 w-auto object-contain max-w-[170px]"
            />
            <div className="space-y-0.5 text-center">
              <div className="text-xl font-black text-slate-800 font-poppins tracking-tight uppercase">Secure Assessment Gateway</div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Authentication & Integrity Clearance</p>
            </div>
          </div>

          <div className="bg-[#f8fafc] border border-slate-100 rounded-xl p-4 flex items-center space-x-3.5 text-left w-full">
            <div className="h-11 w-11 bg-gradient-to-tr from-[#004f90] to-blue-500 text-white rounded-xl flex items-center justify-center border border-white shadow font-bold text-sm shrink-0 uppercase">
              {getInitials(user?.name)}
            </div>
            <div className="flex-1 space-y-0.5 min-w-0">
              <div className="text-sm font-black text-slate-800 tracking-tight leading-none truncate">{user?.name}</div>
              <div className="text-[11px] text-slate-400 font-bold font-mono tracking-wider truncate">{user?.rollNumber} • {user?.department}</div>
            </div>
            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0">Verified</span>
          </div>

          <div className="space-y-3.5 text-left">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Security Directives</div>
            
            <div className="space-y-2.5">
              <div className="flex items-start gap-3 bg-amber-50/40 border border-amber-100/50 p-3.5 rounded-xl text-xs">
                <ShieldAlert className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-700 block">Strict Fullscreen Protocol</span>
                  <span className="text-slate-500 font-medium leading-relaxed block text-[11px]">This exam requires active fullscreen focus. Exiting fullscreen mode halts access instantly.</span>
                </div>
              </div>

              <div className="flex items-start gap-3 bg-red-50/40 border border-red-100/50 p-3.5 rounded-xl text-xs">
                <AlertTriangle className="h-4.5 w-4.5 text-red-500 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-extrabold text-slate-700 block">Zero-Tolerance Tab Lock</span>
                  <span className="text-slate-500 font-medium leading-relaxed block text-[11px]">Tab switches are strictly logged. Exceeding 3 tab switch violations triggers automatic exam submission.</span>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={triggerFullscreen}
            className="w-full bg-[#004f90] hover:bg-[#003c6e] text-white font-extrabold py-3 rounded-full text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.97] cursor-pointer flex items-center justify-center space-x-2"
          >
            <Maximize className="h-4 w-4" />
            <span>Authorize Clearance & Start Test</span>
          </button>
        </div>
      </div>,
      document.body
    );
  }

  const currentQuestion = questions[currentIdx];

  return (
    <div className="h-screen max-h-screen w-screen overflow-hidden bg-charcoal flex flex-col select-none relative">
      <header className="h-16 bg-charcoal-surface border-b border-accent/15 px-6 flex items-center justify-between z-10 shrink-0">
        <div className="flex items-center space-x-4">
          <img 
            src="/logo.png" 
            alt="SDLC Logo" 
            className="h-10 w-auto object-contain max-w-[150px]"
          />
          <div className="border-l border-slate-200 pl-4 flex flex-col justify-center">
            <span className="text-[9px] text-accent tracking-widest uppercase font-bold leading-none">In-Progress Assessment</span>
            <h2 className="text-xs md:text-sm font-bold text-slate-800 line-clamp-1 mt-1 leading-none">{test.title}</h2>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="lg:hidden flex items-center justify-center bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-600 p-2 rounded-xl transition-all cursor-pointer shadow-sm shrink-0"
            title="Toggle Question Navigator"
          >
            <LayoutGrid className="h-5 w-5 text-[#004f90]" />
          </button>

          {/* Live Timer */}
          <Timer formatTime={formatTime} timeRemaining={timeRemaining} />
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-grow flex flex-col lg:flex-row relative min-h-0 overflow-hidden bg-charcoal">
        
        {/* Backdrop Overlay for mobile drawer */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-30 lg:hidden cursor-pointer"
          />
        )}

        {/* Left Side: Question Navigator Grid */}
        <aside className={`
          fixed lg:relative top-0 lg:top-auto bottom-0 lg:bottom-auto left-0 z-40 
          w-80 bg-charcoal-light border-r border-accent/10 p-5 
          flex flex-col h-full min-h-0 overflow-hidden shrink-0
          transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}>
          {/* Navigator Title */}
          <div className="shrink-0 pb-4 border-b border-accent/10 mb-4 flex items-center justify-between">
            <h3 className="text-xs font-bold text-softgrey uppercase tracking-widest pl-1.5 border-l-2 border-accent">
              Navigator Grid
            </h3>
            <span className="text-[10px] font-bold bg-primary/15 text-[#004f90] border border-primary/20 px-2.5 py-0.5 rounded-full">
              {Object.values(answers).filter(Boolean).length} / {questions.length} Solved
            </span>
          </div>

          {/* Grid Box (Scrollable) */}
          <div className="flex-grow overflow-y-auto min-h-0 pr-1 mb-4">
            <div className="grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isCurrent = idx === currentIdx;
                const isAnswered = !!answers[q._id];
                const isFlagged = flagged[q._id];

                let boxStyles = 'bg-charcoal-surface text-softgrey border-accent/10 hover:bg-slate-50 hover:text-slate-800';
                if (isCurrent) {
                  boxStyles = 'border-accent !bg-primary/10 !text-primary !border-primary font-black shadow-lg shadow-accent/5';
                } else if (isFlagged) {
                  boxStyles = '!bg-danger/15 !border-danger/30 !text-danger font-bold';
                } else if (isAnswered) {
                  boxStyles = '!bg-success/15 !border-success/30 !text-success font-semibold';
                }

                return (
                  <button
                    key={q._id}
                    onClick={() => {
                      navigateTo(idx);
                      setIsSidebarOpen(false);
                    }}
                    className={`w-10 h-10 rounded-lg text-xs font-bold transition-all duration-300 border flex items-center justify-center cursor-pointer ${boxStyles}`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sidebar Footer (Violations alerts if active) */}
          {tabSwitches > 0 && (
            <div className="shrink-0 border-t border-accent/10 pt-4 mt-auto bg-charcoal-light z-10">
              <div className="bg-danger/10 border border-danger/20 text-danger p-2.5 rounded-lg text-[9px] flex items-center space-x-2 font-bold animate-pulse shadow-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Violations: {tabSwitches}/3</span>
              </div>
            </div>
          )}
        </aside>

        {/* Center/Right Workspace: Question Panel */}
        <main className="flex-grow flex flex-col min-h-0 bg-charcoal relative overflow-hidden">
          {/* Scrollable Question Content Area */}
          <div className="flex-grow overflow-y-auto p-6 md:p-10 w-full max-w-4xl mx-auto select-none pb-24">
            <div className="space-y-6">
              <QuestionCard
                question={currentQuestion}
                selectedOption={answers[currentQuestion?._id]}
                onSelectOption={(label) => selectOption(currentQuestion._id, label)}
                questionNumber={currentIdx + 1}
                totalQuestions={questions.length}
              />

              {/* Quick Actions (Flag for review) */}
              <div className="flex items-center justify-between">
                <button
                  onClick={() => toggleFlag(currentQuestion._id)}
                  className={`flex items-center space-x-2 px-4.5 py-2.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                    flagged[currentQuestion?._id]
                      ? 'bg-danger/20 border-danger text-danger'
                      : 'bg-charcoal-surface border-accent/15 text-softgrey hover:text-slate-800 hover:bg-slate-50 hover:border-accent/40'
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  <span>{flagged[currentQuestion?._id] ? 'Unflag Question' : 'Flag for Review'}</span>
                </button>

                {answers[currentQuestion?._id] && (
                  <button
                    onClick={() => selectOption(currentQuestion._id, '')}
                    className="text-xs font-semibold text-softgrey hover:text-danger transition-colors underline cursor-pointer"
                  >
                    Clear Selection
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Action Footer Controls (Pinned at bottom) */}
          <div className="shrink-0 bg-charcoal-surface border-t border-accent/15 px-6 py-4 flex items-center justify-between shadow-2xl relative z-10 w-full">
            <div className="max-w-4xl mx-auto w-full flex items-center justify-between gap-4">
              <button
                onClick={prevQuestion}
                disabled={currentIdx === 0}
                className="flex items-center space-x-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 hover:bg-slate-50 px-6 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40 disabled:pointer-events-none cursor-pointer shadow-sm active:scale-[0.98]"
              >
                <ChevronLeft className="h-4.5 w-4.5" />
                <span>Previous</span>
              </button>

              <div className="flex items-center space-x-3 shrink-0">
                {currentIdx < questions.length - 1 && (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center space-x-2 bg-[#004f90] hover:bg-[#003c6e] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-md shadow-[#004f90]/10 hover:shadow-lg active:scale-[0.98]"
                  >
                    <span>Next</span>
                    <ChevronRight className="h-4.5 w-4.5" />
                  </button>
                )}

                {isSubmitLocked ? (
                  <button
                    disabled={true}
                    className="flex items-center space-x-2 bg-slate-100 border border-slate-200 text-slate-400 font-extrabold px-6 py-2.5 rounded-xl text-xs cursor-not-allowed shrink-0"
                    title="You can submit the test after spending at least 50% of the exam time."
                  >
                    <Lock className="h-4 w-4 text-slate-400" />
                    <span>Submit Locked ({formatLockTime(lockSecondsRemaining)})</span>
                  </button>
                ) : (
                  <button
                    onClick={handleOpenSubmitModal}
                    className="flex items-center space-x-2 bg-gradient-to-r from-amber-500 to-[#F7931A] hover:from-emerald-500 hover:to-emerald-600 text-white font-extrabold px-6 py-2.5 rounded-xl text-xs border border-amber-600/30 shadow-md shadow-amber-500/10 hover:shadow-lg active:scale-[0.98] transition-all cursor-pointer shrink-0"
                  >
                    <CheckCircle2 className="h-4.5 w-4.5" />
                    <span>Submit Assessment</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Submit Modal Overlay */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 px-4 blur-none">
          <div className="glass-effect max-w-sm w-full rounded-2xl p-6 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-accent"></div>
            
            <div className="text-center space-y-3">
              <AlertTriangle className="h-12 w-12 text-accent mx-auto" />
              <h4 className="text-lg font-bold text-white">Submit Examination?</h4>
              <p className="text-xs text-softgrey leading-relaxed">
                You have answered <span className="text-white font-bold">{Object.values(answers).filter(Boolean).length}</span> out of <span className="text-white font-bold">{questions.length}</span> questions. Once submitted, you cannot modify your answers.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 bg-charcoal-light border border-accent/15 text-softgrey hover:text-white font-bold py-2.5 rounded-lg text-xs transition-colors cursor-pointer"
                disabled={submitting}
              >
                Go Back
              </button>
              <button
                onClick={() => {
                  setShowSubmitModal(false);
                  handleSubmit(false);
                }}
                className="flex-1 bg-accent text-charcoal hover:bg-success hover:text-white font-extrabold py-2.5 rounded-lg text-xs transition-colors shadow-lg cursor-pointer"
                disabled={submitting}
              >
                Yes, Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TestEngine;
