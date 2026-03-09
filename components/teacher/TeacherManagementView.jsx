"use client";

import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import UserModal from "../user/UserModal";
import UserTable from "../user/UserTable";
import RoleMigrationModal from "../user/RoleMigrationModal";
import ResetPasswordModal from "../user/ResetPasswordModal";
import { Plus } from "lucide-react";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import BulkActionsBar from "@/components/ui/BulkActionsBar";
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
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [migratingUser, setMigratingUser] = useState(null);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userForReset, setUserForReset] = useState(null);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);

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
        apiClient.patch(`/users/toggle-status/${id}`, { isActive })
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

  const handleBulkDelete = async () => {
    setIsBulkConfirmOpen(true);
  };

  const executeBulkDelete = async () => {
    setIsLoading(true);
    try {
      await apiClient.post('/users/bulk-delete', { ids: selectedUserIds });
      showMessage(`Successfully deleted ${selectedUserIds.length} instructor records`);
      setSelectedUserIds([]);
      await fetchTeachers();
      setIsBulkConfirmOpen(false);
    } catch (err) {
      showMessage(err.response?.data?.error || "Bulk deletion failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleStatus = async (user) => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/users/toggle-status/${user.id}`, { isActive: !user.isActive });
      showMessage(`Teacher account ${user.isActive ? "suspended" : "activated"} successfully!`);
      await fetchTeachers();
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMigrateClick = (user) => {
    setMigratingUser(user);
    setIsMigrationModalOpen(true);
  };

  const handleExecuteMigration = async (user, { role, migrationReason }) => {
    setIsLoading(true);
    try {
      await apiClient.put(`/users/${user.id}`, { role, migrationReason });
      showMessage(`Faculty status successfully migrated to ${role}`);
      setIsMigrationModalOpen(false);
      await fetchTeachers();
    } catch (err) {
      showMessage(err.response?.data?.error || "Migration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = (user) => {
    setUserForReset(user);
    setIsResetModalOpen(true);
  };

  const executeResetPassword = async (userId, newPassword) => {
    setIsLoading(true);
    try {
      await apiClient.post(`/users/reset-password/${userId}`, { newPassword });
      showMessage("Credential reset successful. Teacher can now log in with the new password.");
      setIsResetModalOpen(false);
    } catch (err) {
      showMessage(err.response?.data?.error || "Reset failed", "error");
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
      <BulkActionsBar
        selectedIds={selectedUserIds}
        onClear={() => setSelectedUserIds([])}
        onActivate={() => handleBulkStatusChange(true)}
        onSuspend={() => handleBulkStatusChange(false)}
        onDelete={handleBulkDelete}
        label="Instructors"
        showDelete={currentUser?.role === 'ADMIN'}
      />

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
          onResetPassword={handleResetPassword}
          onMigrate={handleMigrateClick}
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
      {isMigrationModalOpen && (
        <RoleMigrationModal
          isOpen={isMigrationModalOpen}
          onClose={() => setIsMigrationModalOpen(false)}
          onMigrate={handleExecuteMigration}
          user={migratingUser}
          roles={["ADMIN", "HR", "TEACHER", "STUDENT", "STUDY_OFFICE", "FINANCE"]}
          isLoading={isLoading}
        />
      )}
      {isResetModalOpen && (
        <ResetPasswordModal
          isOpen={isResetModalOpen}
          onClose={() => setIsResetModalOpen(false)}
          onReset={executeResetPassword}
          user={userForReset}
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
      <ConfirmationDialog
        isOpen={isBulkConfirmOpen}
        title="Instructor Deletion"
        message={`Warning: You are about to permanently delete ${selectedUserIds.length} instructor accounts. This action cannot be reversed.`}
        onConfirm={executeBulkDelete}
        onCancel={() => setIsBulkConfirmOpen(false)}
        isLoading={isLoading}
        type="danger"
        confirmText={`Delete ${selectedUserIds.length} Instructors`}
      />
    </div>
  );
}