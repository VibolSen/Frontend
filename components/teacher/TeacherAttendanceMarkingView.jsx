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
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({}); // { studentId: status }
  const [sessionDate, setSessionDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(true);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch teacher's groups
  const fetchGroups = useCallback(async () => {
    if (!user?.id) return;
    setIsLoadingGroups(true);
    try {
      const data = await apiClient.get(`/teachers/my-groups?teacherId=${user.id}`);
      const list = Array.isArray(data) ? data : [];
      setGroups(list);
      if (list.length > 0) setSelectedGroup(list[0]);
    } catch (error) {
      console.error("Failed to fetch groups:", error);
      setGroups([]);
    } finally {
      setIsLoadingGroups(false);
    }
  }, [user]);

  useEffect(() => { fetchGroups(); }, [fetchGroups]);

  // Fetch courses for the selected group
  useEffect(() => {
    const fetchGroupCourses = async () => {
      if (!selectedGroup) {
        setCourses([]);
        setSelectedCourse(null);
        return;
      }
      try {
        const data = await apiClient.get(`/groups/${selectedGroup.id}`);
        const list = data.courses || [];
        setCourses(list);
        if (list.length > 0) {
          setSelectedCourse(list[0]);
        } else {
          setSelectedCourse(null);
        }
      } catch (error) {
        console.error("Failed to fetch group courses:", error);
      }
    };
    fetchGroupCourses();
  }, [selectedGroup]);

  // Fetch students for selected course and group
  const fetchStudents = useCallback(async () => {
    if (!selectedCourse || !selectedGroup) {
      setStudents([]);
      return;
    }
    setIsLoadingStudents(true);
    setAttendanceMap({});
    try {
      // Endpoint updated to accept groupId
      const data = await apiClient.get(`/courses/${selectedCourse.id}/students?groupId=${selectedGroup.id}`);
      const list = Array.isArray(data) ? data : [];
      setStudents(list);
      
      // Pre-fill existing attendance for the session date and group
      try {
        const existing = await apiClient.get(
          `/attendance/session?courseId=${selectedCourse.id}&groupId=${selectedGroup.id}&date=${sessionDate}`
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
  }, [selectedCourse, selectedGroup, sessionDate]);

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
    if (!selectedCourse || !selectedGroup) return;

    const records = students.map((s) => ({
      studentId: s.id,
      courseId: selectedCourse.id,
      groupId: selectedGroup.id, // Explicitly include groupId
      date: sessionDate,
      status: attendanceMap[s.id] || "ABSENT",
    }));

    setIsSaving(true);
    try {
      await apiClient.post("/attendance/session", { records });
      showToast(`Attendance saved for ${students.length} students!`);
    } catch (error) {
       console.error("Failed to save attendance:", error);
       showToast("Failed to save attendance", "error");
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
    <div className="min-h-screen bg-white pb-12">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">

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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Attendance Marking</h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">Track and manage student participation with precision.</p>
          </div>
          <div className="flex items-center gap-3">
             <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center shadow-sm border border-blue-100">
                <Users size={20} />
             </div>
          </div>
        </div>

        {/* ── Main Controls Grid ─────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Group Selector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <Users size={12} className="text-blue-500" />
                    Target Group
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedGroup?.id || ""}
                      onChange={(e) => {
                        const g = groups.find((x) => x.id === e.target.value);
                        setSelectedGroup(g || null);
                      }}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                    >
                      {isLoadingGroups ? (
                        <option>Loading groups...</option>
                      ) : groups.length > 0 ? (
                        groups.map((g) => (
                          <option key={g.id} value={g.id}>{g.name}</option>
                        ))
                      ) : (
                        <option>No groups assigned</option>
                      )}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-blue-500 transition-colors" />
                  </div>
                </div>

                {/* Course Selector */}
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    <BookOpen size={12} className="text-indigo-500" />
                    Active Course
                  </label>
                  <div className="relative group">
                    <select
                      value={selectedCourse?.id || ""}
                      onChange={(e) => {
                        const c = courses.find((x) => x.id === e.target.value);
                        setSelectedCourse(c || null);
                      }}
                      disabled={!selectedGroup || courses.length === 0}
                      className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {courses.length > 0 ? (
                        courses.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))
                      ) : (
                        <option>No courses for this group</option>
                      )}
                    </select>
                    <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-hover:text-indigo-500 transition-colors" />
                  </div>
                </div>
              </div>

              {/* Date & Search Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-slate-50">
                 <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <Clock size={12} className="text-amber-500" />
                      Session Date
                    </label>
                    <input
                      type="date"
                      value={sessionDate}
                      onChange={(e) => setSessionDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-amber-500/10 focus:border-amber-500 transition-all"
                    />
                 </div>
                 <div className="space-y-2">
                    <label className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                      <Search size={12} className="text-slate-400" />
                      Find student
                    </label>
                    <div className="relative group">
                      <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                      <input
                        type="text"
                        placeholder="Search by name or ID..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-[13px] font-bold text-slate-700 placeholder:text-slate-400 placeholder:font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all"
                      />
                    </div>
                 </div>
              </div>
            </div>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 px-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mark Group As:</span>
                <div className="flex gap-1.5">
                  {Object.entries(STATUS_CFG).map(([key, cfg]) => (
                    <button
                      key={key}
                      onClick={() => handleMarkAll(key)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${cfg.light} ${cfg.color} ${cfg.border} hover:shadow-md active:scale-95`}
                    >
                      All {cfg.label}
                    </button>
                  ))}
                </div>
              </div>
              
              <button
                onClick={handleSave}
                disabled={isSaving || stats.total === 0}
                className="flex items-center gap-2.5 px-6 py-3 bg-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:translate-y-0 disabled:shadow-none"
              >
                {isSaving ? <LoadingSpinner size="xs" color="white" /> : <Save size={16} />}
                Sync Attendance
              </button>
            </div>

            {/* Student Table Container */}
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              {isLoadingStudents ? (
                <div className="flex flex-col items-center justify-center py-24">
                  <LoadingSpinner size="lg" color="blue" />
                  <p className="mt-4 text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Retrieving Student Roster...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center">
                  <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-2xl flex items-center justify-center mb-4">
                     <Users size={32} />
                  </div>
                  <h3 className="text-sm font-black text-slate-800">No students found</h3>
                  <p className="text-[11px] text-slate-400 font-medium px-10">Try adjusting your filters or search query.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Information</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Presence Marking</th>
                        <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Badge</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
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

              {/* Progress Bar Footer */}
              {!isLoadingStudents && stats.total > 0 && (
                <div className="px-6 py-4 border-t border-slate-50 bg-slate-50/30">
                  <div className="flex items-center gap-4">
                    <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(stats.marked / stats.total) * 100}%` }}
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full"
                      />
                    </div>
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest shrink-0">
                      {stats.marked}/{stats.total} Marked ({Math.round((stats.marked / stats.total) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6">
               <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest mb-6 flex items-center gap-2">
                  <CheckSquare size={14} className="text-blue-500" />
                  Roster Summary
               </h3>
               <div className="space-y-4">
                  {[
                    { label: "Class Total", value: stats.total, color: "bg-slate-50 text-slate-700", border: "border-slate-100" },
                    { label: "Present Now", value: stats.present, color: "bg-emerald-50 text-emerald-700", border: "border-emerald-100" },
                    { label: "Marked Absent", value: stats.absent, color: "bg-rose-50 text-rose-700", border: "border-rose-100" },
                    { label: "Tardy/Late", value: stats.late, color: "bg-amber-50 text-amber-700", border: "border-amber-100" },
                  ].map((s) => (
                    <div key={s.label} className={`p-4 rounded-2xl border ${s.border} ${s.color} flex justify-between items-center group hover:scale-[1.02] transition-transform cursor-default`}>
                      <span className="text-[10px] font-black uppercase tracking-widest opacity-70">{s.label}</span>
                      <span className="text-xl font-black">{s.value}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] p-6 text-white shadow-xl shadow-blue-100">
               <div className="space-y-4">
                  <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl w-fit">
                    <AlertCircle size={20} />
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-widest">Marking Advice</h4>
                  <p className="text-[11px] text-blue-100 font-medium leading-relaxed">
                    Ensure all students are marked before sync. Students not marked will be counted as ABSENT by default to safeguard academic integrity.
                  </p>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
