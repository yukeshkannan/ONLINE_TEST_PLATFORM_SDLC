import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, X, GraduationCap, BookOpen, ChevronDown } from 'lucide-react';

const StudentAddModal = ({
  isOpen,
  onClose,
  addStudentType,
  setAddStudentType,
  formData,
  setFormData,
  handleAddDobChange,
  dobError,
  deptList,
  collegeCourseTracks,
  instituteCourseTracks,
  centersList,
  handleSaveStudent
}) => {
  if (!isOpen) return null;

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
                  <UserPlus className="w-4 h-4 text-[#004f90]" />
                  <span>Register New Student</span>
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Enroll a candidate into College or SDLC Institute portal.
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
            {/* Student Type Switcher */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setAddStudentType('college')}
                className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  addStudentType === 'college'
                    ? 'bg-[#004f90] text-white shadow-sm ring-1 ring-[#004f90]'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/60'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>College Student</span>
              </button>
              <button
                type="button"
                onClick={() => setAddStudentType('institute')}
                className={`py-2.5 px-3 text-xs font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 ${
                  addStudentType === 'institute'
                    ? 'bg-[#F7931A] text-white shadow-sm ring-1 ring-[#F7931A]'
                    : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 border border-slate-200/60'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>SDLC Institute</span>
              </button>
            </div>

            {/* Add Form */}
            <form id="add-student-form" onSubmit={handleSaveStudent} className="space-y-4 text-xs">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                  Full Name *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Anand Kumar"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
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
                  placeholder="e.g. anand.kumar@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 px-3.5 text-slate-800 outline-none"
                />
              </div>

              {/* Dynamic fields based on student type */}
              {addStudentType === 'college' ? (
                <>
                  {/* College Roll Number */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      College Roll Number *
                    </label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. 21CS042"
                      value={formData.rollNumber}
                      onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 px-3.5 text-slate-800 outline-none font-mono uppercase"
                    />
                    <p className="text-[10px] text-slate-400">Used as the default login password</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* Department */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Department *
                      </label>
                      <div className="relative flex items-center">
                        <select
                          value={formData.department}
                          onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
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
                        Academic Year *
                      </label>
                      <div className="relative flex items-center">
                        <select
                          value={formData.year}
                          onChange={(e) => setFormData(prev => ({ ...prev, year: e.target.value }))}
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

                  {/* Optional Skill Track */}
                  <div className="space-y-1.5">
                    <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                      Specialized Skill Track (Optional)
                    </label>
                    <div className="relative flex items-center">
                      <select
                        value={formData.courseTrack}
                        onChange={(e) => setFormData(prev => ({ ...prev, courseTrack: e.target.value }))}
                        className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-3.5 pr-8 text-slate-800 outline-none appearance-none cursor-pointer"
                      >
                        <option value="">None / General Track</option>
                        {collegeCourseTracks.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* DOB for SDLC Institute */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        Date of Birth (DOB) *
                      </label>
                      {dobError && <span className="text-rose-500 text-[10px] font-semibold">{dobError}</span>}
                    </div>
                    <input
                      required
                      type="text"
                      placeholder="DD-MM-YYYY (e.g. 04-09-2003)"
                      value={formData.dob}
                      onChange={(e) => handleAddDobChange(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 px-3.5 text-slate-800 outline-none font-mono"
                    />
                    <p className="text-[10px] text-slate-400">Used as the default login password (format: DDMMYYYY)</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    {/* SDLC Center */}
                    <div className="space-y-1.5">
                      <label className="font-bold text-slate-600 uppercase tracking-wider text-[10px]">
                        District Branch Center *
                      </label>
                      <div className="relative flex items-center">
                        <select
                          value={formData.center}
                          onChange={(e) => setFormData(prev => ({ ...prev, center: e.target.value }))}
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
                        SDLC Course Track *
                      </label>
                      <div className="relative flex items-center">
                        <select
                          required
                          value={formData.courseTrack}
                          onChange={(e) => setFormData(prev => ({ ...prev, courseTrack: e.target.value }))}
                          className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-3.5 pr-8 text-slate-800 outline-none appearance-none cursor-pointer font-medium"
                        >
                          <option value="" disabled>-- Select SDLC Course Track * --</option>
                          {instituteCourseTracks.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                      </div>
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
              form="add-student-form"
              className="px-5 py-2.5 bg-[#004f90] hover:bg-[#003c6e] text-white rounded-lg cursor-pointer transition shadow-2xs font-semibold text-xs"
            >
              Create Student
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default StudentAddModal;
