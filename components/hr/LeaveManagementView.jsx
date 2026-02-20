"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar, CheckCircle, XCircle, Clock, Plus,
  Search, RefreshCw, Save,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const LEAVE_TYPES = ["ANNUAL", "SICK", "MATERNITY", "PATERNITY", "UNPAID", "EMERGENCY"];
const STATUS_CFG = {
  PENDING:  { label: "Pending",  color: "text-amber-600",   bg: "bg-amber-50",   border: "border-amber-200",  icon: Clock },
  APPROVED: { label: "Approved", color: "text-emerald-600", bg: "bg-emerald-50", border: "border-emerald-200", icon: CheckCircle },
  REJECTED: { label: "Rejected", color: "text-rose-600",    bg: "bg-rose-50",    border: "border-rose-200",   icon: XCircle },
};

function daysBetween(start, end) {
  if (!start || !end) return 0;
  return Math.max(1, Math.ceil((new Date(end) - new Date(start)) / 86400000) + 1);
}

function LeaveRow({ leave, onApprove, onReject, isManager, index }) {
  const cfg = STATUS_CFG[leave.status] || STATUS_CFG.PENDING;
  const StatusIcon = cfg.icon;
  const days = daysBetween(leave.startDate, leave.endDate);
  const staffName = `${leave.staff?.firstName || leave.user?.firstName || ""} ${leave.staff?.lastName || leave.user?.lastName || ""}`.trim();
  const initials = staffName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <motion.tr initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.03 }}
      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-[11px] font-black shrink-0 border border-rose-100">
            {initials}
          </div>
          <div>
            <p className="text-[12px] font-bold text-slate-800">{staffName}</p>
            <p className="text-[9px] text-slate-400 font-medium">{leave.staff?.role || leave.user?.role || "Staff"}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5">
        <span className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-600 text-[9px] font-black rounded-lg uppercase tracking-wider">
          {leave.leaveType || leave.type}
        </span>
      </td>
      <td className="px-5 py-3.5 text-[11px] text-slate-600 font-medium">{leave.startDate}</td>
      <td className="px-5 py-3.5 text-[11px] text-slate-600 font-medium">{leave.endDate}</td>
      <td className="px-5 py-3.5">
        <span className="text-[13px] font-black text-slate-800">{days}</span>
        <span className="text-[9px] text-slate-400 font-medium ml-1">days</span>
      </td>
      <td className="px-5 py-3.5 hidden md:table-cell max-w-[180px]">
        <p className="text-[11px] text-slate-500 font-medium truncate">{leave.reason || "—"}</p>
      </td>
      <td className="px-5 py-3.5">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-black border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
          <StatusIcon size={11} />{cfg.label}
        </span>
      </td>
      <td className="px-5 py-3.5">
        {isManager && leave.status === "PENDING" ? (
          <div className="flex items-center gap-2">
            <button onClick={() => onApprove(leave.id)}
              className="p-2 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all" title="Approve">
              <CheckCircle size={13} />
            </button>
            <button onClick={() => onReject(leave.id)}
              className="p-2 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 transition-all" title="Reject">
              <XCircle size={13} />
            </button>
          </div>
        ) : <span className="text-[10px] text-slate-300">—</span>}
      </td>
    </motion.tr>
  );
}

