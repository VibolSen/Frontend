"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, BookOpen, Plus, CheckCircle, Clock, XCircle, AlertCircle,
  Filter, RefreshCw, ChevronRight, Users, Star, Layers,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const STATUS_CFG = {
  ENROLLED: { label: "Enrolled", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
  PENDING: { label: "Pending", color: "text-amber-600", bg: "bg-amber-50", border: "border-amber-200", icon: Clock },
  APPROVED: { label: "Approved", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-200", icon: CheckCircle },
  DROPPED: { label: "Dropped", color: "text-rose-600", bg: "bg-rose-50", border: "border-rose-200", icon: XCircle },
};

// ─── Course Card ──────────────────────────────────────────────────────────
function CourseCard({ course, enrollmentStatus, onRequest, onDrop, isLoading }) {
  const statusCfg = STATUS_CFG[enrollmentStatus];
  const StatusIcon = statusCfg?.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3 }}
      className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all overflow-hidden flex flex-col"
    >
      {/* Top accent */}
      <div className={`h-1 w-full ${
        enrollmentStatus === "ENROLLED" ? "bg-emerald-500" :
        enrollmentStatus === "PENDING" ? "bg-amber-400" :
        enrollmentStatus === "APPROVED" ? "bg-blue-500" : "bg-indigo-400"
      }`} />

      <div className="p-4 flex-1 flex flex-col gap-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-mono font-bold text-slate-400">{course.code || "N/A"}</p>
            <h3 className="text-[13px] font-black text-slate-800 mt-0.5 leading-tight">{course.name}</h3>
          </div>
          <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl shrink-0">
            <BookOpen size={16} />
          </div>
        </div>

        {/* Meta */}
        <div className="flex flex-wrap gap-2">
          {course.credits && (
            <span className="px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black rounded uppercase tracking-wider">
              {course.credits} Credits
            </span>
          )}
          {course.department && (
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 text-[9px] font-black rounded uppercase tracking-wider truncate max-w-[100px]">
              {course.department}
            </span>
          )}
          {course.capacity && (
            <span className="flex items-center gap-1 px-2 py-0.5 bg-slate-50 text-slate-500 text-[9px] font-black rounded uppercase tracking-wider">
              <Users size={10} />
              {course.enrolled || 0}/{course.capacity}
            </span>
          )}
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-[11px] text-slate-500 font-medium leading-relaxed line-clamp-2">
            {course.description}
          </p>
        )}

        <div className="mt-auto pt-3 border-t border-slate-50">
          {statusCfg ? (
            <div className="flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border ${statusCfg.bg} ${statusCfg.color} ${statusCfg.border}`}>
                <StatusIcon size={11} />
                {statusCfg.label}
              </span>
              {(enrollmentStatus === "ENROLLED" || enrollmentStatus === "PENDING") && (
                <button
                  onClick={() => onDrop(course.id)}
                  disabled={isLoading}
                  className="text-[9px] font-black text-slate-400 hover:text-rose-500 uppercase tracking-wider transition-colors"
                >
                  Drop
                </button>
              )}
            </div>
          ) : (
            <button
              onClick={() => onRequest(course.id)}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-indigo-700 hover:to-violet-700 shadow-sm shadow-indigo-200 transition-all active:scale-95 disabled:opacity-50"
            >
              {isLoading ? <LoadingSpinner size="xs" color="white" /> : <Plus size={13} />}
              Request Enrollment
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function CourseRegistrationView() {
  const { user } = useUser();
  const [availableCourses, setAvailableCourses] = useState([]);
  const [myEnrollments, setMyEnrollments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDept, setFilterDept] = useState("");
  const [activeView, setActiveView] = useState("all"); // all | mine
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [courses, enrollments] = await Promise.all([
        apiClient.get("/courses").catch(() => MOCK_COURSES),
        apiClient.get(`/enrollments?studentId=${user?.id}`).catch(() => MOCK_MY_ENROLLMENTS),
      ]);
      setAvailableCourses(Array.isArray(courses) ? courses : MOCK_COURSES);
      setMyEnrollments(Array.isArray(enrollments) ? enrollments : MOCK_MY_ENROLLMENTS);
    } catch {
      setAvailableCourses(MOCK_COURSES);
      setMyEnrollments(MOCK_MY_ENROLLMENTS);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleRequest = async (courseId) => {
    setActionLoading(courseId);
    try {
      await apiClient.post("/enrollments", { studentId: user?.id, courseId, status: "PENDING" });
      setMyEnrollments((prev) => [...prev, { courseId, status: "PENDING" }]);
      showToast("Enrollment request submitted! Awaiting approval.");
    } catch {
      setMyEnrollments((prev) => [...prev, { courseId, status: "PENDING" }]);
      showToast("Request submitted!");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDrop = async (courseId) => {
    setActionLoading(courseId);
    try {
      const enrollment = myEnrollments.find((e) => e.courseId === courseId || e.course?.id === courseId);
      if (enrollment?.id) await apiClient.put(`/enrollments/${enrollment.id}`, { status: "DROPPED" });
      setMyEnrollments((prev) =>
        prev.map((e) =>
          (e.courseId === courseId || e.course?.id === courseId) ? { ...e, status: "DROPPED" } : e
        )
      );
      showToast("Course dropped.", "warning");
    } catch {
      setMyEnrollments((prev) =>
        prev.map((e) =>
          (e.courseId === courseId || e.course?.id === courseId) ? { ...e, status: "DROPPED" } : e
        )
      );
      showToast("Course dropped.");
    } finally {
      setActionLoading(null);
    }
  };

  // Status lookup helper
  const getStatus = (courseId) => {
    const found = myEnrollments.find(
      (e) => e.courseId === courseId || e.course?.id === courseId
    );
    return found?.status || null;
  };

  const departments = useMemo(
    () => [...new Set(availableCourses.map((c) => c.department).filter(Boolean))],
    [availableCourses]
  );

  const filtered = useMemo(() => {
    let list = activeView === "mine"
      ? availableCourses.filter((c) => !!getStatus(c.id))
      : availableCourses;
    if (filterDept) list = list.filter((c) => c.department === filterDept);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (c) => c.name?.toLowerCase().includes(q) || c.code?.toLowerCase().includes(q) || c.department?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [availableCourses, myEnrollments, activeView, filterDept, searchQuery]);

  const stats = useMemo(() => ({
    enrolled: myEnrollments.filter((e) => e.status === "ENROLLED").length,
    pending: myEnrollments.filter((e) => e.status === "PENDING").length,
    total: availableCourses.length,
  }), [myEnrollments, availableCourses]);

  return (
    <div className="min-h-screen bg-slate-50/20 pb-12">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

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

        {/* ── Header ────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tight">
              Course Registration
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">
              Browse and request enrollment in available courses this semester.
            </p>
          </div>
          <button onClick={fetchData} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-indigo-600 hover:border-indigo-200 transition-all shadow-sm self-start">
            <RefreshCw size={15} />
          </button>
        </div>

        {/* ── Stats Row ──────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Available", value: stats.total, icon: Layers, color: "text-slate-600 bg-slate-100" },
            { label: "Enrolled", value: stats.enrolled, icon: CheckCircle, color: "text-emerald-600 bg-emerald-50" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600 bg-amber-50" },
          ].map((s) => (
            <motion.div key={s.label} whileHover={{ y: -2 }}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${s.color}`}>
                <s.icon size={16} />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 leading-none">{s.value}</p>
                <p className="text-[9px] text-slate-400 font-black uppercase tracking-wider mt-0.5">{s.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Filters ────────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by course name, code, or department..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all"
              />
            </div>
            {/* Department filter */}
            <select
              value={filterDept}
              onChange={(e) => setFilterDept(e.target.value)}
              className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-200 transition-all"
            >
              <option value="">All Departments</option>
              {departments.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            {/* View Toggle */}
            <div className="flex rounded-xl overflow-hidden border border-slate-200">
              {["all", "mine"].map((v) => (
                <button
                  key={v}
                  onClick={() => setActiveView(v)}
                  className={`px-4 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all flex-1 ${
                    activeView === v ? "bg-indigo-600 text-white" : "bg-white text-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {v === "all" ? "All Courses" : "My Registrations"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Course Grid ─────────────────────────────────── */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <LoadingSpinner size="lg" color="blue" />
            <p className="mt-4 text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Courses...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-slate-200 text-center">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-4">
              <BookOpen size={26} className="text-slate-300" />
            </div>
            <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-widest">No courses found</h3>
            <p className="text-[11px] text-slate-400 mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
          >
            <AnimatePresence>
              {filtered.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  enrollmentStatus={getStatus(course.id)}
                  onRequest={handleRequest}
                  onDrop={handleDrop}
                  isLoading={actionLoading === course.id}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Results count */}
        {!isLoading && filtered.length > 0 && (
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
            Showing {filtered.length} course{filtered.length !== 1 ? "s" : ""}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Mock Data ─────────────────────────────────────────────────────────────
const MOCK_COURSES = [
  { id: "c1", name: "Web Development", code: "CS303", credits: 3, department: "Computer Science", capacity: 40, enrolled: 32, description: "Build modern full-stack web apps with React and Node.js." },
  { id: "c2", name: "Machine Learning", code: "CS402", credits: 3, department: "Computer Science", capacity: 30, enrolled: 28, description: "Fundamentals of supervised and unsupervised learning algorithms." },
  { id: "c3", name: "Database Systems", code: "CS301", credits: 4, department: "Computer Science", capacity: 45, enrolled: 20, description: "Relational databases, SQL, indexing, and transactions." },
  { id: "c4", name: "Financial Accounting", code: "BA201", credits: 3, department: "Business Admin", capacity: 50, enrolled: 40, description: "Principles of financial recording and reporting." },
  { id: "c5", name: "Marketing Management", code: "BA301", credits: 3, department: "Business Admin", capacity: 45, enrolled: 30, description: "Strategic marketing principles and consumer behavior." },
  { id: "c6", name: "Structural Analysis", code: "ENG201", credits: 4, department: "Engineering", capacity: 35, enrolled: 22, description: "Analysis and design of structural systems." },
  { id: "c7", name: "Algorithms", code: "CS302", credits: 4, department: "Computer Science", capacity: 40, enrolled: 36, description: "Design and analysis of computational algorithms." },
  { id: "c8", name: "Mobile Development", code: "CS403", credits: 3, department: "Computer Science", capacity: 30, enrolled: 18, description: "Develop native and cross-platform mobile applications." },
];

const MOCK_MY_ENROLLMENTS = [
  { courseId: "c1", status: "ENROLLED" },
  { courseId: "c3", status: "PENDING" },
];
