"use client";

import { useState, useEffect } from "react";
import StatusMessage from "@/components/StatusMessage";
import StudentAttendanceControls from "./StudentAttendanceControls";
import StudentAttendanceList from "./StudentAttendanceList";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

import { apiClient } from "@/lib/api";
import { UserCheck, ShieldAlert, ClipboardCheck } from "lucide-react";

export default function StudentAttendanceView() {
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const data = await apiClient.get("/groups");
        setGroups(data || []);
      } catch (error) {
        console.error("Error fetching groups:", error);
        setGroups([]);
      }
    };
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroup) {
      const fetchStudents = async () => {
        setIsLoading(true);
        try {
          const data = await apiClient.get(`/groups/${selectedGroup}/students`);
          setStudents(data || []);
        } catch (error) {
           console.error("Error fetching students:", error);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudents();
    } else {
      setStudents([]);
    }
  }, [selectedGroup]);

  useEffect(() => {
    if (selectedGroup && date) {
      const fetchAttendance = async () => {
        try {
          const data = await apiClient.get(`/attendance?groupId=${selectedGroup}&date=${date}`);
          const attendanceMap = {};
          (data || []).forEach((att) => {
            attendanceMap[att.studentId] = att.status;
          });
          setAttendance(attendanceMap);
        } catch (error) {
          console.error("Error fetching attendance:", error);
        }
      };
      fetchAttendance();
    }
  }, [selectedGroup, date]);

  const handleAttendanceChange = (studentId, status) => {
    setAttendance((prev) => ({ ...prev, [studentId]: status }));
  };

  const handleSaveAttendance = async () => {
    setIsSaving(true);
    setStatusMessage(null);
    const attendances = Object.keys(attendance).map((studentId) => ({
      studentId,
      status: attendance[studentId],
    }));

    try {
      await apiClient.post("/attendance/sync", { 
        groupId: selectedGroup,
        date, 
        attendances 
      });

      setStatusMessage({
        type: "success",
        message: "Attendance records synchronized successfully!",
      });
    } catch (error) {
      setStatusMessage({
        type: "error",
        message: error.message || "Failed to synchronize attendance records.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const STATUS_CFG = {
    PRESENT: { label: "Present", color: "text-emerald-600", bg: "bg-emerald-600", light: "bg-emerald-50", border: "border-emerald-100", ring: "ring-emerald-500/10" },
    ABSENT: { label: "Absent", color: "text-rose-600", bg: "bg-rose-600", light: "bg-rose-50", border: "border-rose-100", ring: "ring-rose-500/10" },
    LATE: { label: "Late", color: "text-amber-600", bg: "bg-amber-600", light: "bg-amber-50", border: "border-amber-100", ring: "ring-amber-500/10" },
  };

  const handleMarkAll = (status) => {
    const newAttendance = {};
    students.forEach((student) => {
      newAttendance[student.id] = status;
    });
    setAttendance(newAttendance);
  };

  const getStatusColor = (status) => {
    if (!status) return "bg-slate-50 text-slate-400 border-slate-200";
    const cfg = STATUS_CFG[status];
    return `${cfg.light} ${cfg.color} ${cfg.border}`;
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight flex items-center gap-2">
            <ClipboardCheck className="text-blue-500" />
            Attendance Management
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Monitor and adjust student attendance logs across all academic groups.
          </p>
        </div>
      </div>

      {statusMessage && (
        <div className="mb-6">
          <StatusMessage
            type={statusMessage.type}
            message={statusMessage.message}
          />
        </div>
      )}

      <StudentAttendanceControls
        groups={groups}
        selectedGroup={selectedGroup}
        setSelectedGroup={setSelectedGroup}
        date={date}
        setDate={setDate}
        handleSaveAttendance={handleSaveAttendance}
        isSaving={isSaving}
        students={students}
      />

      {isLoading ? (
        <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-24 text-center">
            <div className="flex flex-col items-center justify-center gap-4">
                <LoadingSpinner size="lg" color="blue" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Requesting Cohort Data...</p>
            </div>
        </div>
      ) : selectedGroup && students.length > 0 ? (
        <StudentAttendanceList
          students={students}
          attendance={attendance}
          handleAttendanceChange={handleAttendanceChange}
          getStatusColor={getStatusColor}
          STATUS_CFG={STATUS_CFG}
          handleMarkAll={handleMarkAll}
        />
      ) : selectedGroup ? (
        <div className="bg-white rounded-2xl border border-slate-200 border-dashed p-24 text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-50 rounded-2xl flex items-center justify-center border border-slate-100">
                <ShieldAlert size={32} className="text-slate-300" />
            </div>
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight mb-1">No Participants Registered</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">This group does not contain any active students</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-24 text-center">
            <div className="w-20 h-20 mx-auto mb-6 bg-blue-50 rounded-3xl flex items-center justify-center border border-blue-100/50">
                <UserCheck size={40} className="text-blue-500" />
            </div>
            <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2 italic">Select Academic Group</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium">
                Choose a specific group to view and manage their attendance presence records.
            </p>
        </div>
      )}
    </div>
  );
}
