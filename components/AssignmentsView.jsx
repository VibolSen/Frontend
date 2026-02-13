"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AssignmentModal from "./AssignmentModal";
import AssignmentCard from "./assignment/AssignmentCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

export default function AssignmentsView({ loggedInUser }) {
  // STATE MANAGEMENT
  const [assignments, setAssignments] = useState([]);
  const [teacherGroups, setTeacherGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [assignmentToEdit, setAssignmentToEdit] = useState(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [assignmentToDelete, setAssignmentToDelete] = useState(null);
  const router = useRouter();
  const teacherId = loggedInUser?.id;

  // DATA FETCHING LOGIC
  const fetchData = useCallback(async () => {
    if (!loggedInUser) return;
    setIsLoading(true);
    try {
      let assignmentsUrl = `/assignments?teacherId=${loggedInUser.id}`;
      if (
        loggedInUser.role === "ADMIN" ||
        loggedInUser.role === "STUDY_OFFICE" ||
        loggedInUser.role === "study_office"
      ) {
        assignmentsUrl = "/assignments";
      }

      const requests = [
        apiClient.get(assignmentsUrl),
        apiClient.get("/courses") // Fetching all courses for now
      ];
      
      if (loggedInUser.role === "TEACHER") {
         requests.push(apiClient.get(`/teachers/my-groups?teacherId=${loggedInUser.id}`));
      }

      const results = await Promise.allSettled(requests);
      
      // Assignments
      if (results[0].status === 'fulfilled') {
        setAssignments(results[0].value || []);
      } else {
        console.error("Failed to fetch assignments:", results[0].reason);
      }

      // Courses
      if (results[1].status === 'fulfilled') {
        const allCourses = results[1].value || [];
        // Optional: Filter courses if needed, or backend should handle it. 
        // For now, passing all courses or filtering by teacher if possible.
        // Assuming courses have leadById, we could filter:
        // const myCourses = allCourses.filter(c => c.leadById === loggedInUser.id);
        // But courses can be assigned to groups taught by teacher too. 
        setCourses(allCourses);
      } else {
        setCourses([]);
      }

      // Groups (Index 2 if teacher)
      if (loggedInUser.role === "TEACHER" && results[2] && results[2].status === 'fulfilled') {
        setTeacherGroups(results[2].value || []);
      } else if (loggedInUser.role !== "TEACHER") {
         // Maybe admin needs groups too? logic was existing. 
         // Original code only set teacherGroups if status was fulfilled at index 1... 
         // Wait, original code pushed groups request at index 1 only if teacher.
         // Now I put courses at index 1, groups at index 2.
         // So I need to be careful with indices.
      }
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [loggedInUser]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // CRUD HANDLERS
  const handleSaveAssignment = async (data) => {
    setIsLoading(true);
    try {
      // data is FormData from AssignmentModal
      if (teacherId) {
        data.append("teacherId", teacherId);
      }
      await apiClient.post("/assignments", data);
      console.log("Assignment created successfully!");
      setIsAddModalOpen(false);
      await fetchData();
    } catch (err) {
      console.error("Save assignment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (assignment) => {
    setAssignmentToEdit(assignment);
    setIsEditModalOpen(true);
  };

  const handleUpdateAssignment = async (formData) => {
    if (!assignmentToEdit) return;
    setIsLoading(true);
    try {
      await apiClient.put(`/assignments/${assignmentToEdit.id}`, formData);
      console.log("Assignment updated successfully!");
      setIsEditModalOpen(false);
      setAssignmentToEdit(null);
      await fetchData();
    } catch (err) {
      console.error("Update assignment error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = (assignmentId) => {
    setAssignmentToDelete(assignmentId);
    setShowConfirmation(true);
  };

  const confirmDelete = async () => {
    if (!assignmentToDelete) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/assignments/${assignmentToDelete}`);
      console.log("Assignment deleted successfully!");
      await fetchData();
    } catch (err) {
      console.error("Delete assignment error:", err);
    } finally {
      setIsLoading(false);
      setShowConfirmation(false);
      setAssignmentToDelete(null);
    }
  };

  const calculateStats = () => {
    if (assignments.length === 0) return { avgRate: 0, totalSubmissions: 0 };
    let totalSubmissions = 0;
    let totalExpected = 0;
    assignments.forEach(a => {
      totalSubmissions += a._count?.submissions || 0;
      totalExpected += a.group?._count?.students || 0;
    });
    const avgRate = totalExpected > 0 ? (totalSubmissions / totalExpected) * 100 : 0;
    return { avgRate: avgRate.toFixed(1), totalSubmissions };
  };

  const stats = calculateStats();

  // MAIN RENDER
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50/30 p-4">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Assignments
            </h1>
            <p className="text-slate-600 mt-1">
              Create and manage assignments for your classes
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            disabled={teacherGroups.length === 0}
            className="group relative bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-2 rounded-xl font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Assignment
            </span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{assignments.length}</p>
                <p className="text-slate-600 text-xs">Total Assignments</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{teacherGroups.length}</p>
                <p className="text-slate-600 text-xs">Active Groups</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{stats.avgRate}%</p>
                <p className="text-slate-600 text-xs">Avg. Submission Rate</p>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                <p className="text-slate-600 text-xs">Today's Date</p>
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-800">All Assignments</h2>
            <button onClick={fetchData} className="flex items-center gap-1 text-slate-600 hover:text-slate-800 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-10">
              <LoadingSpinner size="lg" color="blue" />
            </div>
          ) : assignments.length === 0 ? (
            <div className="text-center py-10">
               <p className="text-slate-500 mb-4">No assignments yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignments.map((assignment, index) => (
                <div key={assignment.id} className="transform hover:scale-105 transition-transform duration-200">
                  <AssignmentCard
                    assignment={{
                      ...assignment,
                      submissionCount: assignment._count?.submissions || 0,
                      totalStudents: assignment.group?._count?.students || 0
                    }}
                    onNavigate={() => router.push(`/teacher/assignment/${assignment.id}`)}
                    onEdit={() => handleEdit(assignment)}
                    onDelete={() => handleDelete(assignment.id)}
                    userRole={loggedInUser?.role}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <AssignmentModal
        isOpen={isAddModalOpen || isEditModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setIsEditModalOpen(false);
          setAssignmentToEdit(null);
        }}
        onSave={assignmentToEdit ? handleUpdateAssignment : handleSaveAssignment}
        teacherGroups={teacherGroups}
        courses={courses}
        isLoading={isLoading}
        assignment={assignmentToEdit}
      />

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h2 className="text-lg font-bold text-slate-800 mb-2">Delete Assignment</h2>
              <p className="text-slate-600 text-sm">Are you sure you want to delete this assignment?</p>
            </div>
            <div className="p-4 bg-slate-50 border-t rounded-b-xl flex justify-end gap-2">
              <button onClick={() => setShowConfirmation(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-lg">Cancel</button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-lg">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
