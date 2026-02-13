"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  FileText, 
  Download, 
  Eye, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  UploadCloud,
  Trophy,
  MessageSquare,
  Paperclip,
  Trash2,
  ChevronRight
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

const StatusBadge = ({ status }) => {
  const configs = {
    PENDING: { color: "bg-amber-100/50 text-amber-700 border-amber-200", icon: Clock, label: "Pending" },
    SUBMITTED: { color: "bg-blue-100/50 text-blue-700 border-blue-200", icon: CheckCircle2, label: "Submitted" },
    GRADED: { color: "bg-emerald-100/50 text-emerald-700 border-emerald-200", icon: Trophy, label: "Graded" },
  };
  
  const config = configs[status] || configs.PENDING;
  const Icon = config.icon;

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black border ${config.color} shadow-sm transition-all hover:scale-105 uppercase tracking-wider`}>
      <Icon size={10} className="shrink-0" />
      {config.label}
    </div>
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

export default function SubmissionView({ initialSubmission }) {
  const [submission, setSubmission] = useState(initialSubmission);
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 10 * 1024 * 1024;
    const validFiles = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        setError(`File ${file.name} is too large. Max size is 10MB.`);
        return;
      }
      validFiles.push(file);
    }
    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setError("");
    e.target.value = "";
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() && selectedFiles.length === 0) {
      setError("Please provide some text or upload at least one file.");
      return;
    }
    setIsLoading(true);
    setError("");
    
    try {
      const formData = new FormData();
      formData.append("content", content);
      
      if (submission.status === "PENDING") {
        formData.append("assignmentId", submission.assignment.id);
        formData.append("studentId", submission.studentId || "");
        selectedFiles.forEach(file => formData.append("files", file));
        const response = await apiClient.post("/submissions", formData);
        setSubmission(response);
      } else {
        selectedFiles.forEach(file => formData.append("files", file));
        const response = await apiClient.put(`/submissions/${submission.id}`, formData);
        setSubmission(response);
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const { assignment } = submission;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }} 
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-4xl mx-auto space-y-4 pb-12"
    >
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white rounded-3xl p-6 shadow-xl shadow-slate-200/50 group border border-slate-100">
        <div className="absolute top-0 right-0 -m-8 w-48 h-48 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-2xl pointer-events-none group-hover:scale-110 transition-transform duration-700" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
          <div className="space-y-3">
            <Link
              href="/student/assignments"
              className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors group"
            >
              <ArrowLeft size={12} className="group-hover:-translate-x-1 transition-transform" />
              Assignment Catalog
            </Link>
            
            <div>
                <h1 className="text-2xl font-black tracking-tight text-slate-900 mb-1.5 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
                    {assignment?.title || "Academic Task"}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 font-bold uppercase tracking-wide">
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                      <User size={12} className="text-blue-500" />
                      Instructor: {assignment?.teacher?.firstName}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                      <Calendar size={12} className="text-indigo-500" />
                      Due: {assignment?.dueDate ? new Date(assignment.dueDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric' }) : "No Date"}
                    </span>
                    <StatusBadge status={submission.status} />
                </div>
            </div>
          </div>
          
          <div className="flex flex-col md:items-end gap-1 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Max Score</span>
              <span className="text-xl font-black text-slate-900 tracking-tighter">{assignment?.maxPoints || 100}<span className="text-slate-300 text-sm ml-0.5">pts</span></span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 items-start">
        {/* Instructions */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-lg shadow-slate-100/50"
        >
            <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm border border-blue-50">
                        <FileText size={16} />
                    </div>
                    <h2 className="text-xs font-black text-slate-800 tracking-tight uppercase">Task Briefing</h2>
                </div>
                {assignment?.attachmentUrls?.length > 0 && (
                    <span className="bg-slate-900 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                        {assignment.attachmentUrls.length} Files
                    </span>
                )}
            </div>
            
            <div className="p-6 space-y-6">
                <div className="prose prose-sm prose-slate max-w-none">
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap font-medium indent-4">
                        {assignment?.description || "Awaiting further instructions from the evaluator."}
                    </p>
                </div>
                
                {assignment?.attachmentUrls?.length > 0 && (
                    <div className="space-y-3 pt-4 border-t border-slate-50">
                        <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 leading-none">
                            <Paperclip size={10} />
                            Resources
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {assignment.attachmentUrls.map((url, idx) => (
                                <div 
                                    key={idx}
                                    className="group p-3 bg-white border border-slate-100 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all duration-300 flex items-center justify-between shadow-sm"
                                >
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                            <FileText size={16} />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[11px] font-black text-slate-800 truncate leading-tight">{url.split('/').pop()}</span>
                                            <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest leading-none">Download Target</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <a 
                                            href={getSecureLink(url)} 
                                            target="_blank" 
                                            rel="noopener noreferrer"
                                            className="p-1.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 hover:bg-white hover:text-blue-600 transition-all shadow-sm"
                                        >
                                            <Eye size={14} />
                                        </a>
                                        <a 
                                            href={getSecureLink(url, true)} 
                                            className="p-1.5 bg-slate-50 text-slate-500 rounded-lg border border-slate-100 hover:bg-white hover:text-emerald-600 transition-all shadow-sm"
                                        >
                                            <Download size={14} />
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </motion.div>

        {/* Submission Form/Status */}
        <motion.div 
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-lg shadow-slate-100/50"
        >
            <div className={`px-6 py-4 border-b border-slate-100 flex items-center justify-between ${submission.status === 'PENDING' ? 'bg-amber-50/20' : 'bg-emerald-50/20'}`}>
                <div className="flex items-center gap-2">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm border ${submission.status === 'PENDING' ? 'bg-white text-amber-500 border-amber-50' : 'bg-white text-emerald-500 border-emerald-50'}`}>
                        {submission.status === 'PENDING' ? <Clock size={16} /> : <CheckCircle2 size={16} />}
                    </div>
                    <h2 className="text-xs font-black text-slate-800 tracking-tight uppercase">
                        {submission.status === 'PENDING' ? 'Draft Evidence' : 'Submission Data'}
                    </h2>
                </div>
            </div>

            <div className="p-6">
                {submission.status === "PENDING" ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 leading-none">
                                <MessageSquare size={10} />
                                Summary / Explanation
                            </label>
                            <textarea
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="w-full h-32 p-4 bg-slate-50 border-2 border-slate-100 rounded-2xl text-[13px] font-medium transition-all focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 placeholder-slate-400 focus:outline-none"
                                placeholder="Describe your submission briefly..."
                            ></textarea>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 leading-none">
                                <UploadCloud size={10} />
                                Attachment Vault (Max 10MB)
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <AnimatePresence>
                                    {selectedFiles.map((file, idx) => (
                                        <motion.div 
                                            key={`${file.name}-${idx}`} 
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            className="group p-3 bg-blue-50/30 border-2 border-dashed border-blue-100 rounded-2xl flex items-center gap-3 animate-pulse-subtle"
                                        >
                                            <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                                                <FileText size={14} />
                                            </div>
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className="text-[10px] font-black text-blue-900 truncate">{file.name}</span>
                                                <span className="text-[8px] font-bold text-blue-400 uppercase tracking-widest leading-none">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                            <button 
                                                type="button"
                                                onClick={() => removeSelectedFile(idx)}
                                                className="p-1.5 bg-white text-slate-400 hover:text-red-500 hover:shadow-md rounded-lg transition-all active:scale-95 shadow-sm border border-slate-100"
                                            >
                                                <Trash2 size={12} />
                                            </button>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                                
                                <label className="min-h-[60px] flex flex-col items-center justify-center gap-1.5 p-4 border-2 border-dashed border-slate-200 bg-slate-50/30 rounded-2xl hover:bg-white hover:border-blue-500 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden">
                                     <div className="w-8 h-8 bg-white rounded-lg shadow-sm border border-slate-200 group-hover:border-blue-200 group-hover:text-blue-600 flex items-center justify-center transition-all duration-300">
                                        <UploadCloud size={16} />
                                     </div>
                                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest transition-colors">Select Files</span>
                                     <input type="file" multiple onChange={handleFileChange} className="hidden" />
                                </label>
                            </div>
                        </div>

                        {error && (
                            <motion.div 
                                initial={{ opacity: 0, x: -5 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-3 bg-red-50 border-2 border-red-100 rounded-2xl text-[10px] font-bold text-red-600 flex items-center gap-3 shadow-sm"
                            >
                                <AlertCircle size={14} />
                                {error}
                            </motion.div>
                        )}

                        <div className="flex justify-end pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="relative group bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] px-8 py-3.5 rounded-2xl shadow-xl shadow-blue-500/20 hover:shadow-blue-500/30 transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                                {isLoading ? (
                                    <LoadingSpinner size="sm" color="white" />
                                ) : (
                                    <>
                                        <CheckCircle2 size={14} />
                                        Commit Task
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                ) : (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 leading-none">
                                    <MessageSquare size={10} />
                                    Your Summary
                                </h3>
                                <div className="text-[13px] font-medium text-slate-700 bg-slate-50/50 p-4 rounded-2xl border border-slate-100 whitespace-pre-wrap min-h-[100px] shadow-inner leading-relaxed overflow-hidden relative group">
                                    {submission.content || "No textual summary provided."}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 leading-none">
                                    <Paperclip size={10} />
                                    Submitted Artifacts
                                </h3>
                                <div className="space-y-2">
                                    {submission.fileUrls && submission.fileUrls.length > 0 ? (
                                        submission.fileUrls.map((url, idx) => (
                                            <div 
                                                key={idx}
                                                className="flex items-center justify-between p-3 bg-white border border-slate-50 rounded-2xl hover:border-blue-500 hover:shadow-md transition-all group shadow-sm"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white shrink-0">
                                                        <FileText size={14} />
                                                    </div>
                                                    <div className="flex flex-col min-w-0">
                                                        <span className="text-[11px] font-black text-slate-800 truncate leading-tight">{url.split('/').pop()}</span>
                                                        <div className="flex gap-3 mt-0.5 leading-none">
                                                            <a 
                                                                href={getSecureLink(url)} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="text-[8px] text-blue-500 hover:text-blue-700 font-bold uppercase tracking-widest flex items-center gap-1"
                                                            >
                                                                <Eye size={8} /> View
                                                            </a>
                                                            <span className="text-slate-200 text-[8px]">|</span>
                                                            <a 
                                                                href={getSecureLink(url, true)} 
                                                                className="text-[8px] text-emerald-500 hover:text-emerald-700 font-bold uppercase tracking-widest flex items-center gap-1"
                                                            >
                                                                <Download size={8} /> Fetch
                                                            </a>
                                                        </div>
                                                    </div>
                                                </div>
                                                <ChevronRight size={14} className="text-slate-300 group-hover:text-blue-500 transition-all translate-x-0 group-hover:translate-x-1" />
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 border-2 border-dashed border-slate-50 rounded-2xl bg-slate-50/50">
                                            <UploadCloud size={24} className="mx-auto text-slate-200 mb-1.5" />
                                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none">No Artifacts Attached</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-6 border-t border-slate-50">
                            <div className="flex items-center gap-2 bg-slate-50/80 px-4 py-2 rounded-xl border border-slate-100">
                                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                                <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest leading-none">
                                    Last Sync: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "Trace Offline"}
                                </p>
                            </div>
                            
                            {submission.status === "SUBMITTED" && (
                                <button 
                                    onClick={() => {
                                        setContent(submission.content || "");
                                        setSubmission({ ...submission, status: 'PENDING' });
                                    }}
                                    className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors"
                                >
                                    Retract Entry
                                </button>
                            )}
                        </div>

                        {submission.status === "GRADED" && (
                            <motion.div 
                                initial={{ opacity: 0, scale: 0.98 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative mt-2"
                            >
                                <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1 flex items-center gap-1.5">
                                    <Trophy size={12} className="text-amber-500" />
                                    Performance Report
                                </h3>
                                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-3xl text-white shadow-xl relative overflow-hidden group border border-slate-800">
                                    <div className="absolute top-0 right-0 -m-8 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none transition-all duration-700" />
                                    
                                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                                        <div className="w-24 h-24 bg-white/5 backdrop-blur-xl rounded-2xl flex flex-col items-center justify-center border border-white/10 shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                            <span className="text-4xl font-black tracking-tighter leading-none">{submission.grade}</span>
                                            <span className="text-[8px] font-black text-blue-300 uppercase tracking-widest leading-none mt-1">Grade Point</span>
                                        </div>
                                        
                                        <div className="space-y-4 flex-1">
                                            <div>
                                                <h4 className="text-lg font-black tracking-tight leading-none mb-1">Academic Status: Validated</h4>
                                                <p className="text-[9px] font-bold text-blue-300 uppercase tracking-widest opacity-60">Verified Enrollment ID: {submission.id.slice(-8).toUpperCase()}</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-xl border border-white/5 shadow-inner">
                                                <div className="flex items-start gap-3">
                                                    <MessageSquare size={14} className="text-blue-400 mt-0.5 shrink-0" />
                                                    <p className="text-[12px] font-medium leading-relaxed italic text-blue-50/80">
                                                        "{submission.feedback || "The evaluator finalized this submission with a standard assessment of fulfillment."}"
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </div>
                )}
            </div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes pulse-subtle {
            0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.05); }
            50% { transform: scale(1.002); box-shadow: 0 0 10px 0 rgba(37, 99, 235, 0.03); }
            100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.05); }
        }
        .animate-pulse-subtle {
            animation: pulse-subtle 4s ease-in-out infinite;
        }
      `}</style>
    </motion.div>
  );
}