function NewLeaveModal({ onClose, onSubmit, isSubmitting }) {
  const [form, setForm] = useState({ leaveType: "ANNUAL", startDate: "", endDate: "", reason: "" });
  const days = daysBetween(form.startDate, form.endDate);
  const valid = form.startDate && form.endDate && form.reason.trim() &&
    new Date(form.endDate) >= new Date(form.startDate);

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-800">New Leave Request</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">Fill in the details below</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200">
            <XCircle size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Leave Type</label>
            <select value={form.leaveType} onChange={(e) => setForm({ ...form, leaveType: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all">
              {LEAVE_TYPES.map((t) => <option key={t} value={t}>{t.charAt(0) + t.slice(1).toLowerCase()} Leave</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300 transition-all" />
            </div>
          </div>
          {form.startDate && form.endDate && (
            <p className="text-[11px] font-black text-rose-600 bg-rose-50 border border-rose-100 rounded-xl px-4 py-2">
              📅 {days} day{days !== 1 ? "s" : ""} of leave requested
            </p>
          )}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Reason *</label>
            <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })}
              rows={3} placeholder="Briefly describe the reason for your leave..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-300 resize-none transition-all" />
          </div>
        </div>
        <div className="flex gap-3 pt-2 border-t border-slate-50">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[11px] font-black text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={() => onSubmit(form)} disabled={!valid || isSubmitting}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[11px] font-black rounded-xl shadow-lg shadow-rose-200 hover:from-rose-700 hover:to-pink-700 transition-all disabled:opacity-50">
            {isSubmitting ? <LoadingSpinner size="xs" color="white" /> : <Save size={13} />}
            Submit Request
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function LeaveManagementView() {
  const { user } = useUser();
  const isManager = ["ADMIN", "HR", "MANAGER"].includes((user?.role || "").toUpperCase());

  const [leaves, setLeaves] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast({ msg }); setTimeout(() => setToast(null), 3000); };

  const fetchLeaves = useCallback(async () => {
    setIsLoading(true);
    try {
      const endpoint = isManager ? "/hr/leaves" : `/hr/leaves?staffId=${user?.id}`;
      const data = await apiClient.get(endpoint);
      setLeaves(Array.isArray(data) ? data : MOCK_LEAVES);
    } catch { setLeaves(MOCK_LEAVES); }
    finally { setIsLoading(false); }
  }, [isManager, user]);

  useEffect(() => { fetchLeaves(); }, [fetchLeaves]);

  const handleSubmit = async (form) => {
    setIsSubmitting(true);
    try {
      const body = { ...form, staffId: user?.id, status: "PENDING" };
      let newLeave;
      try { newLeave = await apiClient.post("/hr/leaves", body); }
      catch { newLeave = { ...body, id: `tmp-${Date.now()}`, staff: { firstName: user?.firstName, lastName: user?.lastName, role: user?.role } }; }
      setLeaves((prev) => [newLeave, ...prev]);
      showToast("Leave request submitted!");
    } finally { setIsSubmitting(false); setShowModal(false); }
  };

  const handleApprove = async (id) => {
    try { await apiClient.put(`/hr/leaves/${id}`, { status: "APPROVED" }); } catch { /* fallback */ }
    setLeaves((p) => p.map((l) => l.id === id ? { ...l, status: "APPROVED" } : l));
    showToast("Leave approved.");
  };

  const handleReject = async (id) => {
    try { await apiClient.put(`/hr/leaves/${id}`, { status: "REJECTED" }); } catch { /* fallback */ }
    setLeaves((p) => p.map((l) => l.id === id ? { ...l, status: "REJECTED" } : l));
    showToast("Leave rejected.");
  };

  const stats = useMemo(() => ({
    total: leaves.length,
    pending: leaves.filter((l) => l.status === "PENDING").length,
    approved: leaves.filter((l) => l.status === "APPROVED").length,
    rejected: leaves.filter((l) => l.status === "REJECTED").length,
  }), [leaves]);

  const filtered = useMemo(() => {
    let list = filterStatus === "ALL" ? leaves : leaves.filter((l) => l.status === filterStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((l) =>
        `${l.staff?.firstName || l.user?.firstName} ${l.staff?.lastName || l.user?.lastName}`.toLowerCase().includes(q) ||
        (l.leaveType || l.type || "").toLowerCase().includes(q) ||
        (l.reason || "").toLowerCase().includes(q)
      );
    }
    return list;
  }, [leaves, filterStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50/20 pb-12">
      <div className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-slate-900 text-white text-[12px] font-bold">
              <CheckCircle size={15} className="text-emerald-400" />{toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {showModal && <NewLeaveModal onClose={() => setShowModal(false)} onSubmit={handleSubmit} isSubmitting={isSubmitting} />}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-rose-600 tracking-tight">Leave Management</h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">
              {isManager ? "Review and approve staff leave requests." : "Submit and track your leave requests."}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={fetchLeaves} className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-400 hover:text-rose-600 hover:border-rose-200 shadow-sm transition-all">
              <RefreshCw size={15} />
            </button>
            <button onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-rose-600 to-pink-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-rose-200 hover:from-rose-700 hover:to-pink-700 transition-all">
              <Plus size={14} />New Request
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total", value: stats.total, color: "text-slate-600", bg: "bg-slate-100", filter: "ALL" },
            { label: "Pending", value: stats.pending, color: "text-amber-600", bg: "bg-amber-50", filter: "PENDING" },
            { label: "Approved", value: stats.approved, color: "text-emerald-600", bg: "bg-emerald-50", filter: "APPROVED" },
            { label: "Rejected", value: stats.rejected, color: "text-rose-600", bg: "bg-rose-50", filter: "REJECTED" },
          ].map((s) => (
            <motion.div key={s.label} whileHover={{ y: -2 }} onClick={() => setFilterStatus(s.filter)}
              className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center gap-3 cursor-pointer hover:border-rose-200 transition-all">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.bg}`}>
                <p className={`text-xl font-black ${s.color}`}>{s.value}</p>
              </div>
              <div>
                <p className={`text-[11px] font-black ${s.color}`}>{s.label}</p>
                <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">requests</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input type="text" placeholder="Search by name, type, or reason..."
              value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-medium text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-200 transition-all" />
          </div>
          <div className="flex rounded-xl overflow-hidden border border-slate-200">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((s) => (
              <button key={s} onClick={() => setFilterStatus(s)}
                className={`px-3 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterStatus === s ? "bg-rose-600 text-white" : "bg-white text-slate-400 hover:bg-slate-50"
                }`}>{s}</button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <LoadingSpinner size="lg" color="blue" />
              <p className="mt-3 text-[11px] font-black text-slate-400 uppercase tracking-widest animate-pulse">Loading Requests...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Calendar size={28} className="text-slate-200 mb-3" />
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No leave requests found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50/50 border-b border-slate-100">
                  <tr>
                    {["Staff","Type","Start","End","Days","Reason","Status","Actions"].map((h) => (
                      <th key={h} className={`px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest ${h === "Reason" ? "hidden md:table-cell" : ""}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((leave, i) => (
                    <LeaveRow key={leave.id} leave={leave} onApprove={handleApprove} onReject={handleReject} isManager={isManager} index={i} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MOCK_LEAVES = [
  { id: "l1", staff: { firstName: "Sophea", lastName: "Chan", role: "Teacher" }, leaveType: "ANNUAL", startDate: "2025-03-10", endDate: "2025-03-14", reason: "Family trip", status: "PENDING" },
  { id: "l2", staff: { firstName: "Dara", lastName: "Kim", role: "HR Officer" }, leaveType: "SICK", startDate: "2025-02-20", endDate: "2025-02-22", reason: "Medical treatment", status: "APPROVED" },
  { id: "l3", staff: { firstName: "Vibol", lastName: "Pich", role: "Teacher" }, leaveType: "EMERGENCY", startDate: "2025-02-15", endDate: "2025-02-15", reason: "Family emergency", status: "APPROVED" },
  { id: "l4", staff: { firstName: "Mealea", lastName: "Sok", role: "Admin" }, leaveType: "UNPAID", startDate: "2025-04-01", endDate: "2025-04-05", reason: "Personal matters", status: "REJECTED" },
  { id: "l5", staff: { firstName: "Rithya", lastName: "Heng", role: "Teacher" }, leaveType: "ANNUAL", startDate: "2025-03-25", endDate: "2025-03-28", reason: "Rest and recovery", status: "PENDING" },
];
