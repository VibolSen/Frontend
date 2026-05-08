"use client";

import React, { useState, useEffect, useCallback } from "react";
import GroupsTable from "./GroupTable";
import GroupModal from "./GroupModal";
import ManageGroupMembersModal from "./ManageGroupMembersModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { apiClient } from '@/lib/api';

export default function GroupManagementView({ role }) {
  const [groups, setGroups] = useState([]);
  const [courses, setCourses] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isManageMembersModalOpen, setIsManageMembersModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null);
  const [groupForMemberManagement, setGroupForMemberManagement] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Can be a single group object or an array of group objects
  const [itemToDelete, setItemToDelete] = useState(null);
  
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

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [groupsData, coursesData, studentsData, batchesData] = await Promise.all([
        apiClient.get("/groups"),
        apiClient.get("/courses"),
        apiClient.get("/students"),
        apiClient.get("/batches"),
      ]);

      setGroups(groupsData || []);
      setCourses(coursesData || []);
      setAllStudents(studentsData || []);
      setBatches(batchesData || []);
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async (groupData) => {
    setIsLoading(true);
    const isEditing = !!editingGroup;

    try {
      if (isEditing) {
        await apiClient.put(`/groups/${editingGroup.id}`, groupData);
      } else {
        await apiClient.post("/groups", groupData);
      }
      showMessage(`Group ${isEditing ? "updated" : "created"} successfully!`);
      await fetchData();
      handleCloseModal();
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveMembers = async (studentIds) => {
    if (!groupForMemberManagement) return;
    setIsLoading(true);
    try {
      await apiClient.put(`/groups/${groupForMemberManagement.id}`, { studentIds });
      showMessage("Group members updated successfully!");
      await fetchData();
      handleCloseManageMembersModal();
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsLoading(true);
    
    try {
      if (Array.isArray(itemToDelete)) {
        // Bulk delete execution via concurrent requests
        const deletePromises = itemToDelete.map(group => apiClient.delete(`/groups/${group.id}`));
        await Promise.all(deletePromises);
        
        showMessage(`Successfully purged ${itemToDelete.length} cohorts.`, "success");
        setGroups((prev) => prev.filter((g) => !itemToDelete.find(deleted => deleted.id === g.id)));
      } else {
        // Single delete
        await apiClient.delete(`/groups/${itemToDelete.id}`);
        showMessage("Cohort securely deleted and logged.", "success");
        setGroups((prev) => prev.filter((g) => g.id !== itemToDelete.id));
      }
    } catch (err) {
      showMessage(err.message || "Failed to purge cohorts. Note: cohorts with active enrollments may be protected.", "error");
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
      // Wait a tick and refetch data to resync the table just in case some failed but others succeeded
      await fetchData(); 
    }
  };

  const handleAddClick = () => {
    setEditingGroup(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (group) => {
    setEditingGroup(group);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (group) => {
    setItemToDelete(group); // single
  };
  
  const handleBulkDeleteRequest = (groupsArray) => {
    setItemToDelete(groupsArray); // array
  };

  const handleManageMembersClick = (group) => {
    setGroupForMemberManagement(group);
    setIsManageMembersModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingGroup(null);
  };

  const handleCloseManageMembersModal = () => {
    setIsManageMembersModalOpen(false);
    setGroupForMemberManagement(null);
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
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-blue-700 tracking-tight">
            Academic Groups
          </h1>
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
            Organize student cohorts, manage course assignments, and coordinate group-based academic activities.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:shadow-indigo-500/50 hover:-translate-y-0.5 shadow-lg shadow-indigo-200 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={16} strokeWidth={3} />
          Create New Group
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.99 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
      >
        <GroupsTable
          groups={groups}
          courses={courses}
          onAddGroupClick={handleAddClick}
          onEdit={handleEditClick}
          onDelete={handleDeleteRequest}
          onBulkDelete={handleBulkDeleteRequest}
          onManageMembers={handleManageMembersClick}
          isLoading={isLoading}
          role={role}
        />
      </motion.div>
      
      {isModalOpen && (
        <GroupModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSave}
          groupToEdit={editingGroup}
          courses={courses}
          allStudents={allStudents}
          batches={batches}
          isLoading={isLoading}
        />
      )}
      
      {isManageMembersModalOpen && (
        <ManageGroupMembersModal
          isOpen={isManageMembersModalOpen}
          onClose={handleCloseManageMembersModal}
          group={groupForMemberManagement}
          allStudents={allStudents}
          onSaveChanges={handleSaveMembers}
          isLoading={isLoading}
        />
      )}
      
      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title={Array.isArray(itemToDelete) ? "Verify Bulk Purge" : "Verify Cohort Deletion"}
        message={
          Array.isArray(itemToDelete)
            ? `DANGER: You are about to permanently purge ${itemToDelete.length} cohorts. This action creates a permanent audit log and drops all related registry connections. Are you sure?`
            : `Are you sure you want to completely delete the "${itemToDelete?.name}" cohort?`
        }
        isLoading={isLoading}
      />
      
      <ConfirmationDialog
        isOpen={isSuccessModalOpen}
        title="Transaction Complete"
        message={successMessage}
        onConfirm={handleCloseSuccessModal}
        onCancel={handleCloseSuccessModal}
        isLoading={isLoading}
        confirmText="Acknowledge"
        type="success"
      />
      
      <ConfirmationDialog
        isOpen={isErrorModalOpen}
        title="Transaction Warning"
        message={errorMessage}
        onConfirm={handleCloseErrorModal}
        onCancel={handleCloseErrorModal}
        isLoading={isLoading}
        confirmText="Dismiss"
        type="danger"
      />
    </div>
  );
}
