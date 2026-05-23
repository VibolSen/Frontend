"use client";

import React from "react";
import Link from "next/link";
import { ChevronUp, ChevronDown, Eye, Edit, Trash2, Award, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const SortIndicator = ({ direction }) => {
  if (!direction) return null;
  return direction === "asc" ? (
    <ChevronUp className="w-3 h-3 text-blue-600" />
  ) : (
    <ChevronDown className="w-3 h-3 text-blue-600" />
  );
};

export default function CertificateTable({
  certificates,
  getCourseName,
  handleEditCertificate,
  handleDeleteCertificate,
  sortField,
  sortOrder,
  handleSort,
  isLoading,
  role = "admin",
  basePath,
  canDelete = true,
  selectedIds = [],
  onSelectionChange,
}) {
  const dynamicBasePath = basePath || `/${role}/certificate-management`;
  
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      onSelectionChange(certificates.map((c) => c.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectOne = (id) => {
    if (selectedIds.includes(id)) {
      onSelectionChange(selectedIds.filter((item) => item !== id));
    } else {
      onSelectionChange([...selectedIds, id]);
    }
  };

  const renderSortIcon = (field) => {
    if (sortField === field) {
      return <SortIndicator direction={sortOrder} />;
    }
    return null;
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50/50 border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 text-left w-10">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer transition-all"
                  checked={
                    certificates.length > 0 &&
                    selectedIds.length === certificates.length
                  }
                  onChange={handleSelectAll}
                />
              </th>
              <th
                className="px-2 py-4 text-left cursor-pointer group hover:bg-slate-100/50 transition-colors"
                onClick={() => handleSort("recipient")}
              >
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Recipient Identity {renderSortIcon("recipient")}
                </div>
              </th>
              <th
                className="px-6 py-4 text-left cursor-pointer group hover:bg-slate-100/50 transition-colors"
                onClick={() => handleSort("course")}
              >
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Academic Program {renderSortIcon("course")}
                </div>
              </th>
              <th className="px-6 py-4 text-left">
                <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Issue Date
                </div>
              </th>
              <th className="px-6 py-4 text-right">
                <div className="inline-flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  Administrative Control
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <AnimatePresence mode="popLayout">
              {isLoading && certificates.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan="5" className="py-24 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-50">
                      <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Scanning Archive...</span>
                    </div>
                  </td>
                </motion.tr>
              ) : certificates.length === 0 ? (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <td colSpan="5" className="py-24 text-center">
                    <div className="w-16 h-16 mx-auto bg-slate-50 rounded-2xl flex items-center justify-center mb-4 border border-slate-100">
                       <Award size={32} className="text-slate-300" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">No Credentials Found</h3>
                    <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">The active search returned zero results</p>
                  </td>
                </motion.tr>
              ) : (
                certificates.map((cert, index) => (
                  <motion.tr
                    key={cert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: Math.min(index * 0.03, 0.5), duration: 0.2 }}
                    className={`group hover:bg-slate-50/80 transition-colors ${
                      selectedIds.includes(cert.id) ? "bg-indigo-50/40" : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-600 w-4 h-4 cursor-pointer transition-all"
                        checked={selectedIds.includes(cert.id)}
                        onChange={() => handleSelectOne(cert.id)}
                      />
                    </td>
                    <td className="px-2 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-sm border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                            {cert.recipient.charAt(0)}
                          </div>
                          <div>
                             <span className="block text-[14px] font-black text-slate-900 tracking-tight leading-none mb-1">
                               {cert.recipient}
                             </span>
                             <span className="block text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                               ID: {cert.studentId || "EXTERNAL"}
                             </span>
                          </div>
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <span className="inline-flex items-center px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-widest border border-blue-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-all">
                          {getCourseName(cert.course?.id || cert.courseId)}
                       </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
                          <Calendar size={12} className="text-slate-400" />
                          {new Date(cert.issueDate).toLocaleDateString(undefined, { 
                             year: 'numeric', month: 'short', day: 'numeric' 
                          })}
                       </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <Link
                          href={`${dynamicBasePath}/${cert.id}`}
                          className="flex items-center justify-center w-8 h-8 text-slate-400 bg-white border border-slate-200 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                          title="View Document"
                        >
                          <Eye size={14} />
                        </Link>
                        <button
                          onClick={() => handleEditCertificate(cert)}
                          className="flex items-center justify-center w-8 h-8 text-slate-400 bg-white border border-slate-200 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                          title="Edit Profile"
                        >
                          <Edit size={14} />
                        </button>
                        {canDelete && (
                          <button
                            onClick={() => handleDeleteCertificate(cert)}
                            className="flex items-center justify-center w-8 h-8 text-slate-400 bg-white border border-slate-200 hover:text-rose-600 hover:border-rose-300 hover:bg-rose-50 rounded-xl transition-all shadow-sm hover:shadow-md"
                            title="Purge Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
