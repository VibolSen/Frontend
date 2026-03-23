"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  ArrowLeft, MapPin, Users, Box, Calendar, Clock, 
  BookOpen, User, CheckCircle, Info, Layout
} from "lucide-react";
import { motion } from "framer-motion";
import { apiClient } from "@/lib/api";
import BackButton from "@/components/ui/BackButton";

export default function RoomsDetailView({ role = "admin" }) {
  const { id } = useParams();
  const router = useRouter();
  const [room, setRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        setIsLoading(true);
        const data = await apiClient.get(`/rooms/${id}`);
        setRoom(data);
      } catch (err) {
        console.error("Error fetching room details:", err);
        setError("Failed to load room details.");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchRoom();
  }, [id]);

  const sortedSchedules = useMemo(() => {
    if (!room?.schedules) return [];
    return [...room.schedules].sort((a, b) => {
      const aStart = a.sessions?.[0]?.startTime ? new Date(a.sessions[0].startTime) : new Date(0);
      const bStart = b.sessions?.[0]?.startTime ? new Date(b.sessions[0].startTime) : new Date(0);
      return aStart - bStart;
    });
  }, [room]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200">
        <Info size={40} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-800 mb-2">Room Not Found</h2>
        <p className="text-slate-500 mb-6">{error || "The facility you are looking for does not exist."}</p>
        <button 
          onClick={() => router.back()}
          className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-blue-100"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="space-y-4">
        <BackButton onClick={() => router.back()} label="Back to Facilities" className="mb-0" />


        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-blue-100">
              <MapPin size={32} />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-4xl font-black text-slate-800 tracking-tight">
                  {room.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                  room.status === 'ACTIVE' 
                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100' 
                    : 'bg-amber-50 text-amber-600 border-amber-100'
                }`}>
                  {room.status}
                </span>
              </div>
              <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.2em] mt-1">
                {room.type} • Capacity: {room.capacity} Students
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details & Resources */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Box size={14} />
                Available Resources
              </h3>
              <div className="flex flex-wrap gap-2">
                {room.resources && room.resources.length > 0 ? (
                  room.resources.map((res, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 text-[11px] font-black rounded-xl border border-slate-200 flex items-center gap-1.5">
                      <CheckCircle size={10} className="text-emerald-500" />
                      {res}
                    </span>
                  ))
                ) : (
                  <p className="text-xs text-slate-400 italic">No specific resources listed.</p>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-slate-100">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                <Layout size={14} />
                Facility Stats
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-center">
                  <p className="text-2xl font-black text-blue-600">{room.schedules?.length || 0}</p>
                  <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Schedules</p>
                </div>
                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100 text-center">
                  <p className="text-2xl font-black text-indigo-600">{room.capacity}</p>
                  <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">Max Seats</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Schedule / Bookings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <Calendar size={14} />
                Upcoming Bookings
              </h3>
            </div>

            <div className="space-y-4">
              {sortedSchedules.length > 0 ? (
                sortedSchedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-blue-200 transition-colors group">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <p className="text-sm font-black text-slate-800">{schedule.title}</p>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            <BookOpen size={12} className="text-slate-400" />
                            {schedule.course?.name || "No Course"}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-500">
                            <Users size={12} className="text-slate-400" />
                            {schedule.assignedToGroup?.name || "No Group"}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-1">
                        <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-100">
                          <Clock size={12} />
                          {schedule.isRecurring ? (
                            <span>{schedule.daysOfWeek?.join(", ")}</span>
                          ) : (
                            <span>{schedule.startDate ? new Date(schedule.startDate).toLocaleDateString() : 'N/A'}</span>
                          )}
                        </div>
                        {schedule.assignedToTeacher && (
                          <div className="flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <User size={10} />
                            {schedule.assignedToTeacher.firstName} {schedule.assignedToTeacher.lastName}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-2xl">
                  <p className="text-sm font-bold text-slate-300">No active bookings for this facility.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
