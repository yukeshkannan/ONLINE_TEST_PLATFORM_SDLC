import React, { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import { parsePdfToText } from '../../utils/pdfParser.js';
import { parseTextToQuestions } from '../../utils/questionParser.js';
import { ArrowLeft, Send } from 'lucide-react';
import ClockLoader from '../shared/ClockLoader.jsx';
import toast from 'react-hot-toast';

import TestSettingsForm from './tests/TestSettingsForm.jsx';
import QuestionEditor from './tests/QuestionEditor.jsx';
import BulkQuestionImportModal from './tests/BulkQuestionImportModal.jsx';

const CreateTest = ({ testToEdit, onSave, onCancel }) => {
  const isEditing = !!testToEdit;

  // Metadata form states
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [duration, setDuration] = useState('30');
  const [customPassMark, setCustomPassMark] = useState(testToEdit?.passMark !== undefined ? String(testToEdit.passMark) : '');
  const [status, setStatus] = useState(testToEdit ? testToEdit.status : 'active'); // draft | active | ended
  const [showResultsToStudents, setShowResultsToStudents] = useState(true);

  // Custom 12-hour AM/PM Time States
  const [startDate, setStartDate] = useState('');
  const [startHour, setStartHour] = useState('00');
  const [startMinute, setStartMinute] = useState('00');
  const [startAmpm, setStartAmpm] = useState('AM');

  const [endDate, setEndDate] = useState('');
  const [endHour, setEndHour] = useState('00');
  const [endMinute, setEndMinute] = useState('00');
  const [endAmpm, setEndAmpm] = useState('AM');

  // Category Mode & Cohort targeting controls ('college' | 'institute')
  const [categoryMode, setCategoryMode] = useState('college');
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
  const [loadingInitialData, setLoadingInitialData] = useState(true);

  // Bulk Import state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState([]);

  // Load Metadata Catalogs
  useEffect(() => {
    Promise.all([
      api.get('/cohorts/departments'),
      api.get('/cohorts/batches'),
      api.get('/cohorts/centers')
    ])
      .then(([deptRes, batchRes, centerRes]) => {
        if (Array.isArray(deptRes.data)) {
          setDeptList(deptRes.data.filter(d => d.isActive !== false).map(d => d.code));
        }
        if (Array.isArray(batchRes.data)) {
          setAllBatches(batchRes.data.filter(b => b.isActive !== false));
        }
        if (Array.isArray(centerRes.data)) {
          setCenterList(centerRes.data.filter(c => c.isActive !== false).map(c => c.name));
        }
      })
      .catch(() => {})
      .finally(() => {
        setLoadingInitialData(false);
      });
  }, []);

  // Compute dynamic batch list filtering by categoryMode
  const batchList = allBatches
    .filter(b => categoryMode === 'college' ? b.category === 'college' : b.category !== 'college')
    .map(b => b.name);

  const toggleTargetDept = (dept) => {
    if (dept === 'All Departments') {
      setSelectedDepts(['All Departments']);
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
  };

  const toggleTargetYear = (yr) => {
    if (yr === 'All Years') {
      setSelectedYears(['All Years']);
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
  };

  const toggleTargetBatch = (bt) => {
    if (bt === 'All Batches') {
      setSelectedBatches(['All Batches']);
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
      setStatus(testToEdit.status === 'ended' ? 'active' : (testToEdit.status || 'draft'));
      setShowResultsToStudents(testToEdit.showResultsToStudents !== undefined ? testToEdit.showResultsToStudents : true);

      if (testToEdit.categoryMode) {
        setCategoryMode(testToEdit.categoryMode);
      } else if (testToEdit.assignedTo && testToEdit.assignedTo.length > 0) {
        const isInst = testToEdit.assignedTo.some(a => 
          a.department === 'SDLC' || ['Karur', 'Coimbatore', 'Namakkal', 'Dindigul', 'Chennai'].includes(a.year)
        );
        setCategoryMode(isInst ? 'institute' : 'college');
      }

      if (testToEdit.assignedTo && testToEdit.assignedTo.length > 0) {
        const uniqueBatches = [...new Set(testToEdit.assignedTo.map(a => a.batch).filter(Boolean))];
        const uniqueDepts = [...new Set(testToEdit.assignedTo.map(a => a.department).filter(Boolean))];
        const uniqueYears = [...new Set(testToEdit.assignedTo.map(a => a.year).filter(Boolean))];

        if (uniqueBatches.length > 0) setSelectedBatches(uniqueBatches);
        if (uniqueDepts.length > 0) setSelectedDepts(uniqueDepts);
        if (uniqueYears.length > 0) {
          setSelectedYears(uniqueYears);
          setSelectedCenters(uniqueYears);
        }
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
    if (hours === 0) {
      hours = ampmStr === 'PM' ? 12 : 0;
    } else {
      if (ampmStr === 'PM' && hours < 12) hours += 12;
      if (ampmStr === 'AM' && hours === 12) hours = 0;
    }
    return new Date(year, month - 1, day, hours, Number(minStr));
  };

  const handleBulkImportSubmit = () => {
    if (parsedQuestions.length === 0) {
      return toast.error('No valid questions found to import.');
    }

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
      toast(`Filtered out ${parsedQuestions.length - validQuestions.length} incomplete question fragments.`);
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
    setParsedQuestions([]);
    setShowBulkModal(false);
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    
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
    if (categoryMode === 'institute') {
      const batchesToAssign = selectedBatches.length > 0 ? selectedBatches : ['All Batches'];
      const centersToAssign = selectedCenters.length > 0 ? selectedCenters : ['All Branches'];

      for (let b of batchesToAssign) {
        for (let c of centersToAssign) {
          assignedCombinations.push({ department: 'SDLC', batch: b, year: c });
        }
      }
    } else {
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
    }

    const finalStatus = (status === 'ended' && endDateTime > new Date()) ? 'active' : status;

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
      status: finalStatus,
      categoryMode: categoryMode || 'college',
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

  if (loadingQuestions) {
    return (
      <div className="flex flex-col items-center justify-center py-32 font-sans">
        <ClockLoader 
          size="lg" 
          color="#004f90" 
          text="Loading assessment details and question paper..." 
        />
      </div>
    );
  }

  const hourOptions = ['00', ...Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'))];
  const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

  return (
    <div className="space-y-8 text-left pb-16 font-sans">
      {/* Top Bar */}
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
        {/* Modular Settings Form Component */}
        <TestSettingsForm
          title={title}
          setTitle={setTitle}
          subject={subject}
          setSubject={setSubject}
          duration={duration}
          setDuration={setDuration}
          customPassMark={customPassMark}
          setCustomPassMark={setCustomPassMark}
          currentPassMark={currentPassMark}
          questionsCount={questions.length}
          status={status}
          setStatus={setStatus}
          showResultsToStudents={showResultsToStudents}
          setShowResultsToStudents={setShowResultsToStudents}
          startDate={startDate}
          setStartDate={setStartDate}
          startHour={startHour}
          setStartHour={setStartHour}
          startMinute={startMinute}
          setStartMinute={setStartMinute}
          startAmpm={startAmpm}
          setStartAmpm={setStartAmpm}
          endDate={endDate}
          setEndDate={setEndDate}
          endHour={endHour}
          setEndHour={setEndHour}
          endMinute={endMinute}
          setEndMinute={setEndMinute}
          endAmpm={endAmpm}
          setEndAmpm={setEndAmpm}
          hourOptions={hourOptions}
          minuteOptions={minuteOptions}
          categoryMode={categoryMode}
          setCategoryMode={setCategoryMode}
          selectedDepts={selectedDepts}
          toggleTargetDept={toggleTargetDept}
          selectedYears={selectedYears}
          toggleTargetYear={toggleTargetYear}
          selectedBatches={selectedBatches}
          toggleTargetBatch={toggleTargetBatch}
          selectedCenters={selectedCenters}
          toggleTargetCenter={toggleTargetCenter}
          deptList={deptList}
          batchList={batchList}
          centerList={centerList}
          description={description}
          setDescription={setDescription}
          instructions={instructions}
          setInstructions={setInstructions}
        />

        {/* Modular Question Editor Component */}
        <QuestionEditor
          questions={questions}
          currentPassMark={currentPassMark}
          addQuestion={addQuestion}
          removeQuestion={removeQuestion}
          updateQuestionField={updateQuestionField}
          onOpenBulkModal={() => setShowBulkModal(true)}
        />

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

      {/* Modular Bulk Import Modal */}
      <BulkQuestionImportModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        handleFileUpload={handleFileUpload}
        parsedQuestions={parsedQuestions}
        handleRemovePreviewQuestion={handleRemovePreviewQuestion}
        handleSetPreviewCorrectAnswer={handleSetPreviewCorrectAnswer}
        handleBulkImportSubmit={handleBulkImportSubmit}
      />
    </div>
  );
};

export default CreateTest;
