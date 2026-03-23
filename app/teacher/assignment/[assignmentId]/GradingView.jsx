"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRightIcon } from "lucide-react";
import toast from "react-hot-toast";

import { apiClient } from "@/lib/api";
import BackButton from "@/components/ui/BackButton";

const StatusBadge = ({ status }) => {
    const styles = {
      PENDING: "bg-yellow-50 text-yellow-600 border-yellow-100",
      SUBMITTED: "bg-blue-50 text-blue-600 border-blue-100",
      GRADED: "bg-emerald-50 text-emerald-600 border-emerald-100",
    };
    return (
      <span className={`px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded-md border ${styles[status]}`}>
        {status}
      </span>
    );
};

export default function GradingView({ initialAssignment }) {
  const [assignment, setAssignment] = useState(initialAssignment);
  const router = useRouter();

  const totalSubmissions = assignment.submissions?.length || 0;
  const gradedCount = assignment.submissions?.filter(s => s.status === "GRADED").length || 0;
  const submissionRate = totalSubmissions > 0 ? Math.round((totalSubmissions / (assignment.group?._count?.students || totalSubmissions)) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50/50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Navigation Layer */}
        <div className="flex items-center justify-between">
          <BackButton 
            href="/teacher/assignments" 
            label="Back to Assignments" 
            className="mb-0" 
          />
          <div className="flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-lg shadow-sm">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Assessment Active</span>
          </div>
        </div>

        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-4">
          <div className="space-y-1">
            <h1 className="text-xl font-black text-slate-900 tracking-tight leading-tight px-1 uppercase">
              Assignment Roster
            </h1>
            <p className="text-slate-400 text-[9px] font-black uppercase tracking-widest px-1">
              Title: {assignment.title}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-slate-700 text-[11px] font-medium border-t border-slate-50 pt-4 px-1">
            <div className="flex flex-col gap-0.5">
                <span className="font-black uppercase tracking-widest text-[8px] text-slate-400">Class Group</span>
                <span className="text-slate-900 font-bold">{assignment.group?.name || "N/A"}</span>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="font-black uppercase tracking-widest text-[8px] text-slate-400">Due Date</span>
                <span className="text-slate-900 font-bold">
                    {assignment.dueDate ? new Date(assignment.dueDate).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "No Deadline"}
                </span>
            </div>
            <div className="flex flex-col gap-0.5">
                <span className="font-black uppercase tracking-widest text-[8px] text-slate-400">Engagement</span>
                <div className="flex items-center gap-2">
                    <span className="text-indigo-600 font-black">{submissionRate}%</span>
                    <div className="h-1 w-16 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${submissionRate}%` }} />
                    </div>
                </div>
            </div>
          </div>
        </div>

        {/* Submissions Roster */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 space-y-5">
           <div className="flex items-center justify-between">
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Lodged Tasks</h2>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
                        Evaluated: {gradedCount}/{totalSubmissions}
                    </span>
                </div>
           </div>

          {!assignment.submissions || assignment.submissions.length === 0 ? (
            <div className="py-12 text-center text-[10px] font-black text-slate-300 uppercase tracking-widest bg-slate-50/30 border-2 border-dashed border-slate-100 rounded-2xl">
              No task entries detected.
            </div>
          ) : (
            <div className="overflow-x-auto border border-slate-100 rounded-xl font-outfit">
              <table className="min-w-full divide-y divide-slate-100">
                <thead className="bg-slate-50/50">
                  <tr>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Student</th>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Status</th>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Submitted</th>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Grade</th>
                    <th className="px-5 py-3 text-right text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-50">
                  {assignment.submissions.map((submission) => {
                    const student = submission.student;
                    
                    return (
                      <tr key={submission.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center text-[11px] font-black border border-indigo-100/50 shadow-sm">
                              {student?.firstName?.[0]}{student?.lastName?.[0]}
                            </div>
                            <div className="text-[11px] font-black text-slate-900 uppercase tracking-tight">
                              {student?.firstName} {student?.lastName}
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <StatusBadge status={submission.status} />
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-[10px] text-slate-500 font-bold uppercase tracking-tight">
                          {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "—"}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          {submission.grade !== null ? (
                            <span className="text-[11px] font-black text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-100/50">{submission.grade}/100</span>
                          ) : (
                            <span className="text-[10px] text-slate-300 font-black uppercase tracking-widest italic">Unranked</span>
                          )}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-right">
                            <button
                                onClick={() => router.push(`/teacher/assignment/${assignment.id}/submission/${submission.id}`)}
                                className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 border border-indigo-100 shadow-sm group/btn"
                            >
                                <span>Review</span>
                                <ChevronRightIcon size={12} className="group-hover/btn:translate-x-0.5 transition-transform" />
                            </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
