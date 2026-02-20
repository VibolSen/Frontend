"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, Calendar, BookOpen,
  GraduationCap, AlertCircle, Star, CheckCircle, X, Save,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const MONTHS = ["January","February","March","April","May","June",
  "July","August","September","October","November","December"];
const DAYS_SHORT = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

const EVENT_TYPES = {
  EXAM:        { label: "Exam",           color: "bg-rose-500",    light: "bg-rose-50",    text: "text-rose-700",    border: "border-rose-200",    icon: BookOpen },
  HOLIDAY:     { label: "Holiday",        color: "bg-amber-400",   light: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-200",   icon: Star },
  ENROLLMENT:  { label: "Enrollment",     color: "bg-indigo-500",  light: "bg-indigo-50",  text: "text-indigo-700",  border: "border-indigo-200",  icon: GraduationCap },
  ASSIGNMENT:  { label: "Assignment Due", color: "bg-blue-500",    light: "bg-blue-50",    text: "text-blue-700",    border: "border-blue-200",    icon: CheckCircle },
  MEETING:     { label: "Meeting",        color: "bg-violet-500",  light: "bg-violet-50",  text: "text-violet-700",  border: "border-violet-200",  icon: AlertCircle },
  OTHER:       { label: "Other",          color: "bg-slate-400",   light: "bg-slate-50",   text: "text-slate-700",   border: "border-slate-200",   icon: Calendar },
};

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate();
}
function getFirstDayOfMonth(year, month) {
  return new Date(year, month, 1).getDay();
}

