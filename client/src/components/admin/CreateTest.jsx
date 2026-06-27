import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { parsePdfToText } from '../../utils/pdfParser.js';
import { FileText, Save, X, Plus, Trash2, Calendar, Clock, BookOpen, AlertCircle, ArrowLeft, Upload, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const parseTextToQuestions = (text) => {
  if (!text) return [];
  const lines = text.split(/\r?\n/).map(line => line.trim()).filter(line => line.length > 0);
  const parsedQuestions = [];
  let currentQuestion = null;
  let lastLineWasOption = false;

  for (let line of lines) {
    const optMatch = line.match(/^([A-Da-d])[\s\.\)]+(.*)$/);
    
    if (optMatch) {
      if (currentQuestion) {
        const label = optMatch[1].toUpperCase();
        const optText = optMatch[2].trim();
        const opt = currentQuestion.options.find(o => o.label === label);
        if (opt) {
          opt.text = optText;
        }
      }
      lastLineWasOption = true;
    } else {
      const isNewQuestion = lastLineWasOption || !currentQuestion || line.match(/^(Question|Q)?\s*\d+[\s\.\)\-:]+/i) || line.toLowerCase().startsWith('question:');
      
      if (isNewQuestion) {
        if (currentQuestion && currentQuestion.questionText.trim()) {
          parsedQuestions.push(currentQuestion);
        }
        
        let cleanText = line.replace(/^(Question|Q)?\s*\d+[\s\.\)\-:]+/i, '').replace(/^question:\s*/i, '').trim();
        currentQuestion = {
          questionText: cleanText,
          options: [
            { label: 'A', text: '' },
            { label: 'B', text: '' },
            { label: 'C', text: '' },
            { label: 'D', text: '' }
          ],
          correctAnswer: 'A',
          marks: 1
        };
        lastLineWasOption = false;
      } else {
        if (currentQuestion) {
          currentQuestion.questionText += ' ' + line;
        }
      }
    }
  }

  if (currentQuestion && currentQuestion.questionText.trim()) {
    parsedQuestions.push(currentQuestion);
  }

  return parsedQuestions.filter(q => q.options[0].text !== '' || q.options[1].text !== '');
};

