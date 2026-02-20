"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { apiClient } from "@/lib/api";
import { useRouter } from "next/navigation";
import { 
  BookOpen, Search, Filter, ArrowUpDown, 
  Users, Layers, GraduationCap, RefreshCcw 
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function MyCoursesView({ loggedInUser }) {
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [sortCriteria, setSortCriteria] = useState("name"); 
  const [sortOrder, setSortOrder] = useState("asc"); 

  const teacherId = loggedInUser?.id || loggedInUser?.userId;

  const fetchMyCourses = useCallback(async () => {
    if (!teacherId) {
      console.warn("No teacher ID found in loggedInUser object:", loggedInUser);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const data = await apiClient.get(`/teachers/my-courses?teacherId=${teacherId}`);
      setCourses(data || []);
    } catch (err) {
      console.error("Failed to fetch courses:", err);
    } finally {
      setIsLoading(false);
    }
  }, [teacherId, loggedInUser]);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const data = await apiClient.get("/departments");
        setDepartments(data || []);
      } catch (err) {
        console.error("Error fetching departments:", err);
      }
    };
    fetchDepartments();
  }, []);

  useEffect(() => {
    fetchMyCourses();
  }, [fetchMyCourses]);

  const sortedAndFilteredCourses = useMemo(() => {
    let tempCourses = courses.filter(
      (course) =>
        (course.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.department?.name?.toLowerCase().includes(searchTerm.toLowerCase())) &&
        (selectedDepartment === "" || course.department?.id === selectedDepartment)
    );

    tempCourses.sort((a, b) => {
      let valA, valB;
      switch (sortCriteria) {
        case "name":
          valA = a.name?.toLowerCase() || "";
          valB = b.name?.toLowerCase() || "";
          break;
        case "department":
          valA = a.department?.name?.toLowerCase() || "";
          valB = b.department?.name?.toLowerCase() || "";
          break;
        case "groups":
          valA = a.groupCount || 0;
          valB = b.groupCount || 0;
          break;
        case "students":
          valA = a.studentCount || 0;
          valB = b.studentCount || 0;
          break;
        default:
          valA = a.name?.toLowerCase() || "";
          valB = b.name?.toLowerCase() || "";
      }

      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return tempCourses;
  }, [courses, searchTerm, selectedDepartment, sortCriteria, sortOrder]);

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
             <div className="h-10 w-1.5 bg-indigo-600 rounded-full" />
             My Academic Catalog
          </h1>
          <p className="text-slate-500 font-medium text-sm ml-4 border-l border-slate-200 pl-4">
            Managing courses, curriculum distribution, and student enrollment metrics.
          </p>
        </div>
        
        <button 
          onClick={fetchMyCourses}
          className="p-2.5 bg-white text-slate-400 hover:text-indigo-600 rounded-2xl border border-slate-200 hover:border-indigo-100 shadow-sm transition-all active:scale-95"
        >
          <RefreshCcw size={18} className={isLoading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Control Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4">
          <div className="relative w-full lg:max-w-md group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search catalog by course or faculty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 min-w-[160px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Filter size={14} />
              </div>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="">All Departments</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>{dept.name}</option>
                ))}
              </select>
            </div>

            <div className="relative flex-1 min-w-[160px]">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <ArrowUpDown size={14} />
              </div>
              <select
                value={sortCriteria}
                onChange={(e) => setSortCriteria(e.target.value)}
                className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[12px] font-bold text-slate-600 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
              >
                <option value="name">Sort by Title</option>
                <option value="department">Sort by Dept</option>
                <option value="groups">Sort by Capacity</option>
                <option value="students">Sort by Students</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Course Description</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Faculty Dept</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Groups</th>
                <th className="px-8 py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Load</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-24">
                    <div className="flex flex-col items-center justify-center gap-4">
                      <LoadingSpinner size="lg" color="indigo" />
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Synchronizing Academic Data...</p>
                    </div>
                  </td>
                </tr>
              ) : sortedAndFilteredCourses.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-24 text-center">
                    <div className="max-w-xs mx-auto space-y-4 opacity-40">
                      <div className="w-20 h-20 bg-slate-100 rounded-[2rem] flex items-center justify-center mx-auto">
                        <BookOpen size={32} className="text-slate-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-tight">Registry Empty</h3>
                        <p className="text-[11px] font-medium text-slate-500 mt-1">No active courses identified for this profile in the current term.</p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                <AnimatePresence mode="popLayout">
                  {sortedAndFilteredCourses.map((course, idx) => (
                    <motion.tr
                      key={course.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => router.push(`/teacher/courses/${course.id}`)}
                      className="group hover:bg-slate-50/80 transition-colors cursor-pointer border-b border-slate-50"
                    >
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 shadow-sm">
                            <BookOpen size={20} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-slate-800 leading-tight group-hover:text-indigo-600 transition-colors">
                              {course.name}
                            </p>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                              {course.code || "REG-ACAD"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-wider border border-slate-200/50">
                          <Layers size={12} />
                          {course.department?.name || "Unassigned"}
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="inline-flex flex-col items-center">
                          <span className="text-sm font-black text-slate-800">{course.groupCount || 0}</span>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Sections</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <div className="flex items-center gap-1.5">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span className="text-sm font-black text-slate-800">{course.studentCount || 0}</span>
                          </div>
                          <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Active Learners</span>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
