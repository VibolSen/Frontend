"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, X, User, Mail, Lock, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const initialFormState = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  role: "", 
  gender: "",
  academicStatus: "ACTIVE",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
  specialization: "",
  maxWorkload: "",
  departmentId: "",
};

export default function UserModal({
  isOpen,
  onClose,
  onSave,
  userToEdit,
  roles,
  departments = [],
  isLoading = false,
}) {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [mounted, setMounted] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [showDetailed, setShowDetailed] = useState(false);

  const isEditMode = !!userToEdit;

  useEffect(() => {
    setMounted(true); 
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        setFormData({
          firstName: userToEdit.firstName || "",
          lastName: userToEdit.lastName || "",
          email: userToEdit.email || "",
          role: userToEdit.role || roles?.[0] || "",
          password: "",
          gender: userToEdit.profile?.gender || "",
          academicStatus: userToEdit.profile?.academicStatus || "ACTIVE",
          emergencyContactName: userToEdit.profile?.emergencyContactName || "",
          emergencyContactPhone: userToEdit.profile?.emergencyContactPhone || "",
          emergencyContactRelation: userToEdit.profile?.emergencyContactRelation || "",
          specialization: userToEdit.profile?.specialization?.join(", ") || "",
          maxWorkload: userToEdit.profile?.maxWorkload || "",
          departmentId: userToEdit.departmentId || "",
        });
      } else {
        setFormData({
          ...initialFormState,
          role: roles?.[0] || "",
        });
      }
      setErrors({});
      setShowDetailed(false);
    }
  }, [isOpen, userToEdit, roles]);

   const handleChange = (e) => {
     const { name, value } = e.target;
     
     // Prevent numbers in first/last name fields
     if ((name === "firstName" || name === "lastName") && /\d/.test(value)) {
       return; 
     }

     setFormData((prev) => ({ ...prev, [name]: value }));
     if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
   };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    } else if (/\d/.test(formData.firstName)) {
      newErrors.firstName = "First name cannot contain numbers";
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    } else if (/\d/.test(formData.lastName)) {
      newErrors.lastName = "Last name cannot contain numbers";
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "A valid email is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!isEditMode && (!formData.password || formData.password.length < 6)) {
      newErrors.password = "Password must be at least 6 characters.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSend = { ...formData };
      if (isEditMode && !dataToSend.password) {
        delete dataToSend.password; 
      }
      
      // Convert specialization string to array
      if (typeof dataToSend.specialization === 'string') {
        dataToSend.specialization = dataToSend.specialization
          .split(',')
          .map(s => s.trim())
          .filter(s => s !== "");
      }
      
      onSave(dataToSend);
    }
  };

  if (!isOpen || !mounted) return null; 

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
          >
            <div className="p-5 border-b bg-gradient-to-r from-slate-50 to-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 id="add-user-modal-title" className="text-lg font-bold text-slate-800">
                      {isEditMode ? "Account Configuration" : "New Personnel Enrollment"}
                    </h2>
                    <p className="text-xs text-slate-500">
                      {isEditMode ? "Modify existing credentials and profile data" : "Initialize a new system account"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto">
                <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Core Identity</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-1">First Name</label>
                      <input
                        name="firstName"
                        placeholder="e.g. John"
                        value={formData.firstName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-white border rounded-xl text-sm transition-all ${errors.firstName ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-1">Last Name</label>
                      <input
                        name="lastName"
                        placeholder="e.g. Doe"
                        value={formData.lastName}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-white border rounded-xl text-sm transition-all ${errors.lastName ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-1">Email Address</label>
                      <input
                        name="email"
                        placeholder="e.g. john.doe@school.com"
                        value={formData.email}
                        onChange={handleChange}
                        className={`w-full px-3 py-2 bg-white border rounded-xl text-sm transition-all ${errors.email ? 'border-red-500' : 'border-slate-200 focus:border-blue-500'}`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-1">Account Role</label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                      >
                        {(roles || [])
                          .filter(r => r !== "ADMIN" || (isEditMode && userToEdit?.role === "ADMIN"))
                          .map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  {!isEditMode && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 ml-1">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-2.5 text-slate-400">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-5 bg-slate-50 border-t flex justify-end items-center gap-3">
                <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-all">Cancel</button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all disabled:opacity-70"
                >
                  {isLoading ? "Synchronizing..." : isEditMode ? "Commit Changes" : "Register User"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
