'use client';

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { Eye, Search, Users, UserCheck, RefreshCcw, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

export default function MyStudentsView({ loggedInUser }) {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const teacherId = loggedInUser?.id || loggedInUser?.userId;

  const fetchMyStudents = useCallback(async () => {
    if (!teacherId) {
      console.warn("No teacher ID found in loggedInUser object:", loggedInUser);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const data = await apiClient.get(`/teachers/my-students?teacherId=${teacherId}`);
      setStudents(data || []);
    } catch (err) {
      console.error("Failed to fetch students:", err);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId, loggedInUser]);

  useEffect(() => {
    fetchMyStudents();
  }, [fetchMyStudents]);

  const filteredStudents = useMemo(() => {
    return students.filter(
      (student) =>
        `${student.firstName} ${student.lastName}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <div className="h-10 w-1.5 bg-emerald-600 rounded-full" />
             Student Community
          </h1>
          <p className="text-slate-500 font-medium text-sm ml-4 border-l border-slate-200 pl-4">
            Unified view of active learners across all your assigned academic sessions.
          </p>
        </div>
        
        <button 
          onClick={fetchMyStudents}
          className="p-2.5 bg-white text-slate-400 hover:text-emerald-600 rounded-2xl border border-slate-200 hover:border-emerald-100 shadow-sm transition-all active:scale-95"
        >
          <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
        <div className="relative w-full lg:max-w-md group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-emerald-500 transition-colors">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search roster by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all"
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Identity</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Contact Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Authority</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Engagement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-24">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <LoadingSpinner size="lg" color="emerald" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Syncing Personnel Roster...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="max-w-xs mx-auto space-y-4 opacity-40">
                      <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto">
                        <Users size={32} className="text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Roster Empty</h3>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">No active student profiles identified for your current course distribution.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredStudents.map((student, idx) => (
                    <motion.tr
                      key={student.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="group hover:bg-slate-50/80 transition-colors"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300 shadow-sm overflow-hidden">
                            {student.profile?.image ? (
                              <img src={student.profile.image} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <User size={20} />
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-tight group-hover:text-emerald-600 transition-colors">
                              {student.firstName} {student.lastName}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              ID: {student.id?.slice(-8).toUpperCase()}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <p className="text-xs font-bold text-slate-600">{student.email}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sky-50 text-sky-700 rounded-xl text-[10px] font-black uppercase tracking-wider border border-sky-100">
                          <UserCheck size={12} />
                          {student.role}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <Link 
                          href={`/teacher/students/${student.id}`}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-600 hover:text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-slate-200 hover:border-indigo-200 shadow-sm transition-all active:scale-95"
                        >
                          <Eye size={14} />
                          Profile
                        </Link>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}