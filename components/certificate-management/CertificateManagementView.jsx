"use client";
import React, { useState, useEffect } from "react";
import CertificateModal from "@/components/certificate-management/CertificateModal";
import BulkCertificateModal from "@/components/certificate-management/BulkCertificateModal";
import CertificateTable from "@/components/certificate-management/CertificateTable";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import BulkActionsBar from "@/components/ui/BulkActionsBar";
import { apiClient } from "@/lib/api";
import {
  Award,
  BookOpen,
  Activity,
  Plus,
  Users,
  Search,
  Filter,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/**
 * Shared Certificate Management UI used by Admin and Study Office.
 * Adheres to the Premium Design Specification.
 */
export default function CertificateManagementView({
  canDelete = false,
  canBulkIssue = false,
  canCreate = false,
  role = "study-office",
}) {
  const [showForm, setShowForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [courses, setCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("recipient");
  const [sortOrder, setSortOrder] = useState("asc");
  const [filterCourse, setFilterCourse] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [isBulkDeleteConfirmOpen, setIsBulkDeleteConfirmOpen] = useState(false);

  const showMessage = (message, type = "success") => {
    if (type === "error") {
      setErrorMessage(message);
      setIsErrorModalOpen(true);
    } else {
      setSuccessMessage(message);
      setIsSuccessModalOpen(true);
    }
  };

  useEffect(() => {
    fetchCertificates();
    fetchCourses();
  }, []);

  const fetchCertificates = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get("/certificates");
      setCertificates(data || []);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      showMessage(`Failed to fetch certificates: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCourses = async () => {
    try {
      const data = await apiClient.get("/courses");
      setCourses(data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
    }
  };

  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.name : "Unknown Course";
  };

  const handleBulkIssue = () => setShowBulkModal(true);

  const handleBulkDeleteClick = () => {
    setIsBulkDeleteConfirmOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    setIsLoading(true);
    try {
      await apiClient.post("/certificates/bulk-delete", { ids: selectedIds });
      setSelectedIds([]);
      fetchCertificates();
      showMessage(`${selectedIds.length} certificates deleted successfully!`, "success");
    } catch (error) {
      showMessage(`Failed to delete certificates: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
      setIsBulkDeleteConfirmOpen(false);
    }
  };

  const handleEditCertificate = (certificate) => {
    setEditingCertificate({
      ...certificate,
      course: certificate.course?.id || certificate.courseId,
    });
    setShowForm(true);
  };

  const handleDeleteClick = (certificate) => {
    setCertificateToDelete(certificate);
    setIsConfirmModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!certificateToDelete) return;
    setIsLoading(true);
    try {
      await apiClient.delete(`/certificates/${certificateToDelete.id}`);
      fetchCertificates();
      showMessage("Certificate deleted successfully!", "success");
    } catch (error) {
      showMessage(`Failed to delete certificate: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
      setIsConfirmModalOpen(false);
      setCertificateToDelete(null);
    }
  };

  const handleCancelDelete = () => {
    setIsConfirmModalOpen(false);
    setCertificateToDelete(null);
  };

  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const method = editingCertificate ? "put" : "post";
      const payload = {
        recipient: formData.recipient,
        courseId: formData.course,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        studentId: formData.studentId,
      };
      if (editingCertificate) payload.id = editingCertificate.id;

      await apiClient[method]("/certificates", payload);
      setShowForm(false);
      setEditingCertificate(null);
      fetchCertificates();
      showMessage(
        `Certificate ${editingCertificate ? "updated" : "added"} successfully!`,
        "success"
      );
    } catch (error) {
      showMessage(`Failed to save certificate: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingCertificate(null);
  };

  const handleSort = (field) => {
    const isAsc = sortField === field && sortOrder === "asc";
    setSortOrder(isAsc ? "desc" : "asc");
    setSortField(field);
  };

  const sortedCertificates = [...certificates].sort((a, b) => {
    if (sortField === "course") {
      const aName = getCourseName(a.course?.id || a.courseId);
      const bName = getCourseName(b.course?.id || b.courseId);
      if (aName < bName) return sortOrder === "asc" ? -1 : 1;
      if (aName > bName) return sortOrder === "asc" ? 1 : -1;
      return 0;
    }
    const aVal = a[sortField] || "";
    const bVal = b[sortField] || "";
    if (aVal < bVal) return sortOrder === "asc" ? -1 : 1;
    if (aVal > bVal) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

  const filteredCertificates = sortedCertificates.filter((cert) => {
    const matchesSearch =
      cert.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getCourseName(cert.course?.id || cert.courseId)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    const matchesFilterCourse =
      filterCourse === "" ||
      (cert.course?.id || cert.courseId) === filterCourse;
    return matchesSearch && matchesFilterCourse;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* ── Bulk Actions Bar ── */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
        onDelete={handleBulkDeleteClick}
        label="Certificates"
        showDelete={canDelete}
      />

      {/* ── Header & Primary Actions ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-blue-700 tracking-tight flex items-center gap-2">
            <Award className="text-blue-600" size={28} strokeWidth={2.5} />
            Certificate Management
          </h1>
          <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
            Institutional Credential Registry
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {canBulkIssue && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleBulkIssue}
              className="flex items-center gap-2 px-4 py-2 bg-white text-indigo-600 border border-indigo-200 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm hover:shadow-md hover:border-indigo-300 hover:bg-indigo-50 transition-all"
            >
              <Users size={14} />
              Bulk Issue
            </motion.button>
          )}
          {canCreate && (
            <motion.button
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 transition-all"
            >
              <Plus size={16} strokeWidth={3} />
              Issue New Credential
            </motion.button>
          )}
        </div>
      </div>

      {/* ── KPI Horizontal Grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
           whileHover={{ y: -3 }}
           className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-blue-600 transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <Activity className="text-slate-400" size={14} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Issued</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums">
            {certificates.length}
          </p>
        </motion.div>

        <motion.div
           whileHover={{ y: -3 }}
           className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-600 transition-all"
        >
          <div className="flex items-center gap-2 mb-2">
            <BookOpen className="text-slate-400" size={14} />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Programs</p>
          </div>
          <p className="text-2xl md:text-3xl font-black text-slate-900 tabular-nums">
            {courses.length}
          </p>
        </motion.div>
      </div>

      {/* ── Filters & Search Bar ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:max-w-md group">
          <input
            type="text"
            placeholder="Search by recipient or program..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all placeholder:font-medium placeholder:text-slate-400"
          />
          <Search
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
            size={16}
          />
        </div>

        <div className="relative w-full md:w-64 group">
          <select
            value={filterCourse}
            onChange={(e) => setFilterCourse(e.target.value)}
            className="w-full pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Programs</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.name}
              </option>
            ))}
          </select>
          <Filter
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
            size={16}
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
             <div className="w-0 h-0 border-l-[4px] border-l-transparent border-t-[5px] border-t-slate-400 border-r-[4px] border-r-transparent"></div>
          </div>
        </div>
      </div>

      {/* ── Edit / Create Modal ── */}
      <AnimatePresence>
         {(showForm) && (
            <CertificateModal
               isOpen={showForm}
               onClose={handleCancel}
               onSubmit={handleSubmit}
               editingCertificate={editingCertificate}
               isLoading={isLoading}
            />
         )}
      </AnimatePresence>

      {canBulkIssue && (
        <BulkCertificateModal
          isOpen={showBulkModal}
          onClose={() => setShowBulkModal(false)}
          onCertificatesIssued={fetchCertificates}
          showMessage={showMessage}
        />
      )}

      {/* ── Certificate Data Grid ── */}
      <CertificateTable
        certificates={filteredCertificates}
        getCourseName={getCourseName}
        handleEditCertificate={handleEditCertificate}
        handleDeleteCertificate={canDelete ? handleDeleteClick : () => {}}
        canDelete={canDelete}
        sortField={sortField}
        sortOrder={sortOrder}
        handleSort={handleSort}
        isLoading={isLoading}
        role={role}
        selectedIds={selectedIds}
        onSelectionChange={setSelectedIds}
      />

      {/* ── Delete Confirmation ── */}
      {canDelete && (
        <ConfirmationDialog
          isOpen={isConfirmModalOpen}
          title="Confirm Record Purge"
          message={
            certificateToDelete
              ? `Are you sure you want to permanently delete the credential for ${certificateToDelete.recipient}? This action creates an audit log and cannot be reversed.`
              : ""
          }
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          isLoading={isLoading}
        />
      )}

      {/* ── Bulk Delete Confirmation ── */}
      <ConfirmationDialog
        isOpen={isBulkDeleteConfirmOpen}
        title="Confirm Bulk Record Purge"
        message={`Are you sure you want to permanently delete ${selectedIds.length} certificates? This action cannot be undone.`}
        onConfirm={handleConfirmBulkDelete}
        onCancel={() => setIsBulkDeleteConfirmOpen(false)}
        isLoading={isLoading}
        type="danger"
      />

      {/* ── Success / Error dialogs ── */}
      <ConfirmationDialog
        isOpen={isSuccessModalOpen}
        title="Transaction Successful"
        message={successMessage}
        onConfirm={() => {
          setIsSuccessModalOpen(false);
          setSuccessMessage("");
        }}
        onCancel={() => {
          setIsSuccessModalOpen(false);
          setSuccessMessage("");
        }}
        isLoading={isLoading}
        confirmText="Acknowledge"
        type="success"
      />
      <ConfirmationDialog
        isOpen={isErrorModalOpen}
        title="Transaction Failed"
        message={errorMessage}
        onConfirm={() => {
          setIsErrorModalOpen(false);
          setErrorMessage("");
        }}
        onCancel={() => {
          setIsErrorModalOpen(false);
          setErrorMessage("");
        }}
        isLoading={isLoading}
        confirmText="Dismiss"
        type="danger"
      />
    </div>
  );
}
