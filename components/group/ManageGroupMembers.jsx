"use client";

import React, { useState, useMemo } from "react";
import { Search, UserPlus, UserMinus, ArrowRightLeft, CheckCircle2, User, Settings2, Filter } from "lucide-react";
import { motion } from "framer-motion";

export default function ManageGroupMembers({
  initialGroup,
  allStudents,
  onSaveChanges,
  isLoading,
  onClose,
}) {
  const [enrolledStudentIds, setEnrolledStudentIds] = useState(
    initialGroup.students?.map((s) => s.id) || []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [showAll, setShowAll] = useState(false);
  
  // New UI Filters
  const [selectedDeptId, setSelectedDeptId] = useState("ALL");
  const [selectedGenerationId, setSelectedGenerationId] = useState("ALL");
  const [selectedYear, setSelectedYear] = useState("ALL");

  // Derive filter options from allStudents
  const { departments, generations, academicYears } = useMemo(() => {
    const deps = new Map();
    const gens = new Map();
    const years = new Set();
    
    allStudents?.forEach(s => {
      // 1. Always map all available Departments globally
      if (s.department) {
        deps.set(s.departmentId, s.department.name);
      }
      
      // 2. Cascade Filter: Only show Generations & Years that exist within the currently selected Department
      const isDeptMatch = selectedDeptId === "ALL" || s.departmentId === selectedDeptId;

      if (isDeptMatch) {
         if (s.profile?.batchId) {
           const generationName = s.profile.generation || (s.profile.batch ? s.profile.batch.name : `Gen ID: ${s.profile.batchId.substring(0,6)}...`);
           gens.set(s.profile.batchId, generationName); 
         }
         if (s.profile?.academicYear) {
           years.add(s.profile.academicYear);
         }
      }
    });
    
    return {
      departments: Array.from(deps.entries()).map(([id, name]) => ({ id, name })),
      generations: Array.from(gens.entries()).map(([id, name]) => ({ id, name })),
      academicYears: Array.from(years).sort((a,b) => a - b)
    };
  }, [allStudents, selectedDeptId]);

  const handleDeptChange = (e) => {
    setSelectedDeptId(e.target.value);
    setSelectedGenerationId("ALL");
    setSelectedYear("ALL");
  };


  const { enrolledStudents, availableStudents } = useMemo(() => {
    const enrolledSet = new Set(enrolledStudentIds);
    const batchDeptId = initialGroup.batch?.departmentId || null;
    
    // Parse the group's academic year (e.g., "Year 1" -> 1)
    const grpYearMatch = initialGroup.academicYear ? initialGroup.academicYear.match(/\d+/) : null;
    const groupAcademicYearInt = grpYearMatch ? parseInt(grpYearMatch[0], 10) : null;

    const filtered = (allStudents || []).filter(s => {
      const matchesSearch = `${s.firstName} ${s.lastName} ${s.email}`.toLowerCase().includes(searchTerm.toLowerCase());
      
      if (showAll) {
        // UI Filters apply when showing all (or exploring)
        const uiMatchesDept = selectedDeptId === "ALL" || s.departmentId === selectedDeptId;
        const uiMatchesGen = selectedGenerationId === "ALL" || s.profile?.batchId === selectedGenerationId;
        const uiMatchesYear = selectedYear === "ALL" || String(s.profile?.academicYear) === selectedYear;
        return matchesSearch && uiMatchesDept && uiMatchesGen && uiMatchesYear;
      }

      // Strict mode: Only show constraints matching the group's properties
      const sBatchId = s.profile?.batchId || null;
      const sYear = s.profile?.academicYear || null;

      const matchesBatch = !initialGroup.batchId || sBatchId === initialGroup.batchId;
      const matchesDept = !batchDeptId || s.departmentId === batchDeptId;
      const matchesYear = !groupAcademicYearInt || sYear === groupAcademicYearInt;

      return matchesSearch && matchesBatch && matchesDept && matchesYear;
    });

    const enrolled = (allStudents || []).filter(s => enrolledSet.has(s.id));
    const available = filtered.filter(s => !enrolledSet.has(s.id));

    return { enrolledStudents: enrolled, availableStudents: available };
  }, [allStudents, enrolledStudentIds, searchTerm, showAll, initialGroup.batchId, initialGroup.batch, initialGroup.academicYear, selectedDeptId, selectedGenerationId, selectedYear]);

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
    <div className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all mb-2 shrink-0">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${type === 'enrolled' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
          {student.profile?.avatar ? (
            <img src={student.profile.avatar} alt="" className="w-full h-full object-cover rounded-xl" />
          ) : (
            <User size={18} />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-slate-800 tracking-tight truncate">{`${student.firstName} ${student.lastName}`}</p>
          <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider truncate">
            {student.email} 
            {student.department && <span className="ml-1 text-slate-300"> • {student.department.name}</span>}
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
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search & Filters (Static) */}
      <div className="p-6 pb-4 bg-white border-b border-slate-100 shrink-0">
        <div className="space-y-4 max-w-4xl mx-auto">
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
                 onChange={handleDeptChange}
                 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
               >
                 <option value="ALL">All Departments</option>
                 {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
               </select>
               <select 
                 value={selectedGenerationId} 
                 onChange={(e) => setSelectedGenerationId(e.target.value)}
                 className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-slate-600"
               >
                 <option value="ALL">All Generations</option>
                 {generations.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
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
      </div>

      {/* Lists Area (Scrollable) */}
      <div className="flex-1 min-h-0 p-6 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 h-full relative">
          {/* Available Students */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 px-2 shrink-0">
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Available Pool</span>
                <button
                  onClick={() => {
                     setShowAll(!showAll)
                     if (showAll) {
                       setSelectedDeptId("ALL");
                       setSelectedGenerationId("ALL");
                       setSelectedYear("ALL");
                     }
                  }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl transition-all text-[11px] font-black uppercase tracking-wider ${showAll
                    ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                    : "bg-slate-100 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600"
                    }`}
                >
                  <Filter size={14} />
                  {showAll ? "Custom Filtering Active" : "Filter Options"}
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

          {/* Transfer Indicator */}
          <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
            <div className="p-2 bg-white rounded-full shadow-lg border border-slate-100 text-slate-300">
              <ArrowRightLeft size={20} />
            </div>
          </div>

          {/* Enrolled Students */}
          <div className="flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-4 px-2 shrink-0">
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
      </div>

      {/* Footer Actions (Sticky) */}
      <div className="p-6 border-t border-slate-200 bg-slate-50/50 backdrop-blur-md shrink-0">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
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
              {isLoading ? "Synchronizing..." : "Confirm & Commit Roster"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
