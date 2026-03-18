"use client";

import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Calendar, Users, Save, ChevronDown } from "lucide-react";

export default function StudentAttendanceControls({
  groups,
  selectedGroup,
  setSelectedGroup,
  date,
  setDate,
  handleSaveAttendance,
  isSaving,
  students,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-slate-200">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Group Selection */}
        <div className="space-y-2">
          <label
            htmlFor="group-select"
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"
          >
            <Users size={12} className="text-blue-500" />
            Academic Group
          </label>
          <div className="relative">
            <select
              id="group-select"
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="">Choose a group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <label
            htmlFor="date-select"
            className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1"
          >
            <Calendar size={12} className="text-indigo-500" />
            Session Date
          </label>
          <input
            id="date-select"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all duration-200 cursor-pointer"
          />
        </div>

        {/* Save Button */}
        <div className="flex items-end">
          <button
            className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-blue-200 hover:from-blue-700 hover:to-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2"
            onClick={handleSaveAttendance}
            disabled={isSaving || !selectedGroup || students.length === 0}
          >
            {isSaving ? (
              <LoadingSpinner size="xs" color="white" />
            ) : (
              <>
                <Save size={14} />
                <span>Save Attendance</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
