"use client";
import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CheckSquare, Square, Search, X, BookOpen, Users, Calendar, ArrowRight } from "lucide-react";
import { apiClient } from "@/lib/api";

// Helper for premium input layout
const FieldLayout = ({ label, icon, children }) => (
  <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
      {icon}
      {label}
    </label>
    <div className="relative group">
      {children}
    </div>
  </div>
);

export default function BulkCertificateModal({ isOpen, onClose, onCertificatesIssued, showMessage }) {
  const [step, setStep] = useState(1); // 1: Select Course/Group, 2: Select Students
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedGroups, setSelectedGroups] = useState(new Set());
  const [selectedStudentIds, setSelectedStudentIds] = useState(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Certificate Details
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [expiryDate, setExpiryDate] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCourses();
      resetState();
    }
  }, [isOpen]);

  const resetState = () => {
    setStep(1);
    setSelectedCourse("");
    setSelectedGroups(new Set());
    setStudents([]);
    setSelectedStudentIds(new Set());
    setIssueDate(new Date().toISOString().split('T')[0]);
    setExpiryDate("");
  };

  const fetchCourses = async () => {
    try {
      const data = await apiClient.get("/courses");
      setCourses(data || []);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  };

  const fetchGroupsForCourse = async (courseId) => {
    try {
      const data = await apiClient.get("/groups"); 
      const relevantGroups = (data || []).filter(g => g.courseIds?.includes(courseId) || g.courseId === courseId);
      setGroups(relevantGroups);
    } catch (error) {
      console.error("Failed to fetch groups", error);
    }
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    setSelectedCourse(courseId);
    setSelectedGroups(new Set());
    if (courseId) {
      fetchGroupsForCourse(courseId);
    } else {
      setGroups([]);
    }
  };

  const toggleGroup = (id) => {
    const newSelected = new Set(selectedGroups);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedGroups(newSelected);
  };

  const handleNext = async () => {
    if (!selectedCourse) return;
    
    setIsLoading(true);
    try {
      let uniqueStudents = [];
      
      if (selectedGroups.size > 0) {
        // Fetch students for all selected groups concurrently
        const fetchPromises = Array.from(selectedGroups).map(id => 
           apiClient.get(`/users?role=STUDENT&groupId=${id}`)
        );
        const results = await Promise.all(fetchPromises);
        const allStudents = results.flat().filter(Boolean);
        uniqueStudents = Array.from(new Map(allStudents.map(s => [s.id, s])).values());
      } else {
        // If no groups selected, fetch all students for the course (assuming backend requires this via loop if not supported natively. 
        // For now, if groups exist, fetch from ALL active groups to be safe).
        if (groups.length > 0) {
           const fetchPromises = groups.map(g => apiClient.get(`/users?role=STUDENT&groupId=${g.id}`));
           const results = await Promise.all(fetchPromises);
           const allStudents = results.flat().filter(Boolean);
           uniqueStudents = Array.from(new Map(allStudents.map(s => [s.id, s])).values());
        } else {
           // Fallback to fetch everyone (or course endpoint if existed)
           const data = await apiClient.get(`/users?role=STUDENT`);
           uniqueStudents = data || [];
        }
      }
      
      setStudents(uniqueStudents);
      setSelectedStudentIds(new Set(uniqueStudents.map(s => s.id)));
      setStep(2);
    } catch (error) {
      showMessage("Failed to fetch students. System connection error.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStudent = (id) => {
    const newSelected = new Set(selectedStudentIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudentIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedStudentIds.size === students.length) {
      setSelectedStudentIds(new Set());
    } else {
      setSelectedStudentIds(new Set(students.map(s => s.id)));
    }
  };

  const handleSubmit = async () => {
    if (selectedStudentIds.size === 0) return;

    setIsSubmitting(true);
    try {
      const payload = {
        courseId: selectedCourse,
        issueDate,
        expiryDate: expiryDate || null,
        studentIds: Array.from(selectedStudentIds)
      };

      const result = await apiClient.post("/certificates/bulk", payload);
      showMessage(`Successfully executed bulk issue for ${result.count || selectedStudentIds.size} identities.`, "success");
      onCertificatesIssued();
      onClose();
    } catch (error) {
      showMessage(error.response?.data?.error || error.message || "Bulk operation failed.", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* ── Backdrop ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      {/* ── Modal Container ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col border border-slate-200/50 overflow-hidden"
      >
        {/* Header Ribbon */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        {/* Header */}
        <div className="px-8 pt-8 pb-5 flex justify-between items-center bg-white border-b border-slate-100 shrink-0">
          <div>
            <h2 className="text-xl font-black text-slate-800 tracking-tight">
              {step === 1 ? "Bulk Issue Scope Configuration" : "Identity Selection Matrix"}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
               <span className={`h-1.5 w-12 rounded-full ${step >= 1 ? "bg-blue-600" : "bg-slate-200"} transition-colors`} />
               <span className={`h-1.5 w-12 rounded-full ${step >= 2 ? "bg-indigo-600" : "bg-slate-200"} transition-colors`} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0">
            <X className="w-5 h-5 stroke-[3]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-slate-50/50 p-8">
          <AnimatePresence mode="wait">
             {step === 1 && (
               <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                 
                 <FieldLayout label="Target Academic Program *" icon={<BookOpen size={12} strokeWidth={3} />}>
                   <select
                     value={selectedCourse}
                     onChange={handleCourseChange}
                     className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer hover:border-slate-300"
                   >
                     <option value="" disabled className="text-slate-400 font-medium">Select a valid program context...</option>
                     {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                   </select>
                   <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                   </div>
                 </FieldLayout>

                 <FieldLayout label="Sub-Cohort Filter (Optional)" icon={<Users size={12} strokeWidth={3} />}>
                   {selectedCourse ? (
                     groups.length > 0 ? (
                       <div className="flex flex-wrap gap-2 mt-2">
                         {groups.map(g => {
                           const isSelected = selectedGroups.has(g.id);
                           return (
                             <button
                               key={g.id}
                               onClick={() => toggleGroup(g.id)}
                               className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-sm border ${
                                 isSelected 
                                 ? "bg-blue-600 text-white border-blue-700 shadow-blue-500/30" 
                                 : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50 relative top-0 hover:-top-0.5"
                               }`}
                             >
                               {g.name}
                             </button>
                           );
                         })}
                         {selectedGroups.size === 0 && (
                           <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-2 px-2">
                             (All active cohorts will be included by default)
                           </span>
                         )}
                       </div>
                     ) : (
                       <div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-400">
                         No active sub-cohorts found for this program.
                       </div>
                     )
                   ) : (
                     <div className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-400">
                       Select a program above to view cohorts.
                     </div>
                   )}
                 </FieldLayout>

                 <div className="grid grid-cols-2 gap-6 pt-2">
                   <FieldLayout label="Issuance Timestamp *" icon={<Calendar size={12} strokeWidth={3} />}>
                      <input 
                         type="date" 
                         value={issueDate}
                         onChange={(e) => setIssueDate(e.target.value)}
                         className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm hover:border-slate-300"
                       />
                   </FieldLayout>
                   <FieldLayout label="Expiry Threshold" icon={<Calendar size={12} strokeWidth={3} />}>
                      <input 
                         type="date" 
                         value={expiryDate}
                         onChange={(e) => setExpiryDate(e.target.value)}
                         className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all shadow-sm hover:border-slate-300"
                       />
                   </FieldLayout>
                 </div>
               </motion.div>
             )}

             {step === 2 && (
               <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-4 h-full flex flex-col">
                 
                 <div className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-blue-100 shadow-sm shadow-blue-500/5 shrink-0">
                    <button onClick={toggleAll} className="flex items-center gap-2 group">
                      <div className="w-5 h-5 rounded flex items-center justify-center transition-colors shadow-sm bg-blue-50 border border-blue-200 group-hover:bg-blue-100 text-blue-600">
                         {selectedStudentIds.size === students.length && students.length > 0 && <CheckSquare className="w-3.5 h-3.5" strokeWidth={3}/>}
                      </div>
                      <span className="text-[10px] font-black tracking-widest uppercase text-blue-700">Select All Identities</span>
                    </button>
                    <span className="text-[10px] font-black uppercase text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                      {selectedStudentIds.size} / {students.length} Target(s)
                    </span>
                 </div>

                 {isLoading ? (
                   <div className="py-20 flex flex-col justify-center items-center gap-4">
                     <LoadingSpinner size="lg"/>
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Scanning Master Records...</span>
                   </div>
                 ) : (
                   <div className="flex-1 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-sm custom-scrollbar divide-y divide-slate-50">
                     {students.map((student, i) => {
                        const isSelected = selectedStudentIds.has(student.id);
                        return (
                          <motion.div 
                            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.02, 0.3) }}
                            key={student.id} 
                            onClick={() => toggleStudent(student.id)}
                            className={`p-4 flex items-center gap-4 cursor-pointer transition-all ${isSelected ? 'bg-blue-50/50' : 'hover:bg-slate-50'}`}
                          >
                            <div className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors shadow-sm border ${isSelected ? "bg-blue-600 border-blue-700 text-white" : "bg-white border-slate-200 text-transparent"}`}>
                               <CheckSquare className="w-3.5 h-3.5" strokeWidth={3} />
                            </div>
                            <div>
                              <p className="text-[13px] font-black text-slate-800 tracking-tight">{student.firstName} {student.lastName}</p>
                              <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mt-0.5">{student.email}</p>
                            </div>
                          </motion.div>
                        );
                     })}
                     {students.length === 0 && (
                       <div className="p-10 flex flex-col items-center justify-center text-slate-400 gap-3">
                          <Users className="w-10 h-10 opacity-30" />
                          <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">0 records matched context</span>
                       </div>
                     )}
                   </div>
                 )}
               </motion.div>
             )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-white flex justify-between items-center shrink-0">
            {step === 2 ? (
               <button onClick={() => setStep(1)} className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-slate-800 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all hover:-translate-x-0.5 shadow-sm">
                 ← Rollback Step
               </button>
            ) : <div/>}

            <div className="flex gap-3">
              <button 
                onClick={onClose} 
                className="px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:text-rose-700 bg-white border border-rose-100 rounded-xl hover:bg-rose-50 transition-all shadow-sm active:scale-95"
              >
                Abort
              </button>

              {step === 1 ? (
                <button 
                  onClick={handleNext}
                  disabled={!selectedCourse}
                  className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-[10px] font-black shadow-lg shadow-indigo-500/30 text-white uppercase tracking-widest rounded-xl hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:-translate-y-0"
                >
                  Confirm Scope <ArrowRight size={14} strokeWidth={3} />
                </button>
              ) : (
                <button 
                  onClick={handleSubmit}
                  disabled={selectedStudentIds.size === 0 || isSubmitting}
                  className="flex items-center gap-2 px-8 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-[10px] font-black shadow-lg shadow-emerald-500/30 text-white uppercase tracking-widest rounded-xl hover:shadow-emerald-500/50 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Executing...</>
                  ) : `Deploy Credentials`}
                </button>
              )}
            </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}
