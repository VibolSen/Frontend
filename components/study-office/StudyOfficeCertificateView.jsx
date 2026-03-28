"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Award,
  Search,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Users,
  Tag,
  Wand2,
  ClipboardList,
  History,
  Edit,
  X,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import CertificateTable from "@/components/certificate-management/CertificateTable";
import CertificateModal from "@/components/certificate-management/CertificateModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";

/* ─── tiny toast helper ─── */
function useToast() {
  const [toast, setToast] = useState(null);
  const show = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };
  return { toast, show };
}

export default function StudyOfficeCertificateView() {
  /* ── tab ── */
  const [activeTab, setActiveTab] = useState("issue"); // "issue" | "history"

  /* ── shared data ── */
  const [courses, setCourses] = useState([]);
  const [allCertificates, setAllCertificates] = useState([]);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const { toast, show: showToast } = useToast();

  /* ── issue-tab state ── */
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [groups, setGroups] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [isCourseLoading, setIsCourseLoading] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [grades, setGrades] = useState({});
  const [issueSearch, setIssueSearch] = useState("");

  /* ── history-tab state ── */
  const [historySearch, setHistorySearch] = useState("");
  const [sortField, setSortField] = useState("recipient");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterCourse, setFilterCourse] = useState("");
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isErrorOpen, setIsErrorOpen] = useState(false);

  /* ────────────────────────────────────
     Data fetching
  ──────────────────────────────────── */
  const fetchCourses = useCallback(async () => {
    try {
      const data = await apiClient.get("/courses");
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    }
  }, []);

  const fetchCertificates = useCallback(async () => {
    try {
      const data = await apiClient.get("/certificates");
      setAllCertificates(data || []);
    } catch (err) {
      console.error("Failed to fetch certificates:", err);
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchCourses(), fetchCertificates()]).finally(() =>
      setIsPageLoading(false)
    );
  }, [fetchCourses, fetchCertificates]);

  const fetchCourseDetail = async (course) => {
    setIsCourseLoading(true);
    try {
      const detail = await apiClient.get(`/courses/${course.id}`);
      setGroups(
        (detail.groups || []).map((g) => ({
          id: g.id,
          name: g.name,
          students: g.students || [],
        }))
      );
      const allEnrollments = await apiClient.get(`/enrollments`);
      const courseEnrollments = (allEnrollments || []).filter(
        (en) => en.courseId === course.id
      );
      setEnrollments(courseEnrollments);
      const initGrades = {};
      courseEnrollments.forEach((en) => {
        if (en.finalGrade !== null && en.finalGrade !== undefined)
          initGrades[en.studentId] = en.finalGrade;
      });
      setGrades(initGrades);
    } catch (err) {
      showToast("Failed to load course data.", "error");
    } finally {
      setIsCourseLoading(false);
    }
  };

  /* ────────────────────────────────────
     Issue-tab handlers
  ──────────────────────────────────── */
  const handleCourseSelect = (course) => {
    setSelectedCourse(course);
    fetchCourseDetail(course);
  };

  const handleBack = () => {
    setSelectedCourse(null);
    setGroups([]);
    setEnrollments([]);
    setGrades({});
  };

  const getEnrollment = (studentId) =>
    enrollments.find((en) => en.studentId === studentId);

  const handleGradeChange = (studentId, value) =>
    setGrades((prev) => ({ ...prev, [studentId]: value }));

  const handleSaveGrade = async (student) => {
    const grade = grades[student.id];
    if (grade === undefined || grade === "") {
      showToast("Please enter a score first.", "error");
      return;
    }
    try {
      await apiClient.post("/enrollments/set-grade", {
        studentId: student.id,
        courseId: selectedCourse.id,
        finalGrade: grade,
      });
      showToast(`Score saved for ${student.firstName} ${student.lastName}`);
      fetchCourseDetail(selectedCourse);
    } catch (err) {
      showToast(`Failed to save: ${err.message}`, "error");
    }
  };

  const handleIssueCertificate = async (student) => {
    try {
      await apiClient.post("/certificates", {
        recipient: `${student.firstName} ${student.lastName}`,
        courseId: selectedCourse.id,
        studentId: student.id,
        issueDate: new Date().toISOString(),
      });
      showToast(
        `🎓 Certificate issued for ${student.firstName} ${student.lastName}!`
      );
      fetchCertificates(); // refresh history tab
    } catch (err) {
      showToast(`Failed to issue certificate: ${err.message}`, "error");
    }
  };

  const handleFetchSuggestions = async (group) => {
    setIsActionLoading(true);
    let updated = { ...grades };
    let count = 0;
    try {
      for (const student of group.students) {
        const enrollment = getEnrollment(student.id);
        if (enrollment?.isCompleted || updated[student.id] !== undefined)
          continue;
        const res = await apiClient.get(
          `/enrollments/auto-score/${selectedCourse.id}/${student.id}`
        );
        if (res?.suggestedScore !== undefined) {
          updated[student.id] = res.suggestedScore;
          count++;
        }
      }
      setGrades(updated);
      showToast(
        count > 0
          ? `✨ Auto-filled ${count} suggested score(s)`
          : "No empty pending scores to auto-fill.",
        count > 0 ? "success" : "error"
      );
    } catch (err) {
      showToast(`Failed to fetch suggestions: ${err.message}`, "error");
    } finally {
      setIsActionLoading(false);
    }
  };

  /* ────────────────────────────────────
     History-tab handlers
  ──────────────────────────────────── */
  const getCourseName = (courseId) => {
    const c = courses.find((c) => c.id === courseId);
    return c ? c.name : "Unknown Course";
  };

  const handleEditCertificate = (cert) => {
    setEditingCertificate({ ...cert, course: cert.course?.id || cert.courseId });
    setShowEditModal(true);
  };

  const handleSubmitEdit = async (formData) => {
    setIsHistoryLoading(true);
    try {
      await apiClient.put(`/certificates/${editingCertificate.id}`, {
        recipient: formData.recipient,
        courseId: formData.course,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        studentId: formData.studentId,
      });
      setShowEditModal(false);
      setEditingCertificate(null);
      await fetchCertificates();
      setSuccessMessage("Certificate updated successfully!");
      setIsSuccessOpen(true);
    } catch (err) {
      setErrorMessage(`Failed to update: ${err.message}`);
      setIsErrorOpen(true);
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const sortedCertificates = [...allCertificates].sort((a, b) => {
    if (sortField === "course") {
      const an = getCourseName(a.course?.id);
      const bn = getCourseName(b.course?.id);
      return sortOrder === "asc" ? an.localeCompare(bn) : bn.localeCompare(an);
    }
    const av = a[sortField] || "";
    const bv = b[sortField] || "";
    return sortOrder === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
  });

  const filteredCertificates = sortedCertificates.filter((cert) => {
    const matchesSearch =
      cert.recipient.toLowerCase().includes(historySearch.toLowerCase()) ||
      getCourseName(cert.course?.id)
        .toLowerCase()
        .includes(historySearch.toLowerCase());
    const matchesCourse =
      !filterCourse || cert.course?.id === filterCourse;
    return matchesSearch && matchesCourse;
  });

  /* ── derived ── */
  const filteredIssueCourses = courses.filter((c) =>
    c.name.toLowerCase().includes(issueSearch.toLowerCase())
  );
  const allStudents = Array.from(
    new Map(
      groups.flatMap((g) => g.students).map((s) => [s.id, s])
    ).values()
  );

  /* ────────────────────────────────────
     RENDER
  ──────────────────────────────────── */
  if (isPageLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <LoadingSpinner size="lg" color="blue" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
          Loading Academic Records...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Global Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-xl text-sm font-bold ${
              toast.type === "error"
                ? "bg-rose-600 text-white"
                : "bg-indigo-600 text-white"
            }`}
          >
            {toast.message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">
            Certificate Management
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Issue academic credentials, manage student certifications &amp; view
            credential history.
          </p>
        </div>

        {/* Badge: cert count */}
        <div className="flex items-center gap-2.5 px-4 py-2 bg-transparent border border-slate-200 rounded-xl shadow-sm border-l-4 border-l-indigo-500">
          <Award size={14} className="text-indigo-500" />
          <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
            {allCertificates.length} Certificates Issued
          </span>
        </div>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("issue")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === "issue"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <ClipboardList size={13} />
          Issue Certificates
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-5 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all ${
            activeTab === "history"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
              : "bg-slate-100 text-slate-500 hover:bg-slate-200"
          }`}
        >
          <History size={13} />
          Certificate History
          {allCertificates.length > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-[9px]">
              {allCertificates.length}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════
          TAB 1: ISSUE CERTIFICATES
      ═══════════════════════════════ */}
      <AnimatePresence mode="wait">
        {activeTab === "issue" && (
          <motion.div
            key="issue-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {!selectedCourse ? (
              /* Course Grid */
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
                  <Search className="text-slate-400 shrink-0" size={18} />
                  <input
                    type="text"
                    placeholder="Search by course name..."
                    className="flex-1 text-sm font-medium outline-none bg-transparent"
                    value={issueSearch}
                    onChange={(e) => setIssueSearch(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredIssueCourses.map((course) => (
                    <div
                      key={course.id}
                      onClick={() => handleCourseSelect(course)}
                      className="group bg-white p-5 rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer relative overflow-hidden"
                    >
                      <div className="relative z-10 flex flex-col gap-4">
                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <h3 className="font-black text-slate-800 text-lg leading-tight">
                            {course.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            <span className="flex items-center gap-1">
                              <Tag size={10} /> {course._count?.groups || 0} Groups
                            </span>
                            <span className="flex items-center gap-1">
                              <Users size={10} /> {course._count?.enrollments || 0} Enrolled
                            </span>
                          </div>
                        </div>
                        <div className="pt-2 border-t border-slate-50 flex items-center">
                          <span className="text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                            Manage <ChevronRight size={14} />
                          </span>
                        </div>
                      </div>
                      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <GraduationCap size={80} />
                      </div>
                    </div>
                  ))}

                  {filteredIssueCourses.length === 0 && (
                    <div className="col-span-full flex flex-col items-center py-20 text-slate-400">
                      <BookOpen size={36} className="mb-3 opacity-30" />
                      <p className="text-sm font-bold">No courses found</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* Course Detail */
              <motion.div
                key="detail"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-6"
              >
                {/* Hero bar */}
                <div className="bg-gradient-to-r from-indigo-700 via-indigo-600 to-blue-700 rounded-[2rem] p-6 text-white flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl shadow-indigo-200/40">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 bg-white/20 rounded-2xl flex items-center justify-center border border-white/10 backdrop-blur-md">
                      <Award className="text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black tracking-tight text-white">
                        {selectedCourse.name}
                      </h2>
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-100/80">
                        Cohort Completion Management
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-center">
                      <p className="text-sm font-black leading-none">{groups.length}</p>
                      <p className="text-[8px] font-bold text-white/40 uppercase mt-1">Groups</p>
                    </div>
                    <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/5 text-center">
                      <p className="text-sm font-black leading-none">{allStudents.length}</p>
                      <p className="text-[8px] font-bold text-white/40 uppercase mt-1">Students</p>
                    </div>
                    <div className="px-4 py-2 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-center">
                      <p className="text-sm font-black text-emerald-400 leading-none">
                        {enrollments.filter((e) => e.isCompleted).length}
                      </p>
                      <p className="text-[8px] font-bold text-white/60 uppercase mt-1">Completed</p>
                    </div>
                    <button
                      onClick={handleBack}
                      className="ml-2 p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors text-white"
                      title="Back to courses"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>

                {isCourseLoading ? (
                  <div className="flex items-center justify-center py-20">
                    <LoadingSpinner size="lg" color="blue" />
                  </div>
                ) : groups.length === 0 ? (
                  <div className="p-12 text-center bg-white rounded-[2rem] border border-slate-100">
                    <Users className="mx-auto text-slate-200 mb-3" size={48} />
                    <p className="text-slate-500 font-bold">No groups assigned to this course yet.</p>
                    <p className="text-slate-400 text-xs mt-1">
                      Assign student groups to this course in Group Management.
                    </p>
                  </div>
                ) : (
                  groups.map((group) => (
                    <div
                      key={group.id}
                      className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden"
                    >
                      <div className="px-6 py-4 bg-indigo-50 border-b border-indigo-100 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-200">
                            <Users size={18} />
                          </div>
                          <div>
                            <h3 className="font-black text-indigo-800 tracking-tight">{group.name}</h3>
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                              {group.students.length} Student(s)
                            </p>
                          </div>
                        </div>
                        {group.students.length > 0 && (
                          <button
                            onClick={() => handleFetchSuggestions(group)}
                            disabled={isActionLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:border-indigo-300 transition-all disabled:opacity-50"
                          >
                            <Wand2 size={12} /> Auto-Fill Suggestions
                          </button>
                        )}
                      </div>

                      {group.students.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          No students in this group.
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Final Score (0–100)</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Status</th>
                                <th className="px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {group.students.map((student) => {
                                const enrollment = getEnrollment(student.id);
                                const isCompleted = enrollment?.isCompleted || false;
                                const existingGrade = enrollment?.finalGrade;
                                const currentInput = grades[student.id];
                                return (
                                  <tr
                                    key={student.id}
                                    className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors group/row"
                                  >
                                    <td className="px-6 py-4">
                                      <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500 font-black text-sm group-hover/row:bg-indigo-50 group-hover/row:text-indigo-600 transition-all">
                                          {student.firstName?.[0]}{student.lastName?.[0]}
                                        </div>
                                        <div>
                                          <p className="font-black text-slate-800 leading-tight text-sm">
                                            {student.firstName} {student.lastName}
                                          </p>
                                          <p className="text-[10px] font-bold text-slate-400 mt-0.5">{student.email}</p>
                                        </div>
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex justify-center">
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          disabled={isCompleted}
                                          placeholder={
                                            existingGrade !== undefined && existingGrade !== null
                                              ? String(existingGrade)
                                              : "Score"
                                          }
                                          className={`w-24 text-center py-2 rounded-xl text-sm font-black border transition-all outline-none ${
                                            isCompleted
                                              ? "bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed"
                                              : "bg-white border-slate-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 text-slate-800"
                                          }`}
                                          value={
                                            currentInput !== undefined ? currentInput : (existingGrade ?? "")
                                          }
                                          onChange={(e) => handleGradeChange(student.id, e.target.value)}
                                        />
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex justify-center">
                                        {isCompleted ? (
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-100">
                                            <CheckCircle2 size={10} /> Completed
                                          </span>
                                        ) : (
                                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                            <AlertCircle size={10} /> Pending
                                          </span>
                                        )}
                                      </div>
                                    </td>
                                    <td className="px-6 py-4">
                                      <div className="flex justify-end gap-2">
                                        {!isCompleted && (
                                          <button
                                            onClick={() => handleSaveGrade(student)}
                                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                                          >
                                            Save Score
                                          </button>
                                        )}
                                        {isCompleted && (
                                          <button
                                            onClick={() => handleIssueCertificate(student)}
                                            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2"
                                          >
                                            <Award size={12} /> Issue Certificate
                                          </button>
                                        )}
                                      </div>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </motion.div>
        )}

        {/* ═══════════════════════════════
            TAB 2: CERTIFICATE HISTORY
        ═══════════════════════════════ */}
        {activeTab === "history" && (
          <motion.div
            key="history-tab"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            <CertificateTable
              certificates={filteredCertificates}
              getCourseName={getCourseName}
              handleEditCertificate={handleEditCertificate}
              handleDeleteCertificate={() => {}} // no-op — delete hidden via canDelete
              canDelete={false}
              canBulkIssue={false}
              sortField={sortField}
              sortOrder={sortOrder}
              handleSort={handleSort}
              searchTerm={historySearch}
              setSearchTerm={setHistorySearch}
              filterCourse={filterCourse}
              setFilterCourse={setFilterCourse}
              courses={courses}
              isLoading={isHistoryLoading}
              onBulkIssueClick={() => {}} // no bulk for study-office
              role="study-office"
            />

            {/* Edit Modal */}
            <CertificateModal
              isOpen={showEditModal}
              onClose={() => {
                setShowEditModal(false);
                setEditingCertificate(null);
              }}
              onSubmit={handleSubmitEdit}
              editingCertificate={editingCertificate}
              isLoading={isHistoryLoading}
            />

            {/* Success dialog */}
            <ConfirmationDialog
              isOpen={isSuccessOpen}
              title="Success"
              message={successMessage}
              onConfirm={() => setIsSuccessOpen(false)}
              onCancel={() => setIsSuccessOpen(false)}
              confirmText="OK"
              type="success"
            />
            {/* Error dialog */}
            <ConfirmationDialog
              isOpen={isErrorOpen}
              title="Error"
              message={errorMessage}
              onConfirm={() => setIsErrorOpen(false)}
              onCancel={() => setIsErrorOpen(false)}
              confirmText="OK"
              type="danger"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
