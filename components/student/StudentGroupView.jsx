'use client';

import React, { useState, useEffect, useCallback } from "react";
import { Users, BookOpen, RefreshCcw, User, GraduationCap, ClipboardList } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

export default function StudentGroupView({ loggedInUser }) {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const studentId = loggedInUser?.id || loggedInUser?.userId;

  const fetchMyGroup = useCallback(async () => {
    if (!studentId) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const data = await apiClient.get(`/students/my-group?studentId=${studentId}`);
      setGroups(data || []);
    } catch (err) {
      console.error("Failed to fetch group:", err);
    } finally {
      setIsLoading(false);
    }
  }, [studentId]);

  useEffect(() => { fetchMyGroup(); }, [fetchMyGroup]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="h-7 w-1 bg-blue-600 rounded-full" />
            My Group
          </h1>
          <p className="text-slate-400 font-medium text-xs ml-3.5 pl-3 border-l border-slate-200">
            Your academic cohort and classmates.
          </p>
        </div>
        <button
          onClick={fetchMyGroup}
          className="p-2.5 bg-white text-slate-400 hover:text-blue-600 rounded-xl border border-slate-200 hover:border-blue-100 shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" color="blue" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Loading Your Group...</p>
        </div>
      ) : groups.length === 0 ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-100 text-center shadow-sm">
          <div className="max-w-xs mx-auto space-y-3 opacity-40">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
              <ClipboardList size={26} className="text-slate-400" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">No Group Assigned</h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1">You haven't been assigned to an academic group yet.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence mode="popLayout">
            {groups.map((group, idx) => (
              <motion.div
                key={group.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="space-y-4"
              >
                {/* Group Info Card */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center border border-blue-100 shadow-sm shrink-0">
                      <Users size={22} />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-slate-900">{group.name}</h2>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1">
                        {group.batch && (
                          <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                            <GraduationCap size={11} className="text-slate-400" />
                            {group.batch.name}
                          </span>
                        )}
                        {group.batch?.department && (
                          <span className="text-[11px] font-bold text-slate-400">· {group.batch.department.name}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-center px-4 py-2 bg-blue-50 rounded-xl border border-blue-100">
                      <p className="text-lg font-black text-blue-700">{group._count?.students ?? group.students?.length ?? 0}</p>
                      <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Members</p>
                    </div>
                    {group.courses?.length > 0 && (
                      <div className="text-center px-4 py-2 bg-indigo-50 rounded-xl border border-indigo-100">
                        <p className="text-lg font-black text-indigo-700">{group.courses.length}</p>
                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Courses</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Courses */}
                {group.courses?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <BookOpen size={12} /> Courses
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {group.courses.map(course => (
                        <span key={course.id} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-100">
                          {course.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Groupmates Table */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                  <div className="px-5 py-4 border-b border-slate-50 flex items-center gap-2">
                    <Users size={13} className="text-slate-400" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Your Classmates</h3>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {group.students?.map((student, sIdx) => {
                      const isMe = student.id === studentId;
                      return (
                        <motion.div
                          key={student.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: sIdx * 0.02 }}
                          className={`flex items-center gap-4 px-5 py-3 transition-colors ${isMe ? "bg-blue-50/60" : "hover:bg-slate-50/60"}`}
                        >
                          {/* Avatar */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border overflow-hidden ${isMe ? "bg-blue-600 border-blue-200 text-white" : "bg-slate-50 border-slate-100 text-slate-500"}`}>
                            {student.profile?.avatar ? (
                              <img src={student.profile.avatar} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User size={16} />
                            )}
                          </div>
                          {/* Name */}
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-black truncate ${isMe ? "text-blue-700" : "text-slate-800"}`}>
                              {student.firstName} {student.lastName}
                              {isMe && <span className="ml-2 text-[9px] font-black bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded uppercase tracking-widest">You</span>}
                            </p>
                            {student.profile?.studentId && (
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{student.profile.studentId}</p>
                            )}
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
