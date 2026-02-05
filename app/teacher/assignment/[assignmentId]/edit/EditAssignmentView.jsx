"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import { apiClient } from "@/lib/api";

export default function EditAssignmentView({ assignment, loggedInUser }) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: assignment.title || "",
    description: assignment.description || "" ,
    dueDate: assignment.dueDate ? new Date(assignment.dueDate).toISOString().split('T')[0] : "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Consolidated error state for field validation (inline) and modal for API errors
  const [fieldError, setFieldError] = useState("");

  // Confirmation States
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

  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSuccessMessage("");
    router.push("/teacher/assignment");
  };

  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
    setErrorMessage("");
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFieldError("Assignment title is required.");
      return;
    }
    setFieldError("");

    setIsLoading(true);
    try {
      await apiClient.put(`/teacher/assignments/${assignment.id}`, formData);
      showMessage("Assignment updated successfully!", "success");
    } catch (err) {
      showMessage(err.response?.data?.error || err.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Edit Assignment</h1>
      <div className="bg-white rounded-xl shadow-2xl w-full">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="e.g., Chapter 5 Review"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full px-3 py-2 border rounded-md"
                placeholder="Instructions for the students..."
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            {fieldError && <p className="text-xs text-red-500 mt-1">{fieldError}</p>}
          </div>
          <div className="p-6 bg-slate-50 border-t flex justify-end gap-4">
            <button
              type="button"
              onClick={() => router.push("/teacher/assignment")}
              disabled={isLoading}
              className="px-4 py-2 bg-white border rounded-md text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

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
