"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { X, FileText, Calendar, Users, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AddExamModal({
  isOpen,
  onClose,
  onSave,
  teacherGroups,
  courses,
  isLoading,
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: "",
    type: "WRITTEN",
    status: "SCHEDULED",
    maxScore: "100",
    groupId: "",
    courseId: "",
  });
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        location: "",
        type: "WRITTEN",
        status: "SCHEDULED",
        maxScore: "100",
        courseId: "",
        groupId: teacherGroups.length > 0 ? teacherGroups[0].id : "",
      });
      setSelectedFiles([]);
      setError("");
    }
  }, [isOpen, teacherGroups]);

  // Filter courses based on selected group
  const filteredCourses = React.useMemo(() => {
    if (!formData.groupId || !courses) return courses;
    return courses.filter(course => 
      course.groupIds?.includes(formData.groupId) || course.groupId === formData.groupId
    );
  }, [formData.groupId, courses]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const newData = { ...prev, [name]: value };
      // If group changes, reset course if it's no longer valid
      if (name === "groupId") {
        const stillValid = courses.some(c => 
          (c.groupIds?.includes(value) || c.groupId === value) && c.id === prev.courseId
        );
        if (!stillValid) newData.courseId = "";
      }
      return newData;
    });
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    const validFiles = [];

    for (const file of files) {
      if (file.type !== "application/pdf") {
        setError(`File ${file.name} is not a PDF. Please use PDF format only.`);
        return;
      }
      if (file.size > MAX_SIZE) {
        setError(`File ${file.name} is too large. Max size is 10MB.`);
        return;
      }
      validFiles.push(file);
    }

    setSelectedFiles((prev) => [...prev, ...validFiles]);
    setError("");
    e.target.value = "";
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setError("Exam title is required.");
      return;
    }
    if (!formData.groupId) {
      setError("You must select a group for this exam.");
      return;
    }
    
    // Use FormData for multi-part
    const data = new FormData();
    Object.keys(formData).forEach(key => {
        let value = formData[key] || "";
        
        // Combine date + time if it's startTime or endTime and we have a master date
        if ((key === "startTime" || key === "endTime") && formData.date && value && value.length === 5) {
            value = `${formData.date}T${value}:00`;
        }
        
        data.append(key, value);
    });
    
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
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-full overflow-hidden flex flex-col border border-white/20"
          >
            <div className="p-5 border-b bg-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800 tracking-tight">New Examination</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Configure assessment parameters</p>
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

            <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full max-h-[85vh] overflow-hidden">
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
                {/* Section: Exam Overview */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Info className="w-4 h-4 text-blue-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Exam Overview</h3>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 ml-1">Exam Title</label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all duration-200 ${
                          error && !formData.title.trim()
                            ? "border-red-500 ring-4 ring-red-500/10 shadow-sm"
                            : "border-slate-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                        }`}
                        placeholder="e.g., Spring Midterm 2024"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-600 ml-1">Instructions / Description</label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 placeholder-slate-400 resize-none hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white"
                        placeholder="Provide exam details, duration, etc..."
                      />
                    </div>
                  </div>
                </div>

                {/* Section: Schedule & Logistics */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Calendar className="w-4 h-4 text-amber-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Schedule & Logistics</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 ml-1">Exam Date</label>
                        <div className="relative group">
                          <input
                            type="date"
                            name="date"
                            value={formData.date}
                            onChange={handleChange}
                            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white shadow-sm"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 ml-1">Location</label>
                        <input
                          type="text"
                          name="location"
                          value={formData.location}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white shadow-sm"
                          placeholder="e.g. Room 304 or Online"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 ml-1">Start Time</label>
                        <input
                          type="time" 
                          name="startTime" 
                          value={formData.startTime}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white shadow-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 ml-1">End Time</label>
                        <input
                          type="time"
                          name="endTime"
                          value={formData.endTime}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white shadow-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Target & Evaluation */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <Users className="w-4 h-4 text-indigo-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Target & Evaluation</h3>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 ml-1">Target Group</label>
                        <div className="relative group">
                          <select
                            name="groupId"
                            value={formData.groupId}
                            onChange={handleChange}
                            className={`w-full pl-3 pr-10 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all duration-200 appearance-none hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white shadow-sm ${
                              error && !formData.groupId ? "border-red-500 ring-red-500/5 shadow-none" : "border-slate-200"
                            }`}
                            disabled={teacherGroups.length === 0}
                          >
                             <option value="">Select Group</option>
                             {teacherGroups.map((group) => (
                               <option key={group.id} value={group.id}>
                                 {group.name}
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

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 ml-1">Course (Optional)</label>
                        <div className="relative group">
                          <select
                            name="courseId"
                            value={formData.courseId}
                            onChange={handleChange}
                            className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 appearance-none hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white shadow-sm"
                          >
                             <option value="">Individual Course</option>
                             {filteredCourses && filteredCourses.map((course) => (
                                <option key={course.id} value={course.id}>
                                  {course.name}
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

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 ml-1">Assessment Type</label>
                        <div className="relative group">
                          <select
                              name="type"
                              value={formData.type}
                              onChange={handleChange}
                              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 appearance-none hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white shadow-sm"
                            >
                              <option value="WRITTEN">Written Examination</option>
                              <option value="ORAL">Oral Assessment</option>
                              <option value="PRACTICAL">Practical Test</option>
                              <option value="ONLINE_QUIZ">Digital Quiz</option>
                              <option value="MIDTERM">Midterm Portfolio</option>
                              <option value="FINAL">Final Examination</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-blue-500 transition-colors">
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-600 ml-1">Maximum Score</label>
                        <input
                          type="number"
                          name="maxScore"
                          value={formData.maxScore}
                          onChange={handleChange}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:bg-white shadow-sm"
                          placeholder="100"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section: Reference Materials */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                    <FileText className="w-4 h-4 text-rose-500" />
                    <h3 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Exam Materials</h3>
                  </div>

                  <div className="space-y-4">
                      {/* Selected Files Preview */}
                      {selectedFiles.length > 0 && (
                          <div className="space-y-2">
                               <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1 italic">Queued for upload</p>
                               <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {selectedFiles.map((file, idx) => (
                                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl group hover:border-blue-200 hover:shadow-sm transition-all">
                                          <div className="flex items-center gap-3 min-w-0">
                                              <div className="w-10 h-10 flex items-center justify-center bg-blue-50 rounded-lg border border-blue-100 shrink-0">
                                                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                  </svg>
                                              </div>
                                              <div className="flex flex-col min-w-0">
                                                  <span className="text-xs text-slate-700 font-bold truncate">{file.name}</span>
                                                  <span className="text-[9px] text-slate-400 font-bold uppercase">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                              </div>
                                          </div>
                                          <button 
                                              type="button"
                                              onClick={() => removeSelectedFile(idx)}
                                              className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                                          >
                                              <X className="w-4 h-4" />
                                          </button>
                                      </div>
                                  ))}
                               </div>
                          </div>
                      )}

                      <div className="flex items-center justify-center w-full">
                          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 group ${
                              error && selectedFiles.length === 0 ? 'border-red-200 bg-red-50/20' : 'border-slate-200 bg-slate-50/50 hover:bg-white hover:border-blue-400 hover:shadow-xl hover:shadow-blue-500/5'
                          }`}>
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-100 group-hover:scale-110 transition-transform duration-300 mb-3">
                                    <svg className="w-6 h-6 text-slate-400 group-hover:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                  </div>
                                  <p className="text-xs text-slate-500 font-black uppercase tracking-tight">Drop files or click to browse</p>
                                  <p className="text-[9px] text-slate-400 font-bold mt-1 uppercase tracking-widest">Max 10MB • PDF Only</p>
                              </div>
                              <input 
                                  type="file" 
                                  className="hidden" 
                                  multiple 
                                  onChange={handleFileChange}
                                  accept="application/pdf"
                                  disabled={isLoading}
                              />
                          </label>
                      </div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 shadow-sm"
                  >
                    <div className="p-1.5 bg-white rounded-lg border border-red-100">
                      <Info className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-xs text-red-700 font-bold tracking-tight">{error}</span>
                  </motion.div>
                )}
              </div>

              <div className="p-6 bg-white border-t border-slate-100 flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-3 text-sm font-bold text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all active:scale-95 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" />
                      Schedule assessment
                    </>
                  )}
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