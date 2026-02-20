"use client";

import React from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Users, Settings2 } from "lucide-react";
import ManageGroupMembers from "@/app/admin/groups/[groupId]/ManageGroupMembers";

export default function ManageGroupMembersModal({
  isOpen,
  onClose,
  group,
  allStudents,
  onSaveChanges,
  isLoading,
}) {
  if (!isOpen || !group) return null;

  const modalContent = (
    <AnimatePresence>
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
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
        >
          {/* Header */}
          <div className="p-5 border-b flex justify-between items-center bg-white shrink-0">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-50 rounded-2xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">
                  Manage Roster
                </h2>
                <p className="text-xs font-medium text-slate-400">
                  Configure membership for <span className="text-blue-600 font-bold">{group.name}</span>
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <div className="p-6 bg-slate-50/50 overflow-y-auto">
            <ManageGroupMembers
              initialGroup={group}
              allStudents={allStudents}
              onSaveChanges={onSaveChanges}
              isLoading={isLoading}
              onClose={onClose}
            />
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
