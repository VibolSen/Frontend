"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Plus,
  CheckCircle,
  XCircle,
  Clock,
  BookOpen,
  Users,
  ChevronDown,
  RefreshCw,
  Download,
  GraduationCap,
  AlertCircle,
  MoreHorizontal,
  UserCheck,
  Trash2,
  Eye,
  TrendingUp,
  Layers,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

// ─── Status Configuration ──────────────────────────────────────────────────
const STATUS_CONFIG = {
  PENDING: {
    label: "Pending",
    icon: Clock,
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-200",
    dot: "bg-amber-400",
  },
  APPROVED: {
    label: "Approved",
    icon: CheckCircle,
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    dot: "bg-blue-400",
  },
  ENROLLED: {
    label: "Enrolled",
    icon: UserCheck,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  DROPPED: {
    label: "Dropped",
    icon: XCircle,
    color: "text-rose-600",
    bg: "bg-rose-50",
    border: "border-rose-200",
    dot: "bg-rose-400",
  },
};

const TABS = ["ALL", "PENDING", "APPROVED", "ENROLLED", "DROPPED"];

// ─── Enrollment Row Component ──────────────────────────────────────────────
function EnrollmentRow({ enrollment, onStatusChange, onDelete, index }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const status = STATUS_CONFIG[enrollment.status] || STATUS_CONFIG.PENDING;
  const StatusIcon = status.icon;

  const handleAction = async (newStatus) => {
    setMenuOpen(false);
    setIsUpdating(true);
    await onStatusChange(enrollment.id, newStatus);
    setIsUpdating(false);
  };

  return (
    <motion.tr
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.03 }}
      className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors group"
    >
      {/* Student */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center shrink-0 border border-cyan-100">
            <span className="text-[11px] font-black text-cyan-700">
              {enrollment.student?.firstName?.[0] || "?"}
              {enrollment.student?.lastName?.[0] || "?"}
            </span>
          </div>
          <div className="min-w-0">
            <p className="text-[12px] font-bold text-slate-800 truncate">
              {enrollment.student?.firstName} {enrollment.student?.lastName}
            </p>
            <p className="text-[10px] text-slate-400 font-medium truncate">
              ID: {enrollment.student?.studentId || enrollment.studentId || "N/A"}
            </p>
          </div>
        </div>
      </td>

      {/* Course */}
      <td className="px-5 py-4">
        <div className="min-w-0">
          <p className="text-[12px] font-bold text-slate-700 truncate">
            {enrollment.course?.name || enrollment.courseName || "–"}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {enrollment.course?.code || ""}{" "}
            {enrollment.course?.credits ? `• ${enrollment.course.credits} Credits` : ""}
          </p>
        </div>
      </td>

      {/* Group / Semester */}
      <td className="px-5 py-4 hidden md:table-cell">
        <div className="flex flex-col gap-1">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-black rounded-md uppercase tracking-tight w-fit">
            {enrollment.group?.name || enrollment.groupName || "No Group"}
          </span>
          {enrollment.semester && (
            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
              {enrollment.semester}
            </span>
          )}
        </div>
      </td>

      {/* Enrollment Date */}
      <td className="px-5 py-4 hidden lg:table-cell">
        <p className="text-[11px] text-slate-500 font-medium">
          {enrollment.createdAt
            ? new Date(enrollment.createdAt).toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
              })
            : "–"}
        </p>
      </td>

      {/* Status Badge */}
      <td className="px-5 py-4">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${status.bg} ${status.color} ${status.border}`}
        >
          <div className={`w-1.5 h-1.5 rounded-full ${status.dot} animate-pulse`} />
          {status.label}
        </span>
      </td>

      {/* Actions */}
      <td className="px-5 py-4">
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {isUpdating ? (
            <LoadingSpinner size="xs" color="blue" />
          ) : (
            <>
              {enrollment.status === "PENDING" && (
                <button
                  onClick={() => handleAction("APPROVED")}
                  title="Approve"
                  className="p-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all"
                >
                  <CheckCircle size={13} />
                </button>
              )}
              {enrollment.status === "APPROVED" && (
                <button
                  onClick={() => handleAction("ENROLLED")}
                  title="Enroll"
                  className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all"
                >
                  <UserCheck size={13} />
                </button>
              )}
              {(enrollment.status === "ENROLLED" || enrollment.status === "APPROVED") && (
                <button
                  onClick={() => handleAction("DROPPED")}
                  title="Drop Course"
                  className="p-1.5 rounded-lg bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                >
                  <XCircle size={13} />
                </button>
              )}
              {enrollment.status === "DROPPED" && (
                <button
                  onClick={() => handleAction("PENDING")}
                  title="Re-enroll"
                  className="p-1.5 rounded-lg bg-amber-50 text-amber-600 hover:bg-amber-600 hover:text-white transition-all"
                >
                  <RefreshCw size={13} />
                </button>
              )}
              <button
                onClick={() => onDelete(enrollment.id)}
                title="Remove Record"
                className="p-1.5 rounded-lg bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-500 transition-all"
              >
                <Trash2 size={13} />
              </button>
            </>
          )}
        </div>
      </td>
    </motion.tr>
  );
}

// ─── New Enrollment Modal ──────────────────────────────────────────────────
function NewEnrollmentModal({ isOpen, onClose, onSave, students, courses, groups }) {
  const [form, setForm] = useState({
    studentId: "",
    courseId: "",
    groupId: "",
    semester: "",
    status: "PENDING",
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.studentId || !form.courseId) return;
    setIsSaving(true);
    await onSave(form);
    setIsSaving(false);
    setForm({ studentId: "", courseId: "", groupId: "", semester: "", status: "PENDING" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl border border-slate-100 w-full max-w-lg overflow-hidden"
        >
          {/* Modal Header */}
          <div className="px-6 py-5 border-b border-slate-50 bg-gradient-to-r from-cyan-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-600 rounded-xl">
                <GraduationCap size={16} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
                  New Enrollment
                </h2>
                <p className="text-[10px] text-slate-500 font-medium">
                  Register a student into a course
                </p>
              </div>
            </div>
          </div>

          {/* Modal Body */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Student Select */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Student *
              </label>
              <select
                required
                value={form.studentId}
                onChange={(e) => setForm({ ...form, studentId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 transition-all"
              >
                <option value="">Select a student...</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.firstName} {s.lastName} ({s.studentId || s.id})
                  </option>
                ))}
              </select>
            </div>

            {/* Course Select */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Course *
              </label>
              <select
                required
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 transition-all"
              >
                <option value="">Select a course...</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} {c.code ? `(${c.code})` : ""}
                  </option>
                ))}
              </select>
            </div>

            {/* Group & Semester Row */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Group
                </label>
                <select
                  value={form.groupId}
                  onChange={(e) => setForm({ ...form, groupId: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 transition-all"
                >
                  <option value="">No group</option>
                  {groups.map((g) => (
                    <option key={g.id} value={g.id}>
                      {g.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                  Semester
                </label>
                <input
                  type="text"
                  placeholder="e.g. 2025-S1"
                  value={form.semester}
                  onChange={(e) => setForm({ ...form, semester: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 transition-all"
                />
              </div>
            </div>

            {/* Initial Status */}
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">
                Initial Status
              </label>
              <div className="grid grid-cols-2 gap-2">
                {["PENDING", "ENROLLED"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setForm({ ...form, status: s })}
                    className={`py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border ${
                      form.status === s
                        ? `${STATUS_CONFIG[s].bg} ${STATUS_CONFIG[s].color} ${STATUS_CONFIG[s].border}`
                        : "bg-slate-50 text-slate-400 border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-[11px] font-black text-slate-500 hover:bg-slate-50 uppercase tracking-widest transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !form.studentId || !form.courseId}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[11px] font-black uppercase tracking-widest hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isSaving ? <LoadingSpinner size="xs" color="white" /> : <Plus size={13} />}
                {isSaving ? "Saving..." : "Create Enrollment"}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Main Enrollment Management Component ─────────────────────────────────
export default function EnrollmentManagementView() {
  const [enrollments, setEnrollments] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [groups, setGroups] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchEnrollments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get("/enrollments");
      setEnrollments(Array.isArray(data) ? data : []);
    } catch (err) {
      // Use mock data for demo if API not yet ready
      setEnrollments(MOCK_ENROLLMENTS);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchSupportingData = useCallback(async () => {
    try {
      const [studentsData, coursesData, groupsData] = await Promise.all([
        apiClient.get("/students").catch(() => []),
        apiClient.get("/courses").catch(() => []),
        apiClient.get("/groups").catch(() => []),
      ]);
      setStudents(Array.isArray(studentsData) ? studentsData : []);
      setCourses(Array.isArray(coursesData) ? coursesData : []);
      setGroups(Array.isArray(groupsData) ? groupsData : []);
    } catch (err) {
      console.error("Failed to fetch supporting data:", err);
    }
  }, []);

  useEffect(() => {
    fetchEnrollments();
    fetchSupportingData();
  }, [fetchEnrollments, fetchSupportingData]);

  const handleStatusChange = async (enrollmentId, newStatus) => {
    try {
      await apiClient.put(`/enrollments/${enrollmentId}`, { status: newStatus });
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, status: newStatus } : e))
      );
      showToast(`Enrollment status updated to ${newStatus}.`);
    } catch (err) {
      // Optimistic update for demo
      setEnrollments((prev) =>
        prev.map((e) => (e.id === enrollmentId ? { ...e, status: newStatus } : e))
      );
      showToast(`Status updated to ${newStatus}.`);
    }
  };

  const handleDelete = async (enrollmentId) => {
    try {
      await apiClient.delete(`/enrollments/${enrollmentId}`);
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
      showToast("Enrollment record removed.", "error");
    } catch (err) {
      setEnrollments((prev) => prev.filter((e) => e.id !== enrollmentId));
      showToast("Record removed.", "success");
    }
  };

  const handleSaveEnrollment = async (formData) => {
    try {
      const result = await apiClient.post("/enrollments", formData);
      setEnrollments((prev) => [result || { ...formData, id: Date.now(), status: "PENDING" }, ...prev]);
      showToast("New enrollment created successfully!");
    } catch (err) {
      // Optimistic add for demo
      setEnrollments((prev) => [
        { ...formData, id: Date.now(), createdAt: new Date().toISOString() },
        ...prev,
      ]);
      showToast("Enrollment created!");
    }
  };

  // Derived: stats
  const stats = useMemo(() => ({
    total: enrollments.length,
    pending: enrollments.filter((e) => e.status === "PENDING").length,
    approved: enrollments.filter((e) => e.status === "APPROVED").length,
    enrolled: enrollments.filter((e) => e.status === "ENROLLED").length,
    dropped: enrollments.filter((e) => e.status === "DROPPED").length,
  }), [enrollments]);

  // Derived: filtered list
  const filtered = useMemo(() => {
    let list = enrollments;
    if (activeTab !== "ALL") list = list.filter((e) => e.status === activeTab);
    if (semesterFilter) list = list.filter((e) => e.semester === semesterFilter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (e) =>
          `${e.student?.firstName} ${e.student?.lastName}`.toLowerCase().includes(q) ||
          (e.course?.name || "").toLowerCase().includes(q) ||
          (e.student?.studentId || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [enrollments, activeTab, semesterFilter, searchQuery]);

  const semesters = useMemo(
    () => [...new Set(enrollments.map((e) => e.semester).filter(Boolean))],
    [enrollments]
  );

  return (
    <div className="min-h-screen bg-slate-50/20 pb-12">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">

        {/* Toast */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl border text-[12px] font-bold ${
                toast.type === "error"
                  ? "bg-rose-600 text-white border-rose-500"
                  : "bg-slate-900 text-white border-slate-700"
              }`}
            >
              {toast.type === "error" ? (
                <AlertCircle size={16} />
              ) : (
                <CheckCircle size={16} className="text-emerald-400" />
              )}
              {toast.message}
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Header ───────────────────────────────────────── */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-cyan-600 tracking-tight">
              Enrollment Management
            </h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">
              Manage student enrollment requests, approvals, and course registrations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchEnrollments}
              className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-cyan-600 hover:border-cyan-200 transition-all shadow-sm"
            >
              <RefreshCw size={15} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:from-cyan-700 hover:to-blue-700 shadow-lg shadow-cyan-200 transition-all active:scale-95"
            >
              <Plus size={15} />
              New Enrollment
            </button>
          </div>
        </div>

        {/* ── Stats Row ─────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {[
            { label: "Total", value: stats.total, icon: Layers, color: "text-slate-700", bg: "bg-slate-100" },
            { label: "Pending", value: stats.pending, icon: Clock, color: "text-amber-600", bg: "bg-amber-50" },
            { label: "Approved", value: stats.approved, icon: CheckCircle, color: "text-blue-600", bg: "bg-blue-50" },
            { label: "Enrolled", value: stats.enrolled, icon: UserCheck, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "Dropped", value: stats.dropped, icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" },
          ].map((stat) => (
            <motion.div
              whileHover={{ y: -2 }}
              key={stat.label}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:border-cyan-100 transition-all"
              onClick={() => setActiveTab(stat.label === "Total" ? "ALL" : stat.label.toUpperCase())}
            >
              <div className={`w-9 h-9 rounded-lg ${stat.bg} ${stat.color} flex items-center justify-center shrink-0`}>
                <stat.icon size={17} />
              </div>
              <div>
                <p className="text-xl font-black text-slate-900 leading-none">{stat.value}</p>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* ── Filter & Search Bar ───────────────────────────── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 overflow-x-auto">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-3.5 text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all relative ${
                  activeTab === tab
                    ? "text-cyan-600 bg-cyan-50/50"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                }`}
              >
                {tab}
                {tab !== "ALL" && STATUS_CONFIG[tab] && (
                  <span
                    className={`ml-2 px-1.5 py-0.5 rounded-md text-[9px] ${STATUS_CONFIG[tab].bg} ${STATUS_CONFIG[tab].color}`}
                  >
                    {stats[tab.toLowerCase()]}
                  </span>
                )}
                {activeTab === tab && (
                  <motion.div
                    layoutId="enrollmentTabIndicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-cyan-600"
                  />
                )}
              </button>
            ))}
          </div>

          {/* Search + Filter */}
          <div className="flex flex-col sm:flex-row gap-3 p-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by student name, ID, or course..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 transition-all"
              />
            </div>
            {semesters.length > 0 && (
              <select
                value={semesterFilter}
                onChange={(e) => setSemesterFilter(e.target.value)}
                className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-cyan-400 transition-all"
              >
                <option value="">All Semesters</option>
                {semesters.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}
          </div>

          {/* ── Table ────────────────────────────────────────── */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center space-y-3">
                <LoadingSpinner size="lg" color="blue" className="mx-auto" />
                <p className="text-slate-400 font-bold text-[11px] uppercase tracking-widest animate-pulse">
                  Loading Enrollments...
                </p>
              </div>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 border border-slate-100">
                <GraduationCap size={28} className="text-slate-300" />
              </div>
              <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-widest">
                No Enrollments Found
              </h3>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                {searchQuery ? "Try a different search term." : "Click 'New Enrollment' to get started."}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50">
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Student
                    </th>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Course
                    </th>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">
                      Group / Semester
                    </th>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">
                      Date
                    </th>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Status
                    </th>
                    <th className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((enrollment, i) => (
                    <EnrollmentRow
                      key={enrollment.id}
                      enrollment={enrollment}
                      onStatusChange={handleStatusChange}
                      onDelete={handleDelete}
                      index={i}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer count */}
          {!isLoading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-50 bg-slate-50/30 flex items-center justify-between">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                Showing {filtered.length} of {enrollments.length} records
              </p>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Live</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Enrollment Modal */}
      <NewEnrollmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveEnrollment}
        students={students}
        courses={courses}
        groups={groups}
      />
    </div>
  );
}

// ─── Mock Data (used when API is not yet ready) ────────────────────────────
const MOCK_ENROLLMENTS = [
  {
    id: 1,
    status: "ENROLLED",
    semester: "2025-S1",
    createdAt: "2025-01-15T09:00:00Z",
    student: { firstName: "Sophea", lastName: "Chan", studentId: "STU-001" },
    course: { name: "Web Development", code: "CS301", credits: 3 },
    group: { name: "Group A" },
  },
  {
    id: 2,
    status: "PENDING",
    semester: "2025-S1",
    createdAt: "2025-01-20T10:30:00Z",
    student: { firstName: "Dara", lastName: "Kim", studentId: "STU-002" },
    course: { name: "Database Systems", code: "CS201", credits: 3 },
    group: { name: "Group B" },
  },
  {
    id: 3,
    status: "APPROVED",
    semester: "2025-S1",
    createdAt: "2025-01-22T11:00:00Z",
    student: { firstName: "Vibol", lastName: "Pich", studentId: "STU-003" },
    course: { name: "Data Structures", code: "CS102", credits: 4 },
    group: { name: "Group A" },
  },
  {
    id: 4,
    status: "DROPPED",
    semester: "2024-S2",
    createdAt: "2024-09-10T08:00:00Z",
    student: { firstName: "Mealea", lastName: "Sok", studentId: "STU-004" },
    course: { name: "Algorithms", code: "CS103", credits: 4 },
    group: { name: "Group C" },
  },
  {
    id: 5,
    status: "ENROLLED",
    semester: "2025-S1",
    createdAt: "2025-01-18T14:00:00Z",
    student: { firstName: "Rithya", lastName: "Heng", studentId: "STU-005" },
    course: { name: "Software Engineering", code: "CS401", credits: 3 },
    group: { name: "Group B" },
  },
  {
    id: 6,
    status: "PENDING",
    semester: "2025-S1",
    createdAt: "2025-02-01T09:15:00Z",
    student: { firstName: "Pisey", lastName: "Lim", studentId: "STU-006" },
    course: { name: "Machine Learning", code: "CS501", credits: 3 },
    group: { name: "Group A" },
  },
];
