import React from 'react';
import { 
  CheckCircle2, Upload, Plus, HelpCircle, Trash2, Check 
} from 'lucide-react';

const QuestionEditor = ({
  questions,
  currentPassMark,
  addQuestion,
  removeQuestion,
  updateQuestionField,
  onOpenBulkModal
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
      {/* Header bar */}
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
            onClick={onOpenBulkModal}
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
  );
};

export default QuestionEditor;
