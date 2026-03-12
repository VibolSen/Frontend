"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserTable from "./UserTable";
import UserModal from "./UserModal";
import BulkUserImportModal from "./BulkUserImportModal";
import RoleMigrationModal from "./RoleMigrationModal";
import ResetPasswordModal from "./ResetPasswordModal";
import AuditLogView from "./AuditLogView";
import ConfirmationDialog from "../ConfirmationDialog";
import BulkActionsBar from "@/components/ui/BulkActionsBar";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, UserPlus, Users, History, Activity, ShieldAlert } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";

const ROLES = ["ADMIN", "HR", "TEACHER", "STUDENT", "STUDY_OFFICE", "FINANCE"];

export default function UserManagementView() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [activeTab, setActiveTab] = useState("directory");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [isMigrationModalOpen, setIsMigrationModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [userForReset, setUserForReset] = useState(null);
  const [migratingUser, setMigratingUser] = useState(null);
  const [selectedUserIds, setSelectedUserIds] = useState([]);
  const [isBulkConfirmOpen, setIsBulkConfirmOpen] = useState(false);
  const [departments, setDepartments] = useState([]);

  const stats = {
    total: users.length,
    active: users.filter(u => u.isActive).length,
    suspended: users.filter(u => !u.isActive).length,
  };


  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setErrorMessage(message);
      setIsErrorModalOpen(true);
    } else {
      setSuccessMessage(message);
      setIsSuccessModalOpen(true);
    }
  };

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get("/users");
      // Filter out ADMIN users from the list as per request
      const nonAdminUsers = data.filter(u => u.role !== 'ADMIN');
      setUsers(nonAdminUsers);
    } catch (err) {
      showMessage(err.message || "Failed to fetch users.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();

    // Fetch departments for the modal
    apiClient.get("/departments").then(setDepartments).catch(console.error);
  }, [fetchUsers]);

  const handleAddClick = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (user) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleSaveUser = async (userData) => {
    setIsLoading(true);
    const isEditing = !!editingUser?.id;
    try {
      if (isEditing) {
        await apiClient.put(`/users/${editingUser.id}`, userData);
      } else {
        await apiClient.post("/users", userData);
      }

      setSuccessMessage(`User ${isEditing ? "updated" : "created"} successfully!`);
      setIsSuccessModalOpen(true);
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      showMessage(errorMessage, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (user) => {
    setUserToDelete(user);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/users/${userToDelete.id}`);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      showMessage("User deleted successfully!");
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      showMessage(errorMessage, "error");
    } finally {
      setIsLoading(false);
      setIsConfirmModalOpen(false);
      setUserToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setUserToDelete(null);
  };

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSuccessMessage("");
  };

  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
    setErrorMessage("");
  };

  const handleToggleStatus = async (user) => {
    setIsLoading(true);
    try {
      await apiClient.patch(`/users/toggle-status/${user.id}`, { isActive: !user.isActive });
      showMessage(`User account ${user.isActive ? "suspended" : "activated"} successfully!`);
      await fetchUsers();
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
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
      showMessage("Password updated successfully!");
      setIsResetModalOpen(false);
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkImport = async (userDataArray) => {
    setIsLoading(true);
    try {
      const response = await apiClient.post("/users/bulk-create", { users: userDataArray });
      showMessage(`${response.data.count} users imported successfully!`);
      setIsBulkModalOpen(false);
      await fetchUsers();
    } catch (err) {
      showMessage(err.response?.data?.error || "Bulk import failed", "error");
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
      await fetchUsers();
    } catch (err) {
      showMessage(err.response?.data?.error || "Migration failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkStatusChange = async (isActive) => {
    setIsLoading(true);
    try {
      await Promise.all(selectedUserIds.map(id =>
        apiClient.put(`/users/${id}`, { isActive })
      ));
      showMessage(`Successfully ${isActive ? 'activated' : 'suspended'} ${selectedUserIds.length} personnel accounts`);
      setSelectedUserIds([]);
      await fetchUsers();
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
      showMessage(`Successfully deleted ${selectedUserIds.length} user records`);
      setSelectedUserIds([]);
      await fetchUsers();
      setIsBulkConfirmOpen(false);
    } catch (err) {
      showMessage(err.response?.data?.error || "Bulk deletion failed", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Premium Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            <div className="h-10 w-1.5 bg-blue-600 rounded-full" />
            User Management Console
          </h1>
          <p className="text-slate-500 font-medium text-sm ml-4 border-l border-slate-200 pl-4">
            Unified control for personnel credentials, access policies, and system auditing.
          </p>
        </div>

        {(currentUser?.role === "ADMIN" || currentUser?.role === "HR") && (
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsBulkModalOpen(true)}
              className="group flex items-center gap-2 px-6 py-2.5 bg-white text-indigo-700 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 shadow-lg shadow-indigo-100 transition-all active:scale-95 whitespace-nowrap"
            >
              <UserPlus size={16} className="group-hover:scale-110 transition-transform" />
              Bulk Enrollment
            </button>
            <button
              onClick={handleAddClick}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-black uppercase tracking-widest rounded-2xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
            >
              <Plus size={16} />
              Register Personnel
            </button>
          </div>
        )}
      </div>

      {/* Bulk Actions Floating Bar */}
      <BulkActionsBar
        selectedIds={selectedUserIds}
        onClear={() => setSelectedUserIds([])}
        onActivate={() => handleBulkStatusChange(true)}
        onSuspend={() => handleBulkStatusChange(false)}
        onDelete={handleBulkDelete}
        label="Personnel"
        showDelete={currentUser?.role === 'ADMIN'}
      />

      {/* Modern Tab Navigation */}
      <div className="flex items-center gap-8 border-b border-slate-100 px-2 pb-px overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab("directory")}
          className={`flex items-center gap-2 pb-4 px-1 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === "directory" ? "text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
        >
          <Users size={14} />
          Personnel Directory
          {activeTab === "directory" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-full" />}
        </button>
        {currentUser?.role === "ADMIN" && (
          <button
            onClick={() => setActiveTab("audit")}
            className={`flex items-center gap-2 pb-4 px-1 text-[11px] font-black uppercase tracking-widest transition-all relative ${activeTab === "audit" ? "text-indigo-600" : "text-slate-400 hover:text-slate-600"}`}
          >
            <History size={14} />
            System Audit Log
            {activeTab === "audit" && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-full" />}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "directory" ? (
          <motion.div
            key="directory"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            {/* Quick Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Users</p>
                  <h3 className="text-xl font-black text-slate-800">{stats.total}</h3>
                </div>
                <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Users size={18} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-100 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Accounts</p>
                  <h3 className="text-xl font-black text-emerald-600">{stats.active}</h3>
                </div>
                <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Activity size={18} />
                </div>
              </div>
              <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-rose-100 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Suspended</p>
                  <h3 className="text-xl font-black text-rose-500">{stats.suspended}</h3>
                </div>
                <div className="p-2.5 bg-rose-50 text-rose-500 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <ShieldAlert size={18} />
                </div>
              </div>
            </div>

            <UserTable
              users={users}
              allRoles={ROLES}
              onAddUserClick={handleAddClick}
              onEditClick={handleEditClick}
              onDeleteClick={handleDeleteClick}
              onToggleStatus={handleToggleStatus}
              onResetPassword={handleResetPassword}
              onMigrate={handleMigrateClick}
              isLoading={isLoading}
              currentUserRole={currentUser?.role}
              selectedUserIds={selectedUserIds}
              onSelectionChange={setSelectedUserIds}
              basePath="users"
            />
          </motion.div>
        ) : (
          <motion.div
            key="audit"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AuditLogView />
          </motion.div>
        )}
      </AnimatePresence>

      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveUser}
        userToEdit={editingUser}
        roles={ROLES}
        departments={departments}
        isLoading={isLoading}
      />

      <BulkUserImportModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onImport={handleBulkImport}
        isLoading={isLoading}
      />

      <ResetPasswordModal
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
        onReset={executeResetPassword}
        user={userForReset}
        isLoading={isLoading}
      />

      <RoleMigrationModal
        isOpen={isMigrationModalOpen}
        onClose={() => setIsMigrationModalOpen(false)}
        onMigrate={handleExecuteMigration}
        user={migratingUser}
        roles={ROLES.filter(r => r !== 'ADMIN')}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        isOpen={isConfirmModalOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete ${userToDelete?.firstName} ${userToDelete?.lastName}? This cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        isLoading={isLoading}
      />

      <ConfirmationDialog
        isOpen={isBulkConfirmOpen}
        title="Bulk Deletion"
        message={`Warning: You are about to permanently delete ${selectedUserIds.length} personnel accounts. This action cannot be reversed.`}
        onConfirm={executeBulkDelete}
        onCancel={() => setIsBulkConfirmOpen(false)}
        isLoading={isLoading}
        type="danger"
        confirmText={`Delete ${selectedUserIds.length} Accounts`}
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
