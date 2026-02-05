"use client";

import React, { useState, useEffect, useCallback } from "react";
import UserTable from "./UserTable";
import UserModal from "./UserModal";
import ConfirmationDialog from "../ConfirmationDialog";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useUser } from "@/context/UserContext";
import { apiClient } from "@/lib/api";

const ROLES = ["ADMIN", "HR", "TEACHER", "STUDENT", "STUDY_OFFICE"];

export default function UserManagementView() {
  const { user: currentUser } = useUser();
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">
            Personnel Directory
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Control system access, manage personnel roles, and monitor user account status.
          </p>
        </div>
        {(currentUser?.role === "ADMIN" || currentUser?.role === "HR") && (
          <button
            onClick={handleAddClick}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
          >
            <Plus size={14} />
            Register Personnel
          </button>
        )}
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <UserTable
          users={users}
          allRoles={ROLES}
          onAddUserClick={handleAddClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteClick}
          isLoading={isLoading}
          currentUserRole={currentUser?.role}
        />
      </motion.div>
      {isModalOpen && (
        <UserModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveUser}
          userToEdit={editingUser}
          roles={ROLES} 
          isLoading={isLoading}
        />
      )}
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
