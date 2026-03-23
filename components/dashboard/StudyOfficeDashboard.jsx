"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import DashboardCard from "@/components/dashboard/DashboardCard";
import {
  Users,
  Briefcase,
  Building2,
  Library,
  BookOpen,
  Calendar,
  BarChart3,
  TrendingUp,
  Activity,
  UserCheck,
  Users as Group,
  ChevronRight,
  Award,
  Clock,
  MessageSquare,
  PenTool,
  Book,
  GraduationCap,
  UserPlus,
} from "lucide-react";
import AnalyticsChart from "./AnalyticsChart";

export default function StudyOfficeDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStudyOfficeDashboardData = async () => {
      try {
        const data = await apiClient.get("/dashboards/study-office");
        if (data) setDashboardData(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      }
    };

    const fetchCurrentUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const userId = storedUser ? JSON.parse(storedUser).id : null;
        const data = await apiClient.get(`/auth/me${userId ? `?userId=${userId}` : ''}`);
        if (data && data.user) setCurrentUser(data.user);
      } catch (error) {
        console.error(error);
      }
    };

    Promise.all([fetchStudyOfficeDashboardData(), fetchCurrentUser()]).finally(
      () => setLoading(false)
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" color="blue" className="mx-auto" />
          <p className="text-slate-500 font-bold tracking-tight animate-pulse">Accessing Academic Records...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6 border border-rose-100">
          <Activity size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Service Offline</h2>
        <p className="text-slate-500 max-w-sm mb-8 text-sm font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200">Retry Connection</button>
      </div>
    );
  }

  if (!dashboardData) return null;

  const welcomeName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Study Lead";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const chartData = [
    { name: "Students", count: dashboardData.studentCount || 0 },
    { name: "Teachers", count: dashboardData.teacherCount || 0 },
    { name: "Courses", count: dashboardData.courseCount || 0 },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.05 },
    },
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.4 } },
  };

  return (
    <div className="min-h-screen bg-slate-50/20 pb-10 font-sans">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto p-3 md:p-6 space-y-6"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4 px-1">
          <div className="space-y-0.5">
            <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">
              {getGreeting()}, <span className="text-indigo-600 font-black">{welcomeName}</span>!
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Academic coordination, student performance, and curriculum monitoring.
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest leading-none">
              Academic Systems: Synchronized
            </span>
          </div>
        </motion.header>

        {/* Dynamic Metric Strip - High Density Overview */}
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-7 gap-3">
          {[
            { title: "Students", val: dashboardData.studentCount, icon: Users, color: "blue", href: "/study-office/students" },
            { title: "Teachers", val: dashboardData.teacherCount, icon: UserCheck, color: "indigo", href: "/study-office/teacher" },
            { title: "Courses", val: dashboardData.courseCount, icon: Library, color: "violet", href: "/study-office/courses" },
            { title: "Groups", val: dashboardData.groupCount, icon: Group, color: "cyan", href: "/study-office/groups" },
            { title: "Dept", val: dashboardData.departmentCount, icon: Building2, color: "rose", href: "/study-office/departments" },
            { title: "Faculty", val: dashboardData.facultyCount, icon: Activity, color: "emerald", href: "/study-office/faculty" },
            { title: "Attendance", val: `${dashboardData.attendanceRate}%`, icon: Clock, color: "orange", href: "/study-office/student-attendance" },
          ].map((stat) => (
            <motion.div variants={itemVariants} key={stat.title} whileHover={{ y: -2 }}>
              <Link href={stat.href} className="group flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{stat.title}</p>
                  <p className="font-black text-sm text-slate-900 leading-none tracking-tight">
                    {stat.val || 0}
                  </p>
                </div>
                <div className={`h-8 w-8 rounded-lg bg-${stat.color}-50 text-${stat.color}-600 flex items-center justify-center shrink-0`}>
                  <stat.icon size={16} />
                </div>
              </Link>
            </motion.div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Academic Controls Grid - Premium Coordination Hub */}
            <motion.section variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">Academic Management</h3>
                <div className="h-6 w-6 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                   <Briefcase size={12} className="text-slate-400" />
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
                {[
                  { label: "Students", icon: Users, href: "/study-office/students", bg: "bg-blue-50", text: "text-blue-600" },
                  { label: "Teachers", icon: UserCheck, href: "/study-office/teacher", bg: "bg-indigo-50", text: "text-indigo-600" },
                  { label: "Courses", icon: Library, href: "/study-office/courses", bg: "bg-violet-50", text: "text-violet-600" },
                  { label: "Schedules", icon: Calendar, href: "/study-office/schedule", bg: "bg-sky-50", text: "text-sky-600" },
                  { label: "Attendance", icon: Clock, href: "/study-office/student-attendance", bg: "bg-orange-50", text: "text-orange-600" },
                  { label: "Exams", icon: PenTool, href: "/study-office/exams", bg: "bg-rose-50", text: "text-rose-600" },
                  { label: "Assignments", icon: Book, href: "/study-office/assignments", bg: "bg-amber-50", text: "text-amber-600" },
                  { label: "Gradebook", icon: GraduationCap, href: "/study-office/gradebook", bg: "bg-emerald-50", text: "text-emerald-600" },
                  { label: "Performance", icon: TrendingUp, href: "/study-office/student-performance", bg: "bg-blue-50", text: "text-blue-600" },
                  { label: "E-Library", icon: BookOpen, href: "/study-office/e-library", bg: "bg-indigo-50", text: "text-indigo-600" },
                  { label: "Certificates", icon: Award, href: "/study-office/certificate-management", bg: "bg-violet-50", text: "text-violet-600" },
                  { label: "Analytics", icon: BarChart3, href: "/study-office/course-analytics", bg: "bg-sky-50", text: "text-sky-600" },
                ].map((action) => (
                  <Link
                    href={action.href}
                    prefetch={false}
                    key={action.label}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-50 hover:border-blue-100 hover:bg-slate-50/50 transition-all active:scale-95 text-center"
                  >
                    <div className={`p-3.5 ${action.bg} ${action.text} rounded-xl group-hover:bg-white transition-all shadow-sm`}>
                      <action.icon size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 tracking-tight leading-none px-1">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.section>

            {/* Analytics Chart */}
            <motion.section variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-5 px-1">University Growth</h3>
              <div className="h-[280px]">
                <AnalyticsChart data={chartData} />
              </div>
            </motion.section>
          </div>

          <div className="space-y-6">
            {/* Intelligence Module - High Fidelity Gradient */}
            <motion.section variants={itemVariants} className="bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200/50 relative overflow-hidden">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg">
                    <TrendingUp size={14} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-50 leading-none">Academic Intelligence</span>
                </div>

                <div className="space-y-3">
                  <h4 className="text-lg font-black leading-tight">
                    Academy coordination is overseeing {dashboardData.studentCount} active students.
                  </h4>
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-black text-indigo-200 uppercase tracking-wider flex items-center gap-1.5 leading-none">
                      <span className="w-1.5 h-1.5 bg-indigo-300 rounded-full animate-pulse" />
                      Status: Performance Optimal
                    </p>
                    <p className="text-xs text-indigo-50 font-medium leading-relaxed opacity-90">
                      With {dashboardData.courseCount} active courses, the student-to-teacher ratio is {(dashboardData.studentCount / (dashboardData.teacherCount || 1)).toFixed(1)}:1. System balance optimal.
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                  <div className="flex gap-5">
                    <div className="text-center">
                      <p className="text-xs font-black text-white leading-none">{(dashboardData.enrollmentsCount / (dashboardData.studentCount || 1)).toFixed(1)}</p>
                      <p className="text-[8px] font-bold text-indigo-200 uppercase mt-1 tracking-tighter">Scale</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-black text-white leading-none">100%</p>
                      <p className="text-[8px] font-bold text-indigo-200 uppercase mt-1 tracking-tighter">Sync</p>
                    </div>
                  </div>
                  <Link href="/study-office/course-analytics" className="h-8 w-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                    <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-white/10 rounded-full blur-2xl opacity-60" />
            </motion.section>

            {/* Live Academic Stream - Compact Audit Stream */}
            <motion.section variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[400px] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Live Academic Stream</h3>
                <Activity size={16} className="text-rose-500 animate-pulse" />
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {/* Announcements */}
                {dashboardData.recentAnnouncements?.map((ann, idx) => (
                  <div key={`ann-${idx}`} className="flex gap-4 p-3 rounded-xl bg-slate-50/50 hover:bg-white hover:border-slate-100 transition-all group border border-transparent">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                      <MessageSquare size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tight">Announcement</p>
                        <span className="text-[8px] font-bold text-slate-400">Recently</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-1">{ann.title}</p>
                      <p className="text-[9px] text-slate-500 font-medium">by {ann.author?.firstName} {ann.author?.lastName}</p>
                    </div>
                  </div>
                ))}

                {/* New Courses */}
                {dashboardData.recentCourses?.map((course, idx) => (
                  <div key={`course-${idx}`} className="flex gap-4 p-3 rounded-xl bg-indigo-50/30 hover:bg-white hover:border-indigo-100 transition-all group border border-transparent">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                      <Library size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-0.5">
                        <p className="text-[10px] font-black text-indigo-600 truncate uppercase tracking-tight">New Course</p>
                        <span className="text-[8px] font-bold text-indigo-400 font-black tracking-widest">NEW</span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-700 leading-tight line-clamp-1">{course.name}</p>
                      <p className="text-[9px] text-slate-500 font-medium">Curriculum Added</p>
                    </div>
                  </div>
                ))}

                {(!dashboardData.recentAnnouncements?.length && !dashboardData.recentCourses?.length) && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2 opacity-50">
                    <Activity size={24} />
                    <p className="text-[9px] font-black uppercase tracking-widest">No Stream Data</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 text-center border-t border-slate-50">
                 <Link href="/study-office/course-analytics" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline transition-all">
                    University System Logs
                 </Link>
              </div>
            </motion.section>

            {/* Profile Summary Card - Premium User Summary */}
            <motion.section variants={itemVariants} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm text-center">
              <div className="h-16 w-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white shadow-sm ring-4 ring-slate-50/50">
                <Group size={24} />
              </div>
              <h4 className="text-sm font-black text-slate-900 leading-none mb-1">{welcomeName}</h4>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Master Academic Hub</p>
              <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-[11px] font-black text-slate-900 leading-none">Global</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Scope</p>
                </div>
                <div className="h-4 w-px bg-slate-100" />
                <div className="text-center">
                  <p className="text-[11px] font-black text-slate-900 leading-none">Primary</p>
                  <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Status</p>
                </div>
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
