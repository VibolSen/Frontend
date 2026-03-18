"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText, Calendar, List, Info, Trash2, Plus, User, Clock, ShieldCheck } from "lucide-react";
import Select from "react-select";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

export default function InvoiceModal({ isOpen, invoice, onClose, onInvoiceSaved, showMessage }) {
  const [formData, setFormData] = useState({
    studentId: "",
    issueDate: "",
    dueDate: "",
    period: "SEMESTER",
    academicYear: "",
    semester: "",
    currency: "USD",
    items: [],
  });

  const periodOptions = [
    { value: "SEMESTER", label: "SEMESTER" },
    { value: "YEAR", label: "YEAR" },
  ];

  const yearOptions = [
    { value: 1, label: "Year 1" },
    { value: 2, label: "Year 2" },
    { value: 3, label: "Year 3" },
    { value: 4, label: "Year 4" },
  ];

  const semesterOptions = [
    { value: 1, label: "Semester 1" },
    { value: 2, label: "Semester 2" },
    { value: 3, label: "Summer" },
  ];

  const [isLoading, setIsLoading] = useState(false);
  const [students, setStudents] = useState([]);
  const [fees, setFees] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [currentInvoiceItem, setCurrentInvoiceItem] = useState({
    feeId: "",
    description: "",
    amount: "",
  });
  const [activeTab, setActiveTab] = useState("ledger"); // ledger or history
  const [auditLogs, setAuditLogs] = useState([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchFees();
  }, []);

  useEffect(() => {
    if (invoice) {
      setFormData({
        studentId: invoice.studentId,
        issueDate: new Date(invoice.issueDate).toISOString().split("T")[0],
        dueDate: new Date(invoice.dueDate).toISOString().split("T")[0],
        period: invoice.period || "SEMESTER",
        academicYear: invoice.academicYear || "",
        semester: invoice.semester || "",
        currency: invoice.currency || "USD",
        items: (invoice.items || []).map(item => ({
            feeId: item.feeId,
            description: item.description,
            amount: item.amount,
        })),
      });
      setSelectedStudent({
        value: invoice.studentId,
        label: `${invoice.student.firstName} ${invoice.student.lastName} (${invoice.student.email})`,
      });
      fetchAuditLogs(invoice.id);
    } else {
      setFormData({
        studentId: "",
        issueDate: new Date().toISOString().split("T")[0],
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0],
        period: "SEMESTER",
        academicYear: "",
        semester: "",
        currency: "USD",
        items: [],
      });
      setSelectedStudent(null);
      setAuditLogs([]);
    }
  }, [invoice]);

  const fetchAuditLogs = async (id) => {
    setIsLogsLoading(true);
    try {
        const data = await apiClient.get(`/financial/invoices/${id}/logs`);
        setAuditLogs(data || []);
    } catch (err) {
        console.error("Failed to fetch logs:", err);
    } finally {
        setIsLogsLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const data = await apiClient.get("/users?role=STUDENT");
      setStudents(data || []);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  const fetchFees = async () => {
    try {
      const data = await apiClient.get("/financial/fees");
      setFees(data || []);
    } catch (error) {
      console.error("Error fetching fees:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStudentSelectChange = (selectedOption) => {
    setSelectedStudent(selectedOption);
    setFormData((prev) => ({ ...prev, studentId: selectedOption ? selectedOption.value : "" }));
  };

  const handleItemInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentInvoiceItem((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemFeeSelect = (selectedOption) => {
    const selectedFee = fees.find(f => f.id === selectedOption.value);
    setCurrentInvoiceItem((prev) => ({
      ...prev,
      feeId: selectedOption.value,
      description: selectedFee ? selectedFee.name.toUpperCase() : '',
      amount: selectedFee ? selectedFee.amount.toString() : '',
    }));
  };

  const handleAddItem = () => {
    if (currentInvoiceItem.feeId && currentInvoiceItem.description && currentInvoiceItem.amount) {
      setFormData((prev) => ({
        ...prev,
        items: [
          ...prev.items,
          {
            feeId: currentInvoiceItem.feeId,
            description: currentInvoiceItem.description,
            amount: parseFloat(currentInvoiceItem.amount),
          },
        ],
      }));
      setCurrentInvoiceItem({ feeId: "", description: "", amount: "" });
    }
  };

  const handleRemoveItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (invoice) {
        await apiClient.put(`/financial/invoices/${invoice.id}`, formData);
      } else {
        await apiClient.post("/financial/invoices", formData);
      }
      showMessage(`Invoice ${invoice ? "updated" : "created"} successfully!`, "success");
      onInvoiceSaved();
      onClose();
    } catch (error) {
       showMessage(error.message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = formData.items.reduce((acc, item) => acc + item.amount, 0);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const selectStyles = {
    control: (base, state) => ({
      ...base,
      backgroundColor: 'rgb(248, 250, 252)',
      borderColor: state.isFocused ? '#2563eb' : 'rgb(226, 232, 240)',
      borderRadius: '0.75rem',
      padding: '0px',
      fontSize: '0.75rem',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(37, 99, 235, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#2563eb' : '#bfdbfe',
      }
    }),
    placeholder: (base) => ({ ...base, color: '#94a3b8' }),
    menu: (base) => ({
      ...base,
      backgroundColor: 'white',
      borderRadius: '0.75rem',
      overflow: 'hidden',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
      border: '1px solid #f1f5f9',
      zIndex: 100
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#eff6ff' : 'transparent',
      color: state.isFocused ? '#2563eb' : '#475569',
      cursor: 'pointer',
      fontSize: '0.75rem'
    })
  };

  const modalContent = (
    <AnimatePresence>
      {(isOpen || invoice) && (
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
            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden flex flex-col border border-white/20"
          >
            {/* Header Area */}
            <div className="p-5 border-b bg-gradient-to-r from-slate-50 to-white">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-800">
                      {invoice ? "Edit Invoice" : "New Invoice"}
                    </h2>
                    <p className="text-xs text-slate-500">Configure institutional billing details</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-all duration-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Bar */}
              {invoice && (
                <div className="flex items-center gap-1 mt-4 p-1 bg-slate-100 w-fit rounded-xl border border-slate-100">
                  <button
                    type="button"
                    onClick={() => setActiveTab("ledger")}
                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      activeTab === "ledger" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Composition
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${
                      activeTab === "history" ? "bg-white text-blue-600 shadow-sm" : "text-slate-400 hover:text-slate-600"
                    }`}
                  >
                    Audit Trail
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} noValidate className="flex-1 flex flex-col min-h-0 overflow-hidden text-left">
              <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar bg-white">
                {activeTab === "ledger" ? (
                  <>
                    {/* Recipient Information Profile */}
                    <div className="p-6 bg-slate-50/50 rounded-2xl border border-slate-100 space-y-5">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="w-4 h-4 text-slate-400" />
                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                          Recipient Selection
                        </h3>
                      </div>

                      <div className="space-y-1.5 px-1">
                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                          Student Account
                        </label>
                        <Select
                          options={students.map((s) => ({
                            value: s.id,
                            label: `${s.firstName.toUpperCase()} ${s.lastName.toUpperCase()} (ID: ${s.id
                              .substring(0, 8)
                              .toUpperCase()})`,
                          }))}
                          value={selectedStudent}
                          onChange={handleStudentSelectChange}
                          styles={selectStyles}
                          placeholder="SEARCH STUDENT DATABASE..."
                          required
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4 px-1">
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">
                            Issue Date
                          </label>
                          <div className="relative group">
                            <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-500" />
                            <input
                              type="date"
                              name="issueDate"
                              value={formData.issueDate}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500"
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[8px] font-black text-rose-400 uppercase tracking-widest ml-1">
                            Due Date
                          </label>
                          <div className="relative group">
                            <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-rose-400" />
                            <input
                              type="date"
                              name="dueDate"
                              value={formData.dueDate}
                              onChange={handleInputChange}
                              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 shadow-sm transition-all focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500"
                              required
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 px-1">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Academic Year
                          </label>
                          <Select
                            options={yearOptions}
                            value={yearOptions.find((o) => o.value === parseInt(formData.academicYear))}
                            onChange={(opt) => setFormData((prev) => ({ ...prev, academicYear: opt.value }))}
                            styles={selectStyles}
                            placeholder="SELECT YEAR..."
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">
                            Semester
                          </label>
                          <Select
                            options={semesterOptions}
                            value={semesterOptions.find((o) => o.value === parseInt(formData.semester))}
                            onChange={(opt) => setFormData((prev) => ({ ...prev, semester: opt.value }))}
                            styles={selectStyles}
                            placeholder="SELECT SEM..."
                          />
                        </div>
                      </div>

                      <div className="px-1">
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center ml-1">
                            <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                              Invoice Currency
                            </label>
                            {formData.items.length > 0 && (
                              <span className="text-[7px] font-black text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded uppercase tracking-tighter animate-pulse">
                                Locked by Ledger Entries
                              </span>
                            )}
                          </div>
                          <select
                            name="currency"
                            value={formData.currency}
                            onChange={handleInputChange}
                            disabled={formData.items.length > 0}
                            className={`w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 shadow-sm transition-all focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 ${
                              formData.items.length > 0 ? "opacity-60 cursor-not-allowed bg-slate-50" : ""
                            }`}
                          >
                            <option value="USD">USD ($)</option>
                            <option value="KHR">KHR (៛)</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Ledger Items Table */}
                    <div className="space-y-4 px-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <List className="w-3.5 h-3.5 text-slate-400" />
                          <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                            Transaction Ledger
                          </h3>
                        </div>
                        <span className="text-[8px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                          {formData.items.length} ENTRIES
                        </span>
                      </div>

                      {/* Ledger Body */}
                      <div className="space-y-2.5 max-h-[25vh] overflow-y-auto pr-1 custom-scrollbar">
                        <AnimatePresence mode="popLayout">
                          {formData.items.length > 0 ? (
                            formData.items.map((item, index) => (
                              <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="group flex items-center bg-white border border-slate-100 hover:border-blue-200 p-3 rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/5"
                              >
                                <div className="w-8 h-8 bg-slate-50 text-slate-400 flex items-center justify-center rounded-lg font-black text-[10px] group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300">
                                  {index + 1}
                                </div>
                                <div className="flex-1 px-3 text-left">
                                  <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight">
                                    {item.description}
                                  </p>
                                  <p className="text-[8px] font-bold text-slate-400 uppercase italic leading-none">
                                    Verified Entry
                                  </p>
                                </div>
                                <div className="text-right flex items-center gap-3">
                                  <span className="text-xs font-black text-slate-900 tabular-nums">
                                    {formData.currency === "USD" ? "$" : "៛"}
                                    {item.amount.toLocaleString(undefined, {
                                      minimumFractionDigits: formData.currency === "USD" ? 2 : 0,
                                    })}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveItem(index)}
                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </motion.div>
                            ))
                          ) : (
                            <div className="p-6 border-2 border-dashed border-slate-100 rounded-2xl text-center bg-slate-50/20">
                              <Info className="w-4 h-4 text-slate-300 mx-auto mb-2" />
                              <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">
                                Ledger is empty
                              </p>
                            </div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Add Line Entry Form */}
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-4">
                        <div className="flex items-center gap-2 mb-0.5">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                          <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">
                            New Line Entry
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                          <div className="md:col-span-4 space-y-1.5 text-left text-xs">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Fee Classification
                            </label>
                            <Select
                              options={fees
                                .filter((f) => f.currency === formData.currency)
                                .map((f) => ({
                                  value: f.id,
                                  label: `${f.name.toUpperCase()} (${f.currency === "USD" ? "$" : "៛"})`,
                                }))}
                              value={
                                fees.find((f) => f.id === currentInvoiceItem.feeId)
                                  ? {
                                      value: currentInvoiceItem.feeId,
                                      label: fees
                                        .find((f) => f.id === currentInvoiceItem.feeId)
                                        .name.toUpperCase(),
                                    }
                                  : null
                              }
                              onChange={handleItemFeeSelect}
                              styles={{
                                ...selectStyles,
                                control: (base, state) => ({
                                  ...base,
                                  backgroundColor: "white",
                                  borderColor: state.isFocused ? "#2563eb" : "rgb(226, 232, 240)",
                                  borderRadius: "0.75rem",
                                  fontSize: "0.7rem",
                                  color: "#0f172a",
                                  boxShadow: "none",
                                  "&:hover": { borderColor: "#bfdbfe" },
                                }),
                                singleValue: (base) => ({ ...base, color: "#0f172a" }),
                                placeholder: (base) => ({ ...base, color: "#94a3b8" }),
                                menu: (base) => ({ ...base, backgroundColor: "white", border: "1px solid #f1f5f9" }),
                                option: (base, state) => ({
                                  ...base,
                                  backgroundColor: state.isFocused ? "#eff6ff" : "transparent",
                                  color: state.isFocused ? "#2563eb" : "#475569",
                                  fontSize: "0.7rem",
                                }),
                              }}
                              placeholder="SELECT FEE..."
                            />
                          </div>
                          <div className="md:col-span-5 space-y-1.5 text-left">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Narrative Description
                            </label>
                            <input
                              type="text"
                              name="description"
                              value={currentInvoiceItem.description}
                              onChange={handleItemInputChange}
                              className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 transition-all focus:border-blue-500 focus:outline-none placeholder:text-slate-400"
                              placeholder="DESCRIPTION..."
                            />
                          </div>
                          <div className="md:col-span-3 space-y-1.5 text-left">
                            <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">
                              Value ({formData.currency})
                            </label>
                            <div className="relative">
                              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px] font-black">
                                {formData.currency === "USD" ? "$" : "៛"}
                              </span>
                              <input
                                type="number"
                                name="amount"
                                value={currentInvoiceItem.amount}
                                onChange={handleItemInputChange}
                                className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-800 transition-all focus:border-blue-500 focus:outline-none tabular-nums"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end pt-1">
                          <button
                            type="button"
                            onClick={handleAddItem}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-50 text-blue-600 border border-blue-100 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-blue-600 hover:text-white transition-all active:scale-[0.98] group"
                          >
                            <Plus className="w-3 h-3 group-hover:rotate-90 transition-transform" />
                            Append to Ledger
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                      <Clock className="w-5 h-5 text-blue-600" />
                      <div>
                        <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Revision History</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                          Audit trail of document modifications
                        </p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {isLogsLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center gap-3">
                          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Accessing Audit Trail...
                          </span>
                        </div>
                      ) : auditLogs.length === 0 ? (
                        <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                          <ShieldCheck className="w-8 h-8 text-slate-100 mx-auto mb-3" />
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            No history recorded yet
                          </p>
                        </div>
                      ) : (
                        auditLogs.map((log, i) => (
                          <motion.div
                            key={log.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="relative pl-8 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-px before:bg-slate-100"
                          >
                            <div className="absolute left-[-4.5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 border-4 border-white shadow-sm" />
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-blue-200 transition-all text-left">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-[9px] font-black text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md uppercase tracking-widest">
                                  {log.action.replace("_", " ")}
                                </span>
                                <span className="text-[8px] font-bold text-slate-400 tabular-nums uppercase">
                                  {new Date(log.timestamp).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic">
                                "{log.details}"
                              </p>
                              <div className="mt-3 pt-3 border-t border-slate-200/60 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                  <div className="w-5 h-5 bg-white border border-slate-200 rounded flex items-center justify-center text-[8px] font-black text-slate-500 uppercase">
                                    {log.actor?.firstName.charAt(0)}
                                    {log.actor?.lastName.charAt(0)}
                                  </div>
                                  <span className="text-[9px] font-black text-slate-900 uppercase">
                                    {log.actor?.firstName} {log.actor?.lastName}
                                  </span>
                                </div>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                  {log.actor?.role}
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Footer Summary */}
              <div className="p-5 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-center sm:text-left">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Total Due</p>
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-5 bg-blue-600 rounded-full" />
                    <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">
                      {formData.currency === "USD" ? "$" : "៛"}
                      {totalAmount.toLocaleString(undefined, { minimumFractionDigits: formData.currency === "USD" ? 2 : 0 })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-all duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 active:scale-[0.98] disabled:opacity-70 flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <LoadingSpinner size="xs" color="white" />
                    ) : (
                      <ShieldCheck className="w-4 h-4" />
                    )}
                    {invoice ? "Save Changes" : "Create Invoice"}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
