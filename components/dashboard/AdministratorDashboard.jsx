"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import {
  Users,
  Briefcase,
  Building2,
  Library,
  Users as Group,
  UserCheck,
  BarChart3,
  Activity,
  Shield,
  TrendingUp,
  Megaphone,
  ClipboardList,
  FileText,
  Book,
  DollarSign,
  Calendar,
  ChevronRight,
  Clock,
  Wallet,
  Award,
  Search,
  UserCog,
} from "lucide-react";
import AnalyticsChart from "./AnalyticsChart";

export default function AdministratorDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  async function fetchDashboardData() {
    try {
      const data = await apiClient.get("/dashboards/admin");
      if (data) setDashboardData(data);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  }

  async function fetchCurrentUser() {
    try {
      const storedUser = localStorage.getItem('user');
      const userId = storedUser ? JSON.parse(storedUser).id : null;
      const data = await apiClient.get(`/auth/me${userId ? `?userId=${userId}` : ''}`);
      if (data && data.user) setCurrentUser(data.user);
    } catch (error) {
      console.error(error);
    }
  }

  useEffect(() => {
    Promise.all([fetchDashboardData(), fetchCurrentUser()]).finally(() =>
      setLoading(false)
    );
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" color="blue" className="mx-auto" />
          <p className="text-slate-500 font-bold tracking-tight animate-pulse">Initializing Admin Console...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-6 text-center">
        <div className="h-16 w-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <Shield size={32} />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Systems Unreachable</h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium text-sm">
          We couldn't establish a secure connection to the dashboard services.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition shadow-lg shadow-blue-200"
        >
          Reconnect
        </button>
      </div>
    );
  }

  const welcomeName = currentUser
    ? `${currentUser.firstName} ${currentUser.lastName}`
    : "Admin";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const formatMultiCurrency = (amounts) => {
    if (!amounts || !Array.isArray(amounts) || amounts.length === 0) return "$0.00";
    const sorted = [...amounts].sort((a, b) => (a.currency === "USD" ? -1 : 1));
    return sorted
      .map((a) => {
        const symbol = a.currency === "KHR" ? "៛" : "$";
        const formatted = a.total.toLocaleString(undefined, {
          minimumFractionDigits: a.currency === "USD" ? 2 : 0,
          maximumFractionDigits: a.currency === "USD" ? 2 : 0,
        });
        return `${symbol}${formatted}`;
      })
      .join(" / ");
  };

  const chartData = [
    { name: "Students", count: dashboardData.studentCount },
    { name: "Teachers", count: dashboardData.teacherCount },
    { name: "Staff", count: dashboardData.staffCount },
    { name: "Depts", count: dashboardData.departmentCount },
    { name: "Courses", count: dashboardData.courseCount },
    { name: "Groups", count: dashboardData.groupCount },
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
    <div className="min-h-screen pb-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto p-3 md:p-6 space-y-6"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-0.5">
            <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">
              {getGreeting()}, <span className="text-indigo-600">{welcomeName}</span>
            </h1>
            <p className="text-slate-500 font-medium text-sm">
              Manage school operations and monitor academic performance.
            </p>
          </div>

          <div className="flex items-center gap-2.5 px-4 py-2 bg-transparent border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-emerald-500">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
               Nodes Active: {dashboardData.activeSessionCount || 1}
            </span>
          </div>
        </motion.div>

        {/* Stats Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-10 gap-3">
          {[
            { title: "Students", val: dashboardData.studentCount, icon: Users, color: "blue", href: "/admin/students" },
            { title: "Teachers", val: dashboardData.teacherCount, icon: UserCheck, color: "indigo", href: "/admin/teachers" },
            { title: "Staff", val: dashboardData.staffCount, icon: Briefcase, color: "slate", href: "/admin/staff" },
            { title: "Faculty", val: dashboardData.facultyCount, icon: Activity, color: "rose", href: "/admin/faculty" },
            { title: "Dept", val: dashboardData.departmentCount, icon: Building2, color: "sky", href: "/admin/departments" },
            { title: "Courses", val: dashboardData.courseCount, icon: Library, color: "violet", href: "/admin/courses" },
            { title: "Groups", val: dashboardData.groupCount, icon: Group, color: "cyan", href: "/admin/groups" },
            { 
              title: "Revenue", 
              val: formatMultiCurrency(dashboardData.totalRevenue), 
              icon: DollarSign, 
              color: "emerald", 
              href: "/admin/finance/payments" 
            },
            { 
              title: "Expenses", 
              val: formatMultiCurrency(dashboardData.totalExpenses), 
              icon: Wallet, 
              color: "amber", 
              href: "/admin/finance" 
            },
            { title: "Sessions", val: dashboardData.activeSessionCount || 1, icon: Shield, color: "emerald", href: "/admin/settings" },
          ].map((stat) => (
            <motion.div variants={itemVariants} key={stat.title} whileHover={{ y: -3 }}>
              <Link href={stat.href || "#"} prefetch={false} className="group flex items-center justify-between p-3.5 bg-white rounded-xl border border-slate-200 shadow-sm hover:border-blue-200 hover:shadow-md transition-all">
                <div className="min-w-0 flex-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5 truncate">{stat.title}</p>
                  <p className={`font-black text-slate-900 leading-none truncate tracking-tight ${stat.title === "Revenue" || stat.title === "Expenses" ? "text-[11px]" : "text-sm"}`}>
                    {stat.val}
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
          {/* Main Controls Area */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick Actions - Compact Grid */}
            <motion.section variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-black text-slate-800 tracking-tight">System Controls</h3>
                <TrendingUp size={16} className="text-slate-300" />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {[
                  { label: "Users", icon: Users, href: "/admin/users", bg: "bg-blue-50", text: "text-blue-600" },
                  { label: "Reports", icon: BarChart3, href: "/admin/reports", bg: "bg-indigo-50", text: "text-indigo-600" },
                  { label: "Settings", icon: Shield, href: "/admin/settings", bg: "bg-slate-50", text: "text-slate-600" },
                  { label: "Announce", icon: Megaphone, href: "/admin/announcements", bg: "bg-violet-50", text: "text-violet-600" },
                  { label: "Payroll", icon: DollarSign, href: "/admin/payroll", bg: "bg-emerald-50", text: "text-emerald-600" },
                  { label: "Schedule", icon: Calendar, href: "/admin/schedule", bg: "bg-sky-50", text: "text-sky-600" },
                  { label: "Exams", icon: FileText, href: "/admin/exam-management", bg: "bg-purple-50", text: "text-purple-600" },
                  { label: "Lib", icon: Book, href: "/admin/e-library", bg: "bg-cyan-50", text: "text-cyan-600" },
                  { label: "Grades", icon: ClipboardList, href: "/admin/assignment-management", bg: "bg-teal-50", text: "text-teal-600" },
                  { label: "History", icon: Activity, href: "/admin/course-analytics", bg: "bg-blue-50", text: "text-blue-600" },
                  { label: "Attendance", icon: Clock, href: "/admin/attendance", bg: "bg-orange-50", text: "text-orange-600" },
                  { label: "Finance", icon: Wallet, href: "/admin/finance", bg: "bg-rose-50", text: "text-rose-600" },
                  { label: "HR Admin", icon: UserCog, href: "/admin/hr", bg: "bg-amber-50", text: "text-amber-600" },
                  { label: "Certify", icon: Award, href: "/admin/certificate-management", bg: "bg-yellow-50", text: "text-yellow-600" },
                  { label: "Recruit", icon: Search, href: "/admin/recruitment", bg: "bg-indigo-50", text: "text-indigo-600" },
                ].map((action) => (
                  <Link
                    href={action.href}
                    prefetch={false}
                    key={action.label}
                    className="group flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-50 hover:border-blue-100 hover:bg-slate-50/50 transition-all active:scale-95"
                  >
                    <div className={`p-3 ${action.bg} ${action.text} rounded-lg group-hover:bg-white transition-all shadow-sm`}>
                      <action.icon size={20} />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700 text-center tracking-tight leading-none px-1">
                      {action.label}
                    </span>
                  </Link>
                ))}
              </div>
            </motion.section>

            <motion.section variants={itemVariants} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
              <h3 className="text-lg font-black text-slate-800 tracking-tight mb-5">
                School Overview
              </h3>
              <div className="h-[280px]">
                <AnalyticsChart data={chartData} />
              </div>
            </motion.section>
          </div>

          {/* Sidebar - Real-time Intel & Activity */}
          <div className="space-y-6">
            
            {/* Intelligence Insights - Retained Gradient but with original content style */}
            <motion.section variants={itemVariants} className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200/50 overflow-hidden relative">
              <div className="relative z-10 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-white/20 backdrop-blur-md rounded-lg">
                    <TrendingUp size={14} className="text-white" />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-50">Intelligence Report</span>
                </div>

                <div className="space-y-3">
                   <h4 className="text-lg font-black leading-tight">
                      Security alert: {dashboardData.loginsLast24h || 0} active logins detected in the last cycle.
                   </h4>
                   <div className="space-y-1">
                      {dashboardData.pendingLeaves > 0 && (
                        <p className="text-[10px] font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-amber-300 rounded-full animate-pulse" />
                          {dashboardData.pendingLeaves} Leave requests pending approval
                        </p>
                      )}
                      {dashboardData.pendingApplications > 0 && (
                        <p className="text-[10px] font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-emerald-300 rounded-full animate-pulse" />
                          {dashboardData.pendingApplications} New job applications to review
                        </p>
                      )}
                      <p className="text-xs text-blue-100 font-medium leading-relaxed opacity-90">
                        The current teacher-to-student ratio is {(dashboardData.studentCount / (dashboardData.teacherCount || 1)).toFixed(1)}:1. System balance optimal.
                      </p>
                   </div>
                </div>

                <div className="pt-2 border-t border-white/10 flex items-center justify-between">
                   <div className="flex gap-4">
                      <div className="text-center">
                         <p className="text-[11px] font-black text-white leading-none">98%</p>
                         <p className="text-[8px] font-bold text-blue-200 uppercase mt-1">Health</p>
                      </div>
                      <div className="text-center">
                         <p className="text-[11px] font-black text-white leading-none">{dashboardData.activeSessionCount || 1}</p>
                         <p className="text-[8px] font-bold text-blue-200 uppercase mt-1">Sessions</p>
                      </div>
                   </div>
                   <Link href="/admin/reports" className="h-8 w-8 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors">
                      <ChevronRight size={16} />
                   </Link>
                </div>
              </div>
              <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-white/10 rounded-full blur-2xl" />
            </motion.section>

            {/* Live Audit Stream - Re-styled to fit the original theme */}
            <motion.section variants={itemVariants} className="bg-white border border-slate-200 rounded-2xl flex flex-col h-[400px] overflow-hidden shadow-sm">
              <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Live Activity Stream</h3>
                <Activity size={16} className="text-rose-500 animate-pulse" />
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {dashboardData.recentActivity?.map((log, i) => (
                  <div key={i} className="flex gap-4 p-3 rounded-xl bg-slate-50/50 hover:bg-white hover:border-slate-100 transition-all group">
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-[10px] font-black text-slate-800 truncate uppercase tracking-tight">
                           {log.actor?.firstName} {log.actor?.lastName}
                        </p>
                        <span className="text-[8px] font-bold text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-[9px] text-slate-500 font-medium leading-tight line-clamp-2">
                         {log.action.replace(/_/g, ' ')}
                      </p>
                    </div>
                  </div>
                ))}

                {(!dashboardData.recentActivity || dashboardData.recentActivity.length === 0) && (
                  <div className="flex flex-col items-center justify-center h-full text-slate-300 space-y-2 opacity-50">
                    <Activity size={24} />
                    <p className="text-[9px] font-black uppercase tracking-widest">No Recent Activity</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 text-center border-t border-slate-50">
                 <Link href="/admin/course-analytics" className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">
                    Detailed System Logs
                 </Link>
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
