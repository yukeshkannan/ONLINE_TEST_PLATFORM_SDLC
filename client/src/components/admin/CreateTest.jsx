import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { parsePdfToText } from '../../utils/pdfParser.js';
import { parseTextToQuestions } from '../../utils/questionParser.js';
import { 
  FileText, Save, X, Plus, Trash2, Calendar, Clock, BookOpen, AlertCircle, 
  ArrowLeft, Upload, HelpCircle, CheckCircle2, GraduationCap, Building2, 
  Layers, Check, FileSpreadsheet, Send, ChevronDown, Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const CreateTest = ({ testToEdit, onSave, onCancel }) => {
  const isEditing = !!testToEdit;

  // Metadata form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const getTodayDateStr = () => new Date().toISOString().split('T')[0];
  const getNextMonthDateStr = () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  const [instructions, setInstructions] = useState('');
  const [duration, setDuration] = useState('30');
  const [customPassMark, setCustomPassMark] = useState(testToEdit?.passMark !== undefined ? String(testToEdit.passMark) : '');
  const [status, setStatus] = useState(testToEdit ? testToEdit.status : 'active'); // draft | active | ended
  const [showResultsToStudents, setShowResultsToStudents] = useState(true);

  // Custom 12-hour AM/PM Time States
  const [startDate, setStartDate] = useState(getTodayDateStr);
  const [startHour, setStartHour] = useState('09');
  const [startMinute, setStartMinute] = useState('00');
  const [startAmpm, setStartAmpm] = useState('AM');

  const [endDate, setEndDate] = useState(getNextMonthDateStr);
  const [endHour, setEndHour] = useState('11');
  const [endMinute, setEndMinute] = useState('59');
  const [endAmpm, setEndAmpm] = useState('PM');

  // Category Mode & Cohort targeting controls ('college' | 'institute')
  const [categoryMode, setCategoryMode] = useState('college');
  const [targetDept, setTargetDept] = useState('All Departments');
  const [targetYear, setTargetYear] = useState('All Years');
  const [targetBatch, setTargetBatch] = useState('All Batches');

  // Multi-Select Tag States
  const [selectedDepts, setSelectedDepts] = useState(['All Departments']);
  const [selectedYears, setSelectedYears] = useState(['All Years']);
  const [selectedBatches, setSelectedBatches] = useState(['All Batches']);
  const [selectedCenters, setSelectedCenters] = useState(['All Branches']);

  const [deptList, setDeptList] = useState([]);
  const [allBatches, setAllBatches] = useState([]);
  const [centerList, setCenterList] = useState([]);

  // Questions state
  const [questions, setQuestions] = useState([
    {
      questionText: '',
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      correctAnswer: 'A'
    }
  ]);

  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Bulk Import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [notepadText, setNotepadText] = useState('');
  const [parsedQuestions, setParsedQuestions] = useState([]);

  useEffect(() => {
    api.get('/cohorts/departments')
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setDeptList(data.filter(d => d.isActive !== false).map(d => d.code));
        }
      })
      .catch(() => {});

    api.get('/cohorts/batches')
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setAllBatches(data.filter(b => b.isActive !== false));
        }
      })
      .catch(() => {});

    api.get('/cohorts/centers')
      .then(({ data }) => {
        if (Array.isArray(data)) {
          setCenterList(data.filter(c => c.isActive !== false).map(c => c.name));
        }
      })
      .catch(() => {});
  }, []);

  // Compute dynamic batch list filtering by categoryMode
  const batchList = allBatches
    .filter(b => categoryMode === 'college' ? b.category === 'college' : b.category !== 'college')
    .map(b => b.name);

  const toggleTargetDept = (dept) => {
    if (dept === 'All Departments') {
      setSelectedDepts(['All Departments']);
      setTargetDept('All Departments');
      return;
    }
    let updated = selectedDepts.filter(d => d !== 'All Departments');
    if (updated.includes(dept)) {
      updated = updated.filter(d => d !== dept);
    } else {
      updated.push(dept);
    }
    if (updated.length === 0) updated = ['All Departments'];
    setSelectedDepts(updated);
    setTargetDept(updated[0]);
  };

  const toggleTargetYear = (yr) => {
    if (yr === 'All Years') {
      setSelectedYears(['All Years']);
      setTargetYear('All Years');
      return;
    }
    let updated = selectedYears.filter(y => y !== 'All Years');
    if (updated.includes(yr)) {
      updated = updated.filter(y => y !== yr);
    } else {
      updated.push(yr);
    }
    if (updated.length === 0) updated = ['All Years'];
    setSelectedYears(updated);
    setTargetYear(updated[0]);
  };

  const toggleTargetBatch = (bt) => {
    if (bt === 'All Batches') {
      setSelectedBatches(['All Batches']);
      setTargetBatch('All Batches');
      return;
    }
    let updated = selectedBatches.filter(b => b !== 'All Batches');
    if (updated.includes(bt)) {
      updated = updated.filter(b => b !== bt);
    } else {
      updated.push(bt);
    }
    if (updated.length === 0) updated = ['All Batches'];
    setSelectedBatches(updated);
    setTargetBatch(updated[0]);
  };

  const toggleTargetCenter = (c) => {
    if (c === 'All Branches') {
      setSelectedCenters(['All Branches']);
      return;
    }
    let updated = selectedCenters.filter(item => item !== 'All Branches');
    if (updated.includes(c)) {
      updated = updated.filter(item => item !== c);
    } else {
      updated.push(c);
    }
    if (updated.length === 0) updated = ['All Branches'];
    setSelectedCenters(updated);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    
    if (!isTxt && !isPdf) {
      return toast.error('Please upload a valid plain text (.txt) or PDF (.pdf) document.');
    }

    const loader = toast.loading('Reading document file...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let text = '';
        if (isPdf) {
          toast.loading('Parsing document text content...', { id: loader });
          text = await parsePdfToText(event.target.result);
        } else {
          text = event.target.result;
        }

        setNotepadText(text);
        const parsed = parseTextToQuestions(text);
        setParsedQuestions(parsed);
        toast.success(`Successfully extracted ${parsed.length} questions from document.`, { id: loader });
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Unable to parse document content.', { id: loader });
      }
    };
    reader.onerror = () => {
      toast.error('Unable to read document file.', { id: loader });
    };

    if (isPdf) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  const handlePreviewChange = (index, field, value) => {
    const updated = [...parsedQuestions];
    updated[index][field] = value;
    setParsedQuestions(updated);
  };

  const handlePreviewOptionChange = (qIndex, optLabel, value) => {
    const updated = [...parsedQuestions];
    const opt = updated[qIndex].options.find(o => o.label === optLabel);
    if (opt) {
      opt.text = value;
    }
    setParsedQuestions(updated);
  };

  const handleRemovePreviewQuestion = (index) => {
    const updated = parsedQuestions.filter((_, i) => i !== index);
    setParsedQuestions(updated);
  };

  const handleSetPreviewCorrectAnswer = (qIndex, label) => {
    const updated = [...parsedQuestions];
    updated[qIndex].correctAnswer = label;
    setParsedQuestions(updated);
  };

  // Pre-fill fields and fetch questions if editing
  useEffect(() => {
    if (isEditing) {
      setTitle(testToEdit.title || '');
      setDuration(testToEdit.duration || '');
      setSubject(testToEdit.subject || '');
      setDescription(testToEdit.description || '');
      setInstructions(testToEdit.instructions || '');
      if (testToEdit.passMark !== undefined) {
        setCustomPassMark(String(testToEdit.passMark));
      }
      setStatus(testToEdit.status || 'draft');
      setShowResultsToStudents(testToEdit.showResultsToStudents !== undefined ? testToEdit.showResultsToStudents : true);

      if (testToEdit.assignedTo && testToEdit.assignedTo[0]) {
        setTargetDept(testToEdit.assignedTo[0].department || 'CSE');
        setTargetYear(testToEdit.assignedTo[0].year || '3rd Year');
        setTargetBatch(testToEdit.assignedTo[0].batch || '2023-2027');
      }

      if (testToEdit.startTime) {
        const d = new Date(testToEdit.startTime);
        const pad = (n) => n.toString().padStart(2, '0');
        setStartDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        
        let hour = d.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        setStartHour(pad(hour));
        setStartMinute(pad(d.getMinutes()));
        setStartAmpm(ampm);
      }

      if (testToEdit.endTime) {
        const d = new Date(testToEdit.endTime);
        const pad = (n) => n.toString().padStart(2, '0');
        setEndDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        
        let hour = d.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12;
        setEndHour(pad(hour));
        setEndMinute(pad(d.getMinutes()));
        setEndAmpm(ampm);
      }

      const fetchQuestions = async () => {
        setLoadingQuestions(true);
        try {
          const { data } = await api.get(`/tests/${testToEdit._id}/questions`);
          if (data && data.length > 0) {
            const mappedQuestions = data.map(q => ({
              questionText: q.questionText,
              optionA: q.options.find(o => o.label === 'A')?.text || '',
              optionB: q.options.find(o => o.label === 'B')?.text || '',
              optionC: q.options.find(o => o.label === 'C')?.text || '',
              optionD: q.options.find(o => o.label === 'D')?.text || '',
              correctAnswer: q.correctAnswer
            }));
            setQuestions(mappedQuestions);
          }
        } catch (err) {
          console.error(err);
          toast.error('Unable to load assessment questions.');
        } finally {
          setLoadingQuestions(false);
        }
      };
      fetchQuestions();
    }
  }, [testToEdit, isEditing]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        questionText: '',
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctAnswer: 'A'
      }
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      return toast.error('An assessment paper must contain at least one question.');
    }
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  const updateQuestionField = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  const parseDateTime = (dateStr, hourStr, minStr, ampmStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    let hours = Number(hourStr);
    if (ampmStr === 'PM' && hours < 12) hours += 12;
    if (ampmStr === 'AM' && hours === 12) hours = 0;
    return new Date(year, month - 1, day, hours, Number(minStr));
  };

  const handleBulkImportSubmit = () => {
    if (parsedQuestions.length === 0) {
      return toast.error('No valid questions found to import.');
    }

    // Auto-clean: keep only questions with question text and at least options A & B
    const validQuestions = parsedQuestions.filter(q => {
      const hasText = q.questionText && q.questionText.trim().length > 0;
      const optA = q.options.find(o => o.label === 'A')?.text.trim();
      const optB = q.options.find(o => o.label === 'B')?.text.trim();
      return hasText && optA && optB;
    });

    if (validQuestions.length === 0) {
      return toast.error('No valid questions found. Every question must contain question text and at least Option A and Option B.');
    }

    if (validQuestions.length < parsedQuestions.length) {
      toast(`Filtered out ${parsedQuestions.length - validQuestions.length} incomplete question fragments.`, { icon: 'ℹ️' });
    }

    const finalQuestions = validQuestions.map(q => {
      let correct = q.correctAnswer;
      const optA = q.options.find(o => o.label === 'A')?.text || '';
      const optB = q.options.find(o => o.label === 'B')?.text || '';
      const optC = q.options.find(o => o.label === 'C')?.text || '';
      const optD = q.options.find(o => o.label === 'D')?.text || '';

      const selected = q.options.find(o => o.label === correct);
      if (!selected || !selected.text.trim()) {
        correct = 'A';
      }

      return {
        questionText: q.questionText.trim(),
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctAnswer: correct
      };
    });

    if (questions.length === 1 && !questions[0].questionText.trim() && !questions[0].optionA.trim() && !questions[0].optionB.trim()) {
      setQuestions(finalQuestions);
    } else {
      setQuestions([...questions, ...finalQuestions]);
    }

    toast.success(`Successfully loaded ${finalQuestions.length} questions into the assessment paper.`);
    setNotepadText('');
    setParsedQuestions([]);
    setShowBulkModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !subject.trim() || !duration || !startDate || !endDate) {
      return toast.error('Please complete all required assessment fields.');
    }

    const startDateTime = parseDateTime(startDate, startHour, startMinute, startAmpm);
    const endDateTime = parseDateTime(endDate, endHour, endMinute, endAmpm);

    if (endDateTime <= startDateTime) {
      return toast.error('Assessment end time must be later than the start time.');
    }

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        return toast.error(`Please enter question text for Question #${i + 1}.`);
      }
      if (!q.optionA.trim() || !q.optionB.trim()) {
        return toast.error(`Please fill in at least Option A and Option B for Question #${i + 1}.`);
      }
      const selectedField = `option${q.correctAnswer}`;
      if (!q[selectedField] || !q[selectedField].trim()) {
        return toast.error(`Question #${i + 1} has option '${q.correctAnswer}' marked as correct, but option text is empty.`);
      }
    }

    const calculatedTotalMarks = questions.length;
    const finalPassMark = customPassMark !== '' && !isNaN(Number(customPassMark))
      ? Math.max(1, Math.min(calculatedTotalMarks, Number(customPassMark)))
      : Math.ceil(calculatedTotalMarks * 0.4);

    const assignedCombinations = [];
    const deptsToAssign = selectedDepts.length > 0 ? selectedDepts : ['All Departments'];
    const batchesToAssign = selectedBatches.length > 0 ? selectedBatches : ['All Batches'];
    const yearsToAssign = selectedYears.length > 0 ? selectedYears : ['All Years'];

    for (let d of deptsToAssign) {
      for (let b of batchesToAssign) {
        for (let y of yearsToAssign) {
          assignedCombinations.push({ department: d, batch: b, year: y });
        }
      }
    }

    const testPayload = {
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      duration: Number(duration),
      totalMarks: calculatedTotalMarks,
      passMark: finalPassMark,
      startTime: startDateTime,
      endTime: endDateTime,
      status: status,
      showResultsToStudents: showResultsToStudents,
      assignedTo: assignedCombinations
    };

    const toastId = toast.loading(isEditing ? 'Updating assessment paper...' : 'Creating assessment paper...');
    try {
      let testId;
      if (isEditing) {
        testId = testToEdit._id;
        await api.put(`/tests/${testId}`, testPayload);
      } else {
        const { data } = await api.post('/tests/create', testPayload);
        testId = data._id;
      }

      const questionsPayload = questions.map((q) => {
        const options = [
          { label: 'A', text: q.optionA.trim() },
          { label: 'B', text: q.optionB.trim() }
        ];
        if (q.optionC && q.optionC.trim()) options.push({ label: 'C', text: q.optionC.trim() });
        if (q.optionD && q.optionD.trim()) options.push({ label: 'D', text: q.optionD.trim() });
        return {
          questionText: q.questionText.trim(),
          options,
          correctAnswer: q.correctAnswer,
          marks: 1
        };
      });

      await api.post(`/questions/sync/${testId}`, questionsPayload);

      toast.success(isEditing ? 'Assessment updated successfully.' : 'Assessment created successfully.', { id: toastId });
      onSave();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save assessment.', { id: toastId });
    }
  };

  const currentPassMark = customPassMark !== '' && !isNaN(Number(customPassMark))
    ? Number(customPassMark)
    : Math.ceil(questions.length * 0.4);

  const applyPassPercent = (pct) => {
    const val = Math.ceil(questions.length * (pct / 100));
    setCustomPassMark(String(val));
  };

  if (loadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-8 w-8 border-3 border-[#004f90] border-t-transparent rounded-full animate-spin"></div>
        <p className="text-sm text-slate-500 font-semibold">Loading assessment questions...</p>
      </div>
    );
  }

  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="space-y-8 text-left pb-16 font-sans">
      
      {/* Page Top Bar Matching Student Roster & Course Catalog Design */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <button
              type="button"
              onClick={onCancel}
              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer transition"
              title="Go Back"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight font-poppins">
              {isEditing ? 'Modify Assessment Paper' : 'Create New Assessment'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium pl-8">
            Configure test schedule, target college & SDLC rosters, and build questions paper.
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4.5 py-2 bg-[#004f90] hover:bg-[#003c6e] text-white rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isEditing ? 'Update Assessment' : 'Publish Assessment'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* ========================================================================= */}
        {/* CARD 1: GENERAL TEST INFORMATION */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-poppins flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#004f90]" />
                <span>1. General Test Information</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Define core test metadata, evaluation duration, passing criteria, and availability status.</p>
            </div>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              
              {/* Test Title */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Test Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Mid-Term Evaluation on React & Node.js"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none font-medium"
                />
              </div>

              {/* Subject */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Subject / Category *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Computer Science / Web Development"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 px-3.5 text-xs text-slate-800 outline-none font-medium"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 items-start">
              
              {/* Test Duration */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Duration (Minutes) *
                </label>
                <div className="relative flex items-center">
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3.5 pr-10 text-xs font-semibold text-slate-800 outline-none"
                  />
                  <Clock className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
              </div>

              {/* Manual Pass Mark Input & Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Pass Mark *
                  </label>
                  <span className="text-[10px] font-extrabold text-[#004f90] bg-[#004f90]/10 px-1.5 py-0.5 rounded">
                    {questions.length > 0 ? `${Math.round((currentPassMark / questions.length) * 100)}%` : '40%'}
                  </span>
                </div>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    min="1"
                    max={questions.length || 999}
                    placeholder={`e.g. ${Math.ceil(questions.length * 0.4)}`}
                    value={customPassMark}
                    onChange={(e) => setCustomPassMark(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3.5 pr-10 text-xs font-extrabold text-[#004f90] outline-none"
                  />
                  <Award className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
                {/* Quick 1-click presets */}
                <div className="flex items-center gap-1 pt-0.5">
                  <button
                    type="button"
                    onClick={() => applyPassPercent(35)}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-[#004f90]/10 hover:text-[#004f90] text-slate-600 transition cursor-pointer"
                  >
                    35%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPassPercent(40)}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-[#004f90]/10 hover:text-[#004f90] text-slate-600 transition cursor-pointer"
                  >
                    40% (Std)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPassPercent(50)}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-[#004f90]/10 hover:text-[#004f90] text-slate-600 transition cursor-pointer"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPassPercent(60)}
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 hover:bg-[#004f90]/10 hover:text-[#004f90] text-slate-600 transition cursor-pointer"
                  >
                    60%
                  </button>
                </div>
              </div>

              {/* Status Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Assessment Status
                </label>
                <div className="relative flex items-center">
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3.5 pr-10 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none"
                  >
                    <option value="draft">Draft (In Preparation)</option>
                    <option value="active">Active (Available for Candidates)</option>
                    <option value="ended">Ended (Completed / Closed)</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
              </div>

              {/* Result Visibility Dropdown */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Result Visibility
                </label>
                <div className="relative flex items-center">
                  <select
                    value={showResultsToStudents ? "true" : "false"}
                    onChange={(e) => setShowResultsToStudents(e.target.value === "true")}
                    className="w-full bg-white border border-slate-200 hover:border-slate-300 focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/10 rounded-xl h-10 pl-3.5 pr-10 text-xs font-semibold text-slate-800 outline-none cursor-pointer appearance-none shadow-2xs transition-all"
                  >
                    <option value="true">Visible to Students</option>
                    <option value="false">Invisible to Students</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 2: TEST TIMINGS & SCHEDULE */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-poppins flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#004f90]" />
                <span>2. Exam Schedule & Timings</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Specify when the test becomes accessible and when registration closes.</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Start Date & Time */}
            <div className="space-y-3 bg-slate-50/60 p-4.5 rounded-xl border border-slate-200/80">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Start Date & Time *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 px-3 text-xs text-slate-800 outline-none"
                />

                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1 flex items-center">
                    <select
                      value={startHour}
                      onChange={(e) => setStartHour(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-2 pr-6 text-xs text-center font-mono outline-none appearance-none cursor-pointer"
                    >
                      {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">:</span>
                  <div className="relative flex-1 flex items-center">
                    <select
                      value={startMinute}
                      onChange={(e) => setStartMinute(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-2 pr-6 text-xs text-center font-mono outline-none appearance-none cursor-pointer"
                    >
                      {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                  </div>
                  <div className="relative flex items-center">
                    <select
                      value={startAmpm}
                      onChange={(e) => setStartAmpm(e.target.value)}
                      className="bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-2.5 pr-6 text-xs font-bold outline-none text-[#004f90] appearance-none cursor-pointer"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* End Date & Time */}
            <div className="space-y-3 bg-slate-50/60 p-4.5 rounded-xl border border-slate-200/80">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                End Date & Time *
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  required
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 px-3 text-xs text-slate-800 outline-none"
                />

                <div className="flex items-center gap-1.5">
                  <div className="relative flex-1 flex items-center">
                    <select
                      value={endHour}
                      onChange={(e) => setEndHour(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-2 pr-6 text-xs text-center font-mono outline-none appearance-none cursor-pointer"
                    >
                      {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                  </div>
                  <span className="text-xs font-bold text-slate-400">:</span>
                  <div className="relative flex-1 flex items-center">
                    <select
                      value={endMinute}
                      onChange={(e) => setEndMinute(e.target.value)}
                      className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-2 pr-6 text-xs text-center font-mono outline-none appearance-none cursor-pointer"
                    >
                      {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                  </div>
                  <div className="relative flex items-center">
                    <select
                      value={endAmpm}
                      onChange={(e) => setEndAmpm(e.target.value)}
                      className="bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-2.5 pr-6 text-xs font-bold outline-none text-[#004f90] appearance-none cursor-pointer"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                    <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 3: TARGET AUDIENCE ALLOCATION (MATCHING COURSE CATALOG TABS) */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-poppins flex items-center gap-2">
                <Building2 className="w-4 h-4 text-[#004f90]" />
                <span>3. Candidate Roster Target Allocation</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Filter which college departments or SDLC institute courses can access this exam.</p>
            </div>
          </div>

          {/* Underline Tab Switcher (Exact same aesthetic as Course Catalog & Student Directory) */}
          <div className="px-6 border-b border-slate-200 bg-white">
            <div className="flex space-x-8">
              <button
                type="button"
                onClick={() => setCategoryMode('college')}
                className={`py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  categoryMode === 'college'
                    ? 'border-[#004f90] text-[#004f90]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>College Management</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  categoryMode === 'college' ? 'bg-blue-50 text-[#004f90] border border-blue-200/80' : 'bg-slate-100 text-slate-600'
                }`}>
                  College
                </span>
              </button>

              <button
                type="button"
                onClick={() => setCategoryMode('institute')}
                className={`py-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
                  categoryMode === 'institute'
                    ? 'border-[#F7931A] text-[#F7931A]'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <BookOpen className="w-4 h-4 text-[#F7931A]" />
                <span>SDLC Courses & Batches</span>
                <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${
                  categoryMode === 'institute' ? 'bg-orange-50 text-[#F7931A] border border-orange-200' : 'bg-slate-100 text-slate-600'
                }`}>
                  SDLC
                </span>
              </button>
            </div>
          </div>

          <div className="p-6">
            {categoryMode === 'college' ? (
              <div className="space-y-6">
                
                {/* 1. Target Skill Course / Batch */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Target Skill Courses & Batches
                    </label>
                    <span className="text-xs font-semibold text-[#004f90]">
                      {selectedBatches.includes('All Batches') ? 'All Batches Active' : `${selectedBatches.length} Selected`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTargetBatch('All Batches')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedBatches.includes('All Batches')
                          ? 'bg-[#004f90] text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All Batches (Every Active Student)
                    </button>
                    {batchList.map(b => {
                      const isSelected = selectedBatches.includes(b);
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => toggleTargetBatch(b)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#004f90] text-white shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}{b}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 2. Target Departments */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Target Engineering Departments
                    </label>
                    <span className="text-xs font-semibold text-[#004f90]">
                      {selectedDepts.includes('All Departments') ? 'Cross-Department Active' : `${selectedDepts.length} Selected`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTargetDept('All Departments')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedDepts.includes('All Departments')
                          ? 'bg-[#004f90] text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All Departments (Cross-Department)
                    </button>
                    {deptList.map(d => {
                      const isSelected = selectedDepts.includes(d);
                      return (
                        <button
                          key={d}
                          type="button"
                          onClick={() => toggleTargetDept(d)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#004f90] text-white shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}{d}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* 3. Target Academic Years */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Target Academic Years
                    </label>
                    <span className="text-xs font-semibold text-[#004f90]">
                      {selectedYears.includes('All Years') ? 'All Years Active' : `${selectedYears.length} Selected`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTargetYear('All Years')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedYears.includes('All Years')
                          ? 'bg-[#004f90] text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All Years (Any Year)
                    </button>
                    {['1st Year', '2nd Year', '3rd Year', '4th Year'].map(yr => {
                      const isSelected = selectedYears.includes(yr);
                      return (
                        <button
                          key={yr}
                          type="button"
                          onClick={() => toggleTargetYear(yr)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#004f90] text-white shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}{yr}
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            ) : (
              <div className="space-y-6">
                
                {/* SDLC Professional Courses Selection */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Target SDLC Professional Courses
                    </label>
                    <span className="text-xs font-semibold text-[#004f90]">
                      {selectedBatches.includes('All Batches') ? 'All SDLC Courses Active' : `${selectedBatches.length} Selected`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTargetBatch('All Batches')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedBatches.includes('All Batches')
                          ? 'bg-[#004f90] text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All SDLC Courses
                    </button>
                    {batchList.map(b => {
                      const isSelected = selectedBatches.includes(b);
                      return (
                        <button
                          key={b}
                          type="button"
                          onClick={() => toggleTargetBatch(b)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#004f90] text-white shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}{b}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* SDLC District Branch Centers */}
                <div className="space-y-2.5 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Target SDLC District Branch Centers
                    </label>
                    <span className="text-xs font-semibold text-[#004f90]">
                      {selectedCenters.includes('All Branches') ? 'All Branches Active' : `${selectedCenters.length} Selected`}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleTargetCenter('All Branches')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                        selectedCenters.includes('All Branches')
                          ? 'bg-[#004f90] text-white shadow-2xs'
                          : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      All District Branches
                    </button>
                    {centerList.map(c => {
                      const isSelected = selectedCenters.includes(c);
                      return (
                        <button
                          key={c}
                          type="button"
                          onClick={() => toggleTargetCenter(c)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
                            isSelected
                              ? 'bg-[#004f90] text-white shadow-2xs'
                              : 'bg-slate-50 text-slate-700 border border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected && '✓ '}{c} Branch
                        </button>
                      );
                    })}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

        {/* ========================================================================= */}
        {/* CARD 4: DESCRIPTION & INSTRUCTIONS */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-poppins flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#004f90]" />
                <span>4. Instructions & Guidelines</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">Provide exam summary and candidate rules before test initiation.</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Assessment Overview / Description
              </label>
              <textarea
                rows={3}
                placeholder="e.g. Evaluation test covering core concepts, algorithms, and dynamic programming..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg p-3 text-xs text-slate-800 outline-none resize-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Candidate Exam Instructions
              </label>
              <textarea
                rows={3}
                placeholder="e.g. 1. Do not switch tabs. 2. Ensure stable internet connection. 3. Attempts close automatically..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg p-3 text-xs text-slate-800 outline-none resize-none"
              />
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* CARD 5: ASSESSMENT QUESTIONS BUILDER */}
        {/* ========================================================================= */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-poppins flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#004f90]" />
                <span>5. Assessment Question Paper Builder</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Add questions manually or bulk-import directly from TXT / PDF question papers.
              </p>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
              >
                <Upload className="w-3.5 h-3.5 text-[#004f90]" />
                <span>Bulk Import (TXT/PDF)</span>
              </button>

              <button
                type="button"
                onClick={addQuestion}
                className="bg-[#004f90] hover:bg-[#003c6e] text-white px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6">
            
            {/* Header stats bar */}
            <div className="flex flex-wrap items-center justify-between bg-slate-50 border border-slate-200/80 px-4 py-3 rounded-xl text-xs text-slate-700 font-semibold gap-3">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Total Questions:</span>
                <span className="bg-[#004f90]/10 text-[#004f90] px-2.5 py-0.5 rounded-full font-bold font-mono">
                  {questions.length} {questions.length === 1 ? 'Question' : 'Questions'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Total Score:</span>
                <span className="bg-emerald-50 text-emerald-700 border border-emerald-200/80 px-2.5 py-0.5 rounded-full font-bold font-mono">
                  {questions.length} Marks
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-medium">Passing Threshold:</span>
                <span className="bg-amber-50 text-amber-800 border border-amber-200/80 px-2.5 py-0.5 rounded-full font-bold font-mono">
                  {currentPassMark} Marks ({questions.length > 0 ? Math.round((currentPassMark / questions.length) * 100) : 40}%)
                </span>
              </div>
            </div>

            {/* Questions List */}
            <div className="space-y-6">
              {questions.map((q, qIndex) => (
                <div key={qIndex} className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 space-y-5 transition-all hover:border-slate-300">
                  
                  {/* Question Card Header */}
                  <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3.5">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200/80 text-[#004f90] rounded-lg text-xs font-extrabold font-mono uppercase tracking-wider">
                        <HelpCircle className="w-3.5 h-3.5" />
                        <span>QUESTION #{qIndex + 1}</span>
                      </span>
                      <span className="text-[11px] font-semibold text-slate-400 hidden sm:inline-block">
                        • Select option radio to mark correct answer
                      </span>
                    </div>

                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qIndex)}
                        className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition font-semibold cursor-pointer"
                        title="Remove Question"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="hidden sm:inline">Delete</span>
                      </button>
                    )}
                  </div>

                  {/* Question Statement */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider flex items-center justify-between">
                      <span>Question Statement *</span>
                      <span className="text-slate-400 text-[10px] font-normal lowercase">(markdown supported)</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder={`Enter question #${qIndex + 1} statement here...`}
                      value={q.questionText}
                      onChange={(e) => updateQuestionField(qIndex, 'questionText', e.target.value)}
                      className="w-full bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 focus:border-[#004f90] rounded-xl p-3.5 text-xs sm:text-sm text-slate-800 font-medium outline-none transition-all resize-y min-h-[85px] leading-relaxed placeholder:text-slate-400 shadow-2xs"
                    />
                  </div>

                  {/* Options List - Clean 1-Column Layout */}
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                        Answer Choices & Correct Key *
                      </label>
                      <span className="text-[11px] font-medium text-slate-400">
                        Click letter badge or 'Set Correct' to choose correct answer
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {['A', 'B', 'C', 'D'].map((optLabel) => {
                        const fieldName = `option${optLabel}`;
                        const isCorrect = q.correctAnswer === optLabel;

                        return (
                          <div 
                            key={optLabel}
                            className={`flex items-center gap-3 p-1.5 rounded-2xl transition-all ${
                              isCorrect 
                                ? 'bg-blue-50/80 p-2 border-2 border-[#004f90] shadow-2xs' 
                                : 'bg-transparent'
                            }`}
                          >
                            {/* Option Letter Badge / Trigger */}
                            <button
                              type="button"
                              onClick={() => updateQuestionField(qIndex, 'correctAnswer', optLabel)}
                              className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold font-mono text-xs sm:text-sm shrink-0 transition-all cursor-pointer ${
                                isCorrect 
                                  ? 'bg-[#004f90] text-white shadow-xs' 
                                  : 'bg-white hover:bg-slate-100 border border-slate-200 text-slate-600 shadow-2xs'
                              }`}
                              title={`Mark Option ${optLabel} as Correct Answer`}
                            >
                              {optLabel}
                            </button>

                            {/* Clean Dedicated Input Box */}
                            <div className="relative flex-1">
                              <input
                                type="text"
                                required={optLabel === 'A' || optLabel === 'B'}
                                placeholder={`Enter Option ${optLabel} text...`}
                                value={q[fieldName]}
                                onChange={(e) => updateQuestionField(qIndex, fieldName, e.target.value)}
                                className={`w-full h-10.5 px-3.5 text-xs sm:text-sm font-medium rounded-xl transition-all outline-none ${
                                  isCorrect 
                                    ? 'bg-white border border-blue-300 text-slate-900 shadow-2xs focus:border-[#004f90] focus:ring-2 focus:ring-[#004f90]/20' 
                                    : 'bg-slate-50/80 hover:bg-white focus:bg-white border border-slate-200/90 focus:border-[#004f90] text-slate-800 focus:ring-2 focus:ring-blue-100 shadow-2xs'
                                }`}
                              />
                            </div>

                            {/* Correct Answer Indicator Button */}
                            <button
                              type="button"
                              onClick={() => updateQuestionField(qIndex, 'correctAnswer', optLabel)}
                              className={`px-3 py-2 rounded-xl text-xs font-bold transition cursor-pointer shrink-0 flex items-center gap-1.5 ${
                                isCorrect
                                  ? 'bg-[#004f90] text-white shadow-xs'
                                  : 'bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800'
                              }`}
                            >
                              {isCorrect ? <Check className="w-3.5 h-3.5 text-white" /> : null}
                              <span>{isCorrect ? 'Correct Key' : 'Set Correct'}</span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                </div>
              ))}
            </div>

            {/* Bottom Add Question Button */}
            <button
              type="button"
              onClick={addQuestion}
              className="w-full py-3.5 bg-slate-50 hover:bg-blue-50/50 text-[#004f90] border-2 border-dashed border-slate-200 hover:border-[#004f90]/50 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-[#004f90]" />
              <span>Add Another Question (+1 Mark)</span>
            </button>

          </div>
        </div>

        {/* Bottom Form Actions */}
        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#004f90] hover:bg-[#003c6e] text-white rounded-lg font-semibold text-xs transition cursor-pointer flex items-center gap-2 shadow-2xs"
          >
            <Send className="w-4 h-4" />
            <span>{isEditing ? 'Update Assessment' : 'Publish Assessment'}</span>
          </button>
        </div>

      </form>

      {/* ========================================================================= */}
      {/* BULK IMPORT MODAL */}
      {/* ========================================================================= */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-left max-h-[90vh] flex flex-col"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
                    <Upload className="w-4 h-4 text-[#004f90]" />
                    <span>Bulk Import Questions from TXT / PDF</span>
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">Extract questions and options automatically from documents.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-4 flex-1 overflow-y-auto pr-1 text-xs">
                
                {/* Upload Zone */}
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-[#004f90] transition bg-slate-50/50">
                  <input
                    type="file"
                    accept=".txt,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="bulk-file-input"
                  />
                  <label htmlFor="bulk-file-input" className="cursor-pointer space-y-2 block">
                    <FileSpreadsheet className="w-8 h-8 text-[#004f90] mx-auto" />
                    <div>
                      <span className="font-bold text-[#004f90]">Click to upload document</span>
                      <span className="text-slate-500 font-medium"> or drag and drop</span>
                    </div>
                    <p className="text-[11px] text-slate-400 font-medium">Supports Plain Text (.txt) and PDF (.pdf) documents</p>
                  </label>
                </div>

                {/* Parsed Preview */}
                {parsedQuestions.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 text-xs">
                        Extracted Questions ({parsedQuestions.length})
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto space-y-3 border border-slate-200 rounded-xl p-3 bg-slate-50/40">
                      {parsedQuestions.map((pq, pIndex) => (
                        <div key={pIndex} className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2.5 shadow-2xs">
                          <div className="flex items-center justify-between">
                            <span className="font-bold font-mono text-[#004f90] text-xs">Question #{pIndex + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePreviewQuestion(pIndex)}
                              className="text-rose-500 hover:text-rose-700 hover:bg-rose-50 p-1 rounded-md transition cursor-pointer"
                              title="Remove Question"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="font-medium text-slate-800 text-xs leading-relaxed">{pq.questionText}</p>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                            {pq.options.map(o => (
                              <div 
                                key={o.label} 
                                onClick={() => handleSetPreviewCorrectAnswer(pIndex, o.label)}
                                className={`flex items-center gap-1.5 p-1.5 rounded-lg border transition cursor-pointer ${
                                  o.label === pq.correctAnswer 
                                    ? 'bg-blue-50/80 border-blue-300 font-bold text-[#004f90]' 
                                    : 'bg-slate-50/50 border-slate-200/80 text-slate-600 hover:bg-white'
                                }`}
                              >
                                <span className={`w-4 h-4 rounded text-[10px] font-mono flex items-center justify-center ${
                                  o.label === pq.correctAnswer ? 'bg-[#004f90] text-white font-bold' : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {o.label}
                                </span>
                                <span className="truncate">{o.text || `(Empty option ${o.label})`}</span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-[11px]">
                            <span className="font-semibold text-slate-500">Correct Answer Key:</span>
                            <div className="flex items-center gap-1">
                              {['A', 'B', 'C', 'D'].map(lbl => (
                                <button
                                  key={lbl}
                                  type="button"
                                  onClick={() => handleSetPreviewCorrectAnswer(pIndex, lbl)}
                                  className={`w-6 h-6 rounded text-[10px] font-mono font-bold transition cursor-pointer flex items-center justify-center ${
                                    pq.correctAnswer === lbl
                                      ? 'bg-[#004f90] text-white shadow-2xs'
                                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                  }`}
                                  title={`Set Option ${lbl} as Correct Answer`}
                                >
                                  {lbl}
                                </button>
                              ))}
                            </div>
                          </div>

                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkImportSubmit}
                  disabled={parsedQuestions.length === 0}
                  className="px-5 py-2 bg-[#004f90] hover:bg-[#003c6e] disabled:opacity-50 text-white rounded-lg cursor-pointer transition shadow-2xs"
                >
                  Import {parsedQuestions.length} Questions
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default CreateTest;
