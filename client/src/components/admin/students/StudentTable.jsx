import React, { useState } from 'react';
import { 
  Users, UserPlus, Search, Filter, Trash2, Edit3, CheckCircle2, 
  GraduationCap, BookOpen, Upload, Send, KeyRound, Copy, Mail,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';

const StudentTable = ({
  categoryTab,
  setCategoryTab,
  collegeCount,
  instituteCount,
  searchTerm,
  setSearchTerm,
  deptFilter,
  setDeptFilter,
  courseFilter,
  setCourseFilter,
  centerFilter,
  setCenterFilter,
  deptList,
  instituteCourseTracks,
  centersList,
  currentStudents,
  filteredStudents,
  totalItems,
  currentPage,
  totalPages,
  setCurrentPage,
  getPageNumbers,
  onAddClick,
  onBulkClick,
  onSendAllClick,
  onEditClick,
  onDeleteClick,
  onSendCredentialsClick,
  getCollegeCourseTrack
}) => {
  const [copiedId, setCopiedId] = useState(null);

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    toast.success('Password copied to clipboard');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs: College vs SDLC */}
      <div className="flex border-b border-slate-200 bg-white rounded-t-xl px-4 pt-2">
        <button
          type="button"
          onClick={() => setCategoryTab('college')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            categoryTab === 'college'
              ? 'border-[#004f90] text-[#004f90]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <GraduationCap className="w-4 h-4" />
          <span>College Students</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            categoryTab === 'college' ? 'bg-blue-50 text-[#004f90]' : 'bg-slate-100 text-slate-600'
          }`}>
            {collegeCount}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setCategoryTab('institute')}
          className={`py-3 px-6 text-sm font-bold border-b-2 transition-all cursor-pointer flex items-center gap-2 ${
            categoryTab === 'institute'
              ? 'border-[#F7931A] text-[#F7931A]'
              : 'border-transparent text-slate-500 hover:text-slate-700'
          }`}
        >
          <BookOpen className="w-4 h-4 text-[#F7931A]" />
          <span>SDLC Institute Candidates</span>
          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
            categoryTab === 'institute' ? 'bg-orange-50 text-[#F7931A]' : 'bg-slate-100 text-slate-600'
          }`}>
            {instituteCount}
          </span>
        </button>
      </div>

      {/* Action and Filter Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder={categoryTab === 'college' ? "Search by Name, Roll No, or Email..." : "Search by Name, Enrollment ID, Center, or Email..."}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-[#004f90] rounded-lg h-9.5 pl-9 pr-3 text-xs text-slate-800 outline-none"
          />
        </div>

        {/* Filters and Actions */}
        <div className="flex flex-wrap items-center gap-2.5">
          {categoryTab === 'college' ? (
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={deptFilter}
                onChange={(e) => setDeptFilter(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
              >
                <option value="All">All Departments</option>
                {deptList.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9.5">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={courseFilter}
                  onChange={(e) => setCourseFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All">All Courses</option>
                  {instituteCourseTracks.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-lg px-2.5 h-9.5">
                <select
                  value={centerFilter}
                  onChange={(e) => setCenterFilter(e.target.value)}
                  className="bg-transparent text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="All">All Centers</option>
                  {centersList.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
                </select>
              </div>
            </>
          )}

          {/* Action Buttons */}
          <button
            type="button"
            onClick={onSendAllClick}
            disabled={filteredStudents.length === 0}
            className="bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-700 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
            title="Email login credentials to all filtered candidates"
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Send Credentials</span>
          </button>

          <button
            type="button"
            onClick={onBulkClick}
            className="bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 px-3 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5"
          >
            <Upload className="w-3.5 h-3.5 text-[#004f90]" />
            <span>Bulk Upload</span>
          </button>

          <button
            type="button"
            onClick={onAddClick}
            className="bg-[#004f90] hover:bg-[#003c6e] text-white px-3.5 py-2 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200/80 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Student Info</th>
                <th className="py-3 px-4">Identifier / DOB</th>
                <th className="py-3 px-4">{categoryTab === 'college' ? 'Department & Track' : 'Course & Center'}</th>
                <th className="py-3 px-4">{categoryTab === 'college' ? 'Batch & Year' : 'Registration Info'}</th>
                <th className="py-3 px-4 text-center">Credentials</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentStudents.length === 0 ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p>No students found matching the selected criteria.</p>
                  </td>
                </tr>
              ) : (
                currentStudents.map((student) => {
                  const isInstitute = student.studentType === 'institute';
                  const defaultPass = student.dob 
                    ? student.dob.replace(/-/g, '').trim()
                    : '123456';

                  return (
                    <tr key={student._id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Email */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#004f90]/10 text-[#004f90] font-bold flex items-center justify-center text-xs shrink-0 font-mono">
                            {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{student.name}</div>
                            <div className="text-[11px] text-slate-400 font-mono">{student.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Identifier */}
                      <td className="py-3.5 px-4 font-mono font-medium text-slate-700">
                        <div>
                          <span className="font-bold text-[#004f90]">
                            {isInstitute ? (student.enrollmentId || student.rollNumber || 'N/A') : (student.rollNumber || 'N/A')}
                          </span>
                          {student.dob && (
                            <div className="text-[11px] text-slate-400">DOB: {student.dob}</div>
                          )}
                        </div>
                      </td>

                      {/* Department / Track */}
                      <td className="py-3.5 px-4">
                        {isInstitute ? (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-orange-50 text-[#F7931A] border border-orange-200">
                              {student.courseTrack || student.department || 'SDLC'}
                            </span>
                            <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                              📍 {student.center || 'Karur'} Center
                            </div>
                          </div>
                        ) : (
                          <div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-50 text-[#004f90] border border-blue-200">
                              {student.department}
                            </span>
                            {student.courseTrack && student.courseTrack !== '-' && (
                              <div className="text-[11px] text-slate-500 font-medium mt-0.5">
                                Track: {getCollegeCourseTrack(student)}
                              </div>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Batch & Year */}
                      <td className="py-3.5 px-4 text-slate-600">
                        {isInstitute ? (
                          <div className="text-[11px]">
                            <div>Batch Time: {student.batchTime || 'Standard'}</div>
                            <div className="text-slate-400">Enrolled: {new Date(student.createdAt).toLocaleDateString()}</div>
                          </div>
                        ) : (
                          <div className="text-[11px]">
                            <div className="font-semibold text-slate-700">{student.year || 'N/A'}</div>
                            <div className="text-slate-400">Batch: {student.batch || 'General'}</div>
                          </div>
                        )}
                      </td>

                      {/* Credentials */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(defaultPass, student._id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-mono font-semibold transition cursor-pointer"
                          title="Click to copy password"
                        >
                          <KeyRound className="w-3 h-3 text-slate-400" />
                          <span>{copiedId === student._id ? 'Copied!' : 'Copy Pass'}</span>
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => onSendCredentialsClick(student)}
                            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                            title="Email credentials"
                          >
                            <Mail className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onEditClick(student)}
                            className="p-1.5 text-slate-400 hover:text-[#004f90] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit Student"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteClick(student._id, student.name)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                            title="Delete Student"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalItems > 0 && (
          <div className="p-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
            <div>
              Showing <span className="font-bold text-slate-700">{Math.min(totalItems, (currentPage - 1) * 8 + 1)}</span> to{' '}
              <span className="font-bold text-slate-700">{Math.min(totalItems, currentPage * 8)}</span> of{' '}
              <span className="font-bold text-slate-700">{totalItems}</span> students
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              {getPageNumbers().map((pg, idx) => (
                pg.toString().startsWith('dots') ? (
                  <span key={`dots-${idx}`} className="px-2">...</span>
                ) : (
                  <button
                    key={pg}
                    type="button"
                    onClick={() => setCurrentPage(pg)}
                    className={`w-7 h-7 rounded-lg font-semibold transition cursor-pointer ${
                      currentPage === pg
                        ? 'bg-[#004f90] text-white shadow-2xs'
                        : 'border border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {pg}
                  </button>
                )
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentTable;
