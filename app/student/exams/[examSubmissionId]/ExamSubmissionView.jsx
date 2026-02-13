"use client";

import React, { useState } from "react";
import Link from "next/link";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

const StatusBadge = ({ status }) => {
  const styles = {
    PENDING: "bg-yellow-100 text-yellow-800",
    SUBMITTED: "bg-blue-100 text-blue-800",
    GRADED: "bg-green-100 text-green-800",
  };
  return (
    <span
      className={`px-2 py-1 text-xs font-semibold rounded-full ${styles[status]}`}
    >
      {status}
    </span>
  );
};

// Robust Cloudinary Link Helper
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

export default function ExamSubmissionView({ initialSubmission }) {
  const [submission, setSubmission] = useState(initialSubmission);
  const [content, setContent] = useState(initialSubmission.content || "");
  const [isLoading, setIsLoading] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    const validFiles = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        setError(`File ${file.name} is too large. Max size is 5MB.`);
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
      setError("Please provide content or upload a file.");
      return;
    }
    setIsLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("content", content);

      if (submission.status === "PENDING") {
        formData.append("examId", submission.exam.id);
        formData.append("studentId", submission.studentId || "");
        selectedFiles.forEach(file => formData.append("files", file));
        
        const response = await apiClient.post("/exam-submissions", formData);
        setSubmission(response);
      } else {
        selectedFiles.forEach(file => formData.append("files", file));
        const response = await apiClient.put(`/exam-submissions/${submission.id}`, formData);
        setSubmission(response);
      }
      console.log("Exam submitted successfully!");
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const { exam } = submission;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex items-center justify-between mb-5">
          <Link href="/student/exams" className="flex items-center bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg px-4 py-2 font-medium shadow-md hover:shadow-lg transform hover:scale-105 transition-all duration-200">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to My Exams
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
                {exam?.title || "Exam Detail"}
              </h1>
              <p className="text-slate-600 text-base mt-1">
                Assigned by: {exam?.teacher?.firstName}{" "}
                {exam?.teacher?.lastName}
              </p>
            </div>
            <StatusBadge status={submission.status} />
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Exam Date:{" "}
            {exam?.examDate
              ? new Date(exam.examDate).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })
              : "N/A"}
          </p>
        </div>

        {/* Exam Description */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4 flex items-center justify-between">
            Instructions
            {exam?.attachmentUrls?.length > 0 && (
                <span className="text-[10px] bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  {exam.attachmentUrls.length} Board Materials
                </span>
            )}
          </h2>
          <div className="space-y-4">
            <p className="text-slate-700 text-base whitespace-pre-wrap">
              {exam?.description || "No instructions were provided."}
            </p>

            {exam?.attachmentUrls?.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4 pt-4 border-t border-slate-100">
                    {exam.attachmentUrls.map((url, idx) => (
                        <div 
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-xl group"
                        >
                            <div className="w-10 h-10 flex items-center justify-center bg-white rounded-xl border border-slate-200 shrink-0 shadow-sm">
                                <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-xs font-bold text-slate-700 truncate group-hover:text-purple-700">
                                    {url.split('/').pop()}
                                </span>
                                <div className="flex gap-3 mt-1 text-[9px] font-bold uppercase tracking-wider">
                                    <a 
                                        href={getSecureLink(url)} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="text-blue-500 hover:text-blue-700"
                                    >
                                        View
                                    </a>
                                    <span className="text-slate-300">|</span>
                                    <a 
                                        href={getSecureLink(url, true)} 
                                        className="text-emerald-500 hover:text-emerald-700"
                                    >
                                        Download
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
        </div>

        {/* Submission & Grade Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 space-y-5">
          <h2 className="text-xl font-bold text-slate-800 border-b border-slate-200 pb-3 mb-4">
            {submission.status === "PENDING"
              ? "Your Submission"
              : "My Submission & Grade"}
          </h2>

          {submission.status === "PENDING" && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">WRITTEN RESPONSE</label>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className="w-full h-40 p-4 bg-slate-50 border border-slate-200 rounded-2xl shadow-inner focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:bg-white focus:border-blue-500 transition-all duration-200 placeholder-slate-400"
                    placeholder="Type your response or paste a link to your work here..."
                  ></textarea>
              </div>

              <div className="space-y-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 block">ATTACHED DOCUMENTS (MAX 5MB)</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {selectedFiles.map((file, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-2xl group animate-in zoom-in-95 duration-200">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="w-9 h-9 flex items-center justify-center bg-white rounded-xl border border-blue-100 shrink-0">
                                    <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="text-xs text-blue-800 font-bold truncate">{file.name}</span>
                                    <span className="text-[10px] text-blue-400 font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                </div>
                            </div>
                            <button 
                                type="button"
                                onClick={() => removeSelectedFile(idx)}
                                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                      ))}
                      <label className="flex items-center justify-center gap-3 p-4 border-2 border-dashed border-slate-200 rounded-2xl hover:bg-blue-50/50 hover:border-blue-400 cursor-pointer transition-all group">
                         <div className="w-9 h-9 flex items-center justify-center bg-white rounded-xl border border-slate-200 group-hover:border-blue-200 shrink-0 shadow-sm">
                             <svg className="w-5 h-5 text-slate-400 group-hover:text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                             </svg>
                         </div>
                         <div className="flex flex-col">
                             <span className="text-sm font-bold text-slate-500 group-hover:text-blue-700 leading-tight">Add File</span>
                             <span className="text-[10px] text-slate-400 font-medium">Upload PDF or Images</span>
                         </div>
                         <input type="file" multiple onChange={handleFileChange} className="hidden" />
                      </label>
                  </div>
              </div>

              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
                    <div className="w-8 h-8 flex items-center justify-center bg-white border border-red-100 rounded-lg shrink-0">
                        <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <span className="text-[11px] font-bold text-red-600 uppercase tracking-tight">{error}</span>
                </div>
              )}

              <div className="text-right pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black uppercase tracking-widest px-8 py-3.5 rounded-2xl hover:shadow-xl hover:shadow-blue-200 disabled:opacity-50 transition-all duration-300 transform active:scale-95 flex items-center gap-2 ml-auto"
                >
                  {isLoading ? (
                    <LoadingSpinner size="xs" color="white" />
                  ) : (
                    <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Finalize Submission
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {submission.status !== "PENDING" && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    YOUR WRITTEN CONTENT
                  </h3>
                  <div className="text-slate-700 bg-slate-50 p-5 rounded-2xl shadow-inner whitespace-pre-wrap border border-slate-100 min-h-[150px]">
                    {submission.content || "No text was provided."}
                  </div>
                </div>

                <div>
                   <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">
                    SUBMITTED DOCUMENTS
                  </h3>
                  <div className="space-y-3">
                    {submission.fileUrls && submission.fileUrls.length > 0 ? (
                        submission.fileUrls.map((url, idx) => (
                            <div 
                                key={idx}
                                className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:bg-blue-50/50 transition-all group shadow-sm"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-xl shrink-0">
                                        <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                    </div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-700">
                                            {url.split('/').pop()}
                                        </span>
                                        <div className="flex gap-3 mt-1 text-[9px] font-bold uppercase tracking-wider">
                                            <a 
                                                href={getSecureLink(url)} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                className="text-blue-500 hover:text-blue-700"
                                            >
                                                View
                                            </a>
                                            <span className="text-slate-200">|</span>
                                            <a 
                                                href={getSecureLink(url, true)} 
                                                className="text-emerald-500 hover:text-emerald-700"
                                            >
                                                Download
                                            </a>
                                        </div>
                                    </div>
                                </div>
                                <svg className="w-4 h-4 text-slate-300 group-hover:text-blue-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                </svg>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/50">
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No files uploaded.</span>
                        </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                  <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                    Captured: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : "N/A"}
                  </p>
              </div>

              {submission.status === "GRADED" && (
                <div className="mt-6">
                  <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">
                    EXAMINATION EVALUATION BOARD
                  </h3>
                  <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 -m-10 w-40 h-40 bg-white/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative z-10 flex flex-col md:flex-row md:items-center gap-8">
                        <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center shadow-2xl shrink-0 animate-scale-in">
                            <span className="text-4xl font-black text-indigo-600">{submission.grade}</span>
                        </div>
                        <div className="space-y-4 flex-1">
                            <div>
                                <p className="text-[10px] font-black text-blue-200 uppercase tracking-widest mb-1">Board Assessment Status</p>
                                <h4 className="text-2xl font-black tracking-tight leading-none uppercase">Successfully Evaluated</h4>
                            </div>
                            <div className="bg-white/10 p-5 rounded-2xl backdrop-blur-md border border-white/10">
                                <p className="text-sm font-medium leading-relaxed italic text-blue-50">
                                    "{submission.feedback || "The examination board has logged a passing score without additional commentary."}"
                                </p>
                            </div>
                        </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
