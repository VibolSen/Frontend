"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react";
import Link from "next/link";
import moment from "moment";

export default function UpcomingSchedule({ teacherId, groupId }) {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSchedule = async () => {
      try {
        const query = teacherId ? `?teacherId=${teacherId}` : `?groupId=${groupId}`;
        const data = await apiClient.get(`/schedules${query}`);
        
        // Flatten sessions and find upcoming ones
        const allSessions = (data || []).flatMap(schedule => 
            (schedule.sessions || []).map(session => ({
                ...session,
                title: schedule.title,
                location: schedule.location,
                isRecurring: schedule.isRecurring,
                daysOfWeek: schedule.daysOfWeek,
                startDate: schedule.startDate,
                endDate: schedule.endDate,
                groupName: schedule.assignedToGroup?.name
            }))
        );

        // Filter and sort for upcoming sessions (today or future)
        // Simplified Logic: Just show the sessions defined in the system
        const now = moment();
        const upcoming = allSessions
            .sort((a, b) => {
                const timeA = moment(a.startTime, "HH:mm");
                const timeB = moment(b.startTime, "HH:mm");
                return timeA.diff(timeB);
            })
            .slice(0, 3);

        setSchedules(upcoming);
      } catch (error) {
        console.error("Failed to fetch upcoming schedule:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSchedule();
  }, [teacherId, groupId]);

  if (loading) return (
    <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 animate-pulse">
        <div className="h-4 w-32 bg-slate-100 dark:bg-slate-800 rounded mb-4"></div>
        <div className="space-y-3">
            <div className="h-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
            <div className="h-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl"></div>
        </div>
    </div>
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between bg-slate-50/30 dark:bg-slate-800/30">
        <h3 className="text-sm font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <Calendar size={16} className="text-indigo-500" />
            Upcoming Classes
        </h3>
        <Link href={teacherId ? "/teacher/schedule" : "/student/schedule"} className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center">
            View All <ChevronRight size={12} />
        </Link>
      </div>

      <div className="p-2 space-y-2">
        {schedules.length === 0 ? (
            <p className="text-xs text-slate-400 dark:text-slate-500 p-4 text-center italic">No classes scheduled.</p>
        ) : (
            schedules.map((session, idx) => (
                <div key={idx} className="p-3 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl hover:border-indigo-100 dark:hover:border-indigo-900/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-900/10 transition-all group">
                    <div className="flex justify-between items-start mb-1">
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-indigo-700 dark:group-hover:text-indigo-400 transition-colors truncate max-w-[150px]">
                            {session.title}
                        </h4>
                        <span className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-1.5 py-0.5 rounded">
                            {moment(session.startTime).format("HH:mm")}
                        </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium whitespace-nowrap">
                            <Clock size={10} className="text-slate-400 dark:text-slate-500" />
                            {moment(session.startTime).format("h:mm A")} - {moment(session.endTime).format("h:mm A")}
                        </div>
                        {session.location && (
                            <div className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                                <MapPin size={10} className="text-rose-400" />
                                {session.location}
                            </div>
                        )}
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
}
