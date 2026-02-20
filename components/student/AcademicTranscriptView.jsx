"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  GraduationCap, TrendingUp, BookOpen, Award, ChevronDown, ChevronUp,
  Printer, Download, Star, AlertCircle, CheckCircle, Minus, Shield,
  BarChart3, Calendar,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Grade to GPA mapping ─────────────────────────────────────────────────
const GRADE_POINT = { "A+": 4.0, "A": 4.0, "A-": 3.7, "B+": 3.3, "B": 3.0, "B-": 2.7, "C+": 2.3, "C": 2.0, "C-": 1.7, "D+": 1.3, "D": 1.0, "F": 0.0 };
const GRADE_COLOR = {
  "A+": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "A": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "A-": "text-emerald-600 bg-emerald-50 border-emerald-200",
  "B+": "text-blue-600 bg-blue-50 border-blue-200",
  "B": "text-blue-600 bg-blue-50 border-blue-200",
  "B-": "text-blue-600 bg-blue-50 border-blue-200",
  "C+": "text-amber-600 bg-amber-50 border-amber-200",
  "C": "text-amber-600 bg-amber-50 border-amber-200",
  "C-": "text-amber-600 bg-amber-50 border-amber-200",
  "D+": "text-orange-600 bg-orange-50 border-orange-200",
  "D": "text-orange-600 bg-orange-50 border-orange-200",
  "F": "text-rose-600 bg-rose-50 border-rose-200",
};

function getStanding(gpa) {
  if (gpa >= 3.7) return { label: "Summa Cum Laude", color: "text-amber-600", icon: Star };
  if (gpa >= 3.3) return { label: "Magna Cum Laude", color: "text-indigo-600", icon: Award };
  if (gpa >= 2.0) return { label: "Good Standing", color: "text-emerald-600", icon: CheckCircle };
  if (gpa >= 1.0) return { label: "Academic Probation", color: "text-orange-600", icon: AlertCircle };
  return { label: "Academic Suspension", color: "text-rose-600", icon: Shield };
}

