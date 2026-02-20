"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserTable from "./UserTable";
import UserModal from "./UserModal";
import BulkUserImportModal from "./BulkUserImportModal";
import RoleMigrationModal from "./RoleMigrationModal";
import ResetPasswordModal from "./ResetPasswordModal";
import AuditLogView from "./AuditLogView";
import ConfirmationDialog from "../ConfirmationDialog";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, UserPlus, Users, ShieldAlert, History, Activity, ShieldCheck } from "lucide-react";
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
      setUsers(data);
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
        await apiClient.put(`/users?id=${editingUser.id}`, userData);
      } else {
        await apiClient.post("/users", userData);
      }

      setSuccessMessage(`User ${isEditing ? "updated" : "created"} successfully!`);
      setIsSuccessModalOpen(true);
      await fetchUsers();
      handleCloseModal();
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (userId) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setUserToDelete(user);
      setIsConfirmModalOpen(true);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/users?id=${userToDelete.id}`);
      setUsers(users.filter((u) => u.id !== userToDelete.id));
      showMessage("User deleted successfully!");
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
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
      await apiClient.put(`/users?id=${user.id}`, { role, migrationReason });
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
        apiClient.put(`/users?id=${id}`, { isActive })
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
              className="group flex items-center gap-2 px-5 py-2.5 bg-white text-indigo-700 text-[11px] font-black uppercase tracking-widest rounded-2xl hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 shadow-sm transition-all active:scale-95"
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
                <Activity size={12} /> Activate All
              </button>
              <button 
                onClick={() => handleBulkStatusChange(false)}
                className="flex items-center gap-2 px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
              >
                <ShieldAlert size={12} /> Suspend All
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
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-blue-100 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Users</p>
                  <h3 className="text-2xl font-black text-slate-800">{stats.total}</h3>
                </div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <Users size={20} />
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-emerald-100 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Accounts</p>
                  <h3 className="text-2xl font-black text-emerald-600">{stats.active}</h3>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                  <Activity size={20} />
                </div>
              </div>
              <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between group hover:border-rose-100 transition-colors">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Suspended</p>
                  <h3 className="text-2xl font-black text-rose-500">{stats.suspended}</h3>
                </div>
                <div className="p-3 bg-rose-50 text-rose-500 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                  <ShieldAlert size={20} />
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
