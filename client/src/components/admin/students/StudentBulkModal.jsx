import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, X, FileText, CheckCircle2, GraduationCap, Building2, Download 
} from 'lucide-react';

const StudentBulkModal = ({
  isOpen,
  onClose,
  bulkStudentType,
  setBulkStudentType,
  selectedFile,
  setSelectedFile,
  parsedStudents,
  setParsedStudents,
  handleBulkFileUpload,
  handleBulkImportSubmit,
  downloadSampleCSV
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1050] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.97 }}
          className="bg-white border border-slate-200 rounded-xl max-w-md w-full overflow-hidden shadow-xl text-xs font-sans"
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div>
              <h2 className="text-base font-bold text-slate-900 font-poppins">
                Bulk Import Students
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Upload a CSV file to register candidate records.
              </p>
            </div>

            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-md hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-4 text-left">
            {/* Category Switcher Tabs */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Target Category
              </label>
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setBulkStudentType('college');
                    setSelectedFile(null);
                    setParsedStudents([]);
                  }}
                  className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    bulkStudentType === 'college'
                      ? 'bg-[#004f90] text-white shadow-sm ring-1 ring-[#004f90]'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/60'
                  }`}
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>College Students</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setBulkStudentType('institute');
                    setSelectedFile(null);
                    setParsedStudents([]);
                  }}
                  className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                    bulkStudentType === 'institute'
                      ? 'bg-[#F7931A] text-white shadow-sm ring-1 ring-[#F7931A]'
                      : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/60'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>SDLC Students</span>
                </button>
              </div>
            </div>

            {/* File Dropzone */}
            {!selectedFile ? (
              <div className="border border-dashed border-slate-300 hover:border-[#004f90] bg-slate-50/50 hover:bg-slate-50 rounded-xl p-6 text-center transition cursor-pointer relative">
                <input
                  type="file"
                  accept=".csv, .txt"
                  onChange={handleBulkFileUpload}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                />
                <div className="space-y-1.5 pointer-events-none">
                  <Upload className="w-5 h-5 text-slate-400 mx-auto" />
                  <p className="text-xs font-semibold text-slate-800">
                    Click to select or drag & drop CSV file
                  </p>
                  <p className="text-[11px] text-slate-400 font-normal">
                    Supported formats: .csv, .txt
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <FileText className="w-5 h-5 text-[#004f90] shrink-0" />
                  <div className="min-w-0 text-left">
                    <p className="text-xs font-semibold text-slate-900 truncate">
                      {selectedFile.name}
                    </p>
                    <p className="text-[11px] text-emerald-700 font-medium flex items-center gap-1 mt-0.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" />
                      {parsedStudents.length} candidates ready
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setParsedStudents([]);
                  }}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-md hover:bg-slate-200/60 cursor-pointer shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Download Sample CSV Action */}
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => downloadSampleCSV(bulkStudentType)}
                className="text-[#004f90] hover:underline font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {bulkStudentType === 'college' ? 'College' : 'SDLC'} Template CSV</span>
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 rounded-lg font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleBulkImportSubmit}
              disabled={parsedStudents.length === 0}
              className="px-5 py-2 bg-[#004f90] hover:bg-[#003c6e] disabled:opacity-50 text-white rounded-lg font-semibold transition cursor-pointer shadow-2xs"
            >
              Import {parsedStudents.length} Students
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentBulkModal;
