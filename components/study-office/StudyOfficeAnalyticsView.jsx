"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  TrendingUp,
  Users,
  AlertTriangle,
  Download,
  RefreshCw,
  ChevronDown,
  Filter,
  Activity,
  BookOpen,
  CheckCircle,
  XCircle,
  Star,
  ArrowUp,
  ArrowDown,
  Minus,
  Calendar,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Colour Palette ────────────────────────────────────────────────────────
const CHART_COLORS = ["#06b6d4", "#6366f1", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"];
const GRADE_COLORS = {
  A: "#10b981",
  B: "#06b6d4",
  C: "#f59e0b",
  D: "#f97316",
  F: "#ef4444",
};

const TABS = [
  { key: "overview", label: "Overview", icon: BarChart3 },
  { key: "performance", label: "Performance", icon: TrendingUp },
  { key: "attendance", label: "Attendance", icon: Calendar },
  { key: "atrisk", label: "At-Risk Students", icon: AlertTriangle },
];

// ─── Helper Components ─────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <motion.div
      whileHover={{ y: -3 }}
      className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex items-center gap-4 hover:border-cyan-100 hover:shadow-md transition-all"
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <p className="text-2xl font-black text-slate-900 leading-none mt-1">{value ?? "–"}</p>
        {sub && <p className="text-[10px] text-slate-400 font-medium mt-0.5">{sub}</p>}
      </div>
      {trend !== undefined && (
        <div
          className={`flex items-center gap-0.5 text-[10px] font-black ${
            trend > 0 ? "text-emerald-500" : trend < 0 ? "text-rose-500" : "text-slate-400"
          }`}
        >
          {trend > 0 ? <ArrowUp size={12} /> : trend < 0 ? <ArrowDown size={12} /> : <Minus size={12} />}
          {Math.abs(trend)}%
        </div>
      )}
    </motion.div>
  );
}

function SectionHeader({ title, subtitle }) {
  return (
    <div className="mb-5">
      <h3 className="text-base font-black text-slate-800 tracking-tight">{title}</h3>
      {subtitle && <p className="text-[11px] text-slate-400 font-medium mt-0.5">{subtitle}</p>}
    </div>
  );
}

