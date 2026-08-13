import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit3, X, ChevronDown, GraduationCap, BookOpen } from 'lucide-react';

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
      <div className="fixed inset-0 z-[1050] overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        />

        {/* Slide-over Right Drawer */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 240 }}
          className="fixed right-0 top-0 bottom-0 h-screen w-full max-w-[480px] bg-white z-[1100] shadow-2xl flex flex-col overflow-hidden text-xs text-left"
        >
          {/* Header with Logo */}
          <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-white shrink-0">
            <div className="space-y-3">
              <img src="/logo.png" alt="SDLC Logo" className="h-8 w-auto object-contain max-w-[150px]" />
              <div>
                <h3 className="text-base font-bold text-slate-900 font-poppins flex items-center gap-2">
                  <Edit3 className="w-4 h-4 text-[#004f90]" />
                  <span>Modify Student Profile</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Update account details for <strong className="text-slate-700 font-semibold">{studentToEdit.name}</strong>
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 scrollbar-none">
            {/* Student Type Badge Indicator */}
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold ${
                isInstitute 
                  ? 'bg-orange-50 text-[#F7931A] border border-orange-200' 
                  : 'bg-blue-50 text-[#004f90] border border-blue-200'
              }`}>
                {isInstitute ? <BookOpen className="w-3.5 h-3.5" /> : <GraduationCap className="w-3.5 h-3.5" />}
                <span>{isInstitute ? 'SDLC Institute Student' : 'College Student'}</span>
              </span>
            </div>

            {/* Edit Form */}
            <form id="edit-student-form" onSubmit={handleUpdateStudent} className="space-y-4 text-xs">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  value={editFormData.name}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 px-3.5 text-slate-800 outline-none"
                />
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 px-3.5 text-slate-800 outline-none"
                />
              </div>

              {isInstitute ? (
                <>
                  {/* DOB for SDLC Institute */}
                  <div className="space-y-1.5">
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
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 px-3.5 text-slate-800 outline-none font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* SDLC Center */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        District Branch Center
                      </label>
                      <div className="relative flex items-center">
                        <select
                          value={editFormData.center}
                          onChange={(e) => handleEditCenterChange(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-3.5 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
                        >
                          {centersList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Course Track */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        SDLC Course Track
                      </label>
                      <div className="relative flex items-center">
                        <select
                          value={editFormData.courseTrack}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, courseTrack: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-3.5 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
                        >
                          {instituteCourseTracks.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Enrollment ID */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      SDLC Enrollment ID *
                    </label>
                    <input
                      required
                      type="text"
                      value={editFormData.enrollmentId}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, enrollmentId: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 px-3.5 text-slate-800 outline-none font-mono uppercase font-bold"
                    />
                  </div>
                </>
              ) : (
                <>
                  {/* College Roll Number */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      College Roll Number *
                    </label>
                    <input
                      required
                      type="text"
                      value={editFormData.rollNumber}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 px-3.5 text-slate-800 outline-none font-mono uppercase"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Department */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Department
                      </label>
                      <div className="relative flex items-center">
                        <select
                          value={editFormData.department}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, department: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-3.5 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
                        >
                          {deptList.map(d => <option key={d} value={d}>{d}</option>)}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                      </div>
                    </div>

                    {/* Academic Year */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Academic Year
                      </label>
                      <div className="relative flex items-center">
                        <select
                          value={editFormData.year}
                          onChange={(e) => setEditFormData(prev => ({ ...prev, year: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-3.5 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
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

                  {/* Specialized Skill Track */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      Specialized Skill Track (Optional)
                    </label>
                    <div className="relative flex items-center">
                      <select
                        value={editFormData.courseTrack}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, courseTrack: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-3.5 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">None / General Track</option>
                        {collegeEditCourseTracks.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                    </div>
                  </div>
                </>
              )}
            </form>
          </div>

          {/* Footer Actions */}
          <div className="p-5 border-t border-slate-100 bg-slate-50/70 flex items-center justify-end gap-2.5 shrink-0 font-semibold">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:text-slate-900 bg-white border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-50 transition text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="edit-student-form"
              className="px-5 py-2.5 bg-[#004f90] hover:bg-[#003c6e] text-white rounded-lg cursor-pointer transition shadow-2xs font-semibold text-xs"
            >
              Save Changes
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentEditModal;
