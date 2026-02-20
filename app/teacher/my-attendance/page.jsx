"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";
import { toast } from "react-hot-toast";

export default function TeacherAttendancePage() {
  const { user } = useUser();
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  const teacherId = user?.id || user?.userId;

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000); // Update every second
    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceStatus = async () => {
    if (!teacherId) return;
    setIsLoading(true);
    try {
      const data = await apiClient.get(`/attendance?userId=${teacherId}`);
      setAttendanceRecord(data);
    } catch (error) {
      console.error("Error fetching attendance status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, [teacherId]);

  const handleAction = async (actionType) => {
    if (!teacherId) {
      toast.error("User identity not verified.");
      return;
    }
    setIsLoading(true);
    try {
      const endpoint = actionType === "CHECK_IN" ? "/attendance/check-in" : "/attendance/check-out";
      const updatedRecord = await apiClient.post(endpoint, { userId: teacherId });
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
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Staff Attendance</h1>
          <p className="text-slate-500 font-medium text-sm">Real-time terminal for personnel time-tracking.</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-black text-indigo-600 tabular-nums">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
          </p>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            {currentTime.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="p-8 space-y-8">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100">
              <span className="text-xl font-black">{user?.firstName?.[0]}{user?.lastName?.[0]}</span>
            </div>
            <div>
              <p className="text-lg font-black text-slate-800">Welcome back, {user?.firstName}!</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">System Authenticated: {user?.role}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Check-In</p>
              <p className="text-xl font-black text-slate-700">
                {attendanceRecord?.checkInTime ? new Date(attendanceRecord.checkInTime).toLocaleTimeString() : '--:-- --'}
              </p>
            </div>
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Shift Check-Out</p>
              <p className="text-xl font-black text-slate-700">
                {attendanceRecord?.checkOutTime ? new Date(attendanceRecord.checkOutTime).toLocaleTimeString() : '--:-- --'}
              </p>
            </div>
          </div>

          {attendanceRecord?.status === 'LATE' && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-center gap-3 text-rose-700">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <p className="text-xs font-black uppercase tracking-wider">
                Clock-in Exception: Late by {formatLateMinutes(attendanceRecord.lateMinutes)}
              </p>
            </div>
          )}

          <div className="flex items-center gap-4 pt-4">
            <button
              onClick={() => handleAction("CHECK_IN")}
              disabled={isLoading || !canCheckIn}
              className={`flex-1 py-4 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg ${
                isLoading || !canCheckIn
                  ? "bg-slate-100 text-slate-400 cursor-not-allowed shadow-none"
                  : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-200 hover:-translate-y-0.5"
              }`}
            >
              {isLoading ? <LoadingSpinner size="xs" color="white" /> : "Initiate Shift"}
            </button>
            
            {canCheckOut && (
              <button
                onClick={() => handleAction("CHECK_OUT")}
                disabled={isLoading}
                className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-slate-800 transition-all hover:-translate-y-0.5"
              >
                {isLoading ? <LoadingSpinner size="xs" color="white" /> : "Terminate Shift"}
              </button>
            )}
          </div>

          {!canCheckIn && !attendanceRecord?.checkInTime && currentTime.getHours() >= 17 && (
            <div className="text-center">
              <p className="text-xs font-bold text-rose-500">Terminal Locked: Check-in window closed after 5:00 PM.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}