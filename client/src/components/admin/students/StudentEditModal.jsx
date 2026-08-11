import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X, ChevronDown } from 'lucide-react';

const StudentEditModal = ({
  isOpen,
  onClose,
  studentToEdit,
  editFormData,
  setEditFormData,
  handleEditDobInputChange,
  editDobError,
  handleEditCenterChange,
  deptList,
  collegeEditCourseTracks,
  instituteCourseTracks,
  centersList,
  handleUpdateStudent
}) => {
  if (!isOpen || !studentToEdit) return null;

  const isInstitute = editFormData.studentType === 'institute';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1100] flex items-center justify-center p-4 bg-slate-900/30 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-slate-200 text-left max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-[#004f90]" />
                <span>Modify Student Profile</span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Update account information for {studentToEdit.name}
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

          <form onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
            {/* Name */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                Full Name *
              </label>
              <input
                required
                type="text"
                value={editFormData.name}
                onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 px-3 text-slate-800 outline-none"
              />
            </div>

            {/* Email */}
            <div className="space-y-1">
              <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                Email Address *
              </label>
              <input
                required
                type="email"
                value={editFormData.email}
                onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 px-3 text-slate-800 outline-none"
              />
            </div>

            {/* DOB */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                  Date of Birth (DOB)
                </label>
                {editDobError && <span className="text-rose-500 text-[10px] font-semibold">{editDobError}</span>}
              </div>
              <input
                type="text"
                placeholder="DD-MM-YYYY (e.g. 04-09-2003)"
                value={editFormData.dob}
                onChange={(e) => handleEditDobInputChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 px-3 text-slate-800 outline-none font-mono"
              />
            </div>

            {isInstitute ? (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {/* Center */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      District Branch Center
                    </label>
                    <div className="relative flex items-center">
                      <select
                        value={editFormData.center}
                        onChange={(e) => handleEditCenterChange(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 pl-3 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
                      >
                        {centersList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                    </div>
                  </div>

                  {/* Course Track */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      SDLC Course Track
                    </label>
                    <div className="relative flex items-center">
                      <select
                        value={editFormData.courseTrack}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, courseTrack: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 pl-3 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
                      >
                        {instituteCourseTracks.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Enrollment ID */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                    SDLC Enrollment ID *
                  </label>
                  <input
                    required
                    type="text"
                    value={editFormData.enrollmentId}
                    onChange={(e) => setEditFormData(prev => ({ ...prev, enrollmentId: e.target.value }))}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 px-3 text-slate-800 outline-none font-mono uppercase font-bold"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-3">
                  {/* Roll Number */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      College Roll Number *
                    </label>
                    <input
                      required
                      type="text"
                      value={editFormData.rollNumber}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 px-3 text-slate-800 outline-none font-mono uppercase"
                    />
                  </div>

                  {/* Department */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      Department
                    </label>
                    <div className="relative flex items-center">
                      <select
                        value={editFormData.department}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 pl-3 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
                      >
                        {deptList.map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Batch Range */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      Batch Range
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 2023-2027"
                      value={editFormData.batch}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, batch: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 px-3 text-slate-800 outline-none font-mono"
                    />
                  </div>

                  {/* Year */}
                  <div className="space-y-1">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      Academic Year
                    </label>
                    <div className="relative flex items-center">
                      <select
                        value={editFormData.year}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, year: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 pl-3 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
                      >
                        <option value="1st Year">1st Year</option>
                        <option value="2nd Year">2nd Year</option>
                        <option value="3rd Year">3rd Year</option>
                        <option value="4th Year">4th Year</option>
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                    </div>
                  </div>
                </div>

                {/* Course Track */}
                <div className="space-y-1">
                  <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                    Skill Track
                  </label>
                  <div className="relative flex items-center">
                    <select
                      value={editFormData.courseTrack}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, courseTrack: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9 pl-3 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
                    >
                      <option value="">None / General Track</option>
                      {collegeEditCourseTracks.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 font-semibold">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:text-slate-900 bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-[#004f90] hover:bg-[#003c6e] text-white rounded-lg cursor-pointer transition shadow-2xs"
              >
                Save Changes
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentEditModal;
