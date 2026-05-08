"use client";
import React from "react";
import { createPortal } from "react-dom";
import CertificateForm from "./CertificateForm";
import { motion, AnimatePresence } from "framer-motion";

const CertificateModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingCertificate,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
      {/* ── Backdrop ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
      />

      {/* ── Modal Container ── */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
        className="relative bg-white rounded-[2rem] shadow-2xl w-full max-w-xl max-h-[90vh] overflow-hidden flex flex-col border border-slate-200/50"
      >
        {/* Header Ribbon */}
        <div className="absolute top-0 inset-x-0 h-2 bg-gradient-to-r from-indigo-600 to-blue-500" />
        
        <div className="px-8 pt-8 pb-4 border-b border-slate-100 flex justify-between items-center bg-white">
          <div>
            <h2 id="add-certificate-modal-title" className="text-xl font-black text-slate-800 tracking-tight">
              {editingCertificate ? "Edit Credential Record" : "Issue New Credential"}
            </h2>
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
              System Registry Entry
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors shrink-0"
            aria-label="Close modal"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth="3"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto custom-scrollbar flex-1 bg-slate-50/50">
          <CertificateForm
            initialData={editingCertificate || {}}
            onSubmit={onSubmit}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </div>
      </motion.div>
    </div>
  );

  return createPortal(
    <AnimatePresence>
      {isOpen && modalContent}
    </AnimatePresence>, 
    document.body
  );
};

export default CertificateModal;
