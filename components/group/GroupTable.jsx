"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import { Edit, Eye, Trash2, UserPlus, Search, Users, CheckSquare, Square } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import BulkActionsBar from "@/components/ui/BulkActionsBar";

const SortIndicator = ({ direction }) => {
  if (!direction) return null;
  return (
    <span className="text-indigo-600 ml-1">
      {direction === "ascending" ? "↑" : "↓"}
    </span>
  );
};

export default function GroupsTable({
  groups = [],
  courses = [],
  onAddGroupClick,
  onEdit,
  onDelete,
  onBulkDelete,
  onManageMembers,
  isLoading,
  role,
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({
    key: "name",
    direction: "ascending",
  });
  const [selectedGroupIds, setSelectedGroupIds] = useState(new Set());

  const processedGroups = useMemo(() => {
    const filtered = groups.filter((group) => {
      return group.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (aValue < bValue)
          return sortConfig.direction === "ascending" ? -1 : 1;
        if (aValue > bValue)
          return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }

    return filtered;
  }, [groups, searchTerm, sortConfig]);

  const handleSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const toggleSelectAll = () => {
    if (selectedGroupIds.size === processedGroups.length) {
      setSelectedGroupIds(new Set());
    } else {
      setSelectedGroupIds(new Set(processedGroups.map(g => g.id)));
    }
  };

  const toggleGroup = (id) => {
    const newSelected = new Set(selectedGroupIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedGroupIds(newSelected);
  };

  const handleBulkDelete = () => {
    const groupsToDelete = groups.filter(g => selectedGroupIds.has(g.id));
    if (onBulkDelete && groupsToDelete.length > 0) {
      onBulkDelete(groupsToDelete);
    }
  };

  const isAllSelected = processedGroups.length > 0 && selectedGroupIds.size === processedGroups.length;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all relative">
      {/* Filters Area */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/30 space-y-3">
        <div className="flex flex-col md:flex-row justify-between items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-1 bg-indigo-600 rounded-full" />
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Active Cohorts</h2>
          </div>
          <div className="w-full md:w-auto flex items-center gap-2">
            <div className="relative group flex-1 md:w-64">
              <input
                type="text"
                placeholder="Find groups..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[13px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 hover:border-slate-300 transition-all text-slate-700"
              />
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-blue-500 transition-colors" size={12} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide">
          <div className="px-3 py-1.5 bg-blue-50 text-indigo-700 text-[10px] font-black uppercase tracking-tight rounded-lg border border-blue-100 shrink-0">
            {processedGroups.length} Total Groups
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50/10 border-b border-slate-100">
            <tr>
              <th className="px-5 py-3 text-left w-10">
                <button 
                   onClick={toggleSelectAll}
                   className={`flex items-center justify-center w-5 h-5 rounded border shadow-sm transition-colors ${isAllSelected ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-300 text-transparent hover:border-blue-400'}`}
                >
                   <CheckSquare className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
              </th>
              <th className="px-2 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest cursor-pointer group" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-1">
                  Group Designation
                  <SortIndicator direction={sortConfig.key === "name" ? sortConfig.direction : null} />
                </div>
              </th>
              <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest hidden lg:table-cell">Academic Lifecycle</th>
              <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Census</th>
              <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Controls</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {isLoading && processedGroups.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 border-none">
                  <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                    <div className="h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Syncing Cohorts...</span>
                  </div>
                </td>
              </tr>
            ) : processedGroups.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center">
                  <div className="flex flex-col items-center opacity-40">
                    <Users size={24} className="mb-2" />
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">No active groups found</p>
                  </div>
                </td>
              </tr>
            ) : (
              processedGroups.map((group, index) => {
                const isSelected = selectedGroupIds.has(group.id);
                return (
                  <motion.tr
                    key={group.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: Math.min(index * 0.02, 0.4) }}
                    onClick={(e) => {
                       // Only toggle row if clicking empty space, not buttons or links
                       if(e.target.tagName !== "BUTTON" && e.target.tagName !== "A" && !e.target.closest("button") && !e.target.closest("a")){
                          toggleGroup(group.id);
                       }
                    }}
                    className={`group transition-colors cursor-pointer ${isSelected ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
                  >
                    <td className="px-5 py-3 whitespace-nowrap">
                       <button 
                          onClick={(e) => { e.stopPropagation(); toggleGroup(group.id); }}
                          className={`flex items-center justify-center w-5 h-5 rounded border shadow-sm transition-colors ${isSelected ? 'bg-blue-600 border-blue-700 text-white' : 'bg-white border-slate-300 text-transparent hover:border-blue-400'}`}
                       >
                          <CheckSquare className="w-3.5 h-3.5" strokeWidth={3} />
                       </button>
                    </td>
                    <td className="px-2 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 text-indigo-700 flex items-center justify-center font-black text-[10px] shrink-0 border border-blue-200 shadow-sm shadow-blue-100 uppercase">
                          {group.name.substring(0, 2)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[13px] font-black text-slate-800 tracking-tight">{group.name}</span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Academic Group</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap hidden lg:table-cell">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-black text-slate-800 uppercase tracking-tight">
                          {group.batch?.name || "No Generation"}
                        </span>
                        <span className="text-[9px] font-bold text-slate-400 mt-0.5">
                          {group.academicYear || "Year N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-center">
                      <span className="px-2 py-0.5 text-[10px] font-black text-blue-700 bg-blue-50 rounded border border-blue-100 uppercase tracking-widest shadow-sm">
                        {group._count?.students ?? 0} students
                      </span>
                    </td>
                    <td className="px-5 py-3 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`/${role}/groups/${group.id}`}
                          prefetch={false}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"
                          title="View Group"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Eye className="w-3.5 h-3.5" strokeWidth={2.5}/>
                        </Link>
                        <button
                          onClick={(e) => { e.stopPropagation(); onManageMembers(group); }}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 rounded-lg transition-all"
                          title="Manage Members"
                        >
                          <UserPlus className="w-3.5 h-3.5" strokeWidth={2.5}/>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onEdit(group); }}
                          className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 border border-transparent hover:border-amber-100 rounded-lg transition-all"
                          title="Quick Edit"
                        >
                          <Edit className="w-3.5 h-3.5" strokeWidth={2.5}/>
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onDelete(group); }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-lg transition-all"
                          title="Remove Group"
                        >
                          <Trash2 className="w-3.5 h-3.5" strokeWidth={2.5}/>
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <BulkActionsBar
        selectedIds={Array.from(selectedGroupIds)}
        onClear={() => setSelectedGroupIds(new Set())}
        onDelete={handleBulkDelete}
        label="Cohorts"
        showDelete={true}
      />
    </div>
  );
}
