"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { format } from "date-fns";
import { toast } from "react-hot-toast";
import {
  Briefcase,
  Search,
  MapPin,
  MoreVertical,
  Plus,
  Users,
  FileText,
  Filter,
  ExternalLink,
} from "lucide-react";

export default function RecruitmentView() {
  const [activeTab, setActiveTab] = useState("applications"); // 'applications' or 'jobs'

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 tracking-tight">Recruitment & Talent</h1>
          <p className="text-slate-500 font-medium">Manage job postings and candidate lifecycle</p>
        </div>
        <div className="flex bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm shadow-indigo-500/5">
             <button
            onClick={() => setActiveTab("applications")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "applications"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Applications
          </button>
          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
              activeTab === "jobs"
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Job Postings
          </button>
        </div>
      </div>

      <div className="transition-all duration-500">
        {activeTab === "applications" ? <ApplicationsList /> : <JobPostingsList />}
      </div>
    </div>
  );
}

function ApplicationsList() {
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("");
  
    useEffect(() => {
      fetchApplications();
    }, [statusFilter]);
  
    const fetchApplications = async () => {
      setLoading(true);
      try {
        const params = {};
        if (statusFilter) params.status = statusFilter;
        const data = await apiClient.get("/hr/applications", { params });
        setApplications(data);
      } catch (error) {
        console.error("Error fetching applications:", error);
        toast.error("Failed to load applications");
      } finally {
        setLoading(false);
      }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await apiClient.patch(`/hr/applications/${id}/status`, { status: newStatus });
            toast.success(`Candidate status: ${newStatus.toLowerCase()}`);
            fetchApplications();
        } catch (error) {
            toast.error("Failed to update status");
        }
    }

    const getAppStatusColor = (status) => {
        switch (status) {
            case "HIRED": return "bg-emerald-100 text-emerald-800 border-emerald-200";
            case "REJECTED": return "bg-rose-100 text-rose-800 border-rose-200";
            case "OFFERED": return "bg-indigo-100 text-indigo-800 border-indigo-200";
            case "INTERVIEWING": return "bg-blue-100 text-blue-800 border-blue-200";
            default: return "bg-slate-100 text-slate-800 border-slate-200";
        }
    };
  
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden shadow-indigo-500/5">
        <div className="p-5 border-b border-slate-50 flex items-center justify-between bg-[#F8FAFC]">
             <div className="flex items-center gap-2">
                 <Filter size={18} className="text-slate-400" />
                 <span className="text-sm font-bold text-slate-600">Pipeline Status</span>
             </div>
             <select 
                className="bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
             >
                 <option value="">All Candidates</option>
                 <option value="APPLIED">Applied</option>
                 <option value="REVIEWING">Reviewing</option>
                 <option value="INTERVIEWING">Interviewing</option>
                 <option value="OFFERED">Offered</option>
                 <option value="HIRED">Hired</option>
                 <option value="REJECTED">Rejected</option>
             </select>
        </div>

        {loading ? (
             <div className="p-12 text-center text-slate-500 font-medium">Refining candidate list...</div>
        ) : applications.length === 0 ? (
            <div className="p-16 text-center text-slate-500">
                <Users className="mx-auto h-12 w-12 text-slate-200 mb-4" />
                <p className="font-bold">No applications found in this stage.</p>
            </div>
        ) : (
          <div className="overflow-x-auto">
             <table className="w-full text-left">
              <thead className="bg-[#F8FAFC] border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Candidate</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target Role</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Profile Snapshot</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Applied</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documents</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Action Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                  {applications.map(app => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-6 py-5">
                              <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 border border-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                      {app.applicantName?.[0]}
                                  </div>
                                  <div>
                                      <div className="font-bold text-slate-800">{app.applicantName}</div>
                                      <div className="text-[11px] text-slate-500 font-medium">{app.applicantEmail}</div>
                                      <div className="text-[10px] text-slate-400">{app.phone}</div>
                                  </div>
                              </div>
                          </td>
                          <td className="px-6 py-5">
                              <div className="text-sm font-bold text-slate-700">{app.jobPosting?.title}</div>
                              <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{app.jobPosting?.department}</div>
                          </td>
                          <td className="px-6 py-5">
                              <div className="text-[11px] text-slate-600 font-bold mb-1.5 flex items-center gap-1">
                                  <Clock size={12} className="text-slate-400" />
                                  Exp: {app.experience || 'N/A'}
                              </div>
                              <div className="flex flex-wrap gap-1">
                                  {app.skills?.slice(0, 3).map((skill, i) => (
                                      <span key={i} className="px-2 py-0.5 rounded-lg bg-indigo-50 text-[10px] font-bold text-indigo-600 border border-indigo-100">
                                          {skill}
                                      </span>
                                  ))}
                              </div>
                          </td>
                          <td className="px-6 py-5 text-[11px] font-bold text-slate-500">
                              {format(new Date(app.appliedAt), "MMM d, yyyy")}
                          </td>
                          <td className="px-6 py-5">
                              {app.resume ? (
                                  <a 
                                    href={app.resume} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-blue-600 font-bold text-[10px] hover:bg-blue-50 transition-colors shadow-sm"
                                  >
                                      <FileText size={12} /> VIEW CV
                                  </a>
                              ) : (
                                  <span className="text-[10px] font-bold text-slate-300">NO ATTACHMENT</span>
                              )}
                          </td>
                          <td className="px-6 py-5">
                              <select 
                                className={`border rounded-xl px-3 py-1.5 text-[11px] font-bold outline-none transition-all shadow-sm ${getAppStatusColor(app.status)}`}
                                value={app.status}
                                onChange={(e) => updateStatus(app.id, e.target.value)}
                              >
                                 <option value="APPLIED">Applied</option>
                                 <option value="REVIEWING">Reviewing</option>
                                 <option value="INTERVIEWING">Interviewing</option>
                                 <option value="OFFERED">Offered</option>
                                 <option value="HIRED">Hired</option>
                                 <option value="REJECTED">Rejected</option>
                              </select>
                          </td>
                      </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
}

function JobPostingsList() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchJobs();
    }, []);

    const fetchJobs = async () => {
        try {
            const data = await apiClient.get("/hr/job-postings");
            setJobs(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map(job => (
                <div key={job.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-indigo-500/10 transition-all duration-300 transform hover:-translate-y-1">
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                            <h3 className="font-bold text-lg text-slate-800 leading-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>
                            <p className="text-xs text-slate-400 font-bold tracking-widest uppercase mt-1 flex items-center gap-1">
                                <MapPin size={10} /> {job.department} • {job.location}
                            </p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wider ${job.status === 'OPEN' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                            {job.status}
                        </span>
                    </div>
                    
                    <div className="space-y-4 mb-6">
                        <div className="text-sm text-slate-500 line-clamp-2 leading-relaxed font-medium">{job.description}</div>
                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                            <div className="flex items-center gap-4">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Type</span>
                                    <span className="text-xs font-bold text-slate-700">{job.employmentType}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">Applicants</span>
                                    <span className="text-xs font-bold text-slate-700">{job.applications?.length || 0}</span>
                                </div>
                            </div>
                            <button className="p-2 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors">
                                <ExternalLink size={16} />
                            </button>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}