// ─── At-Risk Badge ─────────────────────────────────────────────────────────
function RiskBadge({ level }) {
  const cfg = {
    HIGH: { label: "High Risk", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200" },
    MEDIUM: { label: "Borderline", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200" },
    LOW: { label: "On Track", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200" },
  }[level] || { label: level, color: "text-slate-500", bg: "bg-slate-50", border: "border-slate-200" };

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
      <div className={`w-1.5 h-1.5 rounded-full ${level === "HIGH" ? "bg-rose-500 animate-pulse" : level === "MEDIUM" ? "bg-amber-400" : "bg-emerald-500"}`} />
      {cfg.label}
    </span>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function StudyOfficeAnalyticsView() {
  const [activeTab, setActiveTab] = useState("overview");
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [analyticsData, setAnalyticsData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchDepartments = useCallback(async () => {
    try {
      const data = await apiClient.get("/departments");
      if (Array.isArray(data)) setDepartments(data);
    } catch {
      setDepartments(MOCK_DEPARTMENTS);
    }
  }, []);

  const fetchAnalytics = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = [];
      if (selectedDept) params.push(`departmentId=${selectedDept}`);
      if (selectedSemester) params.push(`semester=${selectedSemester}`);
      const query = params.length ? `?${params.join("&")}` : "";
      const data = await apiClient.get(`/faculty/reports${query}`);
      setAnalyticsData(data);
    } catch {
      // Fall back to rich mock data
      setAnalyticsData(MOCK_ANALYTICS_DATA);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDept, selectedSemester]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAnalytics();
    setIsRefreshing(false);
  };

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const data = analyticsData || MOCK_ANALYTICS_DATA;

  // ── Tab Content ────────────────────────────────────────────────────────
  const renderOverview = () => (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Students" value={data.summary?.totalStudents} icon={Users}
          color="bg-cyan-50 text-cyan-600" trend={data.summary?.studentGrowth} sub="Active enrolments" />
        <StatCard label="Avg. GPA" value={data.summary?.avgGpa} icon={Star}
          color="bg-indigo-50 text-indigo-600" sub="Across all courses" trend={data.summary?.gpaChange} />
        <StatCard label="Pass Rate" value={`${data.summary?.passRate}%`} icon={CheckCircle}
          color="bg-emerald-50 text-emerald-600" sub="This semester" trend={data.summary?.passRateChange} />
        <StatCard label="Avg. Attendance" value={`${data.summary?.avgAttendance}%`} icon={Calendar}
          color="bg-amber-50 text-amber-600" sub="All classes" trend={data.summary?.attendanceChange} />
      </div>

      {/* Grade Distribution + Enrollment by Dept */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <SectionHeader title="Grade Distribution" subtitle="Current semester grade spread" />
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data.gradeDistribution} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="grade" tick={{ fontSize: 11, fontWeight: 700, fill: "#64748b" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600 }}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey="students" radius={[6, 6, 0, 0]}>
                {data.gradeDistribution?.map((entry, i) => (
                  <Cell key={i} fill={GRADE_COLORS[entry.grade] || "#06b6d4"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <SectionHeader title="Enrollment by Department" subtitle="Current distribution" />
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data.enrollmentByDept}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={4}
                dataKey="students"
                nameKey="department"
                label={({ department, percent }) => `${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {data.enrollmentByDept?.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, fontWeight: 600 }} />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, fontWeight: 700 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderPerformance = () => (
    <div className="space-y-6">
      {/* Score Trend Line Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <SectionHeader title="Average Score Trend" subtitle="Monthly average across all courses" />
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data.scoreTrend}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b" }} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600 }}
            />
            <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
            <Line type="monotone" dataKey="avgScore" stroke="#06b6d4" strokeWidth={2.5} dot={{ r: 4, fill: "#06b6d4" }} name="Avg Score" />
            <Line type="monotone" dataKey="passThreshold" stroke="#e2e8f0" strokeWidth={1.5} strokeDasharray="6 3" dot={false} name="Pass Line (50)" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Performing Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <SectionHeader title="Top Performing Courses" subtitle="By average student score" />
          <div className="space-y-3">
            {data.topCourses?.map((course, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[9px] font-black ${
                  i === 0 ? "bg-amber-100 text-amber-600" : i === 1 ? "bg-slate-100 text-slate-500" : "bg-orange-50 text-orange-400"
                }`}>
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between mb-1">
                    <p className="text-[11px] font-bold text-slate-700 truncate">{course.name}</p>
                    <span className="text-[11px] font-black text-cyan-600 shrink-0 ml-2">{course.avgScore}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${course.avgScore}%` }}
                      transition={{ duration: 1, delay: i * 0.1 }}
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Radar */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <SectionHeader title="Academic Skills Radar" subtitle="Average competency levels" />
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={data.skillsRadar}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="skill" tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
              <Radar name="Avg Score" dataKey="score" stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      {/* Attendance Trend */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        <SectionHeader title="Attendance Trends" subtitle="Present vs Absent breakdown per week" />
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.attendanceTrend} barSize={14}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 11, fontWeight: 600, fill: "#64748b" }} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} />
            <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 600 }} />
            <Legend wrapperStyle={{ fontSize: 11, fontWeight: 700 }} />
            <Bar dataKey="present" fill="#10b981" radius={[4, 4, 0, 0]} name="Present" />
            <Bar dataKey="absent" fill="#f87171" radius={[4, 4, 0, 0]} name="Absent" />
            <Bar dataKey="late" fill="#fbbf24" radius={[4, 4, 0, 0]} name="Late" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Attendance by Course Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50">
          <h3 className="text-sm font-black text-slate-800">Attendance Rate by Course</h3>
          <p className="text-[10px] text-slate-400 font-medium">Current semester</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {["Course", "Students", "Avg. Present", "Rate", "Trend"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.attendanceByCourse?.map((c, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <p className="text-[12px] font-bold text-slate-700">{c.course}</p>
                    <p className="text-[10px] text-slate-400">{c.code}</p>
                  </td>
                  <td className="px-5 py-3.5 text-[12px] font-bold text-slate-600">{c.students}</td>
                  <td className="px-5 py-3.5 text-[12px] font-bold text-slate-600">{c.present}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden w-20">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${c.rate}%` }}
                          transition={{ duration: 1, delay: i * 0.05 }}
                          className={`h-full rounded-full ${c.rate >= 80 ? "bg-emerald-500" : c.rate >= 60 ? "bg-amber-400" : "bg-rose-400"}`}
                        />
                      </div>
                      <span className={`text-[11px] font-black ${c.rate >= 80 ? "text-emerald-600" : c.rate >= 60 ? "text-amber-600" : "text-rose-500"}`}>
                        {c.rate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[10px] font-black flex items-center gap-1 ${c.trend > 0 ? "text-emerald-500" : c.trend < 0 ? "text-rose-500" : "text-slate-400"}`}>
                      {c.trend > 0 ? <ArrowUp size={11} /> : c.trend < 0 ? <ArrowDown size={11} /> : <Minus size={11} />}
                      {Math.abs(c.trend)}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderAtRisk = () => (
    <div className="space-y-6">
      {/* Risk Summary Callouts */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "High Risk", count: data.atRiskStudents?.filter((s) => s.risk === "HIGH").length || 0, color: "bg-rose-50 border-rose-200 text-rose-700", dot: "bg-rose-500" },
          { label: "Borderline", count: data.atRiskStudents?.filter((s) => s.risk === "MEDIUM").length || 0, color: "bg-amber-50 border-amber-200 text-amber-700", dot: "bg-amber-400" },
          { label: "On Track", count: data.atRiskStudents?.filter((s) => s.risk === "LOW").length || 0, color: "bg-emerald-50 border-emerald-200 text-emerald-700", dot: "bg-emerald-500" },
        ].map((item) => (
          <div key={item.label} className={`rounded-xl border p-4 ${item.color} flex items-center gap-3`}>
            <div className={`w-2.5 h-2.5 rounded-full ${item.dot} animate-pulse shrink-0`} />
            <div>
              <p className="text-xl font-black leading-none">{item.count}</p>
              <p className="text-[10px] font-black uppercase tracking-wider opacity-70 mt-0.5">{item.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* At-Risk Students Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-800">At-Risk Student List</h3>
            <p className="text-[10px] text-slate-400 font-medium">Students flagged based on low grades or poor attendance</p>
          </div>
          <button className="flex items-center gap-1.5 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-rose-200 hover:text-rose-600 transition-all">
            <Download size={12} />
            Export
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                {["Student", "Course", "GPA", "Attendance", "Reason", "Risk Level"].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.atRiskStudents?.map((s, i) => (
                <motion.tr
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shrink-0 ${
                        s.risk === "HIGH" ? "bg-rose-50 text-rose-600" : s.risk === "MEDIUM" ? "bg-amber-50 text-amber-600" : "bg-emerald-50 text-emerald-600"
                      }`}>
                        {s.name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
                      </div>
                      <div>
                        <p className="text-[12px] font-bold text-slate-800">{s.name}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{s.id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-[11px] font-medium text-slate-600">{s.course}</td>
                  <td className="px-5 py-4">
                    <span className={`text-[12px] font-black ${s.gpa < 1.5 ? "text-rose-500" : s.gpa < 2.5 ? "text-amber-500" : "text-emerald-600"}`}>
                      {s.gpa}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${s.attendance < 60 ? "bg-rose-400" : s.attendance < 75 ? "bg-amber-400" : "bg-emerald-500"}`}
                          style={{ width: `${s.attendance}%` }}
                        />
                      </div>
                      <span className={`text-[11px] font-black ${s.attendance < 60 ? "text-rose-500" : s.attendance < 75 ? "text-amber-500" : "text-emerald-600"}`}>
                        {s.attendance}%
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[9px] font-bold rounded-lg uppercase tracking-tight">
                      {s.reason}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <RiskBadge level={s.risk} />
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const tabContent = {
    overview: renderOverview,
    performance: renderPerformance,
    attendance: renderAttendance,
    atrisk: renderAtRisk,
  };

  return (
    <div className="min-h-screen bg-slate-50/20 pb-12">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* ── Header ────────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-cyan-600 tracking-tight">
              Reports & Analytics
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">
              Academic performance insights, attendance trends, and at-risk identification.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* Department Filter */}
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 shadow-sm"
            >
              <option value="">All Departments</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
            <select
              value={selectedSemester}
              onChange={(e) => setSelectedSemester(e.target.value)}
              className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 shadow-sm"
            >
              <option value="">All Semesters</option>
              <option value="2025-S1">2025 – Semester 1</option>
              <option value="2024-S2">2024 – Semester 2</option>
              <option value="2024-S1">2024 – Semester 1</option>
            </select>
            <button
              onClick={handleRefresh}
              className={`p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all shadow-sm ${isRefreshing ? "animate-spin" : ""}`}
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* ── Tab Navigation ────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`relative flex items-center gap-2 px-6 py-4 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all ${
                    activeTab === tab.key
                      ? "text-cyan-600 bg-cyan-50/40"
                      : "text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Icon size={14} />
                  {tab.label}
                  {activeTab === tab.key && (
                    <motion.div
                      layoutId="analyticsTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600"
                    />
                  )}
                </button>
              );
            })}
          </div>

          {/* ── Content ───────────────────────────────────────── */}
          <div className="p-5">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24">
                <LoadingSpinner size="lg" color="blue" className="mb-4" />
                <p className="text-slate-400 font-black text-[11px] uppercase tracking-widest animate-pulse">
                  Loading Analytics...
                </p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25 }}
                >
                  {tabContent[activeTab]?.()}
                </motion.div>
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Rich Mock Data ────────────────────────────────────────────────────────
const MOCK_DEPARTMENTS = [
  { id: "1", name: "Computer Science" },
  { id: "2", name: "Business Administration" },
  { id: "3", name: "Engineering" },
];

const MOCK_ANALYTICS_DATA = {
  summary: {
    totalStudents: 1248,
    avgGpa: 2.84,
    passRate: 78,
    avgAttendance: 82,
    studentGrowth: 4,
    gpaChange: 2,
    passRateChange: -1,
    attendanceChange: 3,
  },
  gradeDistribution: [
    { grade: "A", students: 280 },
    { grade: "B", students: 420 },
    { grade: "C", students: 310 },
    { grade: "D", students: 150 },
    { grade: "F", students: 88 },
  ],
  enrollmentByDept: [
    { department: "Computer Science", students: 480 },
    { department: "Business Admin", students: 360 },
    { department: "Engineering", students: 290 },
    { department: "Other", students: 118 },
  ],
  scoreTrend: [
    { month: "Sep", avgScore: 64, passThreshold: 50 },
    { month: "Oct", avgScore: 68, passThreshold: 50 },
    { month: "Nov", avgScore: 71, passThreshold: 50 },
    { month: "Dec", avgScore: 74, passThreshold: 50 },
    { month: "Jan", avgScore: 72, passThreshold: 50 },
    { month: "Feb", avgScore: 76, passThreshold: 50 },
  ],
  topCourses: [
    { name: "Software Engineering", avgScore: 84 },
    { name: "Data Structures", avgScore: 81 },
    { name: "Web Development", avgScore: 79 },
    { name: "Database Systems", avgScore: 75 },
    { name: "Algorithms", avgScore: 71 },
  ],
  skillsRadar: [
    { skill: "Programming", score: 76 },
    { skill: "Math", score: 68 },
    { skill: "Analysis", score: 72 },
    { skill: "Communication", score: 80 },
    { skill: "Teamwork", score: 85 },
    { skill: "Problem Solving", score: 74 },
  ],
  attendanceTrend: [
    { week: "Wk 1", present: 210, absent: 30, late: 12 },
    { week: "Wk 2", present: 225, absent: 20, late: 8 },
    { week: "Wk 3", present: 200, absent: 45, late: 15 },
    { week: "Wk 4", present: 230, absent: 18, late: 6 },
    { week: "Wk 5", present: 220, absent: 25, late: 10 },
    { week: "Wk 6", present: 235, absent: 15, late: 7 },
  ],
  attendanceByCourse: [
    { course: "Web Development", code: "CS301", students: 45, present: 40, rate: 89, trend: 3 },
    { course: "Database Systems", code: "CS201", students: 38, present: 32, rate: 84, trend: 1 },
    { course: "Algorithms", code: "CS103", students: 52, present: 39, rate: 75, trend: -2 },
    { course: "Machine Learning", code: "CS501", students: 30, present: 19, rate: 63, trend: -5 },
    { course: "Software Engineering", code: "CS401", students: 44, present: 42, rate: 95, trend: 4 },
  ],
  atRiskStudents: [
    { id: "STU-021", name: "Boran Lim", course: "Algorithms", gpa: 1.1, attendance: 42, reason: "Low GPA + Absent", risk: "HIGH" },
    { id: "STU-058", name: "Sreynich Oun", course: "Machine Learning", gpa: 1.4, attendance: 55, reason: "Low Attendance", risk: "HIGH" },
    { id: "STU-103", name: "Vichet Nhem", course: "Database Systems", gpa: 1.8, attendance: 68, reason: "Failing Midterm", risk: "MEDIUM" },
    { id: "STU-144", name: "Kosal Tep", course: "Web Development", gpa: 2.0, attendance: 71, reason: "Borderline GPA", risk: "MEDIUM" },
    { id: "STU-210", name: "Dyna Pang", course: "Software Eng.", gpa: 2.9, attendance: 88, reason: "Improving", risk: "LOW" },
  ],
};
