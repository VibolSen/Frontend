"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  GraduationCap, 
  ChevronRight,
  ShieldCheck,
  Award,
  BookOpen,
  CheckCircle2,
  XCircle,
  Clock
} from "lucide-react";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import BackButton from "@/components/ui/BackButton";
import { motion, AnimatePresence } from "framer-motion";

export default function GraduationManagementView() {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [toast, setToast] = useState(null);

  // Assessment Modal State
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [assessmentData, setAssessmentData] = useState(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [isIssuing, setIsIssuing] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchStudents = async () => {
    try {
      // Fetch all students.
      const data = await apiClient.get("/students");
      setStudents(data || []);
    } catch (error) {
      console.error("Failed to fetch students:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssessStudent = async (student) => {
    setSelectedStudent(student);
    setIsAssessing(true);
    setAssessmentData(null);

    try {
      const data = await apiClient.get(`/certifications/eligibility/${student.id}`);
      setAssessmentData(data);
    } catch (error) {
      showToast("Failed to run academic assessment.", "error");
    } finally {
      setIsAssessing(false);
    }
  };

  const handleIssueCertificate = async (title) => {
    setIsIssuing(true);
    try {
      await apiClient.post("/certifications/issue", {
        studentId: selectedStudent.id,
        title: title
      });
      showToast(`🏆 Successfully issued: ${title}!`);
      // Refresh the assessment data to show the new certificate
      handleAssessStudent(selectedStudent);
    } catch (error) {
      showToast(`Failed to issue certificate: ${error.message}`, "error");
    } finally {
      setIsIssuing(false);
    }
  };

  const closeAssessment = () => {
    setSelectedStudent(null);
    setAssessmentData(null);
  };

  const filteredStudents = students.filter(s =>
    `${s.firstName} ${s.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${
              toast.type === "error" ? "bg-rose-600 text-white" : "bg-indigo-600 text-white"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Page Header */}
      <div className="space-y-2">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black text-indigo-950 tracking-tight">
              Degree <span className="text-indigo-600">&</span> Graduation
            </h1>
            <p className="text-[11px] font-medium text-slate-500 mt-0.5">
              Analyze yearly progression and award Foundation and Bachelor's degrees.
            </p>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
          <LoadingSpinner size="lg" color="indigo" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
            Scanning Institutional Records...
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden flex flex-col md:flex-row min-h-[600px]">
          
          {/* LEFT PANEL: Student List */}
          <div className="w-full md:w-1/3 border-r border-slate-100 bg-slate-50 flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-200 bg-white">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search Candidates..."
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto w-full p-2 space-y-1">
              {filteredStudents.map(student => (
                <button
                  key={student.id}
                  onClick={() => handleAssessStudent(student)}
                  className={`w-full text-left p-4 rounded-2xl transition-all flex items-center justify-between group ${
                    selectedStudent?.id === student.id 
                    ? "bg-indigo-600 text-white shadow-xl shadow-indigo-200" 
                    : "hover:bg-white hover:shadow-sm text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${
                      selectedStudent?.id === student.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                    }`}>
                      {student.firstName?.[0]}{student.lastName?.[0]}
                    </div>
                    <div>
                      <p className={`font-black text-sm leading-tight ${selectedStudent?.id === student.id ? "text-white" : "text-slate-900"}`}>
                        {student.firstName} {student.lastName}
                      </p>
                      <p className={`text-[10px] font-bold mt-0.5 ${selectedStudent?.id === student.id ? "text-indigo-200" : "text-slate-400"}`}>
                        {student.department?.name || "Unassigned Dept"}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={16} className={selectedStudent?.id === student.id ? "text-white" : "text-slate-300 group-hover:text-indigo-400"} />
                </button>
              ))}
            </div>
          </div>

          {/* RIGHT PANEL: Assessment View */}
          <div className="w-full md:w-2/3 bg-white relative">
            {!selectedStudent ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                  <ShieldCheck size={48} className="text-slate-200" />
                </div>
                <h3 className="text-xl font-black text-slate-800">Select a Candidate</h3>
                <p className="text-slate-400 text-sm mt-2 max-w-sm">
                  Choose a student from the list to run a full academic progression scan and evaluate degree eligibility.
                </p>
              </div>
            ) : isAssessing ? (
               <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-white/80 backdrop-blur-sm z-10">
                  <LoadingSpinner size="lg" color="indigo" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mt-4 animate-pulse">
                    Computing Final Grades & Eligibility...
                  </p>
               </div>
            ) : assessmentData ? (
              <div className="h-full overflow-y-auto p-8 space-y-8 animate-in slide-in-from-right-8 duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-8 border-b border-slate-100">
                  <div className="flex items-center gap-5">
                    <div className="h-20 w-20 bg-indigo-50 text-indigo-600 rounded-[2rem] flex items-center justify-center font-black text-2xl border border-indigo-100 shadow-inner">
                       {assessmentData.student.firstName?.[0]}{assessmentData.student.lastName?.[0]}
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black tracking-tight text-indigo-950">
                        {assessmentData.student.firstName} {assessmentData.student.lastName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 mt-2">
                        <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {assessmentData.student.id}
                        </span>
                        <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                          {assessmentData.student.department}
                        </span>
                        <span className="px-2 py-1 bg-amber-50 text-amber-600 rounded-md text-[10px] font-black uppercase tracking-widest border border-amber-100">
                          Total Credits: {assessmentData.degreeProgress.totalCreditsEarned} / {assessmentData.degreeProgress.totalCreditsRequired}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Degree Credit Circular Progress (Simulated with div for now) */}
                  <div className="hidden lg:flex items-center gap-4 bg-slate-50 p-4 rounded-3xl border border-slate-100">
                    <div className="relative h-16 w-16 flex items-center justify-center">
                       <svg className="h-full w-full" viewBox="0 0 36 36">
                         <path className="text-slate-200" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" />
                         <path className="text-indigo-600" strokeDasharray={`${assessmentData.degreeProgress.completionPercentage}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" strokeWidth="3" strokeLinecap="round" />
                       </svg>
                       <span className="absolute text-xs font-black text-slate-900">{assessmentData.degreeProgress.completionPercentage}%</span>
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Degree Completion</p>
                       <p className="text-sm font-black text-slate-900">Overall Credit Score</p>
                    </div>
                  </div>
                </div>

                {/* Eligibility Blocks */}
                <div className="bg-gradient-to-r from-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-2xl relative overflow-hidden">
                   <div className="relative z-10">
                     <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                       <Award size={14} /> Official Endorsements
                     </h3>

                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {/* Foundation Year Block */}
                       <div className="bg-white/5 rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                         <div>
                           <div className="flex items-center justify-between mb-2">
                             <h4 className="font-black text-lg">Foundation Year</h4>
                             {assessmentData.eligibility.foundationYear ? (
                               <CheckCircle2 className="text-emerald-400" size={20} />
                             ) : (
                               <XCircle className="text-rose-400" size={20} />
                             )}
                           </div>
                           <p className="text-[10px] font-medium text-slate-400">Requires completion of all Year 1 courses.</p>
                         </div>
                         <div className="mt-6">
                           {assessmentData.issuedCertificates?.some(c => c.title?.includes("Foundation")) ? (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                               ✅ Awarded
                             </span>
                           ) : assessmentData.eligibility.foundationYear ? (
                             <button 
                               onClick={() => handleIssueCertificate("Foundation Year Certificate")}
                               disabled={isIssuing}
                               className="w-full py-2.5 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 disabled:opacity-50"
                             >
                               Award Certificate 🏆
                             </button>
                           ) : (
                             <span className="inline-block px-3 py-1.5 bg-white/5 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                               Not Eligible
                             </span>
                           )}
                         </div>
                       </div>

                       {/* Bachelor's Block */}
                       <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-2xl p-5 border border-indigo-500/30 flex flex-col justify-between relative overflow-hidden">
                         <div className="absolute top-0 right-0 p-4 opacity-10">
                           <GraduationCap size={80} />
                         </div>
                         <div className="relative z-10">
                           <div className="flex items-center justify-between mb-2">
                             <h4 className="font-black text-lg text-indigo-100">Bachelor's Degree</h4>
                             {assessmentData.eligibility.bachelorsDegree ? (
                               <CheckCircle2 className="text-emerald-400" size={20} />
                             ) : (
                               <XCircle className="text-rose-400" size={20} />
                             )}
                           </div>
                           <p className="text-[10px] font-medium text-indigo-300/70 max-w-[80%]">Requires completion of all courses across Years 1 through 4.</p>
                         </div>
                         <div className="mt-6 relative z-10">
                           {assessmentData.issuedCertificates?.some(c => c.title?.includes("Bachelor")) ? (
                             <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/20 text-emerald-300 rounded-xl text-[10px] font-black uppercase tracking-widest border border-emerald-400/30">
                               ✅ Graduated
                             </span>
                           ) : assessmentData.eligibility.bachelorsDegree ? (
                             <button 
                               onClick={() => handleIssueCertificate(`Bachelor's Degree`)}
                               disabled={isIssuing}
                               className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-400 hover:to-purple-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-purple-500/20 active:scale-95 disabled:opacity-50"
                             >
                               Confer Degree 🎓
                             </button>
                           ) : (
                             <span className="inline-block px-3 py-1.5 bg-black/20 text-indigo-300/50 rounded-xl text-[10px] font-black uppercase tracking-widest">
                               Requirements Not Met
                             </span>
                           )}
                         </div>
                       </div>
                     </div>
                   </div>
                </div>

                {/* Macro Progression Timeline */}
                <div>
                   <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
                     <Clock size={14} /> Academic Progression Maps
                   </h3>
                   
                    {assessmentData.yearlyProgress.length === 0 ? (
                      <p className="text-sm text-slate-400 font-medium italic">No progression data found for this student. Ensure they are assigned to Groups with accurate Academic Years (e.g. YEAR_1).</p>
                    ) : (
                      <div className="space-y-4">
                        {assessmentData.yearlyProgress.sort((a,b) => a.yearLabel.localeCompare(b.yearLabel)).map((yearData, idx) => (
                          <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 overflow-hidden">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`h-8 w-8 rounded-lg flex items-center justify-center font-black ${
                                  yearData.isCompleted ? "bg-emerald-100 text-emerald-600" : "bg-blue-100 text-blue-600"
                                }`}>
                                  {yearData.isCompleted ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                                </div>
                                <div>
                                  <h4 className="font-black text-slate-800 text-md uppercase tracking-wide">
                                    {yearData.yearLabel.replace("_", " ")}
                                  </h4>
                                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                    {yearData.coursesCompleted} / {yearData.coursesTotal} Courses • {yearData.creditsEarned} / {yearData.creditsTotal} Credits
                                  </p>
                                </div>
                              </div>
                              
                              {/* Progress Bar */}
                              <div className="w-32 bg-slate-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${yearData.isCompleted ? "bg-emerald-500" : "bg-blue-500"}`} 
                                  style={{ width: `${(yearData.creditsEarned / (yearData.creditsTotal || 1)) * 100}%` }}
                                ></div>
                              </div>
                            </div>
                            
                            {/* Small Course List */}
                            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                              {yearData.courses.map(course => (
                                <div key={course.id} className="bg-white border text-xs font-bold border-slate-200 p-2.5 rounded-xl flex items-center justify-between shadow-sm">
                                  <div className="flex flex-col">
                                     <span className="truncate max-w-[120px] text-slate-700">{course.name}</span>
                                     <span className="text-[9px] text-slate-400 font-medium">{course.credits} Credits</span>
                                  </div>
                                  {course.isCompleted ? (
                                    <span className="text-emerald-600 flex items-center gap-1 text-[10px]">
                                      {course.finalGrade ?? "Passed"} <CheckCircle2 size={10} />
                                    </span>
                                  ) : (
                                    <span className="text-amber-500 flex items-center gap-1 text-[10px]">
                                      Pending <Clock size={10} />
                                    </span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                </div>

              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