const CreateTest = ({ testToEdit, onSave, onCancel }) => {
  const isEditing = !!testToEdit;

  // Metadata form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [duration, setDuration] = useState('');
  const [status, setStatus] = useState('draft'); // draft | active | ended
  const [showResultsToStudents, setShowResultsToStudents] = useState(true);

  // Custom 12-hour AM/PM Time States
  const [startDate, setStartDate] = useState('');
  const [startHour, setStartHour] = useState('10');
  const [startMinute, setStartMinute] = useState('00');
  const [startAmpm, setStartAmpm] = useState('AM');

  const [endDate, setEndDate] = useState('');
  const [endHour, setEndHour] = useState('05');
  const [endMinute, setEndMinute] = useState('00');
  const [endAmpm, setEndAmpm] = useState('PM');

  // Cohort targeting controls
  const [targetDept, setTargetDept] = useState('Computer Science');
  const [targetYear, setTargetYear] = useState('3rd Year');
  const [targetBatch, setTargetBatch] = useState('2023-2027');

  // Questions state (Microsoft Forms style)
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

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const isTxt = file.type === 'text/plain' || file.name.endsWith('.txt');
    const isPdf = file.type === 'application/pdf' || file.name.endsWith('.pdf');
    
    if (!isTxt && !isPdf) {
      return toast.error('Please upload a valid plain text (.txt) or PDF (.pdf) file.');
    }

    const loader = toast.loading('Reading file...');
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        let text = '';
        if (isPdf) {
          toast.loading('Parsing PDF text content...', { id: loader });
          text = await parsePdfToText(event.target.result);
        } else {
          text = event.target.result;
        }

        setNotepadText(text);
        const parsed = parseTextToQuestions(text);
        setParsedQuestions(parsed);
        toast.success(`Successfully parsed ${parsed.length} questions from file.`, { id: loader });
      } catch (err) {
        console.error(err);
        toast.error(err.message || 'Failed to parse file.', { id: loader });
      }
    };
    reader.onerror = () => {
      toast.error('Failed to read file.', { id: loader });
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

  // Pre-fill fields and fetch questions if editing
  useEffect(() => {
    if (isEditing) {
      setTitle(testToEdit.title || '');
      setDuration(testToEdit.duration || '');
      setSubject(testToEdit.subject || '');
      setDescription(testToEdit.description || '');
      setInstructions(testToEdit.instructions || '');
      setStatus(testToEdit.status || 'draft');
      setShowResultsToStudents(testToEdit.showResultsToStudents !== undefined ? testToEdit.showResultsToStudents : true);

      if (testToEdit.assignedTo && testToEdit.assignedTo[0]) {
        setTargetDept(testToEdit.assignedTo[0].department || 'Computer Science');
        setTargetYear(testToEdit.assignedTo[0].year || '3rd Year');
        setTargetBatch(testToEdit.assignedTo[0].batch || '2023-2027');
      }

      // Deconstruct startTime Date object to 12-hour AM/PM formats
      if (testToEdit.startTime) {
        const d = new Date(testToEdit.startTime);
        const pad = (n) => n.toString().padStart(2, '0');
        setStartDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        
        let hour = d.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12; // hour '0' should be '12'
        setStartHour(pad(hour));
        setStartMinute(pad(d.getMinutes()));
        setStartAmpm(ampm);
      }

      // Deconstruct endTime Date object to 12-hour AM/PM formats
      if (testToEdit.endTime) {
        const d = new Date(testToEdit.endTime);
        const pad = (n) => n.toString().padStart(2, '0');
        setEndDate(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        
        let hour = d.getHours();
        const ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour % 12;
        hour = hour ? hour : 12; // hour '0' should be '12'
        setEndHour(pad(hour));
        setEndMinute(pad(d.getMinutes()));
        setEndAmpm(ampm);
      }

      // Fetch questions associated with this test
      const fetchQuestions = async () => {
        setLoadingQuestions(true);
        try {
          const { data } = await api.get(`/tests/${testToEdit._id}/questions`);
          if (data && data.length > 0) {
            // Map backend questions to our forms structure
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
          toast.error('Failed to load test questions.');
        } finally {
          setLoadingQuestions(false);
        }
      };
      fetchQuestions();
    }
  }, [testToEdit, isEditing]);

  // Add an empty question to the list
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

  // Remove a question at a specific index
  const removeQuestion = (index) => {
    if (questions.length === 1) {
      return toast.error('A test must contain at least one question.');
    }
    setQuestions(questions.filter((_, idx) => idx !== index));
  };

  // Update a specific field for a question
  const updateQuestionField = (index, field, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index][field] = value;
    setQuestions(updatedQuestions);
  };

  // Reconstruct local Date object from date string, 12-hour value, minute, and AM/PM
  const parseDateTime = (dateStr, hourStr, minStr, ampmStr) => {
    const [year, month, day] = dateStr.split('-').map(Number);
    let hours = Number(hourStr);
    if (ampmStr === 'PM' && hours < 12) hours += 12;
    if (ampmStr === 'AM' && hours === 12) hours = 0;
    return new Date(year, month - 1, day, hours, Number(minStr));
  };

  const handleBulkImportSubmit = () => {
    let finalQuestions = [];

    if (parsedQuestions.length === 0) {
      return toast.error('No questions parsed to import.');
    }

    for (let i = 0; i < parsedQuestions.length; i++) {
      const q = parsedQuestions[i];
      if (!q.questionText.trim()) {
        return toast.error(`Question #${i + 1} statement cannot be empty.`);
      }
      if (!q.options[0].text.trim() || !q.options[1].text.trim()) {
        return toast.error(`Question #${i + 1} must have at least Option A and Option B.`);
      }
      const correctOpt = q.options.find(o => o.label === q.correctAnswer);
      if (!correctOpt || !correctOpt.text.trim()) {
        return toast.error(`Question #${i + 1} has correct answer set to '${q.correctAnswer}', but that option has no text.`);
      }
    }

    finalQuestions = parsedQuestions.map(q => ({
      questionText: q.questionText.trim(),
      optionA: q.options.find(o => o.label === 'A')?.text || '',
      optionB: q.options.find(o => o.label === 'B')?.text || '',
      optionC: q.options.find(o => o.label === 'C')?.text || '',
      optionD: q.options.find(o => o.label === 'D')?.text || '',
      correctAnswer: q.correctAnswer
    }));

    if (questions.length === 1 && !questions[0].questionText.trim() && !questions[0].optionA.trim() && !questions[0].optionB.trim()) {
      setQuestions(finalQuestions);
    } else {
      setQuestions([...questions, ...finalQuestions]);
    }

    toast.success(`Successfully loaded ${finalQuestions.length} questions into the form.`);
    setNotepadText('');
    setParsedQuestions([]);
    setShowBulkModal(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validations
    if (!title.trim() || !subject.trim() || !duration || !startDate || !endDate || !targetBatch.trim()) {
      return toast.error('Please fill out all required fields.');
    }

    const startDateTime = parseDateTime(startDate, startHour, startMinute, startAmpm);
    const endDateTime = parseDateTime(endDate, endHour, endMinute, endAmpm);

    if (endDateTime <= startDateTime) {
      return toast.error('End time must be after the start time.');
    }

    // Validate that questions are filled out
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        return toast.error(`Please enter the question statement for Question ${i + 1}.`);
      }
      if (!q.optionA.trim() || !q.optionB.trim()) {
        return toast.error(`Please fill in at least Option A and Option B for Question ${i + 1}.`);
      }
      const selectedField = `option${q.correctAnswer}`;
      if (!q[selectedField] || !q[selectedField].trim()) {
        return toast.error(`Question ${i + 1} has correct answer set to '${q.correctAnswer}', but that option has no text.`);
      }
    }

    const calculatedTotalMarks = questions.length;
    const calculatedPassMark = Math.ceil(calculatedTotalMarks * 0.4);

    const testPayload = {
      title: title.trim(),
      subject: subject.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      duration: Number(duration),
      totalMarks: calculatedTotalMarks,
      passMark: calculatedPassMark,
      startTime: startDateTime,
      endTime: endDateTime,
      status: status,
      showResultsToStudents: showResultsToStudents,
      assignedTo: [
        {
          department: targetDept,
          batch: targetBatch.trim(),
          year: targetYear
        }
      ]
    };
    const toastId = toast.loading(isEditing ? 'Updating test...' : 'Creating test...');
    try {
      let testId;
      if (isEditing) {
        testId = testToEdit._id;
        await api.put(`/tests/${testId}`, testPayload);
      } else {
        const { data } = await api.post('/tests/create', testPayload);
        testId = data._id;
      }

      // Sync questions list
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

      toast.success(isEditing ? 'Test updated successfully.' : 'Test published successfully.', { id: toastId });
      onSave();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to save test configurations.', { id: toastId });
    }
  };

  if (loadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center py-32 space-y-4">
        <div className="h-12 w-12 border-4 border-[#004f90] border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-base text-slate-400 font-bold font-sans">Loading test questions...</p>
      </div>
    );
  }

  // Generate padded hour options (01 to 12)
  const hourOptions = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  // Generate padded minute options (00 to 59)
  const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] rounded-[32px] p-6 sm:p-12 max-w-4xl mx-auto animate-fadeIn font-sans space-y-8 text-left">
      
      {/* Sleek Go Back button at top-left */}
      <div className="flex justify-start">
        <button
          type="button"
          onClick={onCancel}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 text-sm font-bold transition-all duration-150 py-2.5 px-4.5 hover:bg-slate-50 rounded-xl border border-slate-100 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Go Back</span>
        </button>
      </div>

      {/* Title Header with Recovered Corporate Logo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-100 pb-6 gap-4">
        <div className="flex items-center space-x-4">
          <img 
            src="/logo.png" 
            alt="SDLC Logo" 
            className="h-12 w-auto object-contain max-w-[190px]"
          />
          <div className="border-l border-slate-200 pl-4 space-y-0.5">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight font-poppins leading-tight">
              {isEditing ? 'Modify Assessment' : 'Create Assessment'}
            </h2>
            <p className="text-sm text-slate-400 font-semibold leading-none">Configure exam configurations and build questions.</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        
        {/* SECTION 1: Test Details */}
        <div className="space-y-6">
          <h3 className="text-base font-extrabold text-[#004f90] uppercase tracking-wider pl-4 border-l-4 border-[#004f90]">
            1. Test Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test Title */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                TEST TITLE
              </label>
              <input
                required
                type="text"
                placeholder="e.g. MCQ Evaluation on Core React & Node"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-white border border-slate-205 hover:border-slate-350 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-800 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
              />
            </div>
            {/* Subject */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                SUBJECT
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Computer Science"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full bg-white border border-slate-205 hover:border-slate-350 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-850 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Test Duration */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                DURATION (MINUTES)
              </label>
              <input
                required
                type="number"
                min="1"
                placeholder="e.g. 30"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full bg-white border border-slate-205 hover:border-slate-350 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-800 text-base focus:outline-none transition-all outline-none font-semibold placeholder:text-slate-300 shadow-sm"
              />
            </div>
            {/* Status Dropdown */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                STATUS
              </label>
              <div className="relative">
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full bg-white border border-slate-205 hover:border-slate-350 focus:border-[#004f90] rounded-full py-4.5 px-6 pr-10 text-slate-800 text-base focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm"
                >
                  <option value="draft">Draft (In Preparation)</option>
                  <option value="active">Active (Available for Candidates)</option>
                  <option value="ended">Ended (Completed/Closed)</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center px-1 text-slate-500">
                  <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                </div>
              </div>
            </div>

            {/* Release Marks Toggle */}
            <div className={`md:col-span-2 flex items-center justify-between rounded-2xl px-6 py-4 border-l-4 transition-all duration-300 ${
              showResultsToStudents
                ? 'bg-blue-50 border-l-[#004f90] border border-blue-200'
                : 'bg-slate-50 border-l-slate-300 border border-slate-200'
            }`}>
              <div className="space-y-0.5">
                <p className={`text-sm font-bold transition-colors duration-200 ${
                  showResultsToStudents ? 'text-[#004f90]' : 'text-slate-600'
                }`}>
                  Release Marks to Candidates
                </p>
                <p className="text-xs text-slate-400 font-medium">
                  {showResultsToStudents
                    ? 'Students will see their score and review immediately after submitting.'
                    : 'Results are hidden until you release them manually.'}
                </p>
              </div>

              {/* Toggle + ON/OFF label */}
              <div className="flex items-center gap-3 ml-6 shrink-0">
                <span className={`text-xs font-extrabold uppercase tracking-widest transition-colors duration-200 ${
                  showResultsToStudents ? 'text-[#004f90]' : 'text-slate-400'
                }`}>
                  {showResultsToStudents ? 'ON' : 'OFF'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowResultsToStudents(!showResultsToStudents)}
                  className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    showResultsToStudents ? 'bg-[#004f90]' : 'bg-slate-300'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                      showResultsToStudents ? 'translate-x-5' : 'translate-x-0'
                    }`}
                 />
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Description Area */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                DESCRIPTION
              </label>
              <textarea
                rows="3"
                placeholder="e.g. Semester evaluation test covering core concepts..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-white border border-slate-205 hover:border-slate-350 focus:border-[#004f90] rounded-[20px] py-4 px-6 text-slate-800 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm resize-none"
              />
            </div>
            {/* Instructions Area */}
            <div className="space-y-2 flex flex-col">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                INSTRUCTIONS
              </label>
              <textarea
                rows="3"
                placeholder="e.g. 1. Do not switch tabs. 2. Attempts will close automatically..."
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                className="w-full bg-white border border-slate-205 hover:border-slate-350 focus:border-[#004f90] rounded-[20px] py-4 px-6 text-slate-800 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-300 shadow-sm resize-none"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Target Audience Allocation */}
        <div className="space-y-6 border-t border-slate-100 pt-8">
          <h3 className="text-base font-extrabold text-[#004f90] uppercase tracking-wider pl-4 border-l-4 border-[#004f90]">
            2. Candidate Roster Target
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Department Assignment */}
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                  TARGET DEPARTMENT
                </label>
                <div className="relative">
                  <select
                    value={targetDept}
                    onChange={(e) => setTargetDept(e.target.value)}
                    className="w-full bg-white border border-slate-205 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 pr-10 text-slate-800 text-base focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm"
                  >
                    <option value="Computer Science">Computer Science</option>
                    <option value="Information Technology">Information Technology</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Mechanical">Mechanical</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center px-1 text-slate-500">
                    <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* Academic Year */}
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                  TARGET ACADEMIC YEAR
                </label>
                <div className="relative">
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    className="w-full bg-white border border-slate-205 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 pr-10 text-slate-800 text-base focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm"
                  >
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-5 flex items-center px-1 text-slate-500">
                    <svg className="fill-current h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                  </div>
                </div>
              </div>

              {/* Academic Batch */}
              <div className="space-y-2 flex flex-col">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                  TARGET BATCH
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. 2023-2027"
                  value={targetBatch}
                  onChange={(e) => setTargetBatch(e.target.value)}
                  className="w-full bg-white border border-slate-205 hover:border-slate-355 focus:border-[#004f90] rounded-full py-4.5 px-6 text-slate-855 text-base focus:outline-none transition-all outline-none font-semibold placeholder:text-slate-300 shadow-sm"
                />
              </div>
            </div>
        </div>

        {/* SECTION 3: Scheduling - Redesigned to guarantee zero overflow */}
        <div className="space-y-6 border-t border-slate-100 pt-8">
          <h3 className="text-base font-extrabold text-[#004f90] uppercase tracking-wider pl-4 border-l-4 border-[#004f90]">
            3. Exam Availability Window
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            {/* Start Date & Time Group */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-3xl p-6 space-y-6">
              <span className="text-xs font-extrabold text-[#004f90] uppercase tracking-widest pl-1">
                START TIME (OPENS)
              </span>
              
              <div className="flex flex-col gap-5">
                {/* Date Selection */}
                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Select Date</label>
                  <input
                    required
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-2xl py-4 px-5 text-slate-800 text-base focus:outline-none transition-all outline-none font-semibold cursor-pointer shadow-sm animate-transition"
                  />
                </div>
                
                {/* Time Selection Dropdowns */}
                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Select Time</label>
                  <div className="flex items-center gap-2">
                    {/* Hour */}
                    <div className="relative flex-1">
                      <select
                        value={startHour}
                        onChange={(e) => setStartHour(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-2xl py-4 pl-4 pr-10 text-slate-800 text-base focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm relative z-10"
                      >
                        {hourOptions.map(h => (
                          <option key={h} value={h} className="text-slate-900 bg-white font-semibold">
                            {h}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-550 z-20 pointer-events-none">
                        <svg className="fill-current h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                    
                    <span className="font-extrabold text-slate-400 text-lg select-none">:</span>
                    
                    {/* Minute */}
                    <div className="relative flex-1">
                      <select
                        value={startMinute}
                        onChange={(e) => setStartMinute(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-[#004f90] rounded-2xl py-4 pl-4 pr-10 text-slate-800 text-base focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm relative z-10"
                      >
                        {minuteOptions.map(m => (
                          <option key={m} value={m} className="text-slate-900 bg-white font-semibold">
                            {m}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-550 z-20 pointer-events-none">
                        <svg className="fill-current h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                    
                    {/* AM/PM */}
                    <div className="relative w-24 shrink-0">
                      <select
                        value={startAmpm}
                        onChange={(e) => setStartAmpm(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-355 focus:border-[#004f90] rounded-2xl py-4 pl-4 pr-10 text-slate-800 text-base focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm relative z-10"
                      >
                        <option value="AM" className="text-slate-900 bg-white font-semibold">AM</option>
                        <option value="PM" className="text-slate-900 bg-white font-semibold">PM</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-550 z-20 pointer-events-none">
                        <svg className="fill-current h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* End Date & Time Group */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-3xl p-6 space-y-6">
              <span className="text-xs font-extrabold text-[#004f90] uppercase tracking-widest pl-1">
                END TIME (CLOSES)
              </span>
              
              <div className="flex flex-col gap-5">
                {/* Date Selection */}
                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Select Date</label>
                  <input
                    required
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 hover:border-slate-355 focus:border-[#004f90] rounded-2xl py-4 px-5 text-slate-800 text-base focus:outline-none transition-all outline-none font-semibold cursor-pointer shadow-sm"
                  />
                </div>
                
                {/* Time Selection Dropdowns */}
                <div className="space-y-2 flex flex-col">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1">Select Time</label>
                  <div className="flex items-center gap-2">
                    {/* Hour */}
                    <div className="relative flex-1">
                      <select
                        value={endHour}
                        onChange={(e) => setEndHour(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-355 focus:border-[#004f90] rounded-2xl py-4 pl-4 pr-10 text-slate-800 text-base focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm relative z-10"
                      >
                        {hourOptions.map(h => (
                          <option key={h} value={h} className="text-slate-900 bg-white font-semibold">
                            {h}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-550 z-20 pointer-events-none">
                        <svg className="fill-current h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                    
                    <span className="font-extrabold text-slate-400 text-lg select-none">:</span>
                    
                    {/* Minute */}
                    <div className="relative flex-1">
                      <select
                        value={endMinute}
                        onChange={(e) => setEndMinute(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-355 focus:border-[#004f90] rounded-2xl py-4 pl-4 pr-10 text-slate-800 text-base focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm relative z-10"
                      >
                        {minuteOptions.map(m => (
                          <option key={m} value={m} className="text-slate-900 bg-white font-semibold">
                            {m}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-550 z-20 pointer-events-none">
                        <svg className="fill-current h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                    
                    {/* AM/PM */}
                    <div className="relative w-24 shrink-0">
                      <select
                        value={endAmpm}
                        onChange={(e) => setEndAmpm(e.target.value)}
                        className="w-full bg-white border border-slate-200 hover:border-slate-355 focus:border-[#004f90] rounded-2xl py-4 pl-4 pr-10 text-slate-855 text-base focus:outline-none transition-all outline-none font-bold cursor-pointer appearance-none shadow-sm relative z-10"
                      >
                        <option value="AM" className="text-slate-900 bg-white font-semibold">AM</option>
                        <option value="PM" className="text-slate-900 bg-white font-semibold">PM</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-550 z-20 pointer-events-none">
                        <svg className="fill-current h-4 w-4 text-slate-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6 border-t border-slate-100 pt-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
            <h3 className="text-base font-extrabold text-[#004f90] uppercase tracking-wider pl-4 border-l-4 border-[#004f90]">
              4. Exam Questions ({questions.length})
            </h3>
            <div className="flex items-center space-x-3">
              <button
                type="button"
                onClick={() => setShowBulkModal(true)}
                className="bg-slate-50 border border-slate-200 hover:border-[#004f90] hover:bg-slate-100 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
              >
                <Upload className="h-4 w-4 text-[#004f90]" />
                <span>Bulk Import (Notepad/JSON)</span>
              </button>
              <span className="text-xs text-slate-400 font-extrabold select-none uppercase bg-slate-50 border border-slate-100 px-3.5 py-1.5 rounded-full">
                1 Mark Per Question
              </span>
            </div>
          </div>

          <div className="space-y-8">
            <AnimatePresence>
              {questions.map((q, index) => (
                <motion.div 
                  key={index} 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  transition={{ duration: 0.3 }}
                  className="border border-slate-100 hover:border-slate-200/80 shadow-md shadow-slate-100/30 rounded-[24px] p-6 sm:p-8 space-y-6 bg-white relative group text-left"
                >
                  {/* Question header row */}
                  <div className="flex justify-between items-center border-b border-slate-50 pb-4">
                    <span className="text-sm font-extrabold text-[#004f90] uppercase tracking-wider bg-blue-50 px-4 py-1.5 rounded-xl">
                      Question {index + 1}
                    </span>
                    
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="p-2 text-slate-400 hover:text-red-655 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100"
                        title="Remove Question"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>

                  {/* Question Input */}
                  <div className="space-y-2.5 flex flex-col">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">
                      QUESTION STATEMENT
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Which hook is used to handle side-effects in React?"
                      value={q.questionText}
                      onChange={(e) => updateQuestionField(index, 'questionText', e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-2xl py-4.5 px-6 text-slate-800 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-350 shadow-inner"
                    />
                  </div>

                  {/* MCQ Options grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-1">
                    {/* Option A */}
                    <div className="space-y-2 flex flex-col">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-655 text-xs font-bold flex items-center justify-center">A</span>
                        <span>Option A</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Enter option A..."
                        value={q.optionA}
                        onChange={(e) => updateQuestionField(index, 'optionA', e.target.value)}
                        className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-2xl py-3.5 px-5 text-slate-800 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-350 shadow-inner"
                      />
                    </div>
                    {/* Option B */}
                    <div className="space-y-2 flex flex-col">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-655 text-xs font-bold flex items-center justify-center">B</span>
                        <span>Option B</span>
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="Enter option B..."
                        value={q.optionB}
                        onChange={(e) => updateQuestionField(index, 'optionB', e.target.value)}
                        className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-2xl py-3.5 px-5 text-slate-800 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-350 shadow-inner"
                      />
                    </div>
                    {/* Option C */}
                    <div className="space-y-2 flex flex-col">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-655 text-xs font-bold flex items-center justify-center">C</span>
                        <span>Option C</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter option C (optional)..."
                        value={q.optionC}
                        onChange={(e) => updateQuestionField(index, 'optionC', e.target.value)}
                        className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-2xl py-3.5 px-5 text-slate-800 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-355 shadow-inner"
                      />
                    </div>
                    {/* Option D */}
                    <div className="space-y-2 flex flex-col">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-655 text-xs font-bold flex items-center justify-center">D</span>
                        <span>Option D</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Enter option D (optional)..."
                        value={q.optionD}
                        onChange={(e) => updateQuestionField(index, 'optionD', e.target.value)}
                        className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-2xl py-3.5 px-5 text-slate-800 text-base focus:outline-none transition-all outline-none font-medium placeholder:text-slate-355 shadow-inner"
                      />
                    </div>
                  </div>

                  {/* Correct Option selector using dynamic human button-group */}
                  <div className="space-y-2.5 flex flex-col text-left pt-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-1 leading-none">SELECT CORRECT ANSWER</label>
                    <div className="flex space-x-4">
                      {['A', 'B', 'C', 'D'].map((opt) => {
                        const isSelected = q.correctAnswer === opt;
                        return (
                          <button
                            key={opt}
                            type="button"
                            onClick={() => updateQuestionField(index, 'correctAnswer', opt)}
                            className={`h-12 w-16 rounded-xl font-extrabold text-base border transition-all cursor-pointer flex items-center justify-center ${
                              isSelected
                                ? 'bg-[#004f90] border-[#004f90] text-white shadow-md'
                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-800 shadow-sm'
                            }`}
                          >
                            {opt}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <button
            type="button"
            onClick={addQuestion}
            className="w-full flex items-center justify-center space-x-2 border-2 border-dashed border-slate-200 hover:border-[#004f90] hover:bg-blue-50/5 py-5 rounded-2xl text-base font-bold text-slate-500 hover:text-[#004f90] transition-all cursor-pointer shadow-sm"
          >
            <Plus className="h-6 w-6" />
            <span>Add New Question</span>
          </button>
        </div>

        {/* Buttons Row */}
        <div className="flex justify-end gap-4 border-t border-slate-100 pt-8">
          <button
            type="button"
            onClick={onCancel}
            className="border border-slate-200 text-slate-600 font-bold px-8 py-4.5 rounded-full text-sm hover:bg-slate-50 transition-all cursor-pointer"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            className="bg-[#004f90] hover:bg-[#003c6e] text-white font-extrabold px-8 py-4.5 rounded-full text-sm flex items-center justify-center space-x-2 shadow-md active:scale-[0.98] transition-all cursor-pointer"
          >
            <Save className="h-5 w-5" />
            <span>{isEditing ? 'Save Changes' : 'Publish MCQ Test'}</span>
          </button>
        </div>
      </form>

      {/* Bulk Import Modal */}
      <AnimatePresence>
        {showBulkModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[6px] z-[999] flex items-center justify-center p-4">
            <div className="bg-white border border-slate-150 rounded-3xl w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden text-left">
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900 font-poppins">Bulk Import Questions</h3>
                  <p className="text-xs text-slate-400 font-medium">Add multiple questions at once using Notepad text or PDF</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setParsedQuestions([]);
                    setNotepadText('');
                  }}
                  className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-655 transition-all cursor-pointer border border-transparent"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
                {/* Left Column: Input Source */}
                <div className="w-full md:w-5/12 border-r border-slate-100 p-6 overflow-y-auto space-y-5 flex flex-col">
                  {/* File Upload Area */}
                  <div className="space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Upload Notepad (.txt) / PDF File</span>
                    <label className="border-2 border-dashed border-slate-200 hover:border-[#004f90] rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50">
                      <Upload className="h-8 w-8 text-[#004f90]" />
                      <span className="text-xs font-bold text-slate-700">Choose a .txt or .pdf file</span>
                      <span className="text-[10px] text-slate-400">or drag and drop it here</span>
                      <input
                        type="file"
                        accept=".txt,.pdf"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Or Paste Area */}
                  <div className="space-y-2 flex-1 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider">Or Paste Raw Text</span>
                    <textarea
                      value={notepadText}
                      onChange={(e) => setNotepadText(e.target.value)}
                      placeholder="1. Which CSS property is used to make text bold?&#13;&#10;A) font-style&#13;&#10;B) font-weight&#13;&#10;C) text-transform&#13;&#10;D) font-variant&#13;&#10;&#13;&#10;2. What is the standard port number for local HTTP development servers?&#13;&#10;A) 80&#13;&#10;B) 443&#13;&#10;C) 3000&#13;&#10;D) 8080"
                      className="w-full flex-1 bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 text-xs font-mono placeholder:text-slate-400 focus:outline-none focus:border-[#004f90] resize-none min-h-[180px]"
                    />
                  </div>

                  {/* Parse Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const parsed = parseTextToQuestions(notepadText);
                      setParsedQuestions(parsed);
                      if (parsed.length > 0) {
                        toast.success(`Successfully parsed ${parsed.length} questions!`);
                      } else {
                        toast.error('No questions found. Please check the formatting.');
                      }
                    }}
                    className="w-full bg-[#004f90] hover:bg-[#003c6e] text-white py-2.5 rounded-xl text-xs font-bold shadow-sm transition-all cursor-pointer"
                  >
                    Parse & Load Preview
                  </button>
                  
                  {/* Formatting Help */}
                  <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-3.5 space-y-1.5 text-left">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wide">Expected Format:</span>
                    <pre className="text-[9px] text-amber-700 font-mono leading-normal overflow-x-auto">
{`1. Question text here
A) First option
B) Second option
C) Third option
D) Fourth option

