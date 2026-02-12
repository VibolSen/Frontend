"use client";


import React, { useState, useEffect, useCallback } from "react";
import UserTable from "../user/UserTable";
import UserModal from "../user/UserModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Activity, ShieldAlert } from "lucide-react";

import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";

const STUDENT_ROLE = "STUDENT";

export default function StudentManagementView() {
  const { user: currentUser } = useUser();
  const canManageStudents = currentUser?.role === "ADMIN" || currentUser?.role === "STUDY_OFFICE";
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
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

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get("/students");
      setStudents(data || []);
    } catch (err) {
      showMessage(`Failed to load student data: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStudents();
    apiClient.get("/departments").then(setDepartments).catch(console.error);
  }, [fetchStudents]);

  const handleBulkStatusChange = async (isActive) => {
    setIsLoading(true);
    try {
      await Promise.all(selectedUserIds.map(id => 
        apiClient.put(`/users?id=${id}`, { isActive })
      ));
      showMessage(`Successfully ${isActive ? 'activated' : 'suspended'} ${selectedUserIds.length} student accounts`);
      setSelectedUserIds([]);
      await fetchStudents();
    } catch (err) {
      showMessage("Bulk operation failed for some students", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setIsLoading(true);
    try {
      await apiClient.put(`/users?id=${user.id}`, { isActive: !user.isActive });
      showMessage(`User account ${user.isActive ? "suspended" : "activated"} successfully!`);
      await fetchStudents();
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingStudent(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (student) => {
    setEditingStudent(student);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (id) => {
    const student = students.find((s) => s.id === id);
    setItemToDelete(student);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/students/${itemToDelete.id}`);
      setStudents((prev) => prev.filter((s) => s.id !== itemToDelete.id));
      showMessage("Student deleted successfully!");
    } catch (err) {
      showMessage(`Failed to delete student: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  const handleSaveStudent = async (studentData) => {
    setIsLoading(true);
    const isEditing = !!editingStudent?.id;
    const method = isEditing ? "put" : "post";
    const endpoint = isEditing ? `/students/${editingStudent.id}` : "/students";

    const payload = { ...studentData };
    if (!isEditing) {
      payload.role = STUDENT_ROLE;
    }

    try {
      await apiClient[method](endpoint, payload);
      showMessage(`Student ${isEditing ? "updated" : "added"} successfully!`);
      await fetchStudents();
      handleCloseModal();
    } catch (err) {
      showMessage(`Failed to save student: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
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
            Student Management
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Maintain student records, enrollment status, and academic profiles.
          </p>
        </div>
        {canManageStudents && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} />
            Add New Student
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
              <span className="text-xs font-black uppercase tracking-widest text-slate-400">Students Selected</span>
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
          users={students}
          allRoles={["STUDENT"]}
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

      {canManageStudents && isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveStudent}
          userToEdit={editingStudent}
          roles={["STUDENT"]}
          departments={departments}
          isLoading={isLoading}
        />
      )}

      {canManageStudents && (
        <ConfirmationDialog
          isOpen={!!itemToDelete}
          onCancel={() => setItemToDelete(null)}
          onConfirm={handleConfirmDelete}
          title="Delete Student"
          message={`Are you sure you want to delete student ${itemToDelete?.firstName} ${itemToDelete?.lastName}?`}
          isLoading={isLoading}
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