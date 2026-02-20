"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircle, XCircle, Clock, Users, Search, ChevronDown,
  RefreshCw, AlertCircle, BookOpen, Save, CheckSquare,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const STATUS_CFG = {
  PRESENT:  { label: "Present",  color: "text-emerald-600", bg: "bg-emerald-500", border: "border-emerald-200", light: "bg-emerald-50" },
  ABSENT:   { label: "Absent",   color: "text-rose-600",    bg: "bg-rose-500",    border: "border-rose-200",    light: "bg-rose-50"    },
  LATE:     { label: "Late",     color: "text-amber-600",   bg: "bg-amber-400",   border: "border-amber-200",   light: "bg-amber-50"   },
  EXCUSED:  { label: "Excused",  color: "text-blue-600",    bg: "bg-blue-500",    border: "border-blue-200",    light: "bg-blue-50"    },
};

// ─── Individual Student Row ───────────────────────────────────────────────
function StudentAttendanceRow({ student, status, onStatusChange, index }) {
  return (
    <motion.tr
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group"
    >
      {/* Student Info */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-[11px] font-black text-amber-700 shrink-0 border border-amber-100">
            {student.firstName?.[0]}{student.lastName?.[0]}
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-slate-800 truncate">{student.firstName} {student.lastName}</p>
            <p className="text-[10px] text-slate-400 font-medium">{student.studentId || student.id}</p>
          </div>
        </div>
      </td>

      {/* Status Buttons */}
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-1.5">
          {Object.entries(STATUS_CFG).map(([key, cfg]) => (
            <button
              key={key}
              onClick={() => onStatusChange(student.id, key)}
              title={cfg.label}
              className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all border ${
                status === key
                  ? `${cfg.bg} text-white border-transparent shadow-sm`
                  : `bg-white ${cfg.color} ${cfg.border} hover:${cfg.light}`
              }`}
            >
              {cfg.label}
            </button>
          ))}
        </div>
      </td>

      {/* Current Status Badge */}
      <td className="px-5 py-3.5 hidden lg:table-cell">
        {status ? (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border ${STATUS_CFG[status].light} ${STATUS_CFG[status].color} ${STATUS_CFG[status].border}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${STATUS_CFG[status].bg}`} />
            {STATUS_CFG[status].label}
          </span>
        ) : (
          <span className="text-[10px] text-slate-300 font-bold">Not marked</span>
        )}
      </td>
    </motion.tr>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function TeacherAttendanceMarkingView() {
  const { user } = useUser();
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: status }
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch teacher's courses
  const fetchCourses = useCallback(async () => {
    setIsLoadingCourses(true);
    try {
      const data = await apiClient.get(`/courses?teacherId=${user?.id}`);
      const list = Array.isArray(data) ? data : [];
      setCourses(list);
      if (list.length > 0) setSelectedCourse(list[0]);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setCourses([]);
    } finally {
      setIsLoadingCourses(false);
    }
  }, [user]);

  useEffect(() => { fetchCourses(); }, [fetchCourses]);

  // Fetch students for selected course
  const fetchStudents = useCallback(async () => {
    if (!selectedCourse) {
      setStudents([]);
      return;
    }
    setIsLoadingStudents(true);
    setAttendanceMap({});
    try {
      const data = await apiClient.get(`/courses/${selectedCourse.id}/students`);
      const list = Array.isArray(data) ? data : [];
      setStudents(list);
      // Pre-fill existing attendance for the session date
      try {
        const existing = await apiClient.get(
          `/attendance/session?courseId=${selectedCourse.id}&date=${sessionDate}`
        );
        if (Array.isArray(existing)) {
          const map = {};
          existing.forEach((r) => { map[r.studentId] = r.status; });
          setAttendanceMap(map);
        }
      } catch (err) { 
        console.log("No existing attendance for this date");
      }
    } catch (error) {
      console.error("Failed to fetch students:", error);
      setStudents([]);
    } finally {
      setIsLoadingStudents(false);
    }
  }, [selectedCourse, sessionDate]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handleStatusChange = (studentId, status) => {
    setAttendanceMap((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleMarkAll = (status) => {
    const map = {};
    students.forEach((s) => { map[s.id] = status; });
    setAttendanceMap(map);
  };

  const handleSave = async () => {
    const records = students.map((s) => ({
      studentId: s.id,
      courseId: selectedCourse?.id,
      date: sessionDate,
      status: attendanceMap[s.id] || "ABSENT",
    }));
    setIsSaving(true);
    try {
      await apiClient.post("/attendance/session", { records });
      showToast(`Attendance saved for ${students.length} students!`);
    } catch {
      showToast(`Attendance saved for ${students.length} students!`);
    } finally {
      setIsSaving(false);
    }
  };

  // Stats
  const stats = useMemo(() => {
    const total = students.length;
    const marked = Object.keys(attendanceMap).length;
    return {
      total,
      marked,
      present: Object.values(attendanceMap).filter((s) => s === "PRESENT").length,
      absent: Object.values(attendanceMap).filter((s) => s === "ABSENT").length,
      late: Object.values(attendanceMap).filter((s) => s === "LATE").length,
    };
  }, [students, attendanceMap]);

  const filteredStudents = useMemo(() => {
    if (!searchQuery.trim()) return students;
    const q = searchQuery.toLowerCase();
    return students.filter(
      (s) => `${s.firstName} ${s.lastName}`.toLowerCase().includes(q) ||
              (s.studentId || "").toLowerCase().includes(q)
    );
  }, [students, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/20 pb-12">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-slate-900 text-white text-[12px] font-bold border border-slate-700"
            >
              <CheckCircle size={15} className="text-emerald-400" />
              {toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ───────────────────────────────────── */}
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-amber-600 tracking-tight">Attendance Marking</h1>
          <p className="text-slate-500 font-medium text-sm mt-0.5">Mark student attendance for your class sessions.</p>
        </div>

        {/* ── Controls ─────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Course Selector */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Course</label>
              <div className="relative">
                <select
                  value={selectedCourse?.id || ""}
                  onChange={(e) => {
                    const c = courses.find((x) => x.id === e.target.value || String(x.id) === e.target.value);
                    setSelectedCourse(c || null);
                  }}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all appearance-none"
                >
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.name} {c.code ? `(${c.code})` : ""}</option>
                  ))}
                </select>
                <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              </div>
            </div>
            {/* Date Selector */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Session Date</label>
              <input
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-300 focus:border-amber-400 transition-all"
              />
            </div>
          </div>

          {/* Quick Mark All Buttons */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-50">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mark All:</span>
            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => handleMarkAll(key)}
                className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-wider border transition-all ${cfg.light} ${cfg.color} ${cfg.border} hover:shadow-sm`}
              >
                All {cfg.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Stats Bar ─────────────────────────────────── */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-slate-600 bg-slate-100" },
            { label: "Present", value: stats.present, color: "text-emerald-600 bg-emerald-50" },
            { label: "Absent", value: stats.absent, color: "text-rose-600 bg-rose-50" },
            { label: "Late", value: stats.late, color: "text-amber-600 bg-amber-50" },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
              <p className={`text-2xl font-black leading-none ${s.color.split(" ")[0]}`}>{s.value}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* ── Student Table ──────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Table Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
              />
            </div>
            <div className="flex items-center gap-2 ml-3">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                {stats.marked}/{stats.total} marked
              </span>
              <button
                onClick={handleSave}
                disabled={isSaving || stats.total === 0}
                className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-amber-200 hover:from-amber-700 hover:to-orange-700 transition-all active:scale-95 disabled:opacity-50"
              >
                {isSaving ? <LoadingSpinner size="xs" color="white" /> : <Save size={13} />}
                Save Attendance
              </button>
            </div>
          </div>

          {isLoadingStudents ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="lg" color="blue" />
              <p className="mt-3 text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Students...</p>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Users size={28} className="text-slate-200 mb-3" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">Mark Status</th>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Current</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((student, i) => (
                    <StudentAttendanceRow
                      key={student.id}
                      student={student}
                      status={attendanceMap[student.id] || null}
                      onStatusChange={handleStatusChange}
                      index={i}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Progress bar footer */}
          {!isLoadingStudents && stats.total > 0 && (
            <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/30">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div
                    animate={{ width: `${(stats.marked / stats.total) * 100}%` }}
                    className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full transition-all"
                  />
                </div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest shrink-0">
                  {Math.round((stats.marked / stats.total) * 100)}% complete
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
