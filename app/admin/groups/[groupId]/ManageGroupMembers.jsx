"use client";

import React, { useState, useMemo } from "react";
import { Search, UserPlus, UserMinus, ArrowRightLeft, CheckCircle2, User } from "lucide-react";

export default function ManageGroupMembers({
  initialGroup,
  allStudents,
  onSaveChanges,
  isLoading,
  onClose,
}) {
  const [enrolledStudentIds, setEnrolledStudentIds] = useState(
    initialGroup.students.map((s) => s.id)
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { enrolledStudents, availableStudents } = useMemo(() => {
    const enrolledSet = new Set(enrolledStudentIds);
    
    const filtered = allStudents.filter(s => 
      `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const enrolled = filtered.filter(s => enrolledSet.has(s.id));
    const available = filtered.filter(s => !enrolledSet.has(s.id));

    return { enrolledStudents: enrolled, availableStudents: available };
  }, [allStudents, enrolledStudentIds, searchTerm]);

  const handleAddStudent = (studentId) => {
    setEnrolledStudentIds((prev) => [...prev, studentId]);
  };

  const handleRemoveStudent = (studentId) => {
    setEnrolledStudentIds((prev) => prev.filter((id) => id !== studentId));
  };

  const handleSave = () => {
    onSaveChanges(enrolledStudentIds);
  };

  const StudentCard = ({ student, type }) => (
    <div className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all mb-2">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${type === 'enrolled' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
          {student.profile?.image ? (
            <img src={student.profile.image} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <User size={18} />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 tracking-tight">{`${student.firstName} ${student.lastName}`}</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{student.email}</p>
        </div>
      </div>
      <button
        onClick={() => type === 'enrolled' ? handleRemoveStudent(student.id) : handleAddStudent(student.id)}
        className={`p-2 rounded-xl transition-all ${
          type === 'enrolled' 
          ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600' 
          : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'
        }`}
      >
        {type === 'enrolled' ? <UserMinus size={18} /> : <UserPlus size={18} />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Filter personnel by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Available Students */}
        <div className="flex flex-col h-[400px] lg:h-[450px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Available Pool</span>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{availableStudents.length}</span>
            </div>
          </div>
          
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
            {availableStudents.length > 0 ? (
              availableStudents.map((student) => (
                <StudentCard key={student.id} student={student} type="available" />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 border-2 border-dashed border-slate-100 rounded-3xl">
                <Search size={32} strokeWidth={1.5} />
                <p className="text-xs font-bold uppercase tracking-widest">No candidates found</p>
              </div>
            )}
          </div>
        </div>

        {/* Transfer Indicator (Desktop only) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="p-3 bg-white rounded-full shadow-xl border border-slate-100 text-slate-300">
            <ArrowRightLeft size={24} />
          </div>
        </div>

        {/* Enrolled Students */}
        <div className="flex flex-col h-[400px] lg:h-[450px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-500">Active Roster</span>
              <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{enrolledStudents.length}</span>
            </div>
            {enrolledStudents.length > 0 && (
              <button 
                onClick={() => setEnrolledStudentIds([])}
                className="text-[10px] font-bold text-rose-500 hover:underline"
              >
                Remove All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
            {enrolledStudents.length > 0 ? (
              enrolledStudents.map((student) => (
                <StudentCard key={student.id} student={student} type="enrolled" />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                <UserPlus size={32} strokeWidth={1.5} />
                <p className="text-xs font-bold uppercase tracking-widest text-center px-8">Transfer personnel to populate roster</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 size={16} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Drafting Complete</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-8 py-2.5 bg-slate-900 text-white rounded-2xl text-sm font-bold shadow-lg shadow-slate-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2"
          >
            {isLoading ? "Synchronizing..." : "Commit Roster"}
          </button>
        </div>
      </div>
    </div>
  );
}
