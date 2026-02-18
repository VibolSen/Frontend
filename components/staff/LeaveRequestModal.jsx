"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Send, Info, Clock, Briefcase } from "lucide-react";

export default function LeaveRequestModal({ isOpen, onClose, onSubmit, isSubmitting }) {
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({
    type: "CASUAL",
    startDate: "",
    endDate: "",
    reason: "",
  });

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isResignation = formData.type === "RESIGNATION";

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          {/* Backdrop - Matching Examination Board Style */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Compact Modal Panel - Matching Examination Board Aesthetic */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-hidden flex flex-col border border-white"
          >
            {/* Header - Examination Board Style (Gradient + Icon Left) */}
            <div className={`p-5 border-b transition-colors duration-500 ${isResignation ? 'bg-gradient-to-r from-slate-100 to-white' : 'bg-gradient-to-r from-slate-50 to-white'}`}>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${isResignation ? 'bg-slate-200 text-slate-700' : 'bg-indigo-100 text-indigo-600'}`}>
                    {isResignation ? <Briefcase className="w-5 h-5" /> : <Calendar className="w-5 h-5" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">{isResignation ? "Formal Resignation" : "Request Time Off"}</h2>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Absence Management</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden bg-white">
              <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar">
                {/* Category Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 ml-1">Leave Category</label>
                  <div className="relative group">
                    <select
                      required
                      name="type"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold transition-all duration-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white appearance-none"
                      value={formData.type}
                      onChange={(e) => {
                        const newType = e.target.value;
                        setFormData({ 
                          ...formData, 
                          type: newType,
                          endDate: newType === 'RESIGNATION' ? formData.startDate : formData.endDate
                        });
                      }}
                    >
                      <option value="CASUAL">Annual / Casual Leave</option>
                      <option value="SICK">Sick Leave</option>
                      <option value="UNPAID">Unpaid Leave</option>
                      <option value="MATERNITY">Maternity Leave</option>
                      <option value="PATERNITY">Paternity Leave</option>
                      <option value="RESIGNATION">Formal Resignation</option>
                    </select>
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Grid for Dates */}
                <div className={`grid ${isResignation ? 'grid-cols-1' : 'grid-cols-2'} gap-4 transition-all duration-300 transform`}>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 ml-1">
                      {isResignation ? 'Effective Date' : 'Start Date'}
                    </label>
                    <input
                      required
                      type="date"
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold transition-all hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white"
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value, endDate: isResignation ? e.target.value : formData.endDate })}
                    />
                  </div>
                  {!isResignation && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-1">End Date</label>
                      <input
                        required
                        type="date"
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold transition-all hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      />
                    </div>
                  )}
                </div>

                {/* Reason Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-700 ml-1">Detailed Context</label>
                  <textarea
                    required
                    rows={3}
                    placeholder={isResignation ? "Provide formal resignation details..." : "Briefly explain the reason for your request..."}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium transition-all hover:border-indigo-300 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 focus:bg-white resize-none"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  />
                </div>

                {/* Safety Info Box */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 text-[11px] leading-relaxed font-medium transition-colors ${
                  isResignation ? 'bg-red-50 border-red-100 text-red-700' : 'bg-slate-50 border-slate-100 text-slate-600'
                }`}>
                  <Info className="w-4 h-4 shrink-0 mt-0.5" />
                  <p>
                    {isResignation 
                      ? "Confirmatory resignation is a permanent action and will initiate offboarding procedures once approved by HR."
                      : "Requests are forwarded to HR and your department head. You will receive a notification once the status is updated."}
                  </p>
                </div>
              </div>

              {/* Footer Actions - Examination Board Style */}
              <div className="p-5 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider text-center sm:text-left">
                  Status: Draft Ready for Submission
                </span>
                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 sm:flex-none px-5 py-2 text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`flex-1 sm:flex-none px-6 py-2 ${isResignation ? 'bg-slate-900 shadow-slate-200' : 'bg-gradient-to-r from-indigo-600 to-blue-600 shadow-indigo-200'} text-white rounded-xl text-sm font-bold shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2`}
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        {isResignation ? "Confirm" : "Submit Request"}
                      </>
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
