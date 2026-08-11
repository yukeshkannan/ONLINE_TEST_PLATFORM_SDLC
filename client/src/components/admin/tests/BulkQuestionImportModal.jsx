import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileSpreadsheet, Trash2 } from 'lucide-react';

const BulkQuestionImportModal = ({
  isOpen,
  onClose,
  handleFileUpload,
  parsedQuestions,
  handleRemovePreviewQuestion,
  handleSetPreviewCorrectAnswer,
  handleBulkImportSubmit
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-left max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
                <Upload className="w-4 h-4 text-[#004f90]" />
                <span>Bulk Import Questions from TXT / PDF</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Extract questions and options automatically from documents.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
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
                <p className="text-[11px] text-slate-400 font-medium">
                  Supports Plain Text (.txt) and PDF (.pdf) documents
                </p>
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
                        <span className="font-bold font-mono text-[#004f90] text-xs">
                          Question #{pIndex + 1}
                        </span>
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
              onClick={onClose}
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
    </AnimatePresence>
  );
};

export default BulkQuestionImportModal;
