"use client";

import React, { useState, useMemo } from "react";
import { Search, UserPlus, UserMinus, ArrowRightLeft, CheckCircle2, User } from "lucide-react";
import { motion } from "framer-motion";

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
  const [showAll, setShowAll] = useState(false);
  
  // New UI Filters
  const [selectedDeptId, setSelectedDeptId] = useState("ALL");
  const [selectedBatchId, setSelectedBatchId] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");

  // Derive filter options from allStudents
  const { departments, batches, academicYears } = useMemo(() => {
    const deps = new Map();
    const bats = new Map();
    const years = new Set();
    
    allStudents.forEach(s => {
      if (s.department) {
        deps.set(s.departmentId, s.department.name);
      }
      if (s.profile?.batchId) {
        // Find batch name by searching within another list or we extract from existing data.
        // Assuming batch name might not be populated in s.profile, we use the ID as a fallback, or if it is populated, we use it. 
        // We'll use ID here since we only have student data directly. To keep it simple we just use ID as name if name isn't available elsewhere.
        bats.set(s.profile.batchId, s.profile.batchId); 
      }
      if (s.profile?.academicYear) {
        years.add(s.profile.academicYear);
      }
    });
    
    return {
      departments: Array.from(deps.entries()).map(([id, name]) => ({ id, name })),
      batches: Array.from(bats.keys()),
      academicYears: Array.from(years).sort((a,b) => a - b)
    };
  }, [allStudents]);


  const { enrolledStudents, availableStudents } = useMemo(() => {
    const enrolledSet = new Set(enrolledStudentIds);
    const batchDeptId = initialGroup.batch?.departmentId || null;
    
    // Parse the group's academic year (e.g., "Year 1" -> 1)
    const grpYearMatch = initialGroup.academicYear ? initialGroup.academicYear.match(/\d+/) : null;
    const groupAcademicYearInt = grpYearMatch ? parseInt(grpYearMatch[0], 10) : null;

    const filtered = allStudents.filter(s => {
      const matchesSearch = `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (showAll) {
        // UI Filters apply when showing all (or exploring)
        const uiMatchesDept = selectedDeptId === "ALL" || s.departmentId === selectedDeptId;
        const uiMatchesBatch = selectedBatchId === "ALL" || s.profile?.batchId === selectedBatchId;
        const uiMatchesYear = selectedYear === "ALL" || String(s.profile?.academicYear) === selectedYear;
        return matchesSearch && uiMatchesDept && uiMatchesBatch && uiMatchesYear;
      }

      // Strict mode: Only show constraints matching the group's properties
      const sBatchId = s.profile?.batchId || null;
      const sYear = s.profile?.academicYear || null;

      const matchesBatch = !initialGroup.batchId || sBatchId === initialGroup.batchId;
      const matchesDept = !batchDeptId || s.departmentId === batchDeptId;
      const matchesYear = !groupAcademicYearInt || sYear === groupAcademicYearInt;

      return matchesSearch && matchesBatch && matchesDept && matchesYear;
    });

    const enrolled = allStudents.filter(s => enrolledSet.has(s.id));
    const available = filtered.filter(s => !enrolledSet.has(s.id));

    return { enrolledStudents: enrolled, availableStudents: available };
  }, [allStudents, enrolledStudentIds, searchTerm, showAll, initialGroup.batchId, initialGroup.batch, initialGroup.academicYear, selectedDeptId, selectedBatchId, selectedYear]);

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
          {student.profile?.avatar ? (
            <img src={student.profile.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <User size={18} />
          )}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 tracking-tight">{`${student.firstName} ${student.lastName}`}</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
            {student.email} 
            {student.department && <span className="ml-1 text-slate-300"> • {student.department.name}</span>}
            {student.profile?.academicYear && <span className="ml-1 text-slate-300"> • Year {student.profile.academicYear}</span>}
          </p>
        </div>
      </div>
      <button
        onClick={() => type === 'enrolled' ? handleRemoveStudent(student.id) : handleAddStudent(student.id)}
        className={`p-2 rounded-xl transition-all ${type === 'enrolled'
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
      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-4 max-w-2xl mx-auto">
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search roster by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {showAll && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="grid grid-cols-1 md:grid-cols-3 gap-3">
             <select 
               value={selectedDeptId} 
               onChange={(e) => setSelectedDeptId(e.target.value)}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
             >
               <option value="ALL">All Departments</option>
               {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
             </select>
             <select 
               value={selectedBatchId} 
               onChange={(e) => setSelectedBatchId(e.target.value)}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
             >
               <option value="ALL">All Generations</option>
               {batches.map(b => <option key={b} value={b}>Batch ID: {b.substring(0,6)}...</option>)}
             </select>
             <select 
               value={selectedYear} 
               onChange={(e) => setSelectedYear(e.target.value)}
               className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
             >
               <option value="ALL">All Years</option>
               {academicYears.map(y => <option key={y} value={String(y)}>Year {y}</option>)}
             </select>
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Available Students */}
        <div className="flex flex-col h-[400px] lg:h-[450px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Available Pool</span>
              <button
                onClick={() => {
                   setShowAll(!showAll)
                   if (showAll) {
                     setSelectedDeptId("ALL");
                     setSelectedBatchId("ALL");
                     setSelectedYear("ALL");
                   }
                }}
                className={`text-[9px] font-bold px-3 py-1 rounded-full transition-all border shadow-sm ${showAll
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-slate-500 border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                  }`}
              >
                {showAll ? "Custom Filtering Active" : "Strict Filter: Dept, Gen, & Year"}
              </button>
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
