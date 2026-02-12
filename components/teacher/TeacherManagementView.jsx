"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserModal from "../user/UserModal";
import UserTable from "../user/UserTable";
import { Plus, Activity, ShieldCheck } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";

const TEACHER_ROLE = "TEACHER";

export default function TeacherManagementView() {
  const { user: currentUser } = useUser();
  const canManageTeachers = currentUser?.role === "ADMIN" || currentUser?.role === "HR";
  const [teachers, setTeachers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [teacherToDelete, setTeacherToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [departments, setDepartments] = useState([]);

  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setErrorMessage(message);
      setIsErrorModalOpen(true);
    } else {
      setSuccessMessage(message);
      setIsSuccessModalOpen(true);
    }
  };

  const fetchTeachers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get("/teachers");
      setTeachers(data || []);
    } catch (err) {
      showMessage(err.response?.data?.message || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeachers();
    apiClient.get("/departments").then(setDepartments).catch(console.error);
  }, [fetchTeachers]);

  const handleBulkStatusChange = async (isActive) => {
    setIsLoading(true);
    try {
      await Promise.all(selectedUserIds.map(id => 
        apiClient.put(`/users?id=${id}`, { isActive })
      ));
      showMessage(`Successfully ${isActive ? 'activated' : 'suspended'} ${selectedUserIds.length} faculty accounts`);
      setSelectedUserIds([]);
      await fetchTeachers();
    } catch (err) {
      showMessage("Bulk operation failed for some users", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setIsLoading(true);
    try {
      await apiClient.put(`/users?id=${user.id}`, { isActive: !user.isActive });
      showMessage(`User account ${user.isActive ? "suspended" : "activated"} successfully!`);
      await fetchTeachers();
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTeacher = async (teacherData) => {
    setIsLoading(true);
    const isEditing = !!editingTeacher;
    const url = isEditing ? `/teachers/${editingTeacher.id}` : `/teachers`;
    const payload = { ...teacherData, role: TEACHER_ROLE };

    try {
      if (isEditing) {
        await apiClient.put(url, payload);
      } else {
        await apiClient.post(url, payload);
      }
      
      showMessage(`Teacher ${isEditing ? "updated" : "added"} successfully!`);
      await fetchTeachers();
      handleCloseModal();
    } catch (err) {
      showMessage(err.response?.data?.error || err.message || "Failed to save teacher data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!teacherToDelete) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/teachers/${teacherToDelete.id}`);
      showMessage("Teacher deleted successfully!");
      setTeachers((prev) => prev.filter((t) => t.id !== teacherToDelete.id));
    } catch (err) {
      showMessage(err.response?.data?.message || err.message, "error");
    } finally {
      setTeacherToDelete(null);
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingTeacher(null);
    setIsModalOpen(true);
  };
  const handleEditClick = (teacher) => {
    setEditingTeacher(teacher);
    setIsModalOpen(true);
  };
  const handleDeleteRequest = (teacher) => {
    setTeacherToDelete(teacher);
  };
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTeacher(null);
  };
  const handleCancelDelete = () => {
    setTeacherToDelete(null);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSuccessMessage("");
  };

  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
    setErrorMessage("");
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">
            Academic Faculty
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Manage your teaching staff, department assignments, and instructor roles.
          </p>
        </div>
        {canManageTeachers && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} />
            Register Instructor
          </button>
        )}
      </div>

      {/* Bulk Actions Floating Bar */}
      <AnimatePresence>
        {selectedUserIds.length > 0 && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-white/10 backdrop-blur-md"
          >
            <div className="flex items-center gap-3 pr-6 border-r border-white/10">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center font-black text-xs">
                {selectedUserIds.length}
              </div>
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Personnel Selected</span>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => handleBulkStatusChange(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Activate All
              </button>
              <button 
                onClick={() => handleBulkStatusChange(false)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Suspend All
              </button>
              <button 
                onClick={() => setSelectedUserIds([])}
                className="flex items-center gap-2 px-4 py-2 hover:bg-white/5 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ml-2"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <UserTable
          users={teachers}
          allRoles={["TEACHER"]}
          onAddUserClick={handleAddClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteRequest}
          onToggleStatus={handleToggleStatus}
          onResetPassword={() => {}} // Integration point
          onMigrate={() => {}} // Restricted from here
          isLoading={isLoading}
          currentUserRole={currentUser?.role}
          selectedUserIds={selectedUserIds}
          onSelectionChange={setSelectedUserIds}
        />
      </motion.div>
      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveTeacher}
          userToEdit={editingTeacher}
          roles={["TEACHER"]}
          departments={departments}
          isLoading={isLoading}
        />
      )}
      {canManageTeachers && (
        <ConfirmationDialog
          isOpen={!!teacherToDelete}
          onCancel={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title="Delete Teacher"
          message={`Are you sure you want to delete ${teacherToDelete?.firstName} ${teacherToDelete?.lastName}?`}
        />
      )}
      <ConfirmationDialog
        isOpen={isSuccessModalOpen}
        title="Success"
        message={successMessage}
        onConfirm={handleCloseSuccessModal}
        onCancel={handleCloseSuccessModal}
        isLoading={isLoading}
        confirmText="OK"
        type="success"
      />
      <ConfirmationDialog
        isOpen={isErrorModalOpen}
        title="Error"
        message={errorMessage}
        onConfirm={handleCloseErrorModal}
        onCancel={handleCloseErrorModal}
        isLoading={isLoading}
        confirmText="OK"
        type="danger"
      />
    </div>
  );
}