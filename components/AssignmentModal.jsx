"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, ClipboardList, Calendar, Target, Users, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AssignmentModal({
  isOpen,
  onClose,
  onSave,
  teacherGroups,
  courses,
  isLoading,
  assignment, 
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    groupId: "",
    courseId: "",
    points: "", // Deprecated but leaving for compat logic if any
    items: [],
    type: "HOMEWORK",
    status: "DRAFT",
    weight: "",
    maxPoints: "",
    attachmentUrls: "",
  });
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [removedUrls, setRemovedUrls] = useState([]);
  const [isClosing, setIsClosing] = useState(false);
  const [mounted, setMounted] = useState(false);

  const isEditMode = Boolean(assignment);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setIsClosing(false);
      setSelectedFiles([]);
      setRemovedUrls([]);
      if (isEditMode) {
        setFormData({
          title: assignment.title,
          description: assignment.description || "",
          dueDate: assignment.dueDate
            ? new Date(assignment.dueDate).toISOString().split("T")[0]
            : "",
          groupId: assignment.groupId,
          courseId: assignment.courseId || "",
          points: assignment.points || "",
          items: [],
          type: assignment.type || "HOMEWORK",
          status: assignment.status || "DRAFT",
          weight: assignment.weight || "",
          maxPoints: assignment.maxPoints || "",
          attachmentUrls: assignment.attachmentUrls || [],
        });
      } else {
        setFormData({
          title: "",
          description: "",
          dueDate: "",
          groupId: teacherGroups.length > 0 ? teacherGroups[0].id : "",
          courseId: "",
          points: "",
          items: [],
          type: "HOMEWORK",
          status: "DRAFT",
          weight: "",
          maxPoints: "",
          attachmentUrls: [],
        });
      }
      setError("");
    }
  }, [isOpen, isEditMode, assignment, teacherGroups]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 300);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const validFiles = [];

    for (const file of files) {
      if (file.size > MAX_SIZE) {
        setError(`File ${file.name} is too large. Max size is 10MB.`);
        return;
      }
      validFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setError("");
    // Reset input so same file can be selected again if removed
    e.target.value = "";
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingUrl = (url) => {
    setFormData((prev) => ({
      ...prev,
      attachmentUrls: prev.attachmentUrls.filter((u) => u !== url),
    }));
    setRemovedUrls((prev) => [...prev, url]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError("Assignment title is required.");
      return;
    }
    if (!isEditMode && !formData.groupId) {
      setError("You must select a group for this assignment.");
      return;
    }

    // Prepare FormData for multipart upload
    const data = new FormData();
    data.append("title", formData.title);
    data.append("description", formData.description);
    data.append("dueDate", formData.dueDate);
    data.append("groupId", formData.groupId);
    data.append("courseId", formData.courseId);
    data.append("type", formData.type);
    data.append("status", formData.status);
    data.append("weight", formData.weight || "0");
    data.append("maxPoints", formData.maxPoints || "100");
    
    // Remaining existing URLs
    formData.attachmentUrls.forEach(url => {
        data.append("attachmentUrls", url);
    });

    // New files
    selectedFiles.forEach(file => {
        data.append("attachments", file);
    });

    onSave(data);
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
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-full overflow-hidden flex flex-col border border-white/20"
          >
            <div className="p-5 border-b bg-gradient-to-r from-slate-50 to-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <ClipboardList className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      {isEditMode ? "Edit Assignment" : "New Assignment"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isEditMode ? "Update assignment details and requirements" : "Create a new learning task for your students"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
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
                    Assignment Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all duration-200 ${
                      error && !formData.title.trim()
                        ? "border-red-500 ring-4 ring-red-500/10"
                        : "border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                    }`}
                    placeholder="e.g., Quantum Mechanics Problem Set #1"
                    disabled={isLoading}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 ml-1">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 placeholder-slate-400 resize-none hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                    placeholder="Outline the objectives and requirements..."
                    disabled={isLoading}
                  />
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center">
                      <Users className="w-3 h-3 mr-1 text-slate-400" /> Target Group
                    </label>
                    <div className="relative group">
                      <select
                        name="groupId"
                        value={formData.groupId}
                        onChange={handleChange}
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 appearance-none hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                        disabled={isEditMode || teacherGroups.length === 0 || isLoading}
                      >
                        {teacherGroups.length === 0 ? (
                          <option value="">No Groups</option>
                        ) : (
                          <>
                            <option value="">Select Group</option>
                            {teacherGroups.map((group) => (
                              <option key={group.id} value={group.id}>
                                {group.name}
                              </option>
                            ))}
                          </>
                        )}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center">
                      <BookOpen className="w-3 h-3 mr-1 text-slate-400" /> Course
                    </label>
                    <div className="relative group">
                      <select
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleChange}
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 appearance-none hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                        disabled={isLoading}
                      >
                         <option value="">Select Course (Optional)</option>
                         {courses && courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.name} {course.code ? `(${course.code})` : ''}
                            </option>
                         ))}
                      </select>
                       <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-slate-400" /> Due Date
                    </label>
                    <input
                      type="date"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      min={new Date().toISOString().split("T")[0]}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                      disabled={isLoading}
                    />
                  </div>

                   <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center">
                      <Target className="w-3 h-3 mr-1 text-slate-400" /> Type
                    </label>
                    <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 appearance-none hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                        disabled={isLoading}
                      >
                        <option value="HOMEWORK">Homework</option>
                        <option value="PROJECT">Project</option>
                        <option value="ESSAY">Essay</option>
                        <option value="PRESENTATION">Presentation</option>
                        <option value="QUIZ">Quiz</option>
                        <option value="OTHER">Other</option>
                    </select>
                  </div>

                   <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center">
                       Status
                    </label>
                    <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 appearance-none hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                        disabled={isLoading}
                      >
                        <option value="DRAFT">Draft</option>
                        <option value="PUBLISHED">Published</option>
                        <option value="ARCHIVED">Archived</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center">
                      Weight (%)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      value={formData.weight}
                      onChange={handleChange}
                      min="0"
                      max="100"
                      step="0.1"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                      placeholder="e.g. 10.5"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center">
                       Max Points
                    </label>
                    <input
                      type="number"
                      name="maxPoints"
                      value={formData.maxPoints}
                      onChange={handleChange}
                      min="0"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                      placeholder="100"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center gap-2">
                       <ClipboardList className="w-4 h-4 text-blue-500" /> Attachments (PDF/Images - Max 10MB)
                    </label>
                    
                    {/* Existing Attachments */}
                    {formData.attachmentUrls.length > 0 && (
                        <div className="space-y-2">
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Current Files</p>
                             <div className="grid grid-cols-1 gap-2">
                                {formData.attachmentUrls.map((url, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-blue-50/50 border border-blue-100 rounded-xl group">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-blue-100 shrink-0">
                                                <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <span className="text-xs text-blue-700 font-medium truncate">{url.split('/').pop()}</span>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => removeExistingUrl(url)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    {/* New Selected Files */}
                    {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                             <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-1">New Uploads</p>
                             <div className="grid grid-cols-1 gap-2">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-indigo-50/50 border border-indigo-100 rounded-xl group">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-indigo-100 shrink-0">
                                                <svg className="w-4 h-4 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs text-indigo-700 font-medium truncate">{file.name}</span>
                                                <span className="text-[9px] text-indigo-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                            </div>
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={() => removeSelectedFile(idx)}
                                            className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                ))}
                             </div>
                        </div>
                    )}

                    <div className="flex items-center justify-center w-full">
                        <label className={`flex flex-col items-center justify-center w-full h-24 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-200 ${
                            error ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-slate-50/50 hover:bg-blue-50/50 hover:border-blue-300'
                        }`}>
                            <div className="flex flex-col items-center justify-center pt-3 pb-4">
                                <svg className="w-6 h-6 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-xs text-slate-500 font-medium">Click to upload or drag and drop</p>
                                <p className="text-[10px] text-slate-400 mt-1">PDF, JPG, PNG or WEBP (MAX. 10MB)</p>
                            </div>
                            <input 
                                type="file" 
                                className="hidden" 
                                multiple 
                                onChange={handleFileChange}
                                accept="application/pdf,image/*"
                                disabled={isLoading}
                            />
                        </label>
                    </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    <span className="text-xs text-red-600 font-medium">{error}</span>
                  </motion.div>
                )}
              </div>

              <div className="p-5 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                  * All required fields must be complete
                </span>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={handleClose}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="xs" color="white" />
                    ) : (
                      isEditMode ? "Save Changes" : "Create Task"
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}

// Remove the old style tag that was here before