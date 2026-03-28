"use client";
import React, { useState, useEffect } from "react";
import { 
  Award, 
  Download, 
  Eye, 
  Search, 
  Calendar, 
  ChevronRight,
  GraduationCap,
  ShieldCheck,
  Trophy,
  History,
  FileText,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion } from "framer-motion";
import moment from "moment";

export default function StudentCertificateView({ loggedInUser }) {
  const [certificates, setCertificates] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (loggedInUser?.id) {
      fetchData();
    }
  }, [loggedInUser]);

  const fetchData = async () => {
    try {
      const [certsData, enrollsData] = await Promise.all([
        apiClient.get(`/certificates?userId=${loggedInUser.id}`),
        apiClient.get(`/enrollments?studentId=${loggedInUser.id}`)
      ]);
      setCertificates(certsData || []);
      setEnrollments(enrollsData || []);
    } catch (error) {
      console.error("Failed to fetch student academic data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCerts = certificates.filter(cert => {
    const search = searchTerm.toLowerCase();
    const courseName = cert.course?.name?.toLowerCase() || "";
    const title = cert.title?.toLowerCase() || "";
    return courseName.includes(search) || title.includes(search);
  });

  const completedCourses = enrollments.filter(en => en.isCompleted);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner size="lg" color="blue" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 font-mono">Verifying Academic Achievements...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto pb-20">
      {/* Hero Achievement Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-blue-600 to-indigo-700 rounded-[2.5rem] p-8 md:p-12 text-white shadow-2xl shadow-blue-200">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10">
                <Trophy size={14} className="text-amber-400" />
                <span className="text-[9px] font-black uppercase tracking-widest">Academic Excellence</span>
             </div>
             <h1 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                My Official <br />
                <span className="text-blue-400">Certifications</span>
             </h1>
             <p className="text-slate-400 font-medium max-w-md text-sm md:text-base leading-relaxed">
                Review your standardized academic results and download verified credentials for your professional portfolio.
             </p>
          </div>

          <div className="flex gap-4">
             <div className="px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 text-center">
                <p className="text-3xl font-black leading-none text-blue-400">{certificates.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">Awards</p>
             </div>
             <div className="px-6 py-4 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/5 text-center">
                <p className="text-3xl font-black leading-none text-emerald-400">{completedCourses.length}</p>
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-500 mt-2">Passed</p>
             </div>
          </div>
        </div>
        
        <div className="absolute -right-20 -bottom-20 h-80 w-80 bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute -left-20 -top-20 h-64 w-64 bg-indigo-600/10 rounded-full blur-[80px]" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Certificate Feed */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
                 <ShieldCheck className="text-blue-500" /> Verified Credentials
              </h2>
              <div className="relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="Search course..." 
                   className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-bold focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all outline-none"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredCerts.length > 0 ? filteredCerts.map((cert) => (
                <motion.div 
                  key={cert.id}
                  whileHover={{ y: -4 }}
                  className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all group overflow-hidden relative"
                >
                  <div className="relative z-10 flex flex-col h-full gap-5">
                    <div className="flex justify-between items-start">
                      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-all shadow-inner ${
                        cert.title ? "bg-amber-50 text-amber-600 group-hover:bg-amber-600 group-hover:text-white" : "bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white"
                      }`}>
                        <Award size={24} />
                      </div>
                      <div className="text-right">
                         <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Issue Date</p>
                         <p className="text-[11px] font-bold text-slate-900 mt-1">{moment(cert.issueDate).format("MMM DD, YYYY")}</p>
                      </div>
                    </div>

                    <div>
                       <h3 className="text-lg font-black text-slate-800 leading-tight group-hover:text-blue-600 transition-colors uppercase tracking-tight">
                         {cert.title || cert.course?.name || "Official Certificate"}
                       </h3>
                       <div className="flex items-center gap-2 mt-2">
                          <span className="px-2 py-0.5 bg-slate-50 text-slate-400 rounded text-[9px] font-black uppercase tracking-tighter border border-slate-100 italic font-mono">
                             VERIFIED-ID: {cert.id.slice(-8).toUpperCase()}
                          </span>
                       </div>
                    </div>

                    <div className="mt-auto pt-4 flex gap-2">
                       <button
                         onClick={() => window.print()}
                         className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
                       >
                          <Download size={14} /> Download PDF
                       </button>
                       <Link
                         href={`/student/certificates/${cert.id}`}
                         className="p-2.5 bg-slate-50 text-slate-400 rounded-xl hover:bg-slate-100 hover:text-slate-600 transition-all flex items-center justify-center"
                       >
                          <Eye size={16} />
                       </Link>
                    </div>
                  </div>
                  <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                     <GraduationCap size={120} />
                  </div>
                </motion.div>
              )) : (
                <div className="col-span-2 py-12 text-center bg-white rounded-[2rem] border border-slate-100 border-dashed">
                   <Award className="mx-auto text-slate-200 mb-3" size={48} />
                   <p className="text-slate-400 font-bold tracking-tight">No certificates found matching your search.</p>
                </div>
              )}
           </div>
        </div>

        {/* Sidebar: Completion History & Stats */}
        <div className="space-y-8">
           <section className="bg-white p-7 rounded-[2rem] border border-slate-200 shadow-sm relative overflow-hidden group">
              <div className="relative z-10 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] leading-none">Academic Summary</h3>
                    <div className="h-8 w-8 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center border border-blue-100">
                       <History size={14} />
                    </div>
                  </div>

                  <div className="space-y-4">
                    {completedCourses.map(en => (
                      <div key={en.id} className="flex items-center justify-between p-3 bg-slate-50/50 rounded-2xl border border-transparent hover:border-slate-100 transition-all">
                        <div className="flex items-center gap-3">
                           <div className="h-8 w-8 bg-white border border-slate-100 rounded-lg flex items-center justify-center font-black text-blue-600 text-xs shadow-sm">
                              {en.course?.name?.[0] || "C"}
                           </div>
                           <div className="max-w-[120px]">
                              <p className="text-xs font-black text-slate-800 truncate leading-none mb-1">{en.course?.name || "Course"}</p>
                              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">PASSED</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <p className="text-xs font-black text-blue-600 leading-none">{en.finalGrade || 'S'}</p>
                           <p className="text-[8px] font-bold text-slate-400 uppercase mt-1">Score</p>
                        </div>
                      </div>
                    ))}
                    
                    {completedCourses.length === 0 && (
                      <p className="text-[11px] text-slate-400 italic text-center py-4 font-medium">No courses finalized for results yet.</p>
                    )}
                 </div>

                  <div className="pt-2">
                    <button className="w-full py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]">
                       <FileText size={12} /> Request Official Transcript
                    </button>
                 </div>
              </div>
            </section>

           {/* Legal Notice / Info */}
           <section className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100">
              <div className="flex items-center gap-3 mb-3">
                 <AlertCircle size={18} className="text-amber-600" />
                 <h4 className="text-xs font-black text-amber-700 uppercase tracking-widest">Digital Verification</h4>
              </div>
              <p className="text-xs text-amber-600/80 font-medium leading-relaxed">
                 All digital certificates issued through this portal are cryptographically signed and stored on the institutional blockchain. They can be verified by employers via the public portal link.
              </p>
           </section>
        </div>
      </div>
    </div>
  );
}