// ── Add Event Modal ──────────────────────────────────────────────────────
function AddEventModal({ selectedDate, onClose, onSave }) {
  const [form, setForm] = useState({
    title: "", type: "OTHER", startDate: selectedDate || "", endDate: selectedDate || "", description: "",
  });
  const valid = form.title.trim() && form.startDate && form.endDate;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-black text-slate-800">Add Calendar Event</h2>
            <p className="text-[10px] text-slate-400 font-medium mt-0.5">{selectedDate || "Select dates below"}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 transition-all">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Event Title *</label>
            <input type="text" placeholder="e.g. Midterm Exams Week" value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all" />
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Event Type</label>
            <div className="grid grid-cols-3 gap-2">
              {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
                <button key={key} onClick={() => setForm({ ...form, type: key })}
                  className={`px-2 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${
                    form.type === key ? `${cfg.color} text-white border-transparent shadow-sm` : `bg-white ${cfg.text} ${cfg.border} hover:${cfg.light}`
                  }`}>{cfg.label}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Start Date *</label>
              <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all" />
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">End Date *</label>
              <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-300 transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2} placeholder="Optional notes..."
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none transition-all" />
          </div>
        </div>
        <div className="flex gap-3 pt-2 border-t border-slate-50">
          <button onClick={onClose} className="flex-1 py-2.5 border border-slate-200 rounded-xl text-[11px] font-black text-slate-500 hover:bg-slate-50 transition-all">Cancel</button>
          <button onClick={() => onSave(form)} disabled={!valid}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-black rounded-xl shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 transition-all disabled:opacity-50">
            <Save size={13} />Save Event
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main Calendar Component ───────────────────────────────────────────────
export default function AcademicCalendarView() {
  const today = new Date();
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [selectedDate, setSelectedDate] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [filterType, setFilterType] = useState("ALL");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchEvents = async () => {
      setIsLoading(true);
      try {
        const data = await apiClient.get(`/academic-calendar?year=${currentYear}`);
        if (Array.isArray(data) && data.length > 0) setEvents(data);
      } catch { /* use mock */ }
      finally { setIsLoading(false); }
    };
    fetchEvents();
  }, [currentYear]);

  const prevMonth = () => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear((y) => y - 1); }
    else setCurrentMonth((m) => m - 1);
  };
  const nextMonth = () => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear((y) => y + 1); }
    else setCurrentMonth((m) => m + 1);
  };

  const handleSaveEvent = async (form) => {
    const newEvent = { ...form, id: `evt-${Date.now()}` };
    try { await apiClient.post("/academic-calendar", newEvent); } catch { /* fallback */ }
    setEvents((prev) => [...prev, newEvent]);
    setShowModal(false);
  };

  // Events for current month+filter
  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const start = new Date(e.startDate);
      const matchMonth = start.getFullYear() === currentYear && start.getMonth() === currentMonth;
      const matchType = filterType === "ALL" || e.type === filterType;
      return matchMonth && matchType;
    });
  }, [events, currentYear, currentMonth, filterType]);

  // Build map: dateStr → events[]
  const eventsByDate = useMemo(() => {
    const map = {};
    events.forEach((ev) => {
      const start = new Date(ev.startDate);
      const end = ev.endDate ? new Date(ev.endDate) : start;
      const cur = new Date(start);
      while (cur <= end) {
        const key = cur.toISOString().split("T")[0];
        if (!map[key]) map[key] = [];
        map[key].push(ev);
        cur.setDate(cur.getDate() + 1);
      }
    });
    return map;
  }, [events]);

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const cells = Array(firstDay).fill(null).concat(
    Array.from({ length: daysInMonth }, (_, i) => i + 1)
  );
  while (cells.length % 7 !== 0) cells.push(null);

  // Upcoming events (next 5 in sorted order)
  const upcomingEvents = useMemo(() =>
    events
      .filter((e) => new Date(e.startDate) >= today)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 6),
    [events]
  );

  return (
    <div className="min-h-screen bg-slate-50/20 pb-12">
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        {showModal && (
          <AddEventModal
            selectedDate={selectedDate}
            onClose={() => setShowModal(false)}
            onSave={handleSaveEvent}
          />
        )}

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-black text-indigo-600 tracking-tight">Academic Calendar</h1>
            <p className="text-slate-500 font-medium text-sm mt-0.5">
              Manage exams, enrollment windows, holidays, and key academic dates.
            </p>
          </div>
          <button onClick={() => { setSelectedDate(null); setShowModal(true); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-violet-700 transition-all self-start">
            <Plus size={14} />Add Event
          </button>
        </div>

        {/* Event Type Legend / Filter */}
        <div className="flex flex-wrap items-center gap-2">
          <button onClick={() => setFilterType("ALL")}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filterType === "ALL" ? "bg-slate-800 text-white border-transparent" : "bg-white text-slate-500 border-slate-200"}`}>
            All
          </button>
          {Object.entries(EVENT_TYPES).map(([key, cfg]) => (
            <button key={key} onClick={() => setFilterType(key)}
              className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${filterType === key ? `${cfg.color} text-white border-transparent` : `bg-white ${cfg.text} ${cfg.border}`}`}>
              {cfg.label}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* ── Calendar Grid ─────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              {/* Month Nav */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <button onClick={prevMonth} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all">
                  <ChevronLeft size={16} />
                </button>
                <div className="text-center">
                  <h2 className="text-base font-black text-slate-800">{MONTHS[currentMonth]} {currentYear}</h2>
                </div>
                <button onClick={nextMonth} className="p-2 rounded-xl bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-all">
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 border-b border-slate-100">
                {DAYS_SHORT.map((d) => (
                  <div key={d} className="py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">{d}</div>
                ))}
              </div>

              {/* Date cells */}
              <div className="grid grid-cols-7">
                {cells.map((day, i) => {
                  if (!day) return <div key={i} className="h-24 border-b border-r border-slate-50/50" />;
                  const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
                  const dayEvents = eventsByDate[dateStr] || [];
                  const isToday = today.getDate() === day && today.getMonth() === currentMonth && today.getFullYear() === currentYear;
                  const isSelected = selectedDate === dateStr;

                  return (
                    <div key={i}
                      onClick={() => { setSelectedDate(dateStr); }}
                      className={`h-24 border-b border-r border-slate-50/50 p-1.5 cursor-pointer transition-colors group relative ${
                        isToday ? "bg-indigo-50/50" : isSelected ? "bg-slate-50" : "hover:bg-slate-50/50"
                      }`}>
                      <div className={`w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-black transition-all mb-1 ${
                        isToday ? "bg-indigo-600 text-white shadow-sm shadow-indigo-200" : "text-slate-700 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                      }`}>
                        {day}
                      </div>
                      <div className="space-y-0.5 overflow-hidden">
                        {dayEvents.slice(0, 2).map((ev, ei) => {
                          const evType = EVENT_TYPES[ev.type] || EVENT_TYPES.OTHER;
                          return (
                            <div key={ei} className={`px-1.5 py-0.5 rounded text-[8px] font-black truncate ${evType.color} text-white`}>
                              {ev.title}
                            </div>
                          );
                        })}
                        {dayEvents.length > 2 && (
                          <p className="text-[8px] font-black text-slate-400 pl-1">+{dayEvents.length - 2} more</p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Sidebar ───────────────────────────────── */}
          <div className="space-y-4">
            {/* This month events */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-[12px] font-black text-slate-800">This Month</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{filteredEvents.length} event{filteredEvents.length !== 1 ? "s" : ""}</p>
              </div>
              <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                {filteredEvents.length === 0 ? (
                  <div className="px-5 py-8 text-center">
                    <Calendar size={24} className="text-slate-200 mx-auto mb-2" />
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">No events</p>
                  </div>
                ) : filteredEvents.map((ev, i) => {
                  const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.OTHER;
                  return (
                    <motion.div key={ev.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                      className={`flex items-start gap-3 px-4 py-3 hover:${cfg.light} transition-colors`}>
                      <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${cfg.color}`} />
                      <div className="min-w-0">
                        <p className="text-[11px] font-black text-slate-800 truncate">{ev.title}</p>
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5">{ev.startDate}{ev.endDate !== ev.startDate ? ` → ${ev.endDate}` : ""}</p>
                        <span className={`inline-block text-[8px] font-black px-1.5 py-0.5 rounded mt-1 ${cfg.light} ${cfg.text}`}>{cfg.label}</span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Upcoming events */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-[12px] font-black text-slate-800">Upcoming</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">Next scheduled events</p>
              </div>
              <div className="divide-y divide-slate-50">
                {upcomingEvents.map((ev, i) => {
                  const cfg = EVENT_TYPES[ev.type] || EVENT_TYPES.OTHER;
                  const daysLeft = Math.ceil((new Date(ev.startDate) - today) / 86400000);
                  return (
                    <div key={ev.id || i} className="flex items-center gap-3 px-4 py-3">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${cfg.light}`}>
                        <cfg.icon size={14} className={cfg.text} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-slate-800 truncate">{ev.title}</p>
                        <p className="text-[9px] text-slate-400 font-medium">{ev.startDate}</p>
                      </div>
                      <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${daysLeft <= 7 ? "bg-rose-50 text-rose-600" : "bg-slate-50 text-slate-500"}`}>
                        {daysLeft === 0 ? "Today" : `${daysLeft}d`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const MOCK_EVENTS = [
  { id: "e1", title: "Midterm Exams", type: "EXAM", startDate: "2025-03-10", endDate: "2025-03-14", description: "CS & Engineering midterm examinations" },
  { id: "e2", title: "Khmer New Year", type: "HOLIDAY", startDate: "2025-04-14", endDate: "2025-04-16", description: "Khmer New Year national holiday" },
  { id: "e3", title: "Enrollment Window S2", type: "ENROLLMENT", startDate: "2025-04-01", endDate: "2025-04-07", description: "Open enrollment for Semester 2" },
  { id: "e4", title: "Final Exams", type: "EXAM", startDate: "2025-06-02", endDate: "2025-06-13", description: "Final examinations for all departments" },
  { id: "e5", title: "Web Dev Assignment Due", type: "ASSIGNMENT", startDate: "2025-03-20", endDate: "2025-03-20", description: "CS303 final project submission" },
  { id: "e6", title: "Faculty Meeting", type: "MEETING", startDate: "2025-03-05", endDate: "2025-03-05", description: "Quarterly faculty review" },
  { id: "e7", title: "International Workers Day", type: "HOLIDAY", startDate: "2025-05-01", endDate: "2025-05-01", description: "National holiday" },
  { id: "e8", title: "Graduation Ceremony", type: "OTHER", startDate: "2025-07-15", endDate: "2025-07-15", description: "Annual graduation ceremony" },
  { id: "e9", title: "Semester 1 Enrollment", type: "ENROLLMENT", startDate: "2025-09-01", endDate: "2025-09-10", description: "New academic year enrollment" },
];
