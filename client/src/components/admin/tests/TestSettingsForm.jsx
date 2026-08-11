import React from 'react';
import { 
  FileText, Calendar, Building2, BookOpen, GraduationCap, Clock, Award, 
  ChevronDown 
} from 'lucide-react';

const TestSettingsForm = ({
  // General Info
  title,
  setTitle,
  subject,
  setSubject,
  duration,
  setDuration,
  customPassMark,
  setCustomPassMark,
  currentPassMark,
  questionsCount,
  status,
  setStatus,
  showResultsToStudents,
  setShowResultsToStudents,
  // Timings
  startDate,
  setStartDate,
  startHour,
  setStartHour,
  startMinute,
  setStartMinute,
  startAmpm,
  setStartAmpm,
  endDate,
  setEndDate,
  endHour,
  setEndHour,
  endMinute,
  setEndMinute,
  endAmpm,
  setEndAmpm,
  hourOptions,
  minuteOptions,
  // Cohorts & Category
  categoryMode,
  setCategoryMode,
  selectedDepts,
  toggleTargetDept,
  selectedYears,
  toggleTargetYear,
  selectedBatches,
  toggleTargetBatch,
  selectedCenters,
  toggleTargetCenter,
  deptList,
  batchList,
  centerList,
  // Instructions
  description,
  setDescription,
  instructions,
  setInstructions
}) => {
  return (
    <div className="space-y-8">
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
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Define core test metadata, evaluation duration, passing criteria, and availability status.
            </p>
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

            {/* Pass Mark */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Pass Mark *
                </label>
                <span className="text-[10px] font-extrabold text-[#004f90] bg-[#004f90]/10 px-1.5 py-0.5 rounded">
                  {questionsCount > 0 ? `${Math.round((currentPassMark / questionsCount) * 100)}%` : '40%'}
                </span>
              </div>
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="1"
                  max={questionsCount || 999}
                  placeholder={`e.g. ${Math.ceil(questionsCount * 0.4)}`}
                  value={customPassMark}
                  onChange={(e) => setCustomPassMark(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-[#004f90] rounded-lg h-10 pl-3.5 pr-10 text-xs font-extrabold text-[#004f90] outline-none"
                />
                <Award className="w-4 h-4 text-slate-400 absolute right-3 pointer-events-none" />
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
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Specify when the test becomes accessible and when registration closes.
            </p>
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
      {/* CARD 3: TARGET AUDIENCE ALLOCATION */}
      {/* ========================================================================= */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 font-poppins flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#004f90]" />
              <span>3. Candidate Roster Target Allocation</span>
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Filter which college departments or SDLC institute courses can access this exam.
            </p>
          </div>
        </div>

        {/* Underline Tab Switcher */}
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
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Provide exam summary and candidate rules before test initiation.
            </p>
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
    </div>
  );
};

export default TestSettingsForm;
