"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

export default function LiquidConfirm({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?",
  confirmText = "Proceed",
  cancelText = "Cancel",
  type = "danger" // "danger", "warning", "info"
}) {
  if (!isOpen) return null;

  const themes = {
    danger: {
      accent: "rose",
      bg: "bg-rose-50/10",
      border: "border-rose-500/20",
      btn: "bg-gradient-to-r from-rose-600 to-red-600 shadow-rose-500/20",
      icon: "text-rose-500"
    },
    warning: {
      accent: "amber",
      bg: "bg-amber-50/10",
      border: "border-amber-500/20",
      btn: "bg-gradient-to-r from-amber-500 to-orange-600 shadow-amber-500/20",
      icon: "text-amber-500"
    },
    info: {
      accent: "blue",
      bg: "bg-blue-50/10",
      border: "border-blue-500/20",
      btn: "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/20",
      icon: "text-blue-500"
    }
  };

  const theme = themes[type] || themes.info;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`relative w-full max-w-md overflow-hidden rounded-[2.5rem] border ${theme.border} bg-white/10 backdrop-blur-2xl shadow-2xl p-8`}
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute right-6 top-6 p-2 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-all"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Content */}
            <div className="flex flex-col items-center text-center space-y-6 mt-2">
              <div className={`p-4 rounded-3xl ${theme.bg} border ${theme.border}`}>
                <AlertCircle className={`w-8 h-8 ${theme.icon}`} />
              </div>

              <div className="space-y-2">
                <h2 className="text-xl font-black text-white tracking-tight">
                  {title}
                </h2>
                <p className="text-[14px] font-medium text-slate-300 leading-relaxed max-w-[280px] mx-auto">
                  {message}
                </p>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 px-6 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-[13px] font-black text-white hover:bg-white/10 transition-all active:scale-[0.98]"
                >
                  {cancelText}
                </button>
                <button
                  onClick={() => {
                    onConfirm();
                    onClose();
                  }}
                  className={`flex-1 px-6 py-3.5 rounded-2xl ${theme.btn} text-[13px] font-black text-white shadow-xl hover:scale-[1.05] active:scale-[0.98] transition-all`}
                >
                  {confirmText}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
