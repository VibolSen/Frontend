"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function GroupModal({
  isOpen,
  onClose,
  onSave,
  groupToEdit,
  courses,
  batches = [],
  allStudents = [],
  isLoading,
}) {
  const [formData, setFormData] = useState({
    name: "",
    batchId: "",
    courseIds: [],
    studentIds: []
  });
  const [studentSearch, setStudentSearch] = useState("");
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false);

  const isEditMode = !!groupToEdit;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (groupToEdit) {
        setFormData({
          name: groupToEdit.name || "",
          batchId: groupToEdit.batchId || "",
          courseIds: groupToEdit.courseIds || [],
          studentIds: (groupToEdit.students || []).map(s => s.id)
        });
      } else {
        setFormData({
          name: "",
          batchId: "",
          courseIds: [],
          studentIds: []
        });
      }
      setErrors({});
    }
  }, [isOpen, groupToEdit]);

  const handleCourseChange = (courseId) => {
    setFormData((prev) => {
      const courseIds = prev.courseIds.includes(courseId)
        ? prev.courseIds.filter((id) => id !== courseId)
        : [...prev.courseIds, courseId];
      return { ...prev, courseIds };
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "batchId") {
      setStudentSearch("");
    }
  };

  const handleStudentToggle = (studentId) => {
    setFormData((prev) => {
      const studentIds = prev.studentIds.includes(studentId)
        ? prev.studentIds.filter((id) => id !== studentId)
        : [...prev.studentIds, studentId];
      return { ...prev, studentIds };
    });
  };

  // Derive the selected batch object to get its departmentId
  const selectedBatch = batches.find(b => b.id === formData.batchId) || null;

  const filteredStudents = allStudents.filter(student => {
    // Must match the generation (batchId on student profile)
    const matchesBatch = !formData.batchId || student.profile?.batchId === formData.batchId;
    // Must also match the department of that generation (prevents cross-dept mixing)
    const matchesDept = !selectedBatch?.departmentId || student.departmentId === selectedBatch.departmentId;
    const matchesSearch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(studentSearch.toLowerCase());
    return matchesBatch && matchesDept && matchesSearch;
  });

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Group name is required.";
    if (!formData.courseIds || formData.courseIds.length === 0)
      newErrors.courseIds = "At least one course is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSave(formData);
    }
  };

  if (!isOpen || !mounted) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-full overflow-hidden flex flex-col border border-white/20"
          >
            <div className="p-5 border-b bg-gradient-to-r from-slate-50 to-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      {isEditMode ? "Modify Group" : "Create New Group"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      Link this group to a specific cohort generation and assign courses.
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh]">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 ml-1">
                    Group Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all duration-200 ${errors.name
                      ? "border-red-500 ring-4 ring-red-500/10"
                      : "border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white"
                      }`}
                    placeholder="e.g., Year 1 - CS Group A"
                  />
                  {errors.name && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 ml-1">
                      {errors.name}
                    </motion.p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 ml-1">
                    Generation
                  </label>
                  <select
                    name="batchId"
                    value={formData.batchId}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white appearance-none"
                  >
                    <option value="">Select Generation</option>
                    {batches.map((batch) => (
                      <option key={batch.id} value={batch.id}>
                        {batch.name} {batch.department ? `(${batch.department.name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Integrated Student Selection */}
                <div className="space-y-2.5 pt-2">
                  <div className="flex items-center justify-between px-1">
                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest flex items-center gap-2">
                      Assign Students
                      <span className="text-[10px] font-bold text-slate-400 normal-case tracking-normal">({formData.studentIds.length} selected)</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search roster..."
                        value={studentSearch}
                        onChange={(e) => setStudentSearch(e.target.value)}
                        className="text-[10px] px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-32 focus:w-48 transition-all"
                      />
                    </div>
                  </div>

                  {/* Context banner: shows which dept the generation belongs to */}
                  {selectedBatch && (
                    <div className="flex items-center gap-2 text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0" />
                      Showing students from <span className="font-black mx-0.5">{selectedBatch.name}</span>
                      {selectedBatch.department && <> — <span className="font-black mx-0.5">{selectedBatch.department.name}</span></>}
                      only
                    </div>
                  )}

                  <div className="bg-slate-50/50 border border-slate-200 rounded-xl overflow-hidden ring-1 ring-slate-200/50">
                    <div className="max-h-48 overflow-y-auto p-2 custom-scrollbar space-y-1">
                      {filteredStudents.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {filteredStudents.map((student) => (
                            <button
                              key={student.id}
                              type="button"
                              onClick={() => handleStudentToggle(student.id)}
                              className={`flex items-center gap-3 p-2 rounded-xl text-left transition-all border ${formData.studentIds.includes(student.id)
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100 ring-2 ring-indigo-600/20"
                                : "bg-white text-slate-600 border-slate-100 hover:border-indigo-300 hover:shadow-sm"
                                }`}
                            >
                              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${formData.studentIds.includes(student.id) ? "bg-white animate-pulse" : "bg-slate-200"}`} />
                              <div className="flex flex-col min-w-0">
                                <span className="text-[11px] font-black truncate leading-tight tracking-tight">
                                  {student.firstName} {student.lastName}
                                </span>
                                <span className={`text-[9px] font-bold truncate ${formData.studentIds.includes(student.id) ? "text-indigo-100" : "text-slate-400"}`}>
                                  {student.profile?.studentId || "No ID"}
                                </span>
                              </div>
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center opacity-40 bg-white/50 rounded-lg border border-dashed border-slate-200">
                          <Users className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                            {!formData.batchId
                              ? "Select a generation first"
                              : "No students enrolled in this generation & department"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-semibold text-slate-700 ml-1">
                    Associated Courses
                  </label>
                  <div className={`p-1.5 space-y-2.5 bg-slate-50 border rounded-xl max-h-40 overflow-y-auto transition-all duration-200 ${errors.courseIds ? "border-red-500 ring-4 ring-red-500/10" : "border-slate-200"
                    }`}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {courses.map((course) => (
                        <label key={course.id} className="flex items-center group cursor-pointer p-1.5 rounded-lg hover:bg-white transition-all border border-transparent hover:border-slate-100">
                          <div className="relative flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.courseIds.includes(course.id)}
                              onChange={() => handleCourseChange(course.id)}
                              className="peer h-4 w-4 bg-white border-slate-300 rounded text-indigo-600 focus:ring-indigo-500 transition-all duration-200"
                            />
                            <div className="ml-2.5 text-[11px] font-bold text-slate-600 group-hover:text-slate-900 transition-colors">
                              {course.name}
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  {errors.courseIds && (
                    <motion.p initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-[10px] text-red-500 ml-1">
                      {errors.courseIds}
                    </motion.p>
                  )}
                </div>
              </div>

              <div className="p-5 bg-slate-50 border-t flex justify-end items-center gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 active:scale-[0.98] disabled:opacity-70"
                >
                  {isLoading ? "Saving..." : isEditMode ? "Update Group" : "Save Group"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
