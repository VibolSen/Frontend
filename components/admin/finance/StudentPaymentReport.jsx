"use client";

import { useState, useEffect } from "react";
import { 
  Search, RefreshCcw, Filter, User, 
  CheckCircle2, AlertCircle, Clock, FileText, Download
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

export default function StudentPaymentReport({ initialStatus = "" }) {
  const [reportData, setReportData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [academicYearFilter, setAcademicYearFilter] = useState("");
  const [periodFilter, setPeriodFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      // Build query string
      const params = new URLSearchParams();
      if (statusFilter) params.append("status", statusFilter);
      if (academicYearFilter) params.append("academicYear", academicYearFilter);
      if (periodFilter) params.append("period", periodFilter);
      if (semesterFilter) params.append("semester", semesterFilter);

      const endpoint = `/financial/reports/student-payments?${params.toString()}`;
      const data = await apiClient.get(endpoint);
      setReportData(data || []);
    } catch (error) {
      console.error("Failed to fetch student payment report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, [statusFilter, academicYearFilter, periodFilter, semesterFilter]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PAID":
        return "bg-emerald-100 text-emerald-700 border-emerald-200";
      case "OVERDUE":
        return "bg-rose-100 text-rose-700 border-rose-200";
      case "SENT":
        return "bg-amber-100 text-amber-700 border-amber-200";
      case "UNBILLED":
        return "bg-slate-100 text-slate-500 border-dashed border-slate-300";
      case "DRAFT":
        return "bg-slate-100 text-slate-700 border-slate-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "PAID":
        return <CheckCircle2 size={12} className="mr-1" />;
      case "OVERDUE":
        return <AlertCircle size={12} className="mr-1" />;
      case "SENT":
        return <Clock size={12} className="mr-1" />;
      case "UNBILLED":
        return <User size={12} className="mr-1" />;
      default:
        return <FileText size={12} className="mr-1" />;
    }
  };

  const filteredData = reportData.filter((item) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      item.studentName.toLowerCase().includes(searchLower) ||
      item.studentId.toLowerCase().includes(searchLower) ||
      item.invoiceId.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
            Student Payment Report
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Track and filter student payment statuses by academic year, semester, and period.
          </p>
        </div>
        <button
          onClick={fetchReport}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-slate-900 shadow-md transition-all active:scale-95 whitespace-nowrap"
        >
          <RefreshCcw size={14} className={isLoading ? "animate-spin" : ""} />
          Refresh Data
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-3">
        <div className="md:col-span-2 relative group">
          <input
            type="text"
            placeholder="Search by student name or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-700"
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" size={14} />
        </div>
        
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
        >
          <option value="">All Statuses</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="SENT">Sent / Pending</option>
          <option value="UNBILLED">Unbilled (New)</option>
          <option value="DRAFT">Draft</option>
        </select>

        <select
          value={academicYearFilter}
          onChange={(e) => setAcademicYearFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
        >
          <option value="">All Academic Years</option>
          <option value="1">Year 1 (New)</option>
          <option value="2">Year 2</option>
          <option value="3">Year 3</option>
          <option value="4">Year 4 (Senior)</option>
        </select>

        <select
          value={semesterFilter}
          onChange={(e) => setSemesterFilter(e.target.value)}
          className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 appearance-none"
          disabled={periodFilter === "YEAR"}
        >
          <option value="">All Semesters</option>
          <option value="1">Semester 1</option>
          <option value="2">Semester 2</option>
        </select>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden pt-2">
        <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Filter size={14} className="text-indigo-500" />
                Filtered Results ({filteredData.length})
            </h3>
            <button className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest hover:text-indigo-800 transition-colors flex items-center gap-1">
                <Download size={12} /> Export CSV
            </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Student</th>
                <th className="px-5 py-3 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Year / Batch</th>
                <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Fee Amount</th>
                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Paid</th>
                <th className="px-5 py-3 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Balance</th>
                <th className="px-5 py-3 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              <AnimatePresence mode="popLayout">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <div className="flex flex-col items-center justify-center gap-3 opacity-50">
                        <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Loading Report...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-20 text-center">
                      <User size={32} className="mx-auto text-slate-200 mb-3" />
                      <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">No records found</h3>
                      <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1">Adjust your filters to see results</p>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <motion.tr
                      key={item.invoiceId}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: Math.min(index * 0.02, 0.2) }}
                      className="group hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-800">{item.studentName}</span>
                            <span className="text-[10px] font-medium text-slate-500 tabular-nums">{item.studentId}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-700">Year {item.academicYear}</span>
                            <span className="text-[10px] font-medium text-slate-400">{item.batch}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-center">
                        <span className="px-2 py-0.5 rounded border border-slate-200 bg-slate-50 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                            {item.period === "SEMESTER" ? `Sem ${item.semester}` : item.period}
                        </span>
                      </td>
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                      <span className="text-xs font-black text-slate-900 tabular-nums">
                        {item.currency === "USD" ? "$" : "៛"}{item.totalAmount.toLocaleString(undefined, { minimumFractionDigits: item.currency === "USD" ? 2 : 0 })}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <span className="text-xs font-black text-emerald-600 tabular-nums">
                        {item.currency === "USD" ? "$" : "៛"}{item.totalPaid.toLocaleString(undefined, { minimumFractionDigits: item.currency === "USD" ? 2 : 0 })}
                      </span>
                    </td>
                    <td className="px-5 py-4 whitespace-nowrap text-right">
                      <span className={`text-xs font-black tabular-nums ${item.balance > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
                        {item.currency === "USD" ? "$" : "៛"}{item.balance.toLocaleString(undefined, { minimumFractionDigits: item.currency === "USD" ? 2 : 0 })}
                      </span>
                    </td>             
                      <td className="px-5 py-3 whitespace-nowrap text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border ${getStatusColor(item.status)}`}>
                          {getStatusIcon(item.status)}
                          {item.status}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
