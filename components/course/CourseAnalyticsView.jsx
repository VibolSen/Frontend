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
        // Admins see all courses, others see their own
        const url =
          loggedInUser.role === "ADMIN"
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
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-800">Course Management</h1>
      <p className="text-slate-500">
        Dive into the performance, engagement metrics and announcements for your courses.
      </p>

      <div className="bg-white p-4 rounded-xl shadow-md top-0 z-10">
        <label
          htmlFor="course-selector"
          className="block text-sm font-medium text-slate-700 mb-1"
        >
          Select a Course
        </label>
        <select
          id="course-selector"
          value={selectedCourseId || ""}
          onChange={handleCourseChange}
          disabled={loading && !courseData} // Disable while initial courses load
          className="w-full sm:max-w-md px-3 py-2 border border-slate-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
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

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('analytics')}
            className={`${
              activeTab === 'analytics'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Analytics
          </button>
          <button
            onClick={() => setActiveTab('announcements')}
            className={`${
              activeTab === 'announcements'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Announcements
          </button>
        </nav>
      </div>

      {loading && (
        <div className="flex flex-col justify-center items-center h-64 gap-3">
          <LoadingSpinner size="lg" color="blue" />
          <span className="text-slate-500 font-medium animate-pulse">Gathering insights...</span>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-center">
          <h3 className="font-bold">An Error Occurred</h3>
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && !selectedCourseId && (
         <div className="text-center py-20 bg-white rounded-xl shadow-md">
           <h3 className="mt-2 text-sm font-semibold text-slate-900">
             No courses found
           </h3>
           <p className="mt-1 text-sm text-slate-500">
             You are not currently assigned to any courses.
           </p>
         </div>
      )}

      {!loading && !error && selectedCourseId && activeTab === 'analytics' && !courseData && (
        <div className="text-center py-20 bg-white rounded-xl shadow-md">
          <h3 className="mt-2 text-sm font-semibold text-slate-900">
            Select a course
          </h3>
          <p className="mt-1 text-sm text-slate-500">
            Please choose a course from the dropdown to view its analytics.
          </p>
        </div>
      )}


      {activeTab === 'analytics' && !loading && !error && courseData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DashboardCard
              title="Enrolled Students"
              value={(courseData.enrolledStudents?.length || 0).toString()}
              icon={<Users className="w-6 h-6 text-blue-500" />}
              subtitle="Total students enrolled"
            />
            <DashboardCard
              title="Completion Rate"
              value={`${courseData.completionRate || 0}%`}
              icon={<BarChart3 className="w-6 h-6 text-green-500" />}
              subtitle="Based on progress"
            />
          </div>

          {/* Additional Analytics Section */}
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">
              Course Overview
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium text-slate-700 mb-3">
                  Course Details
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Course Title:</span>
                    <span className="font-medium">{selectedCourse?.name || "N/A"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Department:</span>
                    <span className="font-medium">
                      {selectedCourse?.courseDepartments?.[0]?.department?.name || "N/A"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Instructor:</span>
                    <span className="font-medium">
                      {selectedCourse?.leadBy ? `${selectedCourse.leadBy.firstName} ${selectedCourse.leadBy.lastName}` : "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-slate-700 mb-3">
                  Performance Metrics
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Students Enrolled:</span>
                    <span className="font-medium">
                      {courseData.enrolledStudents?.length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Completion Rate:</span>
                    <span className="font-medium">
                      {courseData.completionRate || 0}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {activeTab === 'announcements' && selectedCourseId && (
        <AnnouncementsView courseId={selectedCourseId} loggedInUser={loggedInUser} />
      )}
    </div>
  );
};

export default CourseAnalyticsView;
