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
    items: [],
  });
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
        items: invoice.items.map(item => ({
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
        dueDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split("T")[0], // 30 days from now
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
      description: selectedFee ? selectedFee.description : '',
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
      borderColor: state.isFocused ? '#10b981' : 'rgb(226, 232, 240)',
      borderRadius: '0.75rem',
      padding: '0px',
      fontSize: '0.75rem',
      boxShadow: state.isFocused ? '0 0 0 4px rgba(16, 185, 129, 0.1)' : 'none',
      '&:hover': {
        borderColor: state.isFocused ? '#10b981' : '#a7f3d0',
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
      backgroundColor: state.isFocused ? '#ecfdf5' : 'transparent',
      color: state.isFocused ? '#059669' : '#475569',
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
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20"
        >
          {/* Header Area */}
          <div className="p-8 border-b border-slate-100 bg-gradient-to-br from-emerald-50/50 via-white to-white relative">
            <div className="absolute top-0 right-0 p-8">
              <div className="w-24 h-24 bg-emerald-600/5 rounded-full blur-3xl" />
            </div>
            
            <div className="flex justify-between items-start relative z-10">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-xl shadow-emerald-500/20 rotate-3 transition-transform hover:rotate-0 duration-300">
                  <FileText className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                    {invoice ? "Revise Document" : "Draft New Invoice"}
                  </h2>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] bg-emerald-50 px-2 py-0.5 rounded-md">Financial Ledger</span>
                    <span className="w-1 h-1 bg-slate-300 rounded-full" />
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">STEP Academy ERP System</span>
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-3 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all duration-200 border border-transparent hover:border-rose-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Premium Tab Bar */}
            {invoice && (
                <div className="flex items-center gap-1 mt-6 p-1 bg-slate-100/50 w-fit rounded-xl border border-slate-100">
                    <button
                        type="button"
                        onClick={() => setActiveTab("ledger")}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'ledger' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Composition
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("history")}
                        className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${activeTab === 'history' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Audit Trail
                    </button>
                </div>
            )}
          </div>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col overflow-hidden">
            <div className="p-10 space-y-8 overflow-y-auto custom-scrollbar bg-white min-h-[400px]">
              
              {activeTab === "ledger" ? (
                <>
              {/* Recipient Information Profile */}
              <div className="p-8 bg-slate-50/50 rounded-[2rem] border border-slate-100 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <User className="w-4 h-4 text-slate-400" />
                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Recipient Selection</h3>
                </div>
                
                <div className="space-y-1.5 px-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Search Database (Students Only)</label>
                  <Select
                    options={students.map((s) => ({
                      value: s.id,
                      label: `${s.firstName.toUpperCase()} ${s.lastName.toUpperCase()} (ID: ${s.id.substring(0,8).toUpperCase()})`,
                    }))}
                    value={selectedStudent}
                    onChange={handleStudentSelectChange}
                    styles={selectStyles}
                    placeholder="ENTER NAME OR ACCOUNT ID..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 px-1">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Issue Date</label>
                    <div className="relative group">
                      <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-500" />
                      <input
                        type="date"
                        name="issueDate"
                        value={formData.issueDate}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-700 shadow-sm transition-all focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-black text-rose-400 uppercase tracking-widest ml-1">Settlement Deadline</label>
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
              </div>

              {/* Ledger Items Table */}
              <div className="space-y-4 px-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <List className="w-3.5 h-3.5 text-slate-400" />
                    <h3 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Ledger</h3>
                  </div>
                  <span className="text-[8px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                    {formData.items.length} ENTRIES
                  </span>
                </div>

                {/* Ledger Body */}
                <div className="space-y-2.5 min-h-[100px] max-h-[20vh] overflow-y-auto pr-1 custom-scrollbar">
                  <AnimatePresence mode="popLayout">
                    {formData.items.length > 0 ? (
                      formData.items.map((item, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className="group flex items-center bg-white border border-slate-100 hover:border-emerald-200 p-3 rounded-xl transition-all hover:shadow-lg hover:shadow-emerald-500/5"
                        >
                          <div className="w-8 h-8 bg-slate-50 text-slate-400 flex items-center justify-center rounded-lg font-black text-[10px] group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300">
                             {index + 1}
                          </div>
                          <div className="flex-1 px-3">
                            <p className="text-[9px] font-black text-slate-900 uppercase tracking-tight">{item.description}</p>
                            <p className="text-[8px] font-bold text-slate-400 uppercase italic">Entry Category: Verified</p>
                          </div>
                          <div className="text-right flex items-center gap-3">
                            <span className="text-xs font-black text-slate-900 tabular-nums">${item.amount.toFixed(2)}</span>
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
                      <div className="p-6 border-2 border-dashed border-slate-100 rounded-[1.5rem] text-center bg-slate-50/20">
                        <Info className="w-4 h-4 text-slate-300 mx-auto mb-2" />
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.25em]">Registry is empty</p>
                      </div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Add Line Entry Form */}
                <div className="bg-slate-50/80 p-5 rounded-[1.5rem] border border-slate-100 space-y-4">
                   <div className="flex items-center gap-2 mb-0.5">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Manual Line Entry Interface</span>
                   </div>
                   
                   <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Fee Classification</label>
                      <Select
                        options={fees.map((f) => ({ value: f.id, label: f.name.toUpperCase() }))}
                        value={fees.find(f => f.id === currentInvoiceItem.feeId) ? {value: currentInvoiceItem.feeId, label: fees.find(f => f.id === currentInvoiceItem.feeId).name.toUpperCase()} : null}
                        onChange={handleItemFeeSelect}
                        styles={{
                            ...selectStyles,
                            control: (base, state) => ({
                                ...base,
                                backgroundColor: 'white',
                                borderColor: state.isFocused ? '#10b981' : 'rgb(226, 232, 240)',
                                borderRadius: '0.75rem',
                                fontSize: '0.7rem',
                                color: '#0f172a',
                                boxShadow: 'none',
                                '&:hover': { borderColor: '#a7f3d0' }
                            }),
                            singleValue: (base) => ({ ...base, color: '#0f172a' }),
                            placeholder: (base) => ({ ...base, color: '#94a3b8' }),
                            menu: (base) => ({ ...base, backgroundColor: 'white', border: '1px solid #f1f5f9' }),
                            option: (base, state) => ({ 
                                ...base, 
                                backgroundColor: state.isFocused ? '#ecfdf5' : 'transparent', 
                                color: state.isFocused ? '#059669' : '#475569',
                                fontSize: '0.7rem' 
                            }),
                        }}
                        placeholder="SELECT FEE..."
                      />
                    </div>
                    <div className="md:col-span-5 space-y-1.5">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Narrative Description</label>
                      <input
                        type="text"
                        name="description"
                        value={currentInvoiceItem.description}
                        onChange={handleItemInputChange}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-bold text-slate-800 transition-all focus:border-emerald-500 focus:outline-none placeholder:text-slate-400"
                        placeholder="ENTER LINE DESCRIPTION..."
                      />
                    </div>
                    <div className="md:col-span-3 space-y-1.5">
                      <label className="text-[8px] font-black text-slate-500 uppercase tracking-widest ml-1">Value (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-[9px] font-black">$</span>
                        <input
                          type="number"
                          name="amount"
                          value={currentInvoiceItem.amount}
                          onChange={handleItemInputChange}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-[11px] font-black text-slate-800 transition-all focus:border-emerald-500 focus:outline-none tabular-nums"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-end pt-0.5">
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm hover:bg-emerald-600 hover:text-white transition-all active:scale-95 group"
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
                        <Clock className="w-5 h-5 text-emerald-600" />
                        <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight">Timeline of Revisions</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chronological audit of document modifications</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {isLogsLoading ? (
                            <div className="py-20 flex flex-col items-center justify-center gap-3">
                                <div className="w-6 h-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Logs...</span>
                            </div>
                        ) : auditLogs.length === 0 ? (
                            <div className="py-20 text-center border-2 border-dashed border-slate-100 rounded-[2rem]">
                                <ShieldCheck className="w-8 h-8 text-slate-100 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No history recorded yet</p>
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
                                    <div className="absolute left-[-4.5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 border-4 border-white shadow-sm" />
                                    <div className="p-4 bg-slate-50/50 rounded-2xl border border-slate-100 group hover:border-emerald-200 transition-all">
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md uppercase tracking-widest">
                                                {log.action.replace('_', ' ')}
                                            </span>
                                            <span className="text-[8px] font-bold text-slate-400 tabular-nums">
                                                {new Date(log.timestamp).toLocaleString()}
                                            </span>
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-700 leading-relaxed italic">
                                            "{log.details}"
                                        </p>
                                        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-5 h-5 bg-white border border-slate-200 rounded flex items-center justify-center text-[8px] font-black text-slate-500 uppercase">
                                                    {log.actor?.firstName.charAt(0)}{log.actor?.lastName.charAt(0)}
                                                </div>
                                                <span className="text-[9px] font-black text-slate-900 uppercase">
                                                    {log.actor?.firstName} {log.actor?.lastName}
                                                </span>
                                            </div>
                                            <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{log.actor?.role}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
              )}
              </div>

            {/* Footer / Settlement Summary */}
            <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="space-y-0.5 text-center sm:text-left">
                <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em] ml-1">Final Invoice Evaluation</span>
                <div className="flex items-center justify-center sm:justify-start gap-2.5">
                    <div className="w-1 h-6 bg-emerald-600 rounded-full" />
                    <span className="text-2xl font-black text-slate-900 tracking-tighter tabular-nums">${totalAmount.toFixed(2)}</span>
                </div>
              </div>
              
              <div className="flex gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 sm:flex-none px-6 py-2.5 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 hover:bg-white rounded-lg transition-all"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 sm:flex-none px-8 py-2.5 bg-emerald-600 text-white rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-700 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    <ShieldCheck className="w-3.5 h-3.5" />
                  )}
                  {invoice ? "RE-AUTHORIZE" : "FINALIZE"}
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
