"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpenIcon,
  UserIcon,
  ArrowLeftIcon,
  UsersIcon,
  LayoutGridIcon,
  CalendarIcon,
  AlertCircleIcon,
  CheckCircle2Icon,
  LibraryIcon,
  ShieldCheckIcon,
  ChevronRightIcon
} from "lucide-react";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import { motion } from "framer-motion";

export default function InstitutionalCourseDetailView({ courseId, backUrl = "/admin/courses" }) {
  const [course, setCourse] = useState(null);
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const data = await apiClient.get(`/courses/${courseId}`);
        setCourse(data);
        
        // Use real backend counts
        setStats({
          totalStudents: data._count?.enrollments || 0,
          totalGroups: data._count?.groups || 0,
          totalSchedules: data._count?.schedules || 0,
        });
      } catch (error) {
        console.error("Error fetching institutional course details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) fetchCourseDetails();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-10 w-10 border-[3px] border-blue-600 border-t-transparent"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Institutional Data...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <AlertCircleIcon className="mx-auto h-10 w-10 text-rose-300 mb-4" />
        <h2 className="text-lg font-bold text-slate-900">Academic Entity Not Found</h2>
        <p className="text-slate-500 text-xs mt-2 mb-6">The requested course ID could not be located in the institutional database.</p>
        <Link href={backUrl} className="inline-flex items-center px-5 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
          <ArrowLeftIcon size={14} className="mr-2" /> Return to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Structural Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-4">
          <Link href={backUrl} className="group inline-flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 group-hover:-translate-x-1 transition-all duration-300">
              <ArrowLeftIcon size={16} strokeWidth={3} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-slate-600 transition-colors">
              Institutional Navigation
            </span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="h-10 w-1.5 bg-gradient-to-b from-indigo-600 to-blue-700 rounded-full" />
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              {course.name}
            </h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-blue-100">
              Institutional Asset
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Core Metrics Cards */}
        {[
          { label: "Enrolled Students", value: stats.totalStudents, icon: UsersIcon, color: "blue" },
          { label: "Academic Groups", value: stats.totalGroups, icon: LayoutGridIcon, color: "indigo" },
          { label: "Scheduled Slots", value: stats.totalSchedules, icon: CalendarIcon, color: "emerald" },
          { label: "Active Resources", value: course._count?.announcements || 0, icon: LibraryIcon, color: "amber" },
        ].map((metric, i) => (
          <motion.div
            key={metric.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between"
          >
            <div className={`w-10 h-10 rounded-2xl bg-${metric.color}-50 text-${metric.color}-600 flex items-center justify-center border border-${metric.color}-100 mb-4`}>
              <metric.icon size={20} />
            </div>
            <div>
              <p className="text-xl font-black text-slate-900 tracking-tight">{metric.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">{metric.label}</p>
            </div>
          </motion.div>
        ))}

        {/* Detailed Info Grid */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                  <ShieldCheckIcon size={18} />
                </div>
                <h2 className="text-base font-black text-slate-900 tracking-tight">Institutional Configuration</h2>
              </div>
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-5">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Assigned Faculty Lead</label>
                  <div className="flex items-center gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-200 flex items-center justify-center text-blue-600 font-black text-sm">
                      {course.leadBy?.firstName?.charAt(0) || "U"}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">
                        {course.leadBy ? `${course.leadBy.firstName} ${course.leadBy.lastName}` : "Institutional Unassigned"}
                      </p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">Lead Instructor</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block">Group Distribution</label>
                 <div className="max-h-[200px] overflow-y-auto pr-2 space-y-2">
                    {course.groups?.length > 0 ? (
                      course.groups.map(group => (
                        <div key={group.id} className="flex items-center justify-between p-3.5 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-colors group cursor-default">
                          <div className="flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
                            <span className="text-xs font-bold text-slate-700">{group.name}</span>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <CheckCircle2Icon size={14} className="text-emerald-500" />
                             <span className="text-[10px] font-black text-slate-400 uppercase">Synchronized</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="py-8 text-center text-slate-300 italic text-sm">No group assignments detected.</div>
                    )}
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
