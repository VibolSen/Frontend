"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  CheckCircle,
  XCircle,
  Clock,
  Filter,
  Calendar,
  User,
  Search,
  ClipboardList,
} from "lucide-react";

export default function LeaveManagementView() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterType, setFilterType] = useState("ALL");

  useEffect(() => {
    fetchRequests();
  }, [filterStatus, filterType]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus !== "ALL") params.status = filterStatus;
      if (filterType !== "ALL") params.type = filterType;

      const data = await apiClient.get("/leaves/all", { params });
      setRequests(data);
    } catch (error) {
      console.error("Failed to fetch leave requests:", error);
      toast.error("Failed to load leave requests");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status, currentStatus) => {
    if (status === currentStatus) return;
    
    try {
      await apiClient.put(`/leaves/${id}/status`, { status });
      toast.success(`Leave request ${status.toLowerCase()}`);
      fetchRequests(); // Refresh list
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-800";
      case "REJECTED": return "bg-red-100 text-red-800";
      default: return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Leave Management</h1>
          <p className="text-gray-500">Manage and approve staff leave requests</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-gray-500">
          <Filter size={20} />
          <span className="font-medium">Filter By:</span>
        </div>
        
        <select 
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="ALL">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
        </select>

        <select 
          className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="ALL">All Types</option>
          <option value="SICK">Sick Leave</option>
          <option value="CASUAL">Casual Leave</option>
          <option value="MATERNITY">Maternity Leave</option>
          <option value="UNPAID">Unpaid Leave</option>
          <option value="RESIGNATION">Resignation</option>
        </select>
      </div>

      {/* Requests List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden shadow-indigo-500/5">
        {loading ? (
             <div className="p-8 text-center text-gray-500">
               <div className="animate-pulse flex flex-col items-center gap-2">
                 <div className="h-4 w-32 bg-gray-200 rounded"></div>
                 <div className="text-sm">Loading requests...</div>
               </div>
             </div>
        ) : requests.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <ClipboardList className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p className="font-medium">No leave requests found matching filters.</p>
            </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Staff Member</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Type & Dates</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {requests.map((request) => (
                  <tr key={request.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shadow-sm group-hover:scale-105 transition-transform">
                          {request.user?.firstName?.[0]}{request.user?.lastName?.[0]}
                        </div>
                        <div>
                          <div className="font-bold text-slate-800">
                            {request.user?.firstName} {request.user?.lastName}
                          </div>
                          <div className="text-xs text-slate-500 font-medium">{request.user?.email}</div>
                          {request.user?.department && (
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{request.user.department.name}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1.5">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                          {request.type}
                        </span>
                        <div className="flex items-center text-sm text-slate-600 gap-2 font-medium">
                          <Calendar size={14} className="text-slate-400" />
                          {request.type === 'RESIGNATION' 
                            ? `Last Day: ${format(new Date(request.startDate), "MMM d, yyyy")}`
                            : `${format(new Date(request.startDate), "MMM d, yyyy")} - ${format(new Date(request.endDate), "MMM d, yyyy")}`
                          }
                        </div>
                        {request.type !== 'RESIGNATION' && (
                          <div className="text-[10px] text-slate-400 font-bold">
                             {Math.ceil((new Date(request.endDate).getTime() - new Date(request.startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1} DAYS
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm text-slate-600 max-w-xs truncate font-medium" title={request.reason}>
                        {request.reason || "No reason provided"}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${getStatusColor(request.status)} shadow-sm`}>
                        {request.status}
                      </span>
                      {request.approvedBy && (
                          <div className="text-[10px] text-slate-400 font-medium mt-1">
                              by {request.approvedBy.firstName} {request.approvedBy.lastName}
                          </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {request.status === 'PENDING' && (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'APPROVED', request.status)}
                            className="p-2.5 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-green-500/20"
                            title="Approve"
                          >
                            <CheckCircle size={18} />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(request.id, 'REJECTED', request.status)}
                            className="p-2.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded-xl transition-all duration-200 shadow-sm hover:shadow-red-500/20"
                            title="Reject"
                          >
                            <XCircle size={18} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
