"use client";

import React, { useState, useEffect } from "react";
import DashboardCard from "@/components/dashboard/DashboardCard";
import { Users, BarChart3 } from "lucide-react";
import AnnouncementsView from "@/components/announcements/AnnouncementsView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

const CourseAnalyticsView = ({ loggedInUser }) => {
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [courses, setCourses] = useState([]);
  const [courseData, setCourseData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('analytics');

  // Fetch initial list of courses for the dropdown
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Admins and Study Office see all courses, others see their own
        const url =
          (loggedInUser.role === "ADMIN" || loggedInUser.role === "STUDY_OFFICE")
            ? "/courses"
            : `/courses?teacherId=${loggedInUser.id}`;
        const data = await apiClient.get(url);
        setCourses(data || []);
        // Select the first course by default
        if (data && data.length > 0) {
          setSelectedCourseId(data[0].id);
        }
      } catch (err) {
        console.error("Failed to fetch courses:", err);
        setError("Could not load course list.");
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [loggedInUser]);

  // Fetch analytics data when a course is selected
  useEffect(() => {
    if (!selectedCourseId) {
      setCourseData(null);
      return;
    }

    const fetchAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await apiClient.get(`/course-analytics?courseId=${selectedCourseId}`);
        setCourseData(data);
      } catch (err) {
        console.error(`Analytics fetch error for ${selectedCourseId}:`, err);
        setError(err.response?.data?.error || err.message);
        setCourseData(null); // Clear old data on error
      } finally {
        setLoading(false);
      }
    };

    if (activeTab === 'analytics') {
        fetchAnalytics();
    }
  }, [selectedCourseId, activeTab]);

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value || null);
  };

  const selectedCourse = courseData?.course;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto pb-20">
      <div className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
          Course <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-700">Analytics</span>
        </h1>
        <p className="text-[11px] font-medium text-slate-500 mt-0.5 max-w-xl leading-relaxed">
          Dive into the performance, engagement metrics and announcements for your designated workspace.
        </p>
      </div>

      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-4 z-20">
        <div className="flex-1 w-full max-w-md relative">
          <label htmlFor="course-selector" className="absolute -top-2 left-3 bg-white px-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 shadow-sm rounded">
            Active Workspace
          </label>
          <select
            id="course-selector"
            value={selectedCourseId || ""}
            onChange={handleCourseChange}
            disabled={loading && !courseData}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-slate-50"
          >
            {courses.length > 0 ? (
              courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))
            ) : (
              <option disabled>
                {loading ? "Loading courses..." : "No courses assigned to you"}
              </option>
            )}
          </select>
        </div>

        <nav className="flex space-x-2 bg-slate-50 p-1.5 rounded-xl border border-slate-100" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`${
              activeTab === 'analytics'
                ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/20 border-transparent'
                : 'text-slate-500 hover:text-indigo-600 border-transparent hover:bg-slate-100'
            } px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`${
              activeTab === 'announcements'
                ? 'bg-gradient-to-br from-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/20 border-transparent'
                : 'text-slate-500 hover:text-indigo-600 border-transparent hover:bg-slate-100'
            } px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border`}
          >
            Announcements
          </button>
        </nav>
      </div>

      {loading && (
        <div className="flex flex-col justify-center items-center h-64 gap-3 bg-white rounded-3xl border border-slate-200">
          <LoadingSpinner size="lg" color="indigo" />
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 animate-pulse">Gathering insights...</span>
        </div>
      )}

      {!loading && error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-5 rounded-2xl">
          <h3 className="text-xs font-black uppercase tracking-widest">System Error</h3>
          <p className="text-sm font-medium mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && !selectedCourseId && (
         <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
           <h3 className="mt-2 text-sm font-black text-slate-400 uppercase tracking-widest">
             No courses found
           </h3>
         </div>
      )}

      {!loading && !error && selectedCourseId && activeTab === 'analytics' && !courseData && (
        <div className="text-center py-20 bg-slate-50 rounded-3xl border border-slate-200 border-dashed">
          <h3 className="mt-2 text-sm font-black text-slate-400 uppercase tracking-widest">
            Select a course
          </h3>
        </div>
      )}

      {activeTab === 'analytics' && !loading && !error && courseData && (
        <div className="bg-white rounded-[2.5rem] p-8 text-slate-900 shadow-2xl relative overflow-hidden border border-slate-200">
             <div className="absolute top-0 right-0 -mt-16 -mr-16 w-96 h-96 bg-indigo-50/50 rounded-full blur-[100px] pointer-events-none" />
             <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-72 h-72 bg-blue-50/50 rounded-full blur-[80px] pointer-events-none" />
             
             <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
               
               <div className="space-y-6">
                  <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                    <BarChart3 className="text-indigo-600" size={20} /> Platform Analytics
                  </h2>
                 <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:-translate-y-1 transition-transform shadow-sm group">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-indigo-600 transition-colors">Enrolled</p>
                      <p className="text-4xl font-black tabular-nums text-slate-900">{courseData.enrolledStudents?.length || 0}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:-translate-y-1 transition-transform shadow-sm group">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 group-hover:text-indigo-600 transition-colors">Completion</p>
                      <p className="text-4xl font-black tabular-nums text-emerald-600">{courseData.completionRate || 0}%</p>
                    </div>
                 </div>
               </div>

                <div className="space-y-6">
                 <h2 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
                   <Users className="text-indigo-600" size={20} /> Metadata Registry
                 </h2>
                 <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 backdrop-blur-md p-6 rounded-2xl border border-indigo-100/50 space-y-5 shadow-sm">
                    <div>
                      <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Course Identifier</p>
                       <p className="text-sm font-bold text-slate-900 mt-1 leading-tight">{selectedCourse?.name || "N/A"}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Department</p>
                         <p className="text-xs font-bold text-slate-700 mt-1">{selectedCourse?.courseDepartments?.[0]?.department?.name || "N/A"}</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Instructor</p>
                         <p className="text-xs font-bold text-indigo-600 mt-1">{selectedCourse?.leadBy ? `${selectedCourse.leadBy.firstName} ${selectedCourse.leadBy.lastName}` : "N/A"}</p>
                      </div>
                    </div>
                 </div>
                </div>

             </div>
          </div>
      )}

      {activeTab === 'announcements' && selectedCourseId && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
           <AnnouncementsView courseId={selectedCourseId} loggedInUser={loggedInUser} />
        </div>
      )}
    </div>
  );
};

export default CourseAnalyticsView;
