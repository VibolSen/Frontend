"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import UserTable from "../user/UserTable";
import UserModal from "../user/UserModal";
import RoleMigrationModal from "../user/RoleMigrationModal";
import ResetPasswordModal from "../user/ResetPasswordModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Plus, Trash2, Activity, ShieldAlert, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

const ALL_ROLES = ["ADMIN", "HR", "TEACHER", "STUDY_OFFICE", "FINANCE"];

export default function StaffManagementView() {
  const { user, loading: userLoading } = useUser();
  const [staffList, setStaffList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
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

  const availableStaffRoles = useMemo(() => {
    if (user?.role === "ADMIN") {
      return ALL_ROLES;
    }
    if (user?.role === "HR") {
      return ALL_ROLES;
    }
    return [];
  }, [user?.role]);

  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setErrorMessage(message);
      setIsErrorModalOpen(true);
    } else {
      setSuccessMessage(message);
      setIsSuccessModalOpen(true);
    }
  };

  const fetchStaff = useCallback(async () => {
    setIsLoading(true);
    try {
      const allUsers = await apiClient.get("/users");
      // Filter out STUDENTs to get staff, AND filter out ADMINs as requested
      const staffOnly = allUsers.filter((user) => user.role !== "STUDENT" && user.role !== "ADMIN");
      setStaffList(staffOnly);
    } catch (err) {
      showMessage(`Failed to load staff data: ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStaff();
    apiClient.get("/departments").then(setDepartments).catch(console.error);
  }, [fetchStaff]);

  const handleBulkStatusChange = async (isActive) => {
    setIsLoading(true);
    try {
      await Promise.all(selectedUserIds.map(id =>
        apiClient.put(`/users/${id}`, { isActive })
      ));
      showMessage(`Successfully ${isActive ? 'activated' : 'suspended'} ${selectedUserIds.length} personnel accounts`);
      setSelectedUserIds([]);
      await fetchStaff();
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
      showMessage(`Successfully deleted ${selectedUserIds.length} personnel records`);
      setSelectedUserIds([]);
      await fetchStaff();
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
      await apiClient.put(`/users/${user.id}`, { isActive: !user.isActive });
      showMessage(`User account ${user.isActive ? "suspended" : "activated"} successfully!`);
      await fetchStaff();
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddClick = () => {
    setEditingStaff(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (staff) => {
    setEditingStaff(staff);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (user) => {
    setItemToDelete(user);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/users/${itemToDelete.id}`);
      setStaffList((prev) => prev.filter((s) => s.id !== itemToDelete.id));
      showMessage("Staff member deleted successfully!");
    } catch (err) {
      showMessage(`Failed to delete staff: ${err.response?.data?.error || err.message}`, "error");
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStaff(null);
  };

  const handleSaveStaff = async (staffData) => {
    setIsLoading(true);
    const isEditing = !!editingStaff?.id;
    try {
      if (isEditing) {
        await apiClient.put(`/users/${editingStaff.id}`, staffData);
      } else {
        await apiClient.post("/users", staffData);
      }
      showMessage(
        `Staff member ${isEditing ? "updated" : "added"} successfully!`
      );
      await fetchStaff(); // Refresh the list
      handleCloseModal();
    } catch (err) {
      showMessage(`Failed to save staff: ${err.response?.data?.error || err.message}`, "error");
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
      showMessage(`Personnel authority successfully migrated to ${role}`);
      setIsMigrationModalOpen(false);
      await fetchStaff();
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

  const executeResetPassword = async (user, newPassword) => {
    setIsLoading(true);
    try {
      await apiClient.post(`/users/reset-password/${user.id}`, { newPassword });
      showMessage(`Security credentials updated for ${user.firstName}`);
      setIsResetModalOpen(false);
    } catch (err) {
      showMessage(err.response?.data?.error || "Password reset failed", "error");
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
            Academic & Support Staff
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Manage administrative personnel, support departments, and coordinate academic staff roles.
          </p>
        </div>
        {(user?.role === "ADMIN" || user?.role === "HR") && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={16} />
            Register Staff Member
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
            className="fixed bottom-10 left-1/2 -translate-x-1/2 z-50 bg-white/80 backdrop-blur-2xl px-8 py-5 rounded-[2.5rem] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.15)] flex items-center gap-8 border border-slate-200/60"
          >
            <div className="flex items-center gap-4 pr-8 border-r border-slate-200">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-lg shadow-indigo-200 ring-4 ring-indigo-50">
                {selectedUserIds.length}
              </div>
              <div className="flex flex-col text-left">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600">Selection Active</span>
                <span className="text-[13px] font-bold text-slate-800 tracking-tight whitespace-nowrap">Personnel Selected</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => handleBulkStatusChange(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-emerald-200/50"
              >
                <Activity size={12} strokeWidth={3} /> Activate
              </button>
              <button
                onClick={() => handleBulkStatusChange(false)}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-rose-200/50"
              >
                <ShieldAlert size={12} strokeWidth={3} /> Suspend
              </button>
              {user?.role === 'ADMIN' && (
                <button
                  onClick={handleBulkDelete}
                  className="flex items-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm hover:shadow-rose-200/50"
                >
                  <Trash2 size={12} strokeWidth={3} /> Delete
                </button>
              )}
              <button
                onClick={() => setSelectedUserIds([])}
                className="ml-2 p-2.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-2xl transition-all"
              >
                <X size={18} strokeWidth={3} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >

        <UserTable
          users={staffList}
          allRoles={availableStaffRoles}
          onAddUserClick={handleAddClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteRequest}
          onToggleStatus={handleToggleStatus}
          onResetPassword={handleResetPassword}
          onMigrate={handleMigrateClick}
          isLoading={isLoading || userLoading}
          currentUserRole={user?.role}
          selectedUserIds={selectedUserIds}
          onSelectionChange={setSelectedUserIds}
        />
      </motion.div>

      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveStaff}
          userToEdit={editingStaff}
          roles={availableStaffRoles}
          departments={departments}
          isLoading={isLoading || userLoading}
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

      {isMigrationModalOpen && (
        <RoleMigrationModal
          isOpen={isMigrationModalOpen}
          onClose={() => setIsMigrationModalOpen(false)}
          onMigrate={handleExecuteMigration}
          user={migratingUser}
          roles={ALL_ROLES.filter(r => r !== 'ADMIN')}
          isLoading={isLoading || userLoading}
        />
      )}

      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${itemToDelete?.firstName} ${itemToDelete?.lastName}?`}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        isOpen={isBulkConfirmOpen}
        title="Personnel Deletion"
        message={`Warning: You are about to permanently delete ${selectedUserIds.length} personnel accounts. This operation is irreversible.`}
        onConfirm={executeBulkDelete}
        onCancel={() => setIsBulkConfirmOpen(false)}
        isLoading={isLoading}
        type="danger"
        confirmText={`Delete ${selectedUserIds.length} Members`}
      />
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