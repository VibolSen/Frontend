"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Calendar, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCcw,
  UserCheck
} from "lucide-react";
import { apiClient } from "@/lib/api";

export default function ManageAttendanceView() {
  const { user: currentUser } = useUser();
  const [staffUsers, setStaffUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceRecords, setAttendanceRecords] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchStaffUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get("/users?roleType=nonStudent");
      setStaffUsers(data || []);
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAttendanceForDate = useCallback(async () => {
    if (!selectedDate || staffUsers.length === 0) return;
    setIsLoading(true);
    try {
      const userIds = staffUsers.map((u) => u.id);
      const data = await apiClient.post("/attendance/bulk", { userIds, date: selectedDate });
      setAttendanceRecords(data || {});
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, staffUsers]);

  useEffect(() => {
    fetchStaffUsers();
  }, [fetchStaffUsers]);

  useEffect(() => {
    fetchAttendanceForDate();
  }, [fetchAttendanceForDate]);

  const handleManualAttendanceChange = async (userId, newStatus) => {
    setIsLoading(true);
    try {
      const updatedRecord = await apiClient.post("/attendance/manual", { userId, date: selectedDate, status: newStatus });
      setAttendanceRecords((prev) => ({
        ...prev,
        [userId]: updatedRecord,
      }));
    } catch (error) {
      console.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staffUsers.filter(u => 
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const stats = {
    present: Object.values(attendanceRecords).filter(r => r.status === 'PRESENT').length,
    late: Object.values(attendanceRecords).filter(r => r.status === 'LATE').length,
    absent: Object.values(attendanceRecords).filter(r => r.status === 'ABSENT').length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight flex items-center gap-2">
            <UserCheck className="text-blue-500" />
            Roster & Presence
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Operational dashboard for staff attendance tracking and manual log adjustments.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-indigo-500/5 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
            <Users size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{staffUsers.length}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Personnel</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-indigo-500/5 flex items-center gap-4 border-l-4 border-l-emerald-500">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.present}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Confirmed Present</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-indigo-500/5 flex items-center gap-4 border-l-4 border-l-amber-500">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.late}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Late Arrivals</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm shadow-indigo-500/5 flex items-center gap-4 border-l-4 border-l-rose-500">
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl border border-rose-100">
            <XCircle size={20} />
          </div>
          <div>
            <p className="text-xl font-black text-slate-900 leading-none">{stats.absent}</p>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Absentees</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-indigo-500/5 overflow-hidden transition-all">
        <div className="p-5 border-b border-slate-50 bg-[#F8FAFC] flex flex-col lg:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-1 bg-blue-600 rounded-full" />
            <div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Personnel Roster</h2>
                <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Attendance Feed</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="relative group w-full sm:w-auto">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full sm:w-48 pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold uppercase tracking-tight focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 cursor-pointer shadow-sm shadow-indigo-500/5"
                max={new Date().toISOString().split("T")[0]}
              />
              <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors" size={14} />
            </div>
            <div className="relative group flex-1 min-w-[200px]">
              <input
                type="text"
                placeholder="Filter roster by identity..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all text-slate-700 hover:border-slate-300 shadow-sm shadow-indigo-500/5"
              />
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-600 transition-colors" size={14} />
            </div>
            <button
               onClick={fetchAttendanceForDate}
               className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-slate-800 to-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-slate-900 hover:to-black shadow-lg shadow-slate-200 transition-all active:scale-95 whitespace-nowrap"
               title="Refresh Feed"
            >
               <RefreshCcw size={12} className={isLoading ? "animate-spin" : ""} />
               <span>Re-Sync Feed</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-[#F8FAFC] border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Personnel Identity</th>
                <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Designation</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Entry</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Session Exit</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Manual Override</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {isLoading && filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center gap-4 opacity-75">
                        <div className="h-10 w-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin shadow-lg" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Synchronizing Personnel Stream...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                       <Users size={48} className="mx-auto text-slate-100 mb-4" />
                       <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Null Recognition Results</h3>
                       <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">Adjust search metrics to locate personnel</p>
                    </td>
                  </tr>
                ) : (
                  filteredStaff.map((staff, index) => {
                    const record = attendanceRecords[staff.id];
                    const status = record?.status || "N/A";
                    return (
                      <motion.tr
                        key={staff.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ delay: Math.min(index * 0.015, 0.3) }}
                        className="group hover:bg-indigo-50/30 transition-all duration-200"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-600 flex items-center justify-center font-black text-[11px] shrink-0 border border-blue-100 shadow-sm group-hover:scale-110 transition-transform">
                              {staff.firstName.charAt(0)}{staff.lastName.charAt(0)}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[13px] font-bold text-slate-800 tracking-tight group-hover:text-blue-600 transition-colors">{staff.firstName} {staff.lastName}</span>
                              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter truncate max-w-[140px]">{staff.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap hidden lg:table-cell">
                           <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-500 text-[10px] font-black uppercase tracking-widest border border-slate-100">
                             {staff.role}
                           </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-[12px] font-bold text-slate-700 font-mono">
                            {record?.checkInTime ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(record.checkInTime)) : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-[12px] font-bold text-slate-700 font-mono">
                            {record?.checkOutTime ? new Intl.DateTimeFormat('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }).format(new Date(record.checkOutTime)) : '—'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border shadow-sm transition-all ${
                            status === "PRESENT" ? "bg-emerald-50 text-emerald-700 border-emerald-100 ring-4 ring-emerald-500/5" :
                            status === "ABSENT" ? "bg-rose-50 text-rose-700 border-rose-100 ring-4 ring-rose-500/5" :
                            status === "LATE" ? "bg-amber-50 text-amber-700 border-amber-100 ring-4 ring-amber-500/5" :
                            "bg-white text-slate-300 border-slate-100"
                          }`}>
                            {status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <select
                            value={status === "N/A" ? "" : status}
                            onChange={(e) => handleManualAttendanceChange(staff.id, e.target.value)}
                            className="px-4 py-2 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all cursor-pointer text-slate-600 hover:border-blue-400 shadow-sm"
                            disabled={isLoading}
                          >
                            <option value="" disabled>Adjust Log</option>
                            <option value="PRESENT">Present</option>
                            <option value="ABSENT">Absent</option>
                            <option value="LATE">Late</option>
                          </select>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
