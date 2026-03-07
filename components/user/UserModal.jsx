"use client";

import React, { useState, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, X, User, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";

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
  facultyId: "",
  departmentId: "",
  academicYear: 1,
  semester: 1,
  generation: "",
  batchId: "",
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
  const [faculties, setFaculties] = useState([]);

  const isEditMode = !!userToEdit;
  const isStudent = formData.role === "STUDENT";

  // Load faculties once on mount
  useEffect(() => {
    setMounted(true);
    apiClient.get("/faculties").then(setFaculties).catch(() => { });
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (userToEdit) {
        // Find the faculty from the department already assigned
        const existingDept = departments.find(d => d.id === userToEdit.departmentId);
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
          facultyId: existingDept?.facultyId || "",
          departmentId: userToEdit.departmentId || "",
          academicYear: userToEdit.profile?.academicYear || 1,
          semester: userToEdit.profile?.semester || 1,
          generation: userToEdit.profile?.generation || "",
          batchId: userToEdit.profile?.batchId || "",
        });
      } else {
        setFormData({ ...initialFormState, role: roles?.[0] || "" });
      }
      setErrors({});
    }
  }, [isOpen, userToEdit, roles, departments]);

  // Filter departments by selected faculty
  const filteredDepartments = useMemo(() => {
    if (!formData.facultyId) return departments;
    return departments.filter(d => d.facultyId === formData.facultyId);
  }, [departments, formData.facultyId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if ((name === "firstName" || name === "lastName") && /\d/.test(value)) return;

    // Reset department when faculty changes
    if (name === "facultyId") {
      setFormData(prev => ({ ...prev, facultyId: value, departmentId: "" }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
    else if (/\d/.test(formData.firstName)) newErrors.firstName = "First name cannot contain numbers";
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required";
    else if (/\d/.test(formData.lastName)) newErrors.lastName = "Last name cannot contain numbers";
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "A valid email is required";
    if (!formData.role) newErrors.role = "Role is required";
    if (!isEditMode && (!formData.password || formData.password.length < 6))
      newErrors.password = "Password must be at least 6 characters.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      const dataToSend = { ...formData };
      if (isEditMode && !dataToSend.password) delete dataToSend.password;
      if (typeof dataToSend.specialization === "string") {
        dataToSend.specialization = dataToSend.specialization
          .split(",").map(s => s.trim()).filter(s => s !== "");
      }
      // Don't send facultyId to backend — only departmentId is needed
      delete dataToSend.facultyId;
      onSave(dataToSend);
    }
  };

  if (!isOpen || !mounted) return null;

  const inputClass = (field) =>
    `w-full px-3 py-2 bg-white border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${errors[field] ? "border-red-400" : "border-slate-200 focus:border-blue-500"
    }`;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-5 border-b bg-gradient-to-r from-slate-50 to-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  {isStudent ? <GraduationCap className="w-5 h-5 text-blue-600" /> : <User className="w-5 h-5 text-blue-600" />}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">
                    {isEditMode ? "Edit Student Profile" : isStudent ? "Enroll New Student" : "New Personnel Enrollment"}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {isStudent ? "Fill in identity, faculty, department, and academic placement" : "Initialize a new system account"}
                  </p>
                </div>
              </div>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex flex-col overflow-hidden">
              <div className="p-6 space-y-5 overflow-y-auto">

                {/* ── Section 1: Core Identity ── */}
                <div className="bg-slate-50/60 p-4 rounded-xl border border-slate-100 space-y-4">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Core Identity</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">First Name</label>
                      <input name="firstName" placeholder="e.g. John" value={formData.firstName}
                        onChange={handleChange} className={inputClass("firstName")} />
                      {errors.firstName && <p className="text-[10px] text-red-500">{errors.firstName}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Last Name</label>
                      <input name="lastName" placeholder="e.g. Doe" value={formData.lastName}
                        onChange={handleChange} className={inputClass("lastName")} />
                      {errors.lastName && <p className="text-[10px] text-red-500">{errors.lastName}</p>}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Email Address</label>
                      <input name="email" placeholder="e.g. john@university.edu" value={formData.email}
                        onChange={handleChange} className={inputClass("email")} />
                      {errors.email && <p className="text-[10px] text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Account Role</label>
                      <select name="role" value={formData.role} onChange={handleChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                        {(roles || [])
                          .filter(r => r !== "ADMIN" || (isEditMode && userToEdit?.role === "ADMIN"))
                          .map(r => <option key={r} value={r}>{r}</option>)}
                      </select>
                    </div>
                  </div>

                  {!isEditMode && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700">Password</label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password" placeholder="Min. 6 characters"
                          value={formData.password} onChange={handleChange}
                          className={inputClass("password")}
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-2.5 text-slate-400">
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                      {errors.password && <p className="text-[10px] text-red-500">{errors.password}</p>}
                    </div>
                  )}
                </div>

                {/* ── Section 2: Faculty & Department (Students only) ── */}
                {isStudent && (
                  <div className="bg-blue-50/40 p-4 rounded-xl border border-blue-100/60 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-1 w-4 bg-blue-500 rounded-full" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-500">Faculty & Department</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Faculty</label>
                        <select name="facultyId" value={formData.facultyId} onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                          <option value="">— Select Faculty —</option>
                          {faculties.map(f => (
                            <option key={f.id} value={f.id}>{f.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Department</label>
                        <select name="departmentId" value={formData.departmentId} onChange={handleChange}
                          disabled={!formData.facultyId}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed">
                          <option value="">— Select Department —</option>
                          {filteredDepartments.map(d => (
                            <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                        </select>
                        {!formData.facultyId && (
                          <p className="text-[10px] text-slate-400 italic">Select a faculty first</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Section 3: Academic Placement (Students only) ── */}
                {isStudent && (
                  <div className="bg-indigo-50/40 p-4 rounded-xl border border-indigo-100/60 space-y-4">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="h-1 w-4 bg-indigo-500 rounded-full" />
                      <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Academic Placement</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Academic Year</label>
                        <select name="academicYear" value={formData.academicYear}
                          onChange={(e) => setFormData(prev => ({ ...prev, academicYear: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                          <option value={1}>Year 1 — Freshman</option>
                          <option value={2}>Year 2 — Sophomore</option>
                          <option value={3}>Year 3 — Junior</option>
                          <option value={4}>Year 4 — Senior</option>
                          <option value={5}>Year 5 — Graduating</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Semester</label>
                        <select name="semester" value={formData.semester}
                          onChange={(e) => setFormData(prev => ({ ...prev, semester: parseInt(e.target.value) }))}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                          <option value={1}>Semester 1</option>
                          <option value={2}>Semester 2</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-semibold text-slate-700">Batch / Generation</label>
                          {formData.departmentId && (departments.find(d => d.id === formData.departmentId)?.batches?.length > 0) && (
                            <button
                              type="button"
                              onClick={() => {
                                // Toggle logic: if we have a select but want to type, or vice versa
                                // Using a state like 'isManual' would be cleaner, but let's try a simpler approach
                                // We'll just check if the current value is in the department list
                              }}
                              className="hidden" // We'll use a better approach below
                            />
                          )}
                        </div>

                        {formData.departmentId ? (
                          <>
                            {(() => {
                              const deptBatches = (departments.find(d => d.id === formData.departmentId)?.batches || []);
                              const hasBatches = deptBatches.length > 0;

                              if (hasBatches) {
                                return (
                                  <div className="space-y-2">
                                    <select
                                      name="batchId"
                                      value={formData.batchId}
                                      onChange={(e) => {
                                        const bId = e.target.value;
                                        const selected = deptBatches.find(b => b.id === bId);
                                        setFormData(prev => ({
                                          ...prev,
                                          batchId: bId,
                                          generation: selected ? selected.name : (bId === "CUSTOM_ENTRY" ? prev.generation : "")
                                        }));
                                      }}
                                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                                    >
                                      <option value="">— Select Batch —</option>
                                      {deptBatches.map(batch => (
                                        <option key={batch.id} value={batch.id}>{batch.name} ({batch.status})</option>
                                      ))}
                                      <option value="CUSTOM_ENTRY">+ Enter Manually...</option>
                                    </select>

                                    {/* Show manual input if choice is CUSTOM_ENTRY or if manually set */}
                                    {formData.batchId === "CUSTOM_ENTRY" && (
                                      <input
                                        type="text"
                                        placeholder="Type generation (e.g. G1)"
                                        value={formData.generation}
                                        autoFocus
                                        onChange={(e) => setFormData(prev => ({ ...prev, generation: e.target.value }))}
                                        className="w-full px-3 py-2 bg-white border border-blue-400 rounded-xl text-sm focus:outline-none ring-2 ring-blue-500/10"
                                      />
                                    )}
                                  </div>
                                );
                              } else {
                                // No generations defined for this dept, allow direct typing
                                return (
                                  <input
                                    name="generation"
                                    placeholder="Type generation (e.g. G1)"
                                    value={formData.generation}
                                    onChange={handleChange}
                                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500"
                                  />
                                );
                              }
                            })()}
                          </>
                        ) : (
                          <input
                            name="generation"
                            placeholder="Select department first"
                            value={formData.generation}
                            disabled
                            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm opacity-50 cursor-not-allowed"
                          />
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Academic Status</label>
                        <select name="academicStatus" value={formData.academicStatus} onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                          <option value="ACTIVE">Active</option>
                          <option value="ON_LEAVE">On Leave</option>
                          <option value="GRADUATED">Graduated</option>
                          <option value="WITHDRAWN">Withdrawn</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Gender</label>
                        <select name="gender" value={formData.gender} onChange={handleChange}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-500">
                          <option value="">— Select Gender —</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Footer */}
              <div className="p-5 bg-slate-50 border-t flex justify-end items-center gap-3 shrink-0">
                <button type="button" onClick={onClose}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-all">
                  Cancel
                </button>
                <button type="submit" disabled={isLoading}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-200 hover:-translate-y-0.5 transition-all disabled:opacity-70">
                  {isLoading ? "Saving..." : isEditMode ? "Save Changes" : isStudent ? "Enroll Student" : "Register User"}
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
