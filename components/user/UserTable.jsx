"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Edit, Eye, Trash2, Search, ShieldCheck, Filter, Lock, Power, Building2, GraduationCap } from "lucide-react";
import { motion } from "framer-motion";

const SortIndicator = ({ direction }) => {
  if (!direction) return null;
  return <span className="text-indigo-600 ml-1">{direction === "ascending" ? "↑" : "↓"}</span>;
};

const yearLabels = { 1: "Year 1", 2: "Year 2", 3: "Year 3", 4: "Year 4" };
const yearColors = {
  1: "bg-blue-50 text-blue-700 border-blue-100",
  2: "bg-indigo-50 text-indigo-700 border-indigo-100",
  3: "bg-violet-50 text-violet-700 border-violet-100",
  4: "bg-purple-50 text-purple-700 border-purple-100",
};

export default function UserTable({
  users = [],
  onAddUserClick,
  onEditClick,
  onDeleteClick,
  onToggleStatus,
  onResetPassword,
  onMigrate,
  allRoles = [],
  isLoading = false,
  currentUserRole,
  selectedUserIds = [],
  onSelectionChange,
  initialRoleFilter = "All",
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState(initialRoleFilter);
  const [yearFilter, setYearFilter] = useState("All");
  const [deptFilter, setDeptFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [sortConfig, setSortConfig] = useState({ key: "firstName", direction: "ascending" });

  const isStudentView = roleFilter === "STUDENT";

  // Derive unique departments from users for filter dropdown
  const uniqueDepartments = useMemo(() => {
    const map = new Map();
    users.forEach(u => {
      if (u.department) map.set(u.department.id, u.department.name);
    });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const fullName = `${user.firstName} ${user.lastName}`;
      const matchesSearch =
        fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.profile?.studentId || "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = roleFilter === "All" || user.role === roleFilter;
      const matchesYear = yearFilter === "All" || String(user.profile?.academicYear) === yearFilter;
      const matchesDept = deptFilter === "All" || user.departmentId === deptFilter;
      const matchesStatus = statusFilter === "All" || (statusFilter === "Active" ? user.isActive : !user.isActive);
      return matchesSearch && matchesRole && matchesYear && matchesDept && matchesStatus;
    });
  }, [users, searchTerm, roleFilter, yearFilter, deptFilter, statusFilter]);

  const sortedUsers = useMemo(() => {
    if (!sortConfig.key) return filteredUsers;
    return [...filteredUsers].sort((a, b) => {
      let aVal = a[sortConfig.key];
      let bVal = b[sortConfig.key];
      if (sortConfig.key === "academicYear") {
        aVal = a.profile?.academicYear || 0;
        bVal = b.profile?.academicYear || 0;
      }
      if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
      return 0;
    });
  }, [filteredUsers, sortConfig]);

  const handleSelectAll = (e) => {
    onSelectionChange(e.target.checked ? sortedUsers.map(u => u.id) : []);
  };

  const handleSelectUser = (id) => {
    onSelectionChange(selectedUserIds.includes(id)
      ? selectedUserIds.filter(i => i !== id)
      : [...selectedUserIds, id]);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "ascending" ? "descending" : "ascending",
    }));
  };

  const roleColors = {
    ADMIN: "bg-indigo-50 text-indigo-700 border-indigo-100",
    HR: "bg-blue-50 text-blue-700 border-blue-100",
    TEACHER: "bg-emerald-50 text-emerald-700 border-emerald-100",
    STUDENT: "bg-violet-50 text-violet-700 border-violet-100",
    STUDY_OFFICE: "bg-amber-50 text-amber-700 border-amber-100",
  };

  const colSpan = isStudentView ? 7 : 6;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/30 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-indigo-600 rounded-full" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
              {isStudentView ? "Student Roster" : "Active Personnel"}
            </h2>
          </div>
          <div className="relative group flex-1 md:w-72">
            <input
              type="text"
              placeholder={isStudentView ? "Search by name, email, or Student ID..." : "Find personnel..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all text-slate-700"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={12} />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Role filter — hide if locked to single role */}
          {allRoles.length > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
              <Filter size={11} className="text-slate-400" />
              <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setYearFilter("All"); setDeptFilter("All"); }}
                className="bg-transparent text-[10px] font-black uppercase tracking-tight focus:outline-none cursor-pointer text-slate-600">
                <option value="All">All Roles</option>
                {allRoles.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          )}

          {/* Status filter */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
            <Power size={11} className={statusFilter === "All" ? "text-slate-400" : statusFilter === "Active" ? "text-emerald-500" : "text-rose-500"} />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent text-[10px] font-black uppercase tracking-tight focus:outline-none cursor-pointer text-slate-600">
              <option value="All">All Statuses</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
            </select>
          </div>

          {/* Student-specific filters */}
          {isStudentView && (
            <>
              {/* Year filter */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                <GraduationCap size={11} className="text-indigo-400" />
                <select value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}
                  className="bg-transparent text-[10px] font-black uppercase tracking-tight focus:outline-none cursor-pointer text-slate-600">
                  <option value="All">All Years</option>
                  <option value="1">Year 1</option>
                  <option value="2">Year 2</option>
                  <option value="3">Year 3</option>
                  <option value="4">Year 4</option>
                </select>
              </div>

              {/* Department filter */}
              {uniqueDepartments.length > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg shadow-sm">
                  <Building2 size={11} className="text-blue-400" />
                  <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)}
                    className="bg-transparent text-[10px] font-black uppercase tracking-tight focus:outline-none cursor-pointer text-slate-600 max-w-[120px]">
                    <option value="All">All Departments</option>
                    {uniqueDepartments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
              )}
            </>
          )}

          <div className="px-3 py-1.5 bg-blue-50 text-indigo-700 text-[10px] font-black uppercase tracking-tight rounded-lg border border-blue-100 ml-auto shrink-0">
            {filteredUsers.length} Records
          </div>
        </div>
      </div>

      {/* ── Table ── */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-4 py-3 text-left w-10">
                <input type="checkbox"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                  checked={sortedUsers.length > 0 && selectedUserIds.length === sortedUsers.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-2 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort("firstName")}>
                <div className="flex items-center gap-1">Student <SortIndicator direction={sortConfig.key === "firstName" ? sortConfig.direction : null} /></div>
              </th>
              {isStudentView ? (
                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">
                  Department
                </th>
              ) : (
                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell cursor-pointer" onClick={() => handleSort("email")}>
                  <div className="flex items-center gap-1">Email <SortIndicator direction={sortConfig.key === "email" ? sortConfig.direction : null} /></div>
                </th>
              )}
              {isStudentView && (
                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort("academicYear")}>
                  <div className="flex items-center gap-1">Year <SortIndicator direction={sortConfig.key === "academicYear" ? sortConfig.direction : null} /></div>
                </th>
              )}
              {isStudentView && (
                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden md:table-cell">Generation</th>
              )}
              {!isStudentView && (
                <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer" onClick={() => handleSort("role")}>
                  <div className="flex items-center gap-1">Role <SortIndicator direction={sortConfig.key === "role" ? sortConfig.direction : null} /></div>
                </th>
              )}
              <th className="px-4 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              <th className="px-4 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading && sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-16 border-none text-center">
                  <div className="flex flex-col items-center gap-3 opacity-50">
                    <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loading records...</span>
                  </div>
                </td>
              </tr>
            ) : sortedUsers.length === 0 ? (
              <tr>
                <td colSpan={colSpan} className="py-16 text-center">
                  <div className="flex flex-col items-center gap-2 opacity-40">
                    <ShieldCheck size={28} />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No records found</p>
                    <p className="text-xs text-slate-400">Try adjusting your filters</p>
                  </div>
                </td>
              </tr>
            ) : (
              sortedUsers.map((user, index) => {
                const yr = user.profile?.academicYear;
                return (
                  <motion.tr
                    key={user.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.3) }}
                    className={`group hover:bg-blue-50/20 transition-colors ${selectedUserIds.includes(user.id) ? "bg-indigo-50/40" : ""}`}
                  >
                    {/* Checkbox */}
                    <td className="px-4 py-3">
                      <input type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer"
                        checked={selectedUserIds.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                      />
                    </td>

                    {/* Identity */}
                    <td className="px-2 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[11px] shrink-0 border border-blue-200 overflow-hidden relative group-hover:shadow-md transition-shadow">
                          {user.profile?.avatar ? (
                            <img
                              src={user.profile.avatar}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span>{user.firstName.charAt(0)}{user.lastName.charAt(0)}</span>
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-slate-800 tracking-tight">{user.firstName} {user.lastName}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            {user.profile?.studentId || user.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Department (student) or Email (others) */}
                    {isStudentView ? (
                      <td className="px-4 py-3 hidden lg:table-cell">
                        {user.department ? (
                          <div className="flex flex-col">
                            <span className="text-[12px] font-bold text-slate-700">{user.department.name}</span>
                            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                              {user.department.faculty?.name || "—"}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-slate-300 italic">Not assigned</span>
                        )}
                      </td>
                    ) : (
                      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        <span className="text-[13px] font-semibold text-slate-600">{user.email}</span>
                      </td>
                    )}

                    {/* Academic Year (students only) */}
                    {isStudentView && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border ${yearColors[yr] || "bg-slate-50 text-slate-500 border-slate-100"}`}>
                          {yearLabels[yr] || "—"}
                        </span>
                      </td>
                    )}

                    {/* Generation (students only) */}
                    {isStudentView && (
                      <td className="px-4 py-3 whitespace-nowrap hidden md:table-cell">
                        <span className="text-[11px] font-bold text-slate-600">
                          {user.profile?.generation || <span className="text-slate-300 italic text-[10px]">Unassigned</span>}
                        </span>
                      </td>
                    )}

                    {/* Role (non-students) */}
                    {!isStudentView && (
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border uppercase tracking-wide ${roleColors[user.role] || "bg-slate-50 text-slate-700 border-slate-100"}`}>
                          {user.role}
                        </span>
                      </td>
                    )}

                    {/* Status */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${user.isActive ? "bg-emerald-500" : "bg-slate-300"}`} />
                        <span className={`text-[11px] font-bold ${user.isActive ? "text-emerald-600" : "text-slate-400"}`}>
                          {user.isActive ? "Active" : "Suspended"}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        {(currentUserRole === "ADMIN" || currentUserRole === "HR" || currentUserRole === "STUDY_OFFICE" || currentUserRole === "FINANCE") && (
                          <>
                            <button onClick={() => onEditClick(user)} disabled={isLoading}
                              className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Edit">
                              <Edit className="w-3.5 h-3.5" />
                            </button>
                            {(currentUserRole === "ADMIN" || currentUserRole === "HR") && (
                              <button onClick={() => onMigrate(user)} disabled={isLoading}
                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Migrate role">
                                <ShieldCheck className="w-3.5 h-3.5" />
                              </button>
                            )}
                            <button onClick={() => onResetPassword(user)} disabled={isLoading}
                              className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all" title="Reset password">
                              <Lock className="w-3.5 h-3.5" />
                            </button>
                            {(currentUserRole !== "STUDY_OFFICE" || user.role === "STUDENT") && (
                              <button onClick={() => onToggleStatus(user)} disabled={isLoading}
                                className={`p-1.5 transition-all rounded-lg ${user.isActive ? "text-slate-400 hover:text-rose-600 hover:bg-rose-50" : "text-emerald-500 hover:bg-emerald-50"}`}
                                title={user.isActive ? "Suspend account" : "Activate account"}>
                                <Power className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </>
                        )}
                        {currentUserRole && (
                          <Link href={`/${currentUserRole.toLowerCase()}/users/${user.id}`} prefetch={false}
                            className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all" title="Full profile">
                            <Eye className="w-3.5 h-3.5" />
                          </Link>
                        )}
                        {currentUserRole === "ADMIN" && (
                          <button onClick={() => onDeleteClick(user)} disabled={isLoading}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all" title="Delete">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
