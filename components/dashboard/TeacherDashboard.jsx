"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Users,
  Library,
  Award,
  TrendingUp,
  ClipboardList,
  Calendar,
  FileText,
  ChevronRight,
  Activity,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Clock,
} from "lucide-react";
import UpcomingSchedule from "./UpcomingSchedule";
import { useTheme } from "@/context/ThemeContext";

const TeacherDashboard = ({ loggedInUser }) => {
  const { theme } = useTheme();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await apiClient.get(
          `/dashboards/teacher?teacherId=${loggedInUser.id}`
        );
        if (data) {
          setDashboardData(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    if (loggedInUser?.id) fetchData();
  }, [loggedInUser]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50 dark:bg-slate-900/50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" color="blue" className="mx-auto" />
          <p className="text-slate-500 dark:text-slate-400 font-bold tracking-tight animate-pulse">Gathering Classroom Insights...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 p-6 text-center">
        <div className="h-16 w-16 bg-rose-50 dark:bg-rose-900/20 text-rose-500 rounded-2xl flex items-center justify-center mb-6 border border-rose-100 dark:border-rose-900/30">
          <Activity size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 dark:text-white mb-2">Sync Failed</h2>
        <p className="text-slate-500 dark:text-slate-400 max-w-sm mb-8 text-sm font-medium">{error}</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-200 dark:shadow-none">Retry Connection</button>
      </div>
    );
  }

  if (!dashboardData) return null;

  const welcomeName = loggedInUser
    ? `${loggedInUser.firstName} ${loggedInUser.lastName}`
    : "Teacher";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

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
    <div className="min-h-screen bg-slate-50/20 dark:bg-slate-950 pb-10">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto p-3 md:p-6 space-y-6"
      >
        {/* Header */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl md:text-3xl font-black text-blue-600 dark:text-blue-400 tracking-tight">
              {getGreeting()}, <span className="text-indigo-600 dark:text-indigo-400">Prof. {welcomeName}</span>!
            </h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium text-sm">
              Empower your students and manage your curriculum with ease.
            </p>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm border-l-4 border-l-indigo-500">
            <div className="h-2 w-2 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Teaching Mode Active</span>
          </div>
        </motion.header>

        {/* Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            { title: "My Students", val: dashboardData.totalStudents, icon: Users, color: "blue", darkBg: "dark:bg-blue-900/20", darkText: "dark:text-blue-400" },
            { title: "My Courses", val: dashboardData.totalCourses, icon: Library, color: "indigo", darkBg: "dark:bg-indigo-900/20", darkText: "dark:text-indigo-400" },
            { title: "Avg Grade", val: `${dashboardData.averageGrade}%`, icon: Award, color: "violet", darkBg: "dark:bg-violet-900/20", darkText: "dark:text-violet-400" },
          ].map((stat) => (
            <motion.div variants={itemVariants} key={stat.title} whileHover={{ y: -3 }}>
              <div className="flex items-center justify-between p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:border-blue-100 dark:hover:border-blue-900/50 hover:shadow-md transition-all">
                <div>
                  <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">{stat.title}</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white leading-none">{stat.val}</p>
                </div>
                <div className={`h-11 w-11 rounded-xl bg-${stat.color}-50 ${stat.darkBg} text-${stat.color}-600 ${stat.darkText} flex items-center justify-center shrink-0`}>
                  <stat.icon size={22} />
                </div>
              </div>
            </motion.div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Actions */}
            <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5 px-1">
                <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Academic Tools</h3>
                <TrendingUp size={16} className="text-slate-300 dark:text-slate-600" />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { label: "Assigned", icon: ClipboardList, href: "/teacher/assignment", bg: "bg-blue-50", text: "text-blue-600" },
                  { label: "Grades", icon: Award, href: "/teacher/gradebook", bg: "bg-indigo-50", text: "text-indigo-600" },
                  { label: "Schedule", icon: Calendar, href: "/teacher/schedule", bg: "bg-sky-50", text: "text-sky-600" },
                  { label: "Students", icon: Users, href: "/teacher/students", bg: "bg-violet-50", text: "text-violet-600" },
                  { label: "Courses", icon: Library, href: "/teacher/courses", bg: "bg-slate-50", text: "text-slate-600" },
                  { label: "Exams", icon: FileText, href: "/teacher/exam", bg: "bg-purple-50", text: "text-purple-600" },
                  { label: "Stats", icon: TrendingUp, href: "/teacher/student-performance", bg: "bg-cyan-50", text: "text-cyan-600" },
                  { label: "Leave", icon: Calendar, href: "/teacher/my-absence", bg: "bg-orange-50", text: "text-orange-600" },
                  { label: "E-Library", icon: Library, href: "/teacher/e-library", bg: "bg-emerald-50", text: "text-emerald-600" },
                ].map((action) => (
                  <Link
                    href={action.href}
                    key={action.label}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-50 dark:border-slate-800/50 hover:border-blue-100 dark:hover:border-blue-900/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all active:scale-95"
                  >
                    <div className={`p-3.5 ${action.bg} dark:bg-slate-800 ${action.text} rounded-xl group-hover:bg-white dark:group-hover:bg-slate-700 transition-all shadow-sm`}>
                      <action.icon size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 text-center tracking-tight leading-none px-1">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.section>

            {/* Pending Tasks Section */}
            {(dashboardData.pendingSubmissions > 0 || dashboardData.pendingAttendance?.length > 0) && (
              <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 px-1">
                  <h3 className="text-lg font-black text-slate-800 dark:text-slate-100 tracking-tight">Pending Actions</h3>
                  <div className="px-2 py-0.5 bg-rose-50 dark:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-[10px] font-black rounded-full border border-rose-100 dark:border-rose-900/30">
                    {dashboardData.pendingSubmissions + (dashboardData.pendingAttendance?.length || 0)} TASKS
                  </div>
                </div>
                <div className="space-y-3">
                  {dashboardData.pendingSubmissions > 0 && (
                    <Link href="/teacher/assignment" className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                      <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <ClipboardList size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Grade Submissions</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">You have {dashboardData.pendingSubmissions} new student submissions ready for feedback.</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-500 transition-colors" />
                    </Link>
                  )}
                  {dashboardData.pendingAttendance?.map((item, idx) => (
                    <Link key={idx} href={`/teacher/student-attendance?groupId=${item.groupId}`} className="flex items-center gap-4 p-4 rounded-xl border border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-all group">
                      <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                        <AlertCircle size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 tracking-tight">Mark Attendance: {item.groupName}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">{item.courseName} session on {new Date(item.startTime).toLocaleDateString()}</p>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 group-hover:text-amber-500 transition-colors" />
                    </Link>
                  ))}
                </div>
              </motion.section>
            )}

            {/* Charts Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Students per Course</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.studentsPerCourse}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} fontWeight={700} tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} fontSize={9} fontWeight={700} tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8' }} />
                      <Tooltip cursor={{ fill: theme === 'dark' ? '#0f172a' : '#f8fafc' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="studentCount" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-4">Grade Distribution</h3>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dashboardData.gradeDistribution}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#1e293b' : '#f1f5f9'} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} fontSize={9} fontWeight={700} tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8' }} />
                      <YAxis axisLine={false} tickLine={false} fontSize={9} fontWeight={700} tick={{ fill: theme === 'dark' ? '#64748b' : '#94a3b8' }} />
                      <Tooltip cursor={{ fill: theme === 'dark' ? '#0f172a' : '#f8fafc' }} contentStyle={{ backgroundColor: theme === 'dark' ? '#0f172a' : '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </motion.div>
            </div>
          </div>

          <div className="space-y-6">
            <motion.section variants={itemVariants} className="bg-gradient-to-br from-blue-700 via-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-blue-200/40 relative overflow-hidden">
               <div className="relative z-10 space-y-4">
                 <div className="flex items-center gap-2">
                   <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg">
                     <Activity size={14} className="text-white" />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-widest text-blue-50">Classroom Intel</span>
                 </div>

                 <h4 className="text-lg font-black leading-tight">
                    Average class performance is currently at {dashboardData.averageGrade}%.
                 </h4>
                 <p className="text-xs text-blue-100 font-medium leading-relaxed italic">
                    "The art of teaching is the art of assisting discovery." - You are managing {dashboardData.totalStudents} students effectively.
                 </p>
                 
                 <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                    <div className="space-y-0.5">
                       <p className="text-[9px] font-black text-blue-200 uppercase tracking-tighter">Engagement Scope</p>
                       <p className="text-sm font-black">
                         {dashboardData.totalCourses} Active Courses
                       </p>
                    </div>
                    <Link href="/teacher/student-performance" className="h-8 w-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                      <ChevronRight size={16} />
                    </Link>
                 </div>
               </div>
               <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
            </motion.section>

            <UpcomingSchedule teacherId={loggedInUser.id} />

            <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
               <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3 border-2 border-white dark:border-slate-800 shadow-sm">
                 <Users size={28} />
               </div>
               <h4 className="text-sm font-black text-slate-900 dark:text-white leading-none mb-1">{welcomeName}</h4>
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Certified Instructor</p>
               <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-800 flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{dashboardData.totalCourses}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Courses</p>
                  </div>
                  <div className="h-4 w-px bg-slate-100 dark:bg-slate-800" />
                  <div className="text-center">
                    <p className="text-[11px] font-black text-slate-900 dark:text-white leading-none">{dashboardData.totalStudents}</p>
                    <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter mt-1">Students</p>
                  </div>
               </div>
            </motion.section>

            <motion.section variants={itemVariants} className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
               <div className="flex items-center justify-between mb-4 px-1">
                 <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 tracking-tight uppercase">Recent Activity</h3>
                 <Clock size={14} className="text-slate-300 dark:text-slate-600" />
               </div>
               <div className="space-y-4">
                 {/* Announcements */}
                 {dashboardData.recentAnnouncements?.length > 0 ? (
                   <div className="space-y-3">
                     <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Latest Announcements</p>
                     {dashboardData.recentAnnouncements.map((ann, idx) => (
                       <div key={idx} className="p-3 bg-slate-50/50 dark:bg-slate-800/50 rounded-xl border border-slate-50 dark:border-slate-800/50">
                         <div className="flex items-start gap-2 mb-1">
                            <MessageSquare size={12} className="text-blue-500 mt-0.5 shrink-0" />
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 line-clamp-1">{ann.title}</p>
                         </div>
                         <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium ml-5">{ann.course?.name}</p>
                       </div>
                     ))}
                   </div>
                 ) : null}

                 {/* Library Resources */}
                 {dashboardData.recentLibraryResources?.length > 0 ? (
                   <div className="space-y-3 pt-2">
                     <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">Recent Uploads</p>
                     {dashboardData.recentLibraryResources.map((res, idx) => (
                       <div key={idx} className="flex items-center gap-3 p-2 group">
                         <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                           <Library size={14} />
                         </div>
                         <div className="min-w-0">
                           <p className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-indigo-600 transition-colors">{res.title}</p>
                           <p className="text-[9px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-tighter">{res.author}</p>
                         </div>
                       </div>
                     ))}
                   </div>
                 ) : null}

                 {!(dashboardData.recentAnnouncements?.length > 0) && !(dashboardData.recentLibraryResources?.length > 0) && (
                    <div className="py-8 text-center">
                       <p className="text-xs font-medium text-slate-400 dark:text-slate-500">No recent activity to show.</p>
                    </div>
                 )}
               </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TeacherDashboard;
