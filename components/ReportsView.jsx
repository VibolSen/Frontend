"use client";

import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, AreaChart, Area } from 'recharts';
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900/95 backdrop-blur-md p-4 rounded-xl border border-slate-700 shadow-2xl">
        <p className="text-white font-black text-sm mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-2 text-xs font-bold" style={{ color: entry.color }}>
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="uppercase tracking-widest text-[9px] text-slate-400">{entry.name}:</span>
            <span className="text-white text-sm">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const ReportsView = () => {
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await apiClient.get("/departments");
        setDepartments(data || []);
      } catch (error) {
        console.error("Error fetching departments:", error);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    if (selectedDepartment) {
      const fetchReportsData = async () => {
        setLoading(true);
        setError(null);
        try {
          const data = await apiClient.get(`/faculties/reports?departmentId=${selectedDepartment}`);
          setReportsData(data);
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };
      fetchReportsData();
    }
  }, [selectedDepartment]);

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Activity className="text-indigo-600" size={28} /> Academic <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-700">Analytics</span>
        </h1>
        <p className="text-[11px] font-medium text-slate-500 mt-0.5 max-w-xl leading-relaxed">
          Real-time institutional intelligence tracking academic progression, engagement metrics, and attendance signals.
        </p>
      </div>

      {/* Control Panel */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-20">
        <div className="flex-1 w-full max-w-md relative">
          <label className="absolute -top-2 left-3 bg-white px-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 shadow-sm rounded">
            Institutional Department
          </label>
          <select
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50 transition-all cursor-pointer"
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="" disabled>Compute metrics for a department...</option>
            {departments.map((dept) => (
              <option key={dept.id} value={dept.id}>
                {dept.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {loading && (
        <div className="flex flex-col justify-center items-center py-24 gap-3 bg-white rounded-3xl border border-slate-200">
          <LoadingSpinner size="lg" color="indigo" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Aggregating Global Metrics...</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-5 rounded-2xl mt-4">
          <h3 className="text-xs font-black uppercase tracking-widest">Data Synchronization Error</h3>
          <p className="text-sm font-medium mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && !selectedDepartment && (
         <div className="text-center py-24 bg-slate-50 rounded-3xl border border-slate-200 border-dashed mt-4">
           <h3 className="mt-2 text-sm font-black text-slate-400 uppercase tracking-widest">
             Awaiting Directives
           </h3>
           <p className="text-xs font-medium text-slate-400 mt-1 max-w-md mx-auto">Select a department above to initiate the data pipeline and stream live metrics.</p>
         </div>
      )}

      {reportsData && !loading && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-4 animate-in slide-in-from-bottom-8 duration-700">
          
          {/* Performance Overview Chart */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl col-span-1 xl:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 relative z-10">
              <BarChart3 className="text-indigo-600" size={16} /> Global Grade Trajectories
            </h2>
            <div className="h-[350px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={reportsData.studentPerformance} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="grade" stroke="#4f46e5" strokeWidth={4} fillOpacity={1} fill="url(#colorGrade)" activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Attendance Trends */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-emerald-50/50 rounded-full blur-[80px] pointer-events-none"></div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 relative z-10">
              <TrendingUp className="text-emerald-500" size={16} /> Presence Signals (Last 10 Records)
            </h2>
            <div className="h-[250px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportsData.attendanceTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="stepAfter" dataKey="present" stroke="#10b981" strokeWidth={4} dot={{ r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#fff' }} />
                  <Line type="stepAfter" dataKey="absent" stroke="#f43f5e" strokeWidth={4} dot={{ r: 4, fill: '#f43f5e', strokeWidth: 2, stroke: '#fff' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement */}
          <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-2xl relative overflow-hidden">
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-amber-50/50 rounded-full blur-[80px] pointer-events-none"></div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8 flex items-center gap-2 relative z-10">
              <Users className="text-amber-500" size={16} /> Campus Engagement Rate
            </h2>
            <div className="h-[250px] w-full relative z-10">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsData.classParticipation} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 9, fill: '#94a3b8', fontWeight: 900 }} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="participation" fill="#f59e0b" radius={[6, 6, 0, 0]} maxBarSize={32} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default ReportsView;
