"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

const StaffAttendanceTerminal = () => {
  const { user } = useUser();
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const userId = user?.id || user?.userId;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceStatus = async () => {
    if (!userId) return;
    setIsLoading(true);
    try {
      const data = await apiClient.get(`/attendance?userId=${userId}`);
      setAttendanceRecord(data);
    } catch (error) {
      console.error("Error fetching attendance status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, [userId]);

  const handleAction = async (actionType) => {
    if (!userId) {
      toast.error("User identity not verified.");
      return;
    }
    setIsLoading(true);
    try {
      const endpoint = actionType === "CHECK_IN" ? "/attendance/check-in" : "/attendance/check-out";
      const updatedRecord = await apiClient.post(endpoint, { userId: userId });
      setAttendanceRecord(updatedRecord);
      toast.success(actionType === "CHECK_IN" ? "Shift initiated successfully!" : "Shift terminated successfully!");
    } catch (error) {
      const errorMsg = error.response?.data?.error || "Transaction failed.";
      toast.error(errorMsg);
      console.error(`Error during ${actionType}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const canCheckIn = !attendanceRecord?.checkInTime && currentTime.getHours() < 17;
  const canCheckOut = attendanceRecord?.checkInTime && !attendanceRecord?.checkOutTime;

  const formatLateMinutes = (totalMinutes) => {
    if (!totalMinutes) return "";
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) return `${minutes} minutes`;
    if (minutes === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours} hour${hours > 1 ? 's' : ''} and ${minutes} minute${minutes > 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-4 max-w-2xl mx-auto py-4">
      <div className="flex justify-between items-end px-2">
        <div>
          <h1 className="text-xl font-black text-slate-900 tracking-tight">Staff Attendance</h1>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-wider">Shift Terminal</p>
        </div>
        <div className="text-right">
          <p className="text-xl font-black text-indigo-600 tabular-nums leading-none">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
            {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
        <div className="p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shrink-0">
              <span className="text-sm font-black">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-black text-slate-800 truncate">Welcome, {user?.firstName}</p>
              <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{user?.role} Session</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-0.5">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Clock-In</p>
              <p className="text-sm font-black text-slate-700">
                {attendanceRecord?.checkInTime ? new Date(attendanceRecord.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </p>
            </div>
            <div className="p-4 bg-slate-50/50 rounded-xl border border-slate-100 space-y-0.5">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Clock-Out</p>
              <p className="text-sm font-black text-slate-700">
                {attendanceRecord?.checkOutTime ? new Date(attendanceRecord.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '--:--'}
              </p>
            </div>
          </div>

          {attendanceRecord?.status === 'LATE' && (
            <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex items-center gap-2 text-rose-700">
              <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0" />
              <p className="text-[9px] font-black uppercase tracking-wider">
                Late Arrival: {formatLateMinutes(attendanceRecord.lateMinutes)}
              </p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={() => handleAction("CHECK_IN")}
              disabled={isLoading || !canCheckIn}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md ${
                isLoading || !canCheckIn
                  ? "bg-slate-50 text-slate-300 cursor-not-allowed shadow-none border border-slate-100"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 hover:-translate-y-0.5"
              }`}
            >
              {isLoading && !attendanceRecord?.checkInTime ? <LoadingSpinner size="xs" color="white" /> : "Start Shift"}
            </button>
            
            <button
              onClick={() => handleAction("CHECK_OUT")}
              disabled={isLoading || !canCheckOut}
              className={`flex-1 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-md ${
                isLoading || !canCheckOut
                  ? "bg-slate-50 text-slate-300 cursor-not-allowed shadow-none border border-slate-100"
                  : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200 hover:-translate-y-0.5"
              }`}
            >
              {isLoading && attendanceRecord?.checkInTime && !attendanceRecord?.checkOutTime ? <LoadingSpinner size="xs" color="white" /> : "End Shift"}
            </button>
          </div>

          {!canCheckIn && !attendanceRecord?.checkInTime && currentTime.getHours() >= 17 && (
            <p className="text-center text-[9px] font-bold text-rose-500 italic">Check-in window closed (After 5:00 PM)</p>
          )}

          {attendanceRecord?.checkInTime && attendanceRecord?.checkOutTime && (
            <p className="text-center text-[9px] font-bold text-emerald-600 italic">Today's shift has been successfully completed.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StaffAttendanceTerminal;
