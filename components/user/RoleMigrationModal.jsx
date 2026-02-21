"use client";

import React, { useState } from "react";
import { X, ShieldAlert, ArrowRight, UserCheck, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { createPortal } from "react-dom";

export default function RoleMigrationModal({
  isOpen,
  onClose,
  onMigrate,
  user,
  roles,
  isLoading = false
}) {
  const [selectedRole, setSelectedRole] = useState(user?.role || "");
  const [reason, setReason] = useState("");
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Update selection when user changes or modal opens
  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
      setReason("");
    }
  }, [user, isOpen]);

  if (!isOpen || !user || !mounted) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onMigrate(user, { role: selectedRole, migrationReason: reason });
  };

  const isChanged = selectedRole !== user.role;

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
          className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden flex flex-col border border-white/20"
        >
          {/* Header */}
          <div className="p-6 bg-gradient-to-br from-indigo-600 to-blue-700 text-white relative">
            <div className="absolute top-4 right-4">
              <button 
                onClick={onClose}
                className="p-1.5 hover:bg-white/10 rounded-full transition-colors"
                disabled={isLoading}
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-sm border border-white/20">
                <ShieldAlert size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black tracking-tight">Role Migration</h2>
                <p className="text-white/70 text-[11px] font-medium tracking-wide">Reassign system authority</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-3 rounded-xl border border-white/5 backdrop-blur-sm">
              <div className="w-9 h-9 rounded-full bg-white text-indigo-700 flex items-center justify-center font-black text-xs">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-sm">{user.firstName} {user.lastName}</span>
                <span className="text-[9px] uppercase font-black tracking-widest opacity-60">Current: {user.role}</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">New System Role</label>
                <div className="grid grid-cols-1 gap-3">
                  <select
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none"
                    disabled={isLoading}
                  >
                    {roles
                      .filter(r => r !== "ADMIN" || user?.role === "ADMIN")
                      .map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                  </select>
                </div>
              </div>

              <motion.div 
                className="p-4 bg-amber-50 border border-amber-100 rounded-2xl flex items-start gap-3"
              >
                <AlertTriangle className="text-amber-600 shrink-0" size={18} />
                <div className="space-y-1">
                  {isChanged ? (
                    <p className="text-[11px] font-bold text-amber-900 leading-tight">
                      Migrating from <span className="underline">{user.role}</span> to <span className="underline">{selectedRole}</span>.
                    </p>
                  ) : (
                    <p className="text-[11px] font-bold text-amber-900 leading-tight">
                      System Authority Warning
                    </p>
                  )}
                  <p className="text-[10px] text-amber-700/80 font-medium">
                    Permissions and role-specific data will be synchronized immediately.
                    {isChanged && selectedRole === 'STUDENT' && " A unique Student ID will be generated."}
                  </p>
                </div>
              </motion.div>

              <div className="space-y-2">
                <label className="text-[11px] font-black uppercase tracking-widest text-slate-400 ml-1">Administrative Reason</label>
                <textarea
                  placeholder="e.g. Promotion, Departmental Transfer, Corrective Action..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-600 transition-all outline-none min-h-[100px] resize-none"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading || !isChanged}
                className={`w-full py-3.5 rounded-xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-xl shadow-indigo-100 ${
                  isChanged 
                    ? 'bg-gradient-to-r from-indigo-600 to-blue-700 text-white hover:-translate-y-1 active:scale-95' 
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                }`}
              >
                {isLoading ? (
                  <LoadingSpinner size="sm" color="indigo" />
                ) : (
                  <>
                    <UserCheck size={16} />
                    Execute Migration
                    <ArrowRight size={16} className="ml-1" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
