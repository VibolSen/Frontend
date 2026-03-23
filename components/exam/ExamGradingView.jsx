"use client";

import React, { useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";
import toast from "react-hot-toast";
import BackButton from "@/components/ui/BackButton";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
    GRADED: "bg-green-100 text-green-800",
  };
  return (
    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}>
      {status}
    </span>
  );
};

const getSecureLink = (url, forceDownload = false) => {
    if (!url) return "#";
    try {
        let processedUrl = url;
        if (forceDownload && url.includes("/upload/")) {
            processedUrl = url.replace("/upload/", "/upload/fl_attachment/");
        }
        const separator = processedUrl.includes("?") ? "&" : "?";
        return `${processedUrl}${separator}t=${new Date().getTime()}`;
    } catch (e) {
        return url;
    }
};

export default function ExamGradingView({ initialSubmission, backLink }) {
  const [submission, setSubmission] = useState(initialSubmission);
  const [grade, setGrade] = useState(initialSubmission.grade ?? "");
  const [feedback, setFeedback] = useState(initialSubmission.feedback ?? "");
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    if (grade === "") {
        toast.error("Please enter a valid score.");
        return;
    }
    
    setIsSaving(true);
    try {
      const updated = await apiClient.put(`/exam-submissions/${submission.id}`, {
        grade: parseInt(grade, 10),
        feedback,
        status: "GRADED",
      });
      setSubmission(updated);
      toast.success("Evaluation processed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const { exam, student } = submission;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-6 text-slate-800">
      <div className="max-w-5xl mx-auto space-y-4">
        
        {/* Navigation Layer */}
        <div className="flex items-center justify-between">
            <BackButton href={backLink} label="Back to Exam Roster" color="slate" className="mb-0" />
            <div className="hidden md:flex items-center gap-3">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Protocol Identifier</span>
                <span className="text-[10px] font-mono font-bold text-slate-600 bg-slate-200/50 px-2 py-0.5 rounded uppercase tracking-tight">EXM-{submission.id.slice(-6)}</span>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-start">
          
          {/* Intelligence Layer: Instructions & Student Work (2/3) */}
          <div className="lg:col-span-2 space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-700">
            
            {/* Command Header */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-3 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-20 h-20 bg-blue-50 rounded-full blur-3xl -m-4" />
                <div className="relative z-10 space-y-0.5">
                    <p className="text-[8px] font-black text-blue-600 uppercase tracking-widest">Academic Context</p>
                    <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight">{exam?.title}</h1>
                    <p className="text-slate-500 text-[11px] font-medium max-w-xl leading-relaxed opacity-80">{exam?.description}</p>
                </div>
                
                {exam?.attachmentUrls?.length > 0 && (
                    <div className="pt-3 border-t border-slate-100 flex items-center gap-4">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest shrink-0">Board Materials:</p>
                        <div className="flex flex-wrap gap-1.5">
                            {exam.attachmentUrls.map((url, idx) => (
                                <a key={idx} href={getSecureLink(url)} target="_blank" className="px-2 py-0.5 bg-slate-50 hover:bg-white border border-slate-200 rounded-md text-[8px] font-black text-slate-600 uppercase tracking-widest transition-all hover:-translate-y-0.5 shadow-sm">
                                    Doc {idx + 1}
                                </a>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Student Evidence Detail */}
            <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-5 relative">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 via-indigo-600 to-blue-700 rounded-xl flex items-center justify-center text-white text-lg font-black shadow-md shadow-indigo-100/50">
                            {student?.firstName?.charAt(0)}{student?.lastName?.charAt(0)}
                        </div>
                        <div className="space-y-0">
                            <h2 className="text-base font-black text-slate-900 tracking-tight leading-none">{student?.firstName} {student?.lastName}</h2>
                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-0.5">Assigned Student</p>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                        <StatusBadge status={submission.status} />
                        <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                            {submission.submittedAt ? `Lodged: ${new Date(submission.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Not Lodged'}
                        </span>
                    </div>
                </div>

                <div className="space-y-5">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 px-1">
                            <div className="w-1 h-2 bg-blue-500 rounded-full" />
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Examination Content</label>
                        </div>
                        <div className="bg-slate-50/50 rounded-xl p-5 text-slate-700 text-xs leading-relaxed min-h-[140px] border border-slate-100 shadow-inner whitespace-pre-wrap font-medium">
                            {submission.content || "No textual response detected."}
                        </div>
                    </div>

                    <div className="space-y-2">
                         <div className="flex items-center gap-2 px-1">
                            <div className="w-1 h-2 bg-indigo-500 rounded-full" />
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Supporting Evidence</label>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                            {submission.fileUrls && submission.fileUrls.length > 0 ? (
                                submission.fileUrls.map((url, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-200 hover:shadow-sm transition-all group duration-300 shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center">
                                                <svg className="w-3.5 h-3.5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-[9px] font-black text-slate-700 truncate w-32 uppercase tracking-tight">{url.split('/').pop().slice(-24)}</span>
                                                <span className="text-[7px] font-bold text-slate-400 uppercase tracking-[0.2em] leading-none">PDF Asset</span>
                                            </div>
                                        </div>
                                        <a href={getSecureLink(url)} target="_blank" className="bg-slate-900 text-white px-2.5 py-1 rounded-md text-[7px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-sm">Open</a>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-2 py-8 border border-dashed border-slate-100 rounded-xl flex flex-col items-center justify-center bg-slate-50/30">
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">No Evidence Uploads Found</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Evaluation Panel: Action Center (1/3) */}
          <div className="sticky top-10 space-y-3 lg:animate-in lg:fade-in lg:slide-in-from-right-4 duration-1000">
            <div className="bg-white rounded-xl p-5 border border-indigo-100 shadow-lg shadow-indigo-100/10 space-y-5 relative overflow-hidden">
                <div className="relative z-10 space-y-0.5 text-center">
                    <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.3em]">Evaluation Center</p>
                    <h2 className="text-lg font-black text-slate-900 tracking-tight leading-none">Assessment</h2>
                </div>

                <form onSubmit={handleSaveGrade} className="relative z-10 space-y-5">
                    <div className="space-y-2.5">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Score Metric (0-100)</label>
                        <div className="relative group">
                            <input 
                                type="number" 
                                value={grade}
                                onChange={(e) => setGrade(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-4 text-2xl font-black text-center text-slate-900 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all duration-300 placeholder-slate-200"
                                placeholder="00"
                                min="0"
                                max="100"
                            />
                            <div className="absolute top-1/2 right-5 -translate-y-1/2 text-sm text-slate-200 font-black pointer-events-none group-focus-within:text-indigo-200 transition-colors">/ 100</div>
                        </div>
                    </div>

                    <div className="space-y-2.5">
                        <label className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Academic Remarks</label>
                        <textarea 
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3.5 text-[10px] font-medium text-slate-700 leading-relaxed min-h-[120px] focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:bg-white focus:border-indigo-300 transition-all duration-300 resize-none placeholder-slate-300"
                            placeholder="Draft evaluation..."
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isSaving}
                        className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-700 rounded-lg text-white font-black uppercase tracking-[0.2em] text-[9px] shadow-md shadow-indigo-100/50 hover:shadow-indigo-200 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 disabled:opacity-50 flex items-center justify-center gap-3 group"
                    >
                        {isSaving ? (
                            <LoadingSpinner size="sm" color="white" />
                        ) : (
                            <>
                                <span>Save Evaluation</span>
                                <svg className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </>
                        )}
                    </button>
                    
                    {submission.status === "GRADED" && (
                        <div className="flex items-center justify-center gap-2 text-emerald-500 animate-in fade-in zoom-in-95 duration-700">
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                            <span className="text-[8px] font-black uppercase tracking-[0.2em]">Validated Entry Recorded</span>
                        </div>
                    )}
                </form>
            </div>
            
            <div className="bg-indigo-50/50 rounded-xl p-3 border border-indigo-100/30 flex gap-3">
                <div className="w-0.5 h-auto bg-indigo-500/40 rounded-full shrink-0" />
                <div className="space-y-0.5">
                    <p className="text-[7px] font-black text-indigo-600 uppercase tracking-[0.2em] opacity-80">Security Policy</p>
                    <p className="text-[9px] text-indigo-900/60 font-semibold leading-tight">
                        Records are final upon commit.
                    </p>
                </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
