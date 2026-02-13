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
    date: "", // Use 'date' instead of 'examDate' to match backend map (though controller also accepted examDate, I unified it)
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
        data.append(key, formData[key] || "");
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
            <div className="p-5 border-b bg-gradient-to-r from-slate-50 to-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <FileText className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">New Examination</h2>
                    <p className="text-xs text-slate-500">Configure a new assessment for your students</p>
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
                  <label className="text-xs font-semibold text-slate-700 ml-1">Exam Title</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all duration-200 ${
                      error && !formData.title.trim()
                        ? "border-red-500 ring-4 ring-red-500/10"
                        : "border-slate-200 hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white"
                    }`}
                    placeholder="e.g., Spring Midterm 2024"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 ml-1">Instructions / Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 placeholder-slate-400 resize-none hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white"
                    placeholder="Provide exam details, duration, etc..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center">
                      <Users className="w-3 h-3 mr-1 text-slate-400" /> Target Group
                    </label>
                    <div className="relative group">
                      <select
                        name="groupId"
                        value={formData.groupId}
                        onChange={handleChange}
                        className={`w-full pl-3 pr-8 py-2 bg-slate-50 border rounded-xl text-sm transition-all duration-200 appearance-none hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white ${
                          error && !formData.groupId ? "border-red-500" : "border-slate-200"
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
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center">
                       Course
                    </label>
                    <div className="relative group">
                      <select
                        name="courseId"
                        value={formData.courseId}
                        onChange={handleChange}
                        className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 appearance-none hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white"
                      >
                         <option value="">Select Course (Optional)</option>
                         {courses && courses.map((course) => (
                            <option key={course.id} value={course.id}>
                              {course.name}
                            </option>
                         ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400 group-focus-within:text-purple-500 transition-colors">
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center">
                      <Calendar className="w-3 h-3 mr-1 text-slate-400" /> Date
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Start Time</label>
                    <input
                      type="datetime-local" 
                      name="startTime" 
                      value={formData.startTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">End Time</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white"
                      placeholder="e.g. Room 304 or Online"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Type</label>
                     <select
                        name="type"
                        value={formData.type}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 appearance-none hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white"
                      >
                        <option value="WRITTEN">Written</option>
                        <option value="ORAL">Oral</option>
                        <option value="PRACTICAL">Practical</option>
                        <option value="ONLINE_QUIZ">Online Quiz</option>
                        <option value="MIDTERM">Midterm</option>
                        <option value="FINAL">Final</option>
                      </select>
                  </div>
                </div>
                
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-slate-700 ml-1 flex items-center gap-2">
                       <FileText className="w-4 h-4 text-purple-500" /> Exam Materials (PDF/Images)
                    </label>
                    
                    {/* New Selected Files */}
                    {selectedFiles.length > 0 && (
                        <div className="space-y-2">
                             <div className="grid grid-cols-1 gap-2">
                                {selectedFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-2 bg-purple-50/50 border border-purple-100 rounded-xl group">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-purple-100 shrink-0">
                                                <svg className="w-4 h-4 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                </svg>
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-xs text-purple-700 font-medium truncate">{file.name}</span>
                                                <span className="text-[9px] text-purple-400">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
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
                            error ? 'border-red-200 bg-red-50/30' : 'border-slate-200 bg-slate-50/50 hover:bg-purple-50/50 hover:border-purple-300'
                        }`}>
                            <div className="flex flex-col items-center justify-center pt-3 pb-4">
                                <svg className="w-6 h-6 mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                <p className="text-xs text-slate-500 font-medium">Add exam papers or materials</p>
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
                
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Max Score</label>
                    <input
                      type="number"
                      name="maxScore"
                      value={formData.maxScore}
                      onChange={handleChange}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white"
                      placeholder="100"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">Status</label>
                     <select
                        name="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm transition-all duration-200 appearance-none hover:border-purple-300 focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 focus:bg-white"
                      >
                        <option value="SCHEDULED">Scheduled</option>
                        <option value="ONGOING">Ongoing</option>
                        <option value="COMPLETED">Completed</option>
                        <option value="GRADED">Graded</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-2"
                  >
                    <Info className="w-4 h-4 text-red-500" />
                    <span className="text-xs text-red-600 font-medium">{error}</span>
                  </motion.div>
                )}
              </div>

              <div className="p-5 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Students will see this in their agenda
                </span>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 sm:flex-none px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-purple-200 hover:shadow-xl hover:shadow-purple-300 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="xs" color="white" />
                    ) : (
                      "Schedule Exam"
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