// ─── Semester Section Component ───────────────────────────────────────────
function SemesterSection({ semester, index }) {
  const [isExpanded, setIsExpanded] = useState(index === 0);

  const semGpa = useMemo(() => {
    if (!semester.courses?.length) return 0;
    let totalPoints = 0, totalCredits = 0;
    semester.courses.forEach((c) => {
      const pts = GRADE_POINT[c.grade] ?? 0;
      totalPoints += pts * (c.credits || 3);
      totalCredits += c.credits || 3;
    });
    return totalCredits > 0 ? (totalPoints / totalCredits).toFixed(2) : "0.00";
  }, [semester.courses]);

  const totalCredits = semester.courses?.reduce((s, c) => s + (c.credits || 3), 0) || 0;
  const passed = semester.courses?.filter((c) => (GRADE_POINT[c.grade] ?? 0) >= 1.0).length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden"
    >
      {/* Semester Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50/60 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Calendar size={16} />
          </div>
          <div className="text-left">
            <p className="text-sm font-black text-slate-800">{semester.name}</p>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">
              {semester.courses?.length || 0} Courses &nbsp;·&nbsp; {totalCredits} Credits
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden sm:flex items-center gap-5">
            <div className="text-center">
              <p className="text-[18px] font-black text-slate-900 leading-none">{semGpa}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Sem GPA</p>
            </div>
            <div className="text-center">
              <p className="text-[18px] font-black text-emerald-600 leading-none">{passed}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Passed</p>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-100 text-slate-500">
            {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </div>
        </div>
      </button>

      {/* Course Table */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <div className="overflow-x-auto border-t border-slate-100">
              <table className="w-full">
                <thead className="bg-slate-50/50">
                  <tr>
                    {["Course", "Code", "Credits", "Midterm", "Final", "Grade", "Points"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {semester.courses?.map((course, i) => {
                    const pts = GRADE_POINT[course.grade];
                    return (
                      <motion.tr
                        key={i}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors"
                      >
                        <td className="px-5 py-3.5">
                          <p className="text-[12px] font-bold text-slate-800">{course.name}</p>
                          {course.teacher && (
                            <p className="text-[9px] text-slate-400 font-medium">{course.teacher}</p>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[11px] font-mono font-bold text-slate-500">{course.code || "–"}</td>
                        <td className="px-5 py-3.5 text-[12px] font-bold text-slate-600">{course.credits || 3}</td>
                        <td className="px-5 py-3.5 text-[12px] font-bold text-slate-600">{course.midterm ?? "–"}</td>
                        <td className="px-5 py-3.5 text-[12px] font-bold text-slate-600">{course.final ?? "–"}</td>
                        <td className="px-5 py-3.5">
                          {course.grade ? (
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[11px] font-black border ${GRADE_COLOR[course.grade] || "text-slate-600 bg-slate-50 border-slate-200"}`}>
                              {course.grade}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-300 font-bold">Pending</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] font-black text-indigo-600">
                          {pts !== undefined ? pts.toFixed(1) : "–"}
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
                {/* Semester Footer */}
                <tfoot className="bg-indigo-50/50 border-t border-indigo-100">
                  <tr>
                    <td colSpan={2} className="px-5 py-3">
                      <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Semester Total</span>
                    </td>
                    <td className="px-5 py-3 text-[12px] font-black text-slate-700">{totalCredits} credits</td>
                    <td colSpan={2} />
                    <td className="px-5 py-3">
                      <span className="text-[10px] font-black text-indigo-600">{passed}/{semester.courses?.length} passed</span>
                    </td>
                    <td className="px-5 py-3 text-[14px] font-black text-indigo-700">{semGpa}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Main Transcript Component ────────────────────────────────────────────
export default function AcademicTranscriptView() {
  const { user } = useUser();
  const [transcriptData, setTranscriptData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchTranscript = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get(`/students/transcript?studentId=${user?.id}`);
      setTranscriptData(data);
    } catch {
      setTranscriptData(MOCK_TRANSCRIPT);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchTranscript(); }, [fetchTranscript]);

  // ── Computed Aggregates ────────────────────────────────────────────────
  const { cumulativeGpa, totalCredits, totalCourses, gpaByTerm } = useMemo(() => {
    if (!transcriptData?.semesters) return { cumulativeGpa: 0, totalCredits: 0, totalCourses: 0, gpaByTerm: [] };

    let totalPoints = 0, totalCreds = 0, totalCrs = 0;
    const gpaByTerm = [];

    transcriptData.semesters.forEach((sem) => {
      let semPts = 0, semCreds = 0;
      sem.courses?.forEach((c) => {
        const pts = GRADE_POINT[c.grade] ?? 0;
        const creds = c.credits || 3;
        totalPoints += pts * creds;
        totalCreds += creds;
        semPts += pts * creds;
        semCreds += creds;
        totalCrs++;
      });
      gpaByTerm.push({
        name: sem.shortName || sem.name,
        gpa: semCreds > 0 ? parseFloat((semPts / semCreds).toFixed(2)) : 0,
      });
    });

    return {
      cumulativeGpa: totalCreds > 0 ? (totalPoints / totalCreds).toFixed(2) : "0.00",
      totalCredits: totalCreds,
      totalCourses: totalCrs,
      gpaByTerm,
    };
  }, [transcriptData]);

  const standing = getStanding(parseFloat(cumulativeGpa));
  const StandingIcon = standing.icon;

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <LoadingSpinner size="lg" color="blue" />
        <p className="mt-4 text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">
          Loading Transcript...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/20 pb-12">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">

        {/* ── Page Header ──────────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tight">
              Academic Transcript
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">
              Official academic record for {user?.firstName} {user?.lastName}
            </p>
          </div>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-2xl text-[11px] font-black text-slate-600 uppercase tracking-widest hover:border-indigo-200 hover:text-indigo-600 shadow-sm transition-all active:scale-95 print:hidden"
          >
            <Printer size={14} />
            Print Transcript
          </button>
        </motion.div>

        {/* ── Student Info Card ─────────────────────────────────── */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-indigo-600 via-violet-500 to-indigo-600" />
          <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
            {/* Avatar */}
            <div className="relative shrink-0">
              <img
                src={user?.profile?.avatar || "/default-cover.jpg"}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
                alt="Student"
              />
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                <CheckCircle size={12} className="text-white" />
              </div>
            </div>
            {/* Info */}
            <div className="flex-1 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {[
                { label: "Full Name", value: `${user?.firstName || ""} ${user?.lastName || ""}` },
                { label: "Student ID", value: user?.studentId || user?.id || "N/A" },
                { label: "Program", value: transcriptData?.program || "Computer Science" },
                { label: "Department", value: transcriptData?.department || "Engineering" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                  <p className="text-[13px] font-bold text-slate-800 mt-0.5 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* ── KPI Row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Cumulative GPA", value: cumulativeGpa, sub: "/ 4.00", icon: TrendingUp, color: "text-indigo-600 bg-indigo-50" },
            { label: "Total Credits", value: totalCredits, sub: "earned", icon: BookOpen, color: "text-emerald-600 bg-emerald-50" },
            { label: "Courses Taken", value: totalCourses, sub: "completed", icon: BarChart3, color: "text-blue-600 bg-blue-50" },
            { label: "Academic Standing", value: standing.label, sub: null, icon: StandingIcon, color: `${standing.color} bg-slate-50` },
          ].map((s, i) => (
            <motion.div
              key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }} whileHover={{ y: -2 }}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm"
            >
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${s.color}`}>
                <s.icon size={17} />
              </div>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
              <p className={`text-lg font-black leading-tight mt-1 ${i === 3 ? "text-sm " + standing.color : "text-slate-900"}`}>
                {s.value}
              </p>
              {s.sub && <p className="text-[9px] text-slate-400 font-medium">{s.sub}</p>}
            </motion.div>
          ))}
        </div>

        {/* ── GPA Trend Chart ───────────────────────────────────── */}
        {gpaByTerm.length > 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-sm font-black text-slate-800">GPA Trend</h3>
                <p className="text-[10px] text-slate-400 font-medium">Semester-by-semester performance</p>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] font-black ${
                parseFloat(gpaByTerm[gpaByTerm.length - 1]?.gpa) >= parseFloat(gpaByTerm[gpaByTerm.length - 2]?.gpa)
                  ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                  : "bg-rose-50 border-rose-200 text-rose-500"
              }`}>
                <TrendingUp size={12} />
                {parseFloat(gpaByTerm[gpaByTerm.length - 1]?.gpa) >= parseFloat(gpaByTerm[gpaByTerm.length - 2]?.gpa || 0)
                  ? "Improving" : "Declining"}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={gpaByTerm}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fontWeight: 700, fill: "#64748b" }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 9, fill: "#94a3b8" }} />
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0", fontSize: 12, fontWeight: 700 }}
                  formatter={(v) => [v, "GPA"]}
                />
                <Line type="monotone" dataKey="gpa" stroke="#6366f1" strokeWidth={2.5}
                  dot={{ r: 5, fill: "#6366f1", strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* ── Semester Sections ─────────────────────────────────── */}
        <div className="space-y-4">
          <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest px-1">
            Semester Records
          </h3>
          {transcriptData?.semesters?.map((sem, i) => (
            <SemesterSection key={sem.id || i} semester={sem} index={i} />
          ))}
        </div>

        {/* ── Signature Block (print-ready) ───────────────────── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-indigo-600 mb-2">
                <GraduationCap size={18} />
                <span className="text-[11px] font-black uppercase tracking-widest">Official Academic Record</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium max-w-sm">
                This transcript is an official document issued by the Academic Office. 
                Any alterations render it invalid.
              </p>
            </div>
            <div className="flex flex-col items-center gap-2 shrink-0">
              <div className="w-32 h-0.5 bg-slate-900" />
              <p className="text-[10px] font-black text-slate-700 uppercase tracking-wider">Registrar Signature</p>
              <p className="text-[9px] text-slate-400">Generated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

// ─── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_TRANSCRIPT = {
  program: "Bachelor of Computer Science",
  department: "Faculty of Engineering & Technology",
  semesters: [
    {
      id: 1,
      name: "Semester 1 — 2023",
      shortName: "2023-S1",
      courses: [
        { name: "Introduction to Programming", code: "CS101", credits: 3, midterm: 78, final: 82, grade: "B+", teacher: "Dr. Sophea Lim" },
        { name: "Mathematics for CS", code: "MATH101", credits: 4, midterm: 85, final: 88, grade: "A-", teacher: "Prof. Dara Kim" },
        { name: "English Communication", code: "ENG101", credits: 2, midterm: 90, final: 92, grade: "A", teacher: "Ms. Pisey Chan" },
        { name: "Digital Logic", code: "CS102", credits: 3, midterm: 70, final: 74, grade: "B", teacher: "Dr. Vibol Pich" },
      ],
    },
    {
      id: 2,
      name: "Semester 2 — 2023",
      shortName: "2023-S2",
      courses: [
        { name: "Data Structures", code: "CS201", credits: 4, midterm: 80, final: 84, grade: "A-", teacher: "Dr. Sophea Lim" },
        { name: "Discrete Mathematics", code: "MATH201", credits: 3, midterm: 72, final: 68, grade: "B-", teacher: "Prof. Dara Kim" },
        { name: "Object-Oriented Programming", code: "CS202", credits: 3, midterm: 88, final: 90, grade: "A", teacher: "Mr. Kosal Tep" },
        { name: "Computer Networks Basics", code: "CS203", credits: 3, midterm: 65, final: 60, grade: "C+", teacher: "Dr. Mealea Sok" },
      ],
    },
    {
      id: 3,
      name: "Semester 1 — 2024",
      shortName: "2024-S1",
      courses: [
        { name: "Database Systems", code: "CS301", credits: 4, midterm: 84, final: 87, grade: "A-", teacher: "Dr. Vibol Pich" },
        { name: "Algorithms", code: "CS302", credits: 4, midterm: 76, final: 80, grade: "B+", teacher: "Dr. Sophea Lim" },
        { name: "Web Development", code: "CS303", credits: 3, midterm: 91, final: 94, grade: "A+", teacher: "Mr. Kosal Tep" },
        { name: "Operating Systems", code: "CS304", credits: 3, midterm: 70, final: 73, grade: "B", teacher: "Dr. Mealea Sok" },
      ],
    },
    {
      id: 4,
      name: "Semester 2 — 2024",
      shortName: "2024-S2",
      courses: [
        { name: "Software Engineering", code: "CS401", credits: 4, midterm: 88, final: 90, grade: "A", teacher: "Dr. Sophea Lim" },
        { name: "Machine Learning", code: "CS402", credits: 3, midterm: 82, final: 85, grade: "A-", teacher: "Prof. Rithya Heng" },
        { name: "Mobile Development", code: "CS403", credits: 3, midterm: 79, final: 83, grade: "B+", teacher: "Mr. Kosal Tep" },
        { name: "Final Year Project I", code: "CS490", credits: 4, midterm: 85, final: 87, grade: "A-", teacher: "Dr. Vibol Pich" },
      ],
    },
  ],
};
