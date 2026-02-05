"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

export default function StudyOfficeAttendancePage() {
  const { user } = useUser();
  const [attendanceRecord, setAttendanceRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // Update every minute
    return () => clearInterval(timer);
  }, []);

  const fetchAttendanceStatus = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await apiClient.get(`/attendance?userId=${user.id}`);
      setAttendanceRecord(data);
    } catch (error) {
      console.error("Error fetching attendance status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceStatus();
  }, [user]);

  const handleAction = async (actionType) => {
    if (!user) {
      console.error("User not logged in.");
      return;
    }
    setIsLoading(true);
    try {
      const updatedRecord = await apiClient.post("/attendance", { userId: user.id, action: actionType });
      setAttendanceRecord(updatedRecord);
      console.log(`Successfully ${actionType.replace("_", " ").toLowerCase()}!`);
    } catch (error) {
      console.error(`Error during ${actionType}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  const canCheckIn = !attendanceRecord?.checkInTime && currentTime.getHours() < 17;
  const canCheckOut = attendanceRecord?.checkInTime && !attendanceRecord?.checkOutTime;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Staff Attendance</h1>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <p className="text-lg text-slate-700 mb-4">
          Welcome, {user?.firstName} {user?.lastName}!
        </p>

        <div className="text-md text-slate-600 mb-6">
          <p>Check-in Time: {attendanceRecord?.checkInTime ? new Date(attendanceRecord.checkInTime).toLocaleTimeString() : 'N/A'}</p>
          <p>Check-out Time: {attendanceRecord?.checkOutTime ? new Date(attendanceRecord.checkOutTime).toLocaleTimeString() : 'N/A'}</p>
          {attendanceRecord?.status === 'LATE' && (
            <p className="text-red-500">Status: {attendanceRecord.note}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div>
            <button
              onClick={() => handleAction("CHECK_IN")}
              disabled={isLoading || !canCheckIn}
              className={`px-6 py-3 rounded-md text-white font-semibold transition-colors ${
                isLoading || !canCheckIn
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {isLoading ? (
                <LoadingSpinner size="xs" color="white" />
              ) : "Check In"}
            </button>
            {!canCheckIn && !attendanceRecord?.checkInTime && (
              <p className="text-sm text-red-500 mt-2">Check-in is not available after 5:00 PM.</p>
            )}
          </div>
          {canCheckOut && (
            <button
              onClick={() => handleAction("CHECK_OUT")}
              disabled={isLoading}
              className={`px-6 py-3 rounded-md text-white font-semibold transition-colors ${
                isLoading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              }`}
            >
              {isLoading ? (
                <LoadingSpinner size="xs" color="white" />
              ) : "Check Out"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
