import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { parsePdfToText } from '../../utils/pdfParser.js';
import { HelpCircle, Plus, Upload, Trash2, Edit2, GripVertical, CheckCircle2, Save, X, Eye, RefreshCw, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

const AddQuestions = ({ test, onFinished }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form input states
  const [editingQuestionId, setEditingQuestionId] = useState(null);
  const [questionText, setQuestionText] = useState('');
  const [optionA, setOptionA] = useState('');
  const [optionB, setOptionB] = useState('');
  const [optionC, setOptionC] = useState('');
  const [optionD, setOptionD] = useState('');
  const [correctAnswer, setCorrectAnswer] = useState('A');
  const [marks, setMarks] = useState(1);

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

  const handleImportSubmit = async () => {
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
      // Ensure that selected correct answer is not an empty option
      const correctOpt = q.options.find(o => o.label === q.correctAnswer);
      if (!correctOpt || !correctOpt.text.trim()) {
        return toast.error(`Question #${i + 1} has correct answer set to '${q.correctAnswer}', but that option has no text.`);
      }
    }

    const finalPayload = parsedQuestions.map((q, idx) => {
      // Filter out empty options before sending payload to the backend
      const filteredOptions = q.options.filter(opt => opt.text.trim() !== '');
      return {
        ...q,
        options: filteredOptions,
        testId: test._id,
        order: questions.length + idx + 1
      };
    });

    const loader = toast.loading('Importing questions...');
    try {
      await api.post('/questions/add', finalPayload);
      toast.success('Questions imported successfully!', { id: loader });
      setNotepadText('');
      setParsedQuestions([]);
      setShowBulkModal(false);
      fetchQuestions();
    } catch (err) {
      let errMsg = 'Failed to import questions.';
      if (err.response?.data) {
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errMsg = `Import failed: ${err.response.data.errors.join(', ')}`;
        } else {
          errMsg = err.response.data.message || errMsg;
        }
      }
      toast.error(errMsg, { id: loader });
    }
  };

  // Drag and Drop tracking states
  const [draggedIndex, setDraggedIndex] = useState(null);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/tests/${test._id}/questions`);
      setQuestions(data.sort((a, b) => a.order - b.order));
    } catch (err) {
      toast.error('Failed to download question list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQuestions();
  }, [test]);

  const resetForm = () => {
    setEditingQuestionId(null);
    setQuestionText('');
    setOptionA('');
    setOptionB('');
    setOptionC('');
    setOptionD('');
    setCorrectAnswer('A');
    setMarks(1);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();

    if (!questionText.trim() || !optionA.trim() || !optionB.trim()) {
      return toast.error('Please enter question text and at least Option A and Option B.');
    }

    const optionsArray = [
      { label: 'A', text: optionA.trim() },
      { label: 'B', text: optionB.trim() }
    ];
    if (optionC.trim()) optionsArray.push({ label: 'C', text: optionC.trim() });
    if (optionD.trim()) optionsArray.push({ label: 'D', text: optionD.trim() });

    const hasCorrectOption = optionsArray.some(opt => opt.label === correctAnswer);
    if (!hasCorrectOption) {
      return toast.error(`Please select a correct option that has text filled (selected Option ${correctAnswer} is empty).`);
    }

    const payload = {
      testId: test._id,
      questionText: questionText.trim(),
      options: optionsArray,
      correctAnswer,
      marks: Number(marks),
      order: editingQuestionId 
        ? questions.find(q => q._id === editingQuestionId)?.order 
        : questions.length + 1
    };

    const loader = toast.loading(editingQuestionId ? 'Updating question...' : 'Adding question...');
    try {
      if (editingQuestionId) {
        await api.put(`/questions/${editingQuestionId}`, payload);
        toast.success('Question updated successfully!', { id: loader });
      } else {
        await api.post('/questions/add', payload);
        toast.success('Question added successfully!', { id: loader });
      }
      resetForm();
      fetchQuestions();
    } catch (err) {
      let errMsg = 'Error occurred.';
      if (err.response?.data) {
        if (err.response.data.errors && Array.isArray(err.response.data.errors)) {
          errMsg = `Save failed: ${err.response.data.errors.join(', ')}`;
        } else {
          errMsg = err.response.data.message || errMsg;
        }
      }
      toast.error(errMsg, { id: loader });
    }
  };

  const handleEditClick = (q) => {
    setEditingQuestionId(q._id);
    setQuestionText(q.questionText);
    const optA = q.options.find(o => o.label === 'A')?.text || '';
    const optB = q.options.find(o => o.label === 'B')?.text || '';
    const optC = q.options.find(o => o.label === 'C')?.text || '';
    const optD = q.options.find(o => o.label === 'D')?.text || '';
    setOptionA(optA);
    setOptionB(optB);
    setOptionC(optC);
    setOptionD(optD);
    setCorrectAnswer(q.correctAnswer);
    setMarks(q.marks || 1);
  };

  const handleDeleteClick = async (qId) => {
    if (!window.confirm('Delete this question permanently?')) return;
    
    const loader = toast.loading('Deleting question...');
    try {
      await api.delete(`/questions/${qId}`);
      toast.success('Question deleted.', { id: loader });
      fetchQuestions();
    } catch (err) {
      toast.error('Deletion failed.', { id: loader });
    }
  };



  // NATIVE HTML5 DRAG & DROP REORDERING
  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e, index) => {
    e.preventDefault(); // Required to allow drop
    if (draggedIndex === null || draggedIndex === index) return;

    // Rearrange locally
    const updated = [...questions];
    const draggedItem = updated[draggedIndex];
    
    // Remove and insert
    updated.splice(draggedIndex, 1);
    updated.splice(index, 0, draggedItem);
    
    setDraggedIndex(index);
    setQuestions(updated);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSaveOrder = async () => {
    const loader = toast.loading('Syncing question layout orders...');
    try {
      // Loop through rearranged list and save new indexing
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        await api.put(`/questions/${q._id}`, { order: i + 1 });
      }
      toast.success('Visual sorting orders saved successfully!', { id: loader });
      fetchQuestions();
    } catch (err) {
      toast.error('Failed to preserve reordering state.', { id: loader });
    }
  };



  return (
    <div className="space-y-8 animate-fadeIn max-w-6xl mx-auto pb-10">
      
      {/* Sleek Go Back button at top-left */}
      <div className="flex justify-start">
        <button
          type="button"
          onClick={onFinished}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-800 text-sm font-bold transition-all duration-150 py-2.5 px-4.5 hover:bg-slate-50 rounded-xl border border-slate-100 shadow-sm cursor-pointer"
        >
          <ArrowLeft className="h-4.5 w-4.5" />
          <span>Go Back</span>
        </button>
      </div>

      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-4 gap-4">
        <div className="flex flex-col space-y-1">
          <span className="text-xs font-bold text-[#004f90] uppercase tracking-widest pl-2 border-l-2 border-[#004f90]">
            Question Configurator
          </span>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight font-poppins">{test.title} ({test.subject})</h2>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onFinished}
            className="bg-[#004f90] hover:bg-[#003c6e] text-white px-5 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all flex items-center space-x-2 cursor-pointer border border-[#004f90]"
          >
            <CheckCircle2 className="h-4.5 w-4.5" />
            <span>Finish Configuration</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Form Left, Question list Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form console */}
        <div className="lg:col-span-5 space-y-6">
          
            {/* SINGLE ADD FORM */}
            <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-md shadow-slate-100/30 space-y-5 relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#004f90] rounded-t-3xl"></div>
              
              <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider font-poppins">
                {editingQuestionId ? 'Modify Question' : 'Formulate Question'}
              </h3>

              <form onSubmit={handleSaveQuestion} className="space-y-5">
                {/* Question text */}
                <div className="space-y-1.5 flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-1">Question Statement</span>
                  <textarea
                    rows="3"
                    placeholder="Enter question text statement..."
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-2xl py-3 px-4.5 text-slate-805 text-sm font-medium placeholder:text-slate-350 shadow-inner focus:outline-none transition-all resize-none"
                  ></textarea>
                </div>

                {/* Option fields */}
                <div className="space-y-3.5">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-1 block">Choices</span>
                  
                  {/* Option A */}
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6.5 h-6.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">A</span>
                    <input
                      type="text"
                      placeholder="Option A text..."
                      value={optionA}
                      onChange={(e) => setOptionA(e.target.value)}
                      className="flex-1 bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl py-2 px-3.5 text-slate-805 text-sm font-medium placeholder:text-slate-300 shadow-inner focus:outline-none transition-all"
                    />
                  </div>
                  
                  {/* Option B */}
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6.5 h-6.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">B</span>
                    <input
                      type="text"
                      placeholder="Option B text..."
                      value={optionB}
                      onChange={(e) => setOptionB(e.target.value)}
                      className="flex-1 bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl py-2 px-3.5 text-slate-805 text-sm font-medium placeholder:text-slate-300 shadow-inner focus:outline-none transition-all"
                    />
                  </div>

                  {/* Option C */}
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6.5 h-6.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">C</span>
                    <input
                      type="text"
                      placeholder="Option C text (optional)..."
                      value={optionC}
                      onChange={(e) => setOptionC(e.target.value)}
                      className="flex-1 bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl py-2 px-3.5 text-slate-805 text-sm font-medium placeholder:text-slate-300 shadow-inner focus:outline-none transition-all"
                    />
                  </div>

                  {/* Option D */}
                  <div className="flex items-center space-x-2.5">
                    <span className="w-6.5 h-6.5 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-500 flex items-center justify-center shrink-0">D</span>
                    <input
                      type="text"
                      placeholder="Option D text (optional)..."
                      value={optionD}
                      onChange={(e) => setOptionD(e.target.value)}
                      className="flex-1 bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl py-2 px-3.5 text-slate-805 text-sm font-medium placeholder:text-slate-300 shadow-inner focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Answer key & marks */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-1">Correct Key</span>
                    <select
                      value={correctAnswer}
                      onChange={(e) => setCorrectAnswer(e.target.value)}
                      className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl py-2 px-3 text-slate-800 text-sm font-bold focus:outline-none transition-all cursor-pointer"
                    >
                      <option value="A">Option A</option>
                      <option value="B">Option B</option>
                      <option value="C">Option C</option>
                      <option value="D">Option D</option>
                    </select>
                  </div>
                  <div className="space-y-1.5 flex flex-col">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest pl-1">Marks Value</span>
                    <input
                      type="number"
                      min="1"
                      value={marks}
                      onChange={(e) => setMarks(Number(e.target.value))}
                      className="w-full bg-[#f8fafc] border border-slate-200 focus:border-[#004f90] focus:bg-white rounded-xl py-2 px-3 text-slate-805 text-sm font-bold focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex justify-end gap-2 pt-2">
                  {editingQuestionId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="border border-slate-200 text-slate-600 hover:bg-slate-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    className="bg-[#004f90] hover:bg-[#003c6e] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all cursor-pointer"
                  >
                    {editingQuestionId ? 'Save Edits' : 'Save Question'}
                  </button>
                </div>
              </form>
            </div>

        </div>

        {/* Right Column: Question List and Sorting Panel */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex items-center justify-between pl-1">
            <h3 className="text-base font-extrabold text-slate-900 pl-3 border-l-4 border-[#004f90] leading-none font-poppins">
              Active Question Pool ({questions.length})
            </h3>
            
            {questions.length > 1 && (
              <button
                onClick={handleSaveOrder}
                className="flex items-center space-x-1.5 bg-blue-50 border border-blue-150 hover:bg-blue-100 text-[#004f90] px-3.5 py-2 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer"
              >
                <Save className="h-3.5 w-3.5" />
                <span>Preserve Reordering</span>
              </button>
            )}
          </div>

          {loading ? (
            <div className="py-20 text-center text-xs text-slate-400 font-bold">Loading question bank...</div>
          ) : questions.length === 0 ? (
            <div className="bg-white border border-slate-200/80 rounded-3xl p-16 text-center text-slate-400 space-y-3 shadow-md shadow-slate-100/10">
              <HelpCircle className="h-10 w-10 text-slate-300 mx-auto" />
              <p className="font-extrabold text-slate-800 text-sm">Empty question roster.</p>
              <p className="text-[10px] text-slate-400 font-medium">Configure your first question on the left.</p>
            </div>
          ) : (
            /* Draggable list */
            <div className="space-y-4 max-h-[calc(100vh-16rem)] overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isBeingDragged = idx === draggedIndex;
                return (
                  <div
                    key={q._id}
                    draggable
                    onDragStart={() => handleDragStart(idx)}
                    onDragOver={(e) => handleDragOver(e, idx)}
                    onDragEnd={handleDragEnd}
                    className={`bg-charcoal-surface border rounded-xl p-4.5 transition-all duration-300 relative ${
                      isBeingDragged 
                        ? 'opacity-40 border-dashed border-accent bg-charcoal-light scale-95' 
                        : 'border-accent/10 hover:border-accent/30 hover:shadow-lg'
                    }`}
                  >
                    {/* Top drag handle header */}
                    <div className="flex items-start justify-between gap-4 pb-2 border-b border-accent/5">
                      <div className="flex items-center space-x-2">
                        <div className="cursor-grab hover:text-accent text-softgrey/45 active:cursor-grabbing p-1">
                          <GripVertical className="h-4 w-4" />
                        </div>
                        <span className="text-[10px] font-bold text-accent">Question {idx + 1}</span>
                        <span className="text-[9px] bg-charcoal-light text-softgrey/80 border border-accent/5 px-2 py-0.5 rounded">
                          {q.marks || 1} Mark{q.marks > 1 ? 's' : ''}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditClick(q)}
                          className="p-1.5 rounded-md text-softgrey hover:text-accent hover:bg-charcoal-light transition-colors"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(q._id)}
                          className="p-1.5 rounded-md text-softgrey hover:text-danger hover:bg-danger/10 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Question Content */}
                    <div className="pt-3 space-y-3">
                      <p className="text-xs font-semibold text-white leading-relaxed">{q.questionText}</p>
                      
                      {/* Grid options */}
                      <div className="grid grid-cols-2 gap-2 text-[10px] text-softgrey">
                        {q.options.map(opt => {
                          const isRight = opt.label === q.correctAnswer;
                          return (
                            <div
                              key={opt.label}
                              className={`flex items-center space-x-2 pl-2 pr-1 py-1.5 rounded border ${
                                isRight 
                                  ? 'bg-success/10 border-success/30 text-success font-semibold' 
                                  : 'bg-charcoal-light/40 border-accent/5'
                              }`}
                            >
                              <span className="font-bold shrink-0">{opt.label}:</span>
                              <span className="truncate">{opt.text}</span>
                            </div>
                          );
                        })}
                      </div>

                      <div className="text-[9px] text-softgrey/60">
                        Correct Option: <span className="text-success font-bold">{q.correctAnswer}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

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
                              className="text-slate-400 hover:text-red-655 hover:bg-red-50 rounded-xl transition-all cursor-pointer border border-transparent hover:border-slate-100"
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
                  className="px-4 py-2 border border-slate-200 text-slate-550 hover:bg-slate-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleImportSubmit}
                  disabled={parsedQuestions.length === 0}
                  className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md ${
                    parsedQuestions.length > 0
                      ? 'bg-[#004f90] hover:bg-[#003c6e] text-white cursor-pointer'
                      : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed shadow-none'
                  }`}
                >
                  Import {parsedQuestions.length} Questions
                </button>
              </div>

            </div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default AddQuestions;
