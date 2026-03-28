"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CertificateModal from '@/components/certificate-management/CertificateModal';
import BulkCertificateModal from '@/components/certificate-management/BulkCertificateModal';
import CertificateTable from '@/components/certificate-management/CertificateTable';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { apiClient } from '@/lib/api';
import { Award, BookOpen, Activity, Play } from 'lucide-react';
import { motion } from 'framer-motion';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'; // Import dialog components

const CertificateManagementPage = () => {
  const [showForm, setShowForm] = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [certificates, setCertificates] = useState([]);
  const [editingCertificate, setEditingCertificate] = useState(null);
  const [courses, setCourses] = useState([]); // To map course IDs to names
  const [isLoading, setIsLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [certificateToDelete, setCertificateToDelete] = useState(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState(""); // New state for search term
  const [sortField, setSortField] = useState("recipient"); // Default sort field
  const [sortOrder, setSortOrder] = useState("asc"); // 'asc' or 'desc'
  const [filterCourse, setFilterCourse] = useState(""); // New state for course filter

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
          fetchCertificates(); // Refresh the list
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
            courseId: formData.course, // Map 'course' from form to 'courseId' for API
            issueDate: formData.issueDate,
            expiryDate: formData.expiryDate,
            studentId: formData.studentId, // Pass studentId to API
          };
    
          if (editingCertificate) {
            payload.id = editingCertificate.id;
          }
    
          await apiClient[method](url, payload);
    
          setShowForm(false);
          setEditingCertificate(null);
          fetchCertificates(); // Refresh the list
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
      <div className="space-y-6 max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Dynamic Header Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 bg-gradient-to-br from-indigo-600 to-blue-700 p-8 md:p-10 rounded-[2rem] shadow-2xl border border-white/20 relative overflow-hidden"
        >
          {/* Decorative Backgrounds */}
          <div className="absolute top-0 right-0 -mt-16 -mr-16 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-16 -ml-16 w-48 h-48 bg-indigo-400 opacity-20 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-4 relative z-10">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 shadow-2xl hover:-translate-y-1 transition-transform duration-300">
                <Award className="w-8 h-8 md:w-10 md:h-10 text-white" strokeWidth={1.5} />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight drop-shadow-sm">
                Certificates
              </h1>
            </div>
            <p className="text-blue-100 font-medium text-sm md:text-lg max-w-xl leading-relaxed">
              Dynamically oversee academic credentials and professional qualifications across the institution.
            </p>
          </div>

          <div className="flex items-center gap-4 relative z-10 w-full lg:w-auto">
             <motion.div 
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-md px-6 py-5 rounded-2xl border border-white/20 flex-1 lg:flex-none shadow-2xl transition-all"
             >
                <div className="flex items-center gap-2 mb-2">
                   <Activity className="w-4 h-4 text-blue-200" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Total Issued</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight">{certificates.length}</p>
                </div>
             </motion.div>
             <motion.div 
                whileHover={{ y: -4 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white/10 backdrop-blur-md px-6 py-5 rounded-2xl border border-white/20 flex-1 lg:flex-none shadow-2xl transition-all"
             >
                <div className="flex items-center gap-2 mb-2">
                   <BookOpen className="w-4 h-4 text-blue-200" />
                   <p className="text-[10px] font-black uppercase tracking-widest text-blue-200">Programs</p>
                </div>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl md:text-5xl font-black text-white tabular-nums tracking-tight">{courses.length}</p>
                </div>
             </motion.div>
          </div>
        </motion.div>

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
              handleDeleteCertificate={handleDeleteClick} // Use handleDeleteClick for confirmation
              sortField={sortField}
              sortOrder={sortOrder}
              handleSort={handleSort}

              onBulkIssueClick={handleBulkIssue}
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              filterCourse={filterCourse}
              setFilterCourse={setFilterCourse}
              courses={courses}
              isLoading={isLoading} // Pass isLoading to the table
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