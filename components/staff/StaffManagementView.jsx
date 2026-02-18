"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useUser } from "@/context/UserContext";
import UserTable from "../user/UserTable";
import UserModal from "../user/UserModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Plus } from "lucide-react";
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
      const staffOnly = allUsers.filter((user) => user.role !== "STUDENT");
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
        apiClient.put(`/users?id=${id}`, { isActive })
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

  const handleToggleStatus = async (user) => {
    setIsLoading(true);
    try {
      await apiClient.put(`/users?id=${user.id}`, { isActive: !user.isActive });
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

  const handleDeleteRequest = (id) => {
    const staffMember = staffList.find((s) => s.id === id);
    setItemToDelete(staffMember);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/users?id=${itemToDelete.id}`);
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
        await apiClient.put(`/users?id=${editingStaff.id}`, staffData);
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
          onResetPassword={() => {}} // Can add later
          onMigrate={() => {}} // Restricted from here
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

      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Staff Member"
        message={`Are you sure you want to delete ${itemToDelete?.firstName} ${itemToDelete?.lastName}?`}
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