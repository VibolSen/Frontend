"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

const StudentPerformanceView = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "ascending" });

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
        setError("");
        
        // Fetch performance data and supporting lists
        const [performanceData, departmentsData, coursesData] = await Promise.all([
          apiClient.get("/dashboards/student-performance"),
          apiClient.get("/departments"),
          apiClient.get("/courses"),
        ]);

        setStudents(performanceData || []);
        setDepartments(departmentsData || []);
        setCourses(coursesData || []);
      } catch (err) {
        console.error("Error fetching performance data:", err);
        setError(err.message || "Failed to fetch student performance.");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const sortedAndFilteredStudents = useMemo(() => {
    let filtered = students.filter(student =>
      `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (selectedDepartment) {
      filtered = filtered.filter(student => student.departmentId === selectedDepartment);
    }

    if (selectedCourse) {
      // Note: backend might need to return courseId per student if we want to filter by course here
      filtered = filtered.filter(student => student.courseId === selectedCourse);
    }

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [students, searchQuery, selectedDepartment, selectedCourse, sortConfig]);

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] gap-6">
        <div className="relative">
          <div className="absolute inset-0 bg-blue-400/20 blur-2xl rounded-full scale-150 animate-pulse" />
          <LoadingSpinner size="xl" color="blue" />
        </div>
        <p className="text-slate-600 font-bold text-lg animate-pulse tracking-tight">
          Analyzing Student Performance Data...
        </p>
      </div>
    );
  }

  if (error) {
    return (
       <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
         <p className="font-bold">Error loading performance data</p>
         <p className="text-sm">{error}</p>
       </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">
            Performance Analytics
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Monitor academic progress, attendance trends, and engagement metrics across the student body.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <input
          type="text"
          placeholder="Search students..."
          className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((dept) => (
            <option key={dept.id} value={dept.id}>
              {dept.name}
            </option>
          ))}
        </select>
        <select
          className="w-full bg-white border border-slate-200 px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">All Courses</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name}
            </option>
          ))}
        </select>
      </div>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm overflow-hidden h-96">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedAndFilteredStudents}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="lastName" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
            <Tooltip 
              contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
            />
            <Legend />
            <Bar dataKey="averageGrade" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Grade" />
            <Bar dataKey="attendanceRate" fill="#10b981" radius={[4, 4, 0, 0]} name="Attendance %" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer" onClick={() => requestSort('lastName')}>Student</th>
                <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer" onClick={() => requestSort('averageGrade')}>Avg Grade</th>
                <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer" onClick={() => requestSort('attendanceRate')}>Attendance</th>
                <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer" onClick={() => requestSort('completedAssignments')}>Assignments</th>
                <th className="px-6 py-4 font-bold text-slate-700 cursor-pointer" onClick={() => requestSort('averageExamGrade')}>Exam Avg</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedAndFilteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{`${student.firstName} ${student.lastName}`}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${student.averageGrade >= 80 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                      {student.averageGrade}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{student.attendanceRate}%</td>
                  <td className="px-6 py-4 text-slate-600">{student.completedAssignments} Completed</td>
                  <td className="px-6 py-4 text-slate-600 font-semibold">{student.averageExamGrade}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformanceView;