2. Next question here...`}
                    </pre>
                  </div>
                </div>

                {/* Right Column: Live Preview & Answer Selector */}
                <div className="w-full md:w-7/12 p-6 overflow-y-auto space-y-4 bg-slate-50/30 flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-wider block">
                    Parsed Questions Preview ({parsedQuestions.length})
                  </span>

                  {parsedQuestions.length === 0 ? (
                    <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center p-8 text-center space-y-2">
                      <HelpCircle className="h-10 w-10 text-slate-300" />
                      <span className="text-xs font-bold text-slate-700">No questions parsed yet</span>
                      <span className="text-[10px] text-slate-400 max-w-xs">Upload a notepad file or paste text on the left, then click "Parse & Load Preview".</span>
                    </div>
                  ) : (
                    <div className="space-y-4 flex-1">
                      {parsedQuestions.map((q, qIndex) => (
                        <div key={qIndex} className="bg-white border border-slate-200/60 rounded-xl p-4.5 shadow-sm space-y-3 relative text-left">
                          {/* Question Header */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-bold text-[#004f90]">Question #{qIndex + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemovePreviewQuestion(qIndex)}
                              className="text-slate-400 hover:text-red-600 p-1 hover:bg-slate-50 rounded cursor-pointer"
                              title="Remove question from import list"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          {/* Question Text */}
                          <textarea
                            value={q.questionText}
                            onChange={(e) => handlePreviewChange(qIndex, 'questionText', e.target.value)}
                            rows="2"
                            className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-slate-800 text-xs focus:outline-none focus:border-[#004f90] resize-none"
                          />

                          {/* Options */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {['A', 'B', 'C', 'D'].map((label) => {
                              const opt = q.options.find(o => o.label === label);
                              return (
                                <div key={label} className="flex items-center space-x-2">
                                  <span className="w-6 h-6 rounded bg-slate-100 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">{label}</span>
                                  <input
                                    type="text"
                                    value={opt?.text || ''}
                                    onChange={(e) => handlePreviewOptionChange(qIndex, label, e.target.value)}
                                    placeholder={`Option ${label}`}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg py-1 px-2.5 text-slate-800 text-xs focus:outline-none focus:border-[#004f90]"
                                  />
                                </div>
                              );
                            })}
                          </div>

                          {/* Footer: Correct Answer Selector */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-550">Correct Answer:</span>
                              <div className="flex items-center gap-1">
                                {['A', 'B', 'C', 'D'].map((label) => (
                                  <button
                                    key={label}
                                    type="button"
                                    onClick={() => handlePreviewChange(qIndex, 'correctAnswer', label)}
                                    className={`h-7 w-7 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                                      q.correctAnswer === label
                                        ? 'bg-emerald-600 text-white shadow-sm'
                                        : 'bg-slate-100 text-slate-550 hover:bg-slate-200'
                                    }`}
                                  >
                                    {label}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => {
                    setShowBulkModal(false);
                    setParsedQuestions([]);
                    setNotepadText('');
                  }}
                  className="px-4 py-2 border border-slate-200 text-slate-555 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleBulkImportSubmit}
                  disabled={parsedQuestions.length === 0}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    parsedQuestions.length > 0
                      ? 'bg-[#004f90] hover:bg-[#003c6e] text-white cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  }`}
                >
                  Load {parsedQuestions.length} Questions
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CreateTest;
