"use client";

import React, { useState, useEffect, useCallback } from "react";
import DepartmentsTable from "./DepartmentsTable";
import DepartmentModal from "./DepartmentModal";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { motion } from "framer-motion";
import { Plus } from "lucide-react";

import { apiClient } from '@/lib/api';

export default function DepartmentManagementView() {
  const [departments, setDepartments] = useState([]);
  const [faculties, setFaculties] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [potentialHeads, setPotentialHeads] = useState([]);

  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setErrorMessage(message);
      setIsErrorModalOpen(true);
    } else {
      setSuccessMessage(message);
      setIsSuccessModalOpen(true);
    }
  };

  const fetchDepartments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get('/departments');
      setDepartments(data || []);
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFaculties = useCallback(async () => {
    try {
      const data = await apiClient.get('/faculties');
      setFaculties(data || []);
    } catch (err) {
      showMessage(err.message, "error");
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
    fetchFaculties();
    apiClient.get('/users?roleType=nonStudent').then(setPotentialHeads).catch(console.error);
  }, [fetchDepartments, fetchFaculties]);

  const handleSaveDepartment = async (formData) => {
    setIsLoading(true);
    const isEditing = !!editingDepartment;

    try {
      if (isEditing) {
        await apiClient.put(`/departments/${editingDepartment.id}`, formData);
      } else {
        await apiClient.post('/departments', formData);
      }
      
      showMessage(
        `Department ${isEditing ? "updated" : "created"} successfully!`
      );
      await fetchDepartments();
      handleCloseModal();
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
      await apiClient.delete(`/departments/${itemToDelete.id}`);
      showMessage("Department deleted successfully!");
      setDepartments((prevDepts) =>
        prevDepts.filter((d) => d.id !== itemToDelete.id)
      );
    } catch (err) {
      showMessage(err.message, "error");
    } finally {
      setIsLoading(false);
      setItemToDelete(null);
    }
  };

  const handleAddClick = () => {
    setEditingDepartment(null);
    setIsModalOpen(true);
  };

  const handleEditClick = (department) => {
    setEditingDepartment(department);
    setIsModalOpen(true);
  };

  const handleDeleteRequest = (department) => {
    setItemToDelete(department);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingDepartment(null);
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
            Departmental Matrix
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Oversee academic units, manage faculty associations, and track course distributions.
          </p>
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:from-blue-700 hover:to-indigo-700 shadow-lg shadow-blue-200 transition-all active:scale-95 whitespace-nowrap"
        >
          <Plus size={14} />
          Add Department
        </button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <DepartmentsTable
          departments={departments}
          onAddDepartmentClick={handleAddClick}
          onEditClick={handleEditClick}
          onDeleteClick={handleDeleteRequest}
          isLoading={isLoading}
        />
      </motion.div>

      {isModalOpen && (
        <DepartmentModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveDepartment}
          departmentToEdit={editingDepartment}
          isLoading={isLoading}
          faculties={faculties}
          heads={potentialHeads}
        />
      )}

      <ConfirmationDialog
        isOpen={!!itemToDelete}
        onCancel={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Department"
        message={`Are you sure you want to delete the "${itemToDelete?.name}" department? This action cannot be undone.`}
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