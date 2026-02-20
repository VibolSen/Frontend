"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CertificateModal from '@/components/certificate-management/CertificateModal';
import BulkCertificateModal from '@/components/certificate-management/BulkCertificateModal';
import CertificateTable from '@/components/certificate-management/CertificateTable';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { apiClient } from '@/lib/api';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

const CertificateManagementPage = () => {
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
      const data = await apiClient.get('/certificates');
      setCertificates(data || []);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      showMessage(`Failed to fetch certificates: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };
    
  const fetchCourses = async () => {
    setIsLoading(true);
    try {
      const data = await apiClient.get('/courses');
      setCourses(data || []);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      showMessage(`Failed to fetch courses: ${error.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };
    
  const getCourseName = (courseId) => {
    const course = courses.find((c) => c.id === courseId);
    return course ? course.name : 'Unknown Course';
  };

  const handleBulkIssue = () => {
    setShowBulkModal(true);
  };
    
  const handleEditCertificate = (certificate) => {
    setEditingCertificate({
      ...certificate,
      course: certificate.course.id,
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
      showMessage('Certificate deleted successfully!', 'success');
    } catch (error) {
      console.error("Failed to delete certificate:", error);
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
 
  const handleCloseSuccessModal = () => {
    setIsSuccessModalOpen(false);
    setSuccessMessage("");
  };
    
  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
    setErrorMessage("");
  };
    
  const handleSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const method = editingCertificate ? 'put' : 'post';
      const url = '/certificates';
    
      const payload = {
        recipient: formData.recipient,
        courseId: formData.course,
        issueDate: formData.issueDate,
        expiryDate: formData.expiryDate,
        studentId: formData.studentId,
      };
    
      if (editingCertificate) {
        payload.id = editingCertificate.id;
      }
    
      await apiClient[method](url, payload);
    
      setShowForm(false);
      setEditingCertificate(null);
      fetchCertificates();
      showMessage(`Certificate ${editingCertificate ? 'updated' : 'added'} successfully!`, 'success');
    } catch (error) {
      console.error("Failed to save certificate:", error);
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
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (sortField === "course") {
      const aCourseName = getCourseName(a.course.id);
      const bCourseName = getCourseName(b.course.id);
      if (aCourseName < bCourseName) return sortOrder === "asc" ? -1 : 1;
      if (aCourseName > bCourseName) return sortOrder === "asc" ? 1 : -1;
      return 0;
    }
    
    if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
    if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });
    
  const filteredCertificates = sortedCertificates.filter((certificate) => {
    const matchesSearch = certificate.recipient.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           getCourseName(certificate.course.id).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilterCourse = filterCourse === "" || certificate.course.id === filterCourse;
    return matchesSearch && matchesFilterCourse;
  });
    
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-0.5">
          <h1 className="text-2xl md:text-3xl font-black text-blue-600 tracking-tight">
            Institutional Certificates
          </h1>
          <p className="text-slate-500 font-medium text-sm">
            Issue academic credentials, manage student certifications, and oversee professional qualifications.
          </p>
        </div>
      </div>

      <CertificateModal
        isOpen={showForm}
        onClose={handleCancel}
        onSubmit={handleSubmit}
        editingCertificate={editingCertificate}
        isLoading={isLoading}
      />

      <BulkCertificateModal
        isOpen={showBulkModal}
        onClose={() => setShowBulkModal(false)}
        onCertificatesIssued={fetchCertificates}
        showMessage={showMessage}
      />

      <CertificateTable
        certificates={filteredCertificates}
        getCourseName={getCourseName}
        handleEditCertificate={handleEditCertificate}
        handleDeleteCertificate={handleDeleteClick}
        sortField={sortField}
        sortOrder={sortOrder}
        handleSort={handleSort}
        onBulkIssueClick={handleBulkIssue}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterCourse={filterCourse}
        setFilterCourse={setFilterCourse}
        courses={courses}
        isLoading={isLoading}
        // Special prop to ensure links use the correct role path
        basePath="/study-office/certificate-management"
      />
      
      <ConfirmationDialog
        isOpen={isConfirmModalOpen}
        title="Confirm Deletion"
        message={`Are you sure you want to delete the certificate for ${certificateToDelete?.recipient}? This cannot be undone.`}
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
};
          
export default CertificateManagementPage;