"use client";

import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { motion } from "framer-motion";
import { History, Search, Filter, Shield, User, Clock, Info } from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function AuditLogView() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await apiClient.get("/users/audit-logs");
        setLogs(data);
      } catch (error) {
        console.error("Failed to fetch logs:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter(log => 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.actor?.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getActionColor = (action) => {
    if (action.includes("DEACTIVATED") || action.includes("SUSPENDED") || action.includes("DELETE")) return "text-rose-600 bg-rose-50 border-rose-100";
    if (action.includes("ACTIVATED") || action.includes("CREATE")) return "text-emerald-600 bg-emerald-50 border-emerald-100";
    if (action.includes("UPDATE")) return "text-blue-600 bg-blue-50 border-blue-100";
    return "text-slate-600 bg-slate-50 border-slate-100";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-3">
            <div className="p-2 bg-indigo-600 rounded-xl text-white">
              <History size={20} />
            </div>
            System Audit Records
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Review critical administrative actions and system modifications.
          </p>
        </div>

        <div className="relative group w-full md:w-72">
          <input
            type="text"
            placeholder="Filter by action or actor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
          />
          <Search className="absolute left-3 top-2.5 text-slate-400 group-focus-within:text-indigo-600" size={16} />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Timestamp</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Administrator</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Record Action</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Target Context</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Operational Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <LoadingSpinner size="md" color="blue" />
                    <p className="text-xs font-bold text-slate-400 mt-4 uppercase tracking-widest">Retrieving logs...</p>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center">
                    <div className="flex flex-col items-center opacity-30">
                      <Shield size={40} className="mb-4" />
                      <p className="text-sm font-black text-slate-500 uppercase tracking-widest">No activity records found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className="text-[12px] font-bold text-slate-700">
                          {new Date(log.timestamp).toLocaleDateString()}
                        </span>
                        <span className="text-[10px] font-medium text-slate-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-[10px] border border-indigo-100">
                          {log.actor?.firstName[0]}{log.actor?.lastName[0]}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[12px] font-black text-slate-800 tracking-tight">
                            {log.actor?.firstName} {log.actor?.lastName}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {log.actor?.role}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getActionColor(log.action)}`}>
                        {log.action.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-[11px] font-bold text-slate-600">{log.target}</span>
                        <span className="text-[9px] font-medium text-slate-400 font-mono truncate max-w-[120px]">{log.targetId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {log.details ? (
                         <div className="group relative inline-block">
                           <button className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 transition-all">
                             <Info size={14} />
                           </button>
                           <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block z-20 w-48 bg-slate-900 text-white p-3 rounded-xl shadow-xl text-[10px] leading-relaxed">
                             <p className="font-bold text-indigo-400 mb-1 font-mono uppercase">Payload Data:</p>
                             <div className="break-all font-mono opacity-80">
                               {log.details}
                             </div>
                           </div>
                         </div>
                      ) : (
                        <span className="text-[10px] font-black text-slate-200">NO DATA</span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
