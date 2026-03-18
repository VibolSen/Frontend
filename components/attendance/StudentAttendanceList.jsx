"use client";

import { motion } from "framer-motion";

export default function StudentAttendanceList({
  students,
  attendance,
  handleAttendanceChange,
  getStatusColor,
}) {
  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-200">
      {/* Table Header */}
      <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div>
          <h2 className="text-[13px] font-black text-slate-800 uppercase tracking-tight">Enrolled Students</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
            {students.length} students in this cohort
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Student Profile
              </th>
              <th className="px-6 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest w-64">
                Attendance Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {students.map((student, index) => (
              <tr
                key={student.id}
                className="hover:bg-slate-50 transition-colors duration-150 group"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl flex items-center justify-center font-black text-blue-600 text-[11px] group-hover:scale-110 transition-transform">
                        {student.firstName?.[0] ?? ''}
                        {student.lastName?.[0] ?? ''}
                    </div>
                    <div>
                      <div className="text-[12px] font-bold text-slate-800 tracking-tight">
                        {student.firstName} {student.lastName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">#{student.studentId || "N/A"}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <select
                    value={attendance[student.id] || ""}
                    onChange={(e) =>
                      handleAttendanceChange(student.id, e.target.value)
                    }
                    className={`w-full px-4 py-2 border border-slate-200 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 cursor-pointer ${getStatusColor(
                      attendance[student.id]
                    )}`}
                  >
                    <option value="">-- Status --</option>
                    <option value="PRESENT">Present</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">Late</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-slate-50/50 px-6 py-3 border-t border-slate-100">
        <div className="flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
          <span>Student Census: {students.length} total</span>
        </div>
      </div>
    </div>
  );
}
