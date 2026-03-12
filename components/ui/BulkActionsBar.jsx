"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Activity, ShieldAlert, Trash2, X } from "lucide-react";

/**
 * A reusable floating bar for bulk actions on selected items.
 * 
 * @param {Object} props
 * @param {Array} props.selectedIds - Array of selected item IDs
 * @param {Function} props.onClear - Callback to clear the selection
 * @param {Function} props.onActivate - Callback for bulk activation
 * @param {Function} props.onSuspend - Callback for bulk suspension
 * @param {Function} props.onDelete - Callback for bulk deletion
 * @param {string} props.label - Label for the selected items (e.g., "Students", "Personnel")
 * @param {boolean} props.showDelete - Whether to show the delete button (usually restricted to ADMIN)
 */
export default function BulkActionsBar({
  selectedIds = [],
  onClear,
  onActivate,
  onSuspend,
  onDelete,
  label = "Items",
  showDelete = false,
}) {
  const count = selectedIds.length;

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-2xl px-8 py-5 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] flex items-center gap-8 border border-slate-200/60"
        >
          <div className="flex items-center gap-4 pr-8 border-r border-slate-200">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
              {count}
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Selection Active</span>
              <span className="text-[13px] font-bold text-slate-800 tracking-tight whitespace-nowrap">{label} Selected</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {onActivate && (
              <button
                onClick={() => onActivate(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-emerald-200/50"
              >
                <Activity size={12} strokeWidth={3} /> Activate
              </button>
            )}
            
            {onSuspend && (
              <button
                onClick={() => onSuspend(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-amber-200/50"
              >
                <ShieldAlert size={12} strokeWidth={3} /> Suspend
              </button>
            )}

            {showDelete && onDelete && (
              <button
                onClick={onDelete}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-rose-200/50"
              >
                <Trash2 size={12} strokeWidth={3} /> Delete
              </button>
            )}

            <button
              onClick={onClear}
              className="ml-2 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
            >
              <X size={18} strokeWidth={3} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
