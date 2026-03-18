'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Users, Search, RefreshCcw, BookOpen, ClipboardList, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

export default function MyGroupsView({ loggedInUser }) {
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const teacherId = loggedInUser?.id || loggedInUser?.userId;

  const fetchMyGroups = useCallback(async () => {
    if (!teacherId) { setIsLoading(false); return; }
    setIsLoading(true);
    try {
      const data = await apiClient.get(`/teachers/my-groups?teacherId=${teacherId}`);
      setGroups(data || []);
    } catch (err) {
      console.error("Failed to fetch groups:", err);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId]);

  useEffect(() => { fetchMyGroups(); }, [fetchMyGroups]);

  const filteredGroups = useMemo(() =>
    groups.filter(g =>
      g.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.courses?.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()))
    ), [groups, searchTerm]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <div className="h-7 w-1 bg-indigo-600 rounded-full" />
            My Groups
          </h1>
          <p className="text-slate-400 font-medium text-xs ml-3.5 pl-3 border-l border-slate-200">
            Academic cohorts assigned to your teaching schedule.
          </p>
        </div>
        <button
          onClick={fetchMyGroups}
          className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-xl border border-slate-200 hover:border-indigo-100 shadow-sm transition-all active:scale-95 self-start sm:self-auto"
        >
          <RefreshCcw size={16} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm group">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
            <Search size={14} />
          </div>
          <input
            type="text"
            placeholder="Search groups or courses..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-400 transition-all text-slate-700 placeholder:text-slate-400 shadow-sm"
          />
        </div>
        <div className="px-3 py-2 bg-indigo-50 text-indigo-700 text-[10px] font-black uppercase tracking-widest rounded-xl border border-indigo-100 whitespace-nowrap shadow-sm">
          {filteredGroups.length} {filteredGroups.length === 1 ? "Group" : "Groups"}
        </div>
      </div>

      {/* Cards Grid */}
      {isLoading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <LoadingSpinner size="lg" color="indigo" />
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Syncing Groups...</p>
        </div>
      ) : filteredGroups.length === 0 ? (
        <div className="py-20 bg-white rounded-2xl border border-slate-100 text-center shadow-sm">
          <div className="max-w-xs mx-auto space-y-3 opacity-40">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto">
              <ClipboardList size={26} className="text-slate-400" />
            </div>
            <div>
              <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">No Groups Found</h3>
              <p className="text-[11px] font-medium text-slate-500 mt-1">No groups are assigned to your current schedule.</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {filteredGroups.map((group, idx) => {
              const studentCount = group._count?.students ?? group.studentIds?.length ?? 0;
              const courseName = group.courses?.[0]?.name;

              return (
                <motion.div
                  key={group.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:shadow-indigo-500/5 hover:border-indigo-100 transition-all duration-300 group flex flex-col gap-4"
                >
                  {/* Top Row */}
                  <div className="flex items-start justify-between">
                    <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm shrink-0">
                      <Users size={18} />
                    </div>
                    <span className="px-2.5 py-1 bg-slate-50 text-slate-500 text-[10px] font-black rounded-lg border border-slate-100 group-hover:bg-indigo-50 group-hover:text-indigo-600 group-hover:border-indigo-100 transition-colors">
                      {studentCount} {studentCount === 1 ? "Student" : "Students"}
                    </span>
                  </div>

                  {/* Group Name */}
                  <div>
                    <h3 className="text-sm font-black text-slate-800 group-hover:text-indigo-600 transition-colors leading-snug">
                      {group.name}
                    </h3>
                    {courseName && (
                      <div className="flex items-center gap-1.5 mt-1.5">
                        <BookOpen size={11} className="text-slate-400 shrink-0" />
                        <span className="text-[11px] font-semibold text-slate-400 truncate">{courseName}</span>
                      </div>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between mt-auto">
                    <Link
                      href={`/teacher/student-attendance?groupId=${group.id}`}
                      className="text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors flex items-center gap-1"
                    >
                      Attendance
                      <ArrowRight size={10} />
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
