"use client";

import { motion } from "framer-motion";

export default function StudentAttendanceList({
  students,
  attendance,
  handleAttendanceChange,
  STATUS_CFG,
  handleMarkAll,
}) {
  return (
    <div className="bg-white rounded-[2rem] shadow-sm overflow-hidden border border-slate-200">
      {/* Table Header */}
      <div className="bg-slate-50/50 px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-[0.15em]">Enrolled Students</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            {students.length} active participants in this cohort
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mr-1">Mark Group:</span>
          <div className="flex gap-1.5">
            {Object.entries(STATUS_CFG).map(([key, cfg]) => (
              <button
                key={key}
                onClick={() => handleMarkAll(key)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider border transition-all ${cfg.light} ${cfg.color} ${cfg.border} hover:shadow-md active:scale-95`}
              >
                {cfg.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-slate-50">
              <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Student Profile
              </th>
              <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                Attendance Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((student, index) => (
              <tr
                key={student.id}
                className="hover:bg-slate-50/50 transition-colors duration-150 group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl flex items-center justify-center font-black text-blue-600 text-[12px] group-hover:scale-105 transition-transform shadow-sm">
                        {student.firstName?.[0] ?? ''}
                        {student.lastName?.[0] ?? ''}
                    </div>
                    <div>
                      <div className="text-[13px] font-bold text-slate-800 tracking-tight leading-none mb-1">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">#{student.studentId || "UNASSIGNED"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-center gap-1.5">
                    {Object.entries(STATUS_CFG).map(([key, cfg]) => {
                      const isActive = attendance[student.id] === key;
                      return (
                        <button
                          key={key}
                          onClick={() => handleAttendanceChange(student.id, key)}
                          className={`
                            px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 border
                            ${isActive 
                              ? `${cfg.bg} text-white ${cfg.border} shadow-lg ${cfg.ring} scale-105` 
                              : `bg-white text-slate-400 border-slate-100 hover:border-slate-200 hover:text-slate-600`
                            }
                          `}
                        >
                          {cfg.label}
                        </button>
                      );
                    })}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-slate-50/30 px-6 py-4 border-t border-slate-100">
        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <div className="flex items-center gap-4">
            <span>Presence Logs: {students.length} Total</span>
            {Object.entries(STATUS_CFG).map(([key, cfg]) => {
              const count = Object.values(attendance).filter(v => v === key).length;
              return (
                <span key={key} className={cfg.color}>{cfg.label}: {count}</span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
