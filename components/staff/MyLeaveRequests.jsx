"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  Calendar,
  Clock,
  Plus,
  FileText,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Info,
  Send,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LeaveRequestModal from "./LeaveRequestModal";

export default function MyLeaveRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [balances, setBalances] = useState({ year: 2026, taken: {} });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchMyRequests();
    fetchBalances();
  }, []);

  const fetchMyRequests = async () => {
    try {
      const data = await apiClient.get("/leaves/my-requests");
      setRequests(data);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load your leave history");
    } finally {
      setLoading(false);
    }
  };

  const fetchBalances = async () => {
    try {
      const data = await apiClient.get("/leaves/balances");
      setBalances(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleModalSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await apiClient.post("/leaves/request", data);
      toast.success("Leave request submitted successfully!");
      setIsModalOpen(false);
      fetchMyRequests();
    } catch (error) {
      toast.error(error.response?.data?.error || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-50 text-emerald-600 border-emerald-100";
      case "REJECTED":
        return "bg-rose-50 text-rose-600 border-rose-100";
      default:
        return "bg-amber-50 text-amber-600 border-amber-100";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 size={14} />;
      case "REJECTED":
        return <XCircle size={14} />;
      default:
        return <Clock size={14} />;
    }
  };

  const safeFormatDate = (dateStr, formatStr = "MMM d, yyyy") => {
    try {
      if (!dateStr) return "N/A";
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Invalid Date";
      return format(date, formatStr);
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
            <Calendar className="text-indigo-600" />
            My Absence & Leave
          </h1>
          <p className="text-slate-500 font-medium">Manage your time off and monitor your leave history</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-xs font-black uppercase tracking-widest rounded-xl hover:shadow-lg hover:shadow-indigo-500/20 transition-all active:scale-95 group"
        >
          <Plus size={16} className="group-hover:rotate-90 transition-transform" />
          Request Time Off
        </button>
      </div>

      <LeaveRequestModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSubmit={handleModalSubmit}
        isSubmitting={isSubmitting}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm shadow-indigo-500/5 overflow-hidden">
          <div className="p-5 border-b border-slate-50 bg-[#F8FAFC] flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Request Stream</h3>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white border border-slate-200 rounded-lg text-slate-400">
                <Info size={12} />
                <span className="text-[10px] font-bold uppercase tracking-widest">History</span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50/50 text-left border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Absence Type</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Duration</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">HR Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                   <tr><td colSpan={3} className="py-12 text-center text-slate-400 font-medium">Retrieving history...</td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={3} className="py-12 text-center text-slate-400 font-medium italic">No leave requests found.</td></tr>
                ) : (
                  requests.map((req) => (
                    <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-500 flex items-center justify-center font-bold text-xs border border-slate-200">
                                {req.type[0]}
                            </div>
                            <div>
                                <div className="text-sm font-bold text-slate-800 leading-none">{req.type}</div>
                                <div className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tighter">Applied {safeFormatDate(req.createdAt, "MMM d")}</div>
                            </div>
                        </div>
                      </td>
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="text-xs font-black text-slate-700">{safeFormatDate(req.startDate, "MMM d, yy")} — {safeFormatDate(req.endDate, "MMM d, yy")}</div>
                        <div className="text-[10px] text-indigo-500 font-bold mt-1 uppercase tracking-widest">
                            {(() => {
                              const start = new Date(req.startDate);
                              const end = new Date(req.endDate);
                              if (isNaN(start.getTime()) || isNaN(end.getTime())) return "N/A";
                              return Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
                            })()} Business Days
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight border shadow-sm ${getStatusBadge(req.status)}`}>
                            {getStatusIcon(req.status)}
                            {req.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-700 to-blue-800 p-6 rounded-2xl text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
            <h3 className="text-lg font-black tracking-tight mb-1">Leave Balances</h3>
            <p className="text-xs text-indigo-100/70 font-bold uppercase tracking-widest mb-6">Year {balances.year}</p>
            
            <div className="space-y-4 relative z-10">
              {["SICK", "CASUAL", "OTHER"].map((t) => (
                <div key={t} className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span>{t} Leave</span>
                        <span>{balances.taken[t] || 0} Days Taken</span>
                    </div>
                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.min((balances.taken[t] || 0) * 10, 100)}%` }}
                            className="h-full bg-emerald-400"
                        />
                    </div>
                </div>
              ))}
            </div>
            
            <div className="absolute -right-6 -bottom-6 h-32 w-32 bg-white/5 rounded-full blur-2xl" />
          </div>

          <div className="bg-amber-50 rounded-2xl border border-amber-100 p-5 p-6 flex items-start gap-4">
            <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <AlertCircle size={20} />
            </div>
            <div>
                <h4 className="text-sm font-black text-amber-900 tracking-tight leading-none mb-2 underline decoration-amber-300">Resignation Notice</h4>
                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                    Planning to leave permanently? Resignations require a formal 30-day notice and approval from HR. Contact support for exit documentation.
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
