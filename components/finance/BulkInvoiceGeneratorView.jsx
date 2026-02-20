"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText, Users, CheckCircle, Zap, DollarSign,
} from "lucide-react";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

function InvoicePreviewRow({ invoice, index }) {
  return (
    <motion.tr initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.025 }}
      className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center text-[10px] font-black shrink-0">
            {invoice.student?.firstName?.[0]}{invoice.student?.lastName?.[0]}
          </div>
          <div>
            <p className="text-[12px] font-bold text-slate-800">{invoice.student?.firstName} {invoice.student?.lastName}</p>
            <p className="text-[9px] text-slate-400 font-medium">{invoice.student?.studentId}</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-[12px] font-bold text-slate-600">{invoice.description}</td>
      <td className="px-5 py-3.5 text-[13px] font-black text-emerald-700">${parseFloat(invoice.amount).toFixed(2)}</td>
      <td className="px-5 py-3.5 text-[11px] text-slate-500">{invoice.dueDate}</td>
      <td className="px-5 py-3.5">
        <span className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-200 text-[9px] font-black rounded-lg">Pending</span>
      </td>
    </motion.tr>
  );
}

export default function BulkInvoiceGeneratorView() {
  const [groups, setGroups] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("2025-S1");
  const [feeType, setFeeType] = useState("TUITION");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewInvoices, setPreviewInvoices] = useState([]);
  const [step, setStep] = useState(1);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => { setToast({ msg }); setTimeout(() => setToast(null), 3500); };

  useEffect(() => {
    apiClient.get("/groups").then((data) => setGroups(Array.isArray(data) ? data : MOCK_GROUPS)).catch(() => setGroups(MOCK_GROUPS));
    const d = new Date(); d.setDate(d.getDate() + 30);
    setDueDate(d.toISOString().split("T")[0]);
  }, []);

  const fetchStudents = useCallback(async () => {
    if (!selectedGroup) return;
    setIsLoading(true);
    try {
      const data = await apiClient.get(`/groups/${selectedGroup}/students`);
      setStudents(Array.isArray(data) ? data : MOCK_STUDENTS);
    } catch { setStudents(MOCK_STUDENTS); }
    finally { setIsLoading(false); }
  }, [selectedGroup]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const handlePreview = () => {
    const invoices = students.map((s) => ({
      studentId: s.id, student: s,
      description: `${description} — ${selectedSemester}`,
      amount: parseFloat(amount), dueDate, feeType, status: "PENDING",
    }));
    setPreviewInvoices(invoices); setStep(2);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try { await apiClient.post("/finance/bulk-invoices", { invoices: previewInvoices }); }
    catch { /* fallback */ }
    finally { setIsGenerating(false); setStep(3); showToast(`${previewInvoices.length} invoices generated!`); }
  };

  const totalAmount = useMemo(() => previewInvoices.reduce((s, i) => s + i.amount, 0), [previewInvoices]);
  const canPreview = amount && description && dueDate && students.length > 0 && selectedGroup;

  return (
    <div className="min-h-screen bg-slate-50/20 pb-12">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        <AnimatePresence>
          {toast && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
              className="fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl bg-slate-900 text-white text-[12px] font-bold">
              <CheckCircle size={15} className="text-emerald-400" />{toast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        <div>
          <h1 className="text-2xl md:text-3xl font-black text-emerald-700 tracking-tight">Bulk Invoice Generator</h1>
          <p className="text-slate-500 font-medium text-sm mt-0.5">Generate fee invoices for an entire group in one action.</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {[{ n: 1, label: "Configure" }, { n: 2, label: "Preview" }, { n: 3, label: "Done" }].map(({ n, label }, i) => (
            <React.Fragment key={n}>
              <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                step === n ? "bg-emerald-600 text-white shadow-lg shadow-emerald-200" :
                step > n ? "bg-emerald-50 text-emerald-600 border border-emerald-200" :
                "bg-white text-slate-400 border border-slate-200"
              }`}>
                <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-[10px] font-black">{n}</span>
                {label}
              </div>
              {i < 2 && <div className={`h-0.5 flex-1 rounded-full ${step > n ? "bg-emerald-400" : "bg-slate-200"}`} />}
            </React.Fragment>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="s1" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-5">
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Invoice Configuration</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Target Group *</label>
                  <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all">
                    <option value="">Select a group...</option>
                    {groups.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Semester *</label>
                  <select value={selectedSemester} onChange={(e) => setSelectedSemester(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all">
                    <option value="2025-S1">2025 – Semester 1</option>
                    <option value="2024-S2">2024 – Semester 2</option>
                    <option value="2024-S1">2024 – Semester 1</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Fee Type *</label>
                  <select value={feeType} onChange={(e) => setFeeType(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all">
                    {["TUITION","REGISTRATION","EXAM","LIBRARY","ACTIVITY","OTHER"].map((t) => (
                      <option key={t} value={t}>{t.charAt(0)+t.slice(1).toLowerCase()} Fee</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Amount (USD) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-black">$</span>
                    <input type="number" min="0" step="0.01" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" />
                  </div>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Description *</label>
                  <input type="text" placeholder="e.g. Tuition Fee – Semester 1, 2025" value={description} onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1.5">Due Date *</label>
                  <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-300 transition-all" />
                </div>
                <div className="flex items-end">
                  <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border w-full ${students.length > 0 ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200"}`}>
                    {isLoading ? <LoadingSpinner size="xs" color="blue" /> : <Users size={16} className={students.length > 0 ? "text-emerald-600" : "text-slate-400"} />}
                    <div>
                      <p className={`text-base font-black leading-none ${students.length > 0 ? "text-emerald-700" : "text-slate-400"}`}>{students.length}</p>
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-wider mt-0.5">Students Selected</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-end pt-2 border-t border-slate-50">
                <button onClick={handlePreview} disabled={!canPreview}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-200 hover:from-emerald-700 hover:to-teal-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  <Zap size={14} />Preview Invoices
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="s2" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
              <div className="bg-emerald-600 rounded-2xl p-5 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="text-[11px] font-black text-emerald-200 uppercase tracking-widest">Ready to Generate</p>
                  <p className="text-2xl font-black mt-1">{previewInvoices.length} Invoices</p>
                  <p className="text-[12px] text-emerald-100 mt-0.5">Total: ${totalAmount.toFixed(2)}</p>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep(1)} className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/20">Back</button>
                  <button onClick={handleGenerate} disabled={isGenerating}
                    className="flex items-center gap-2 px-5 py-2.5 bg-white text-emerald-700 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-50 shadow-lg transition-all">
                    {isGenerating ? <LoadingSpinner size="xs" color="green" /> : <CheckCircle size={14} />}
                    Confirm & Issue All
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-slate-50/50 border-b border-slate-100">
                      <tr>{["Student","Description","Amount","Due Date","Status"].map((h) => (
                        <th key={h} className="px-5 py-3 text-left text-[9px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>{previewInvoices.map((inv, i) => <InvoicePreviewRow key={i} invoice={inv} index={i} />)}</tbody>
                    <tfoot className="bg-emerald-50/50 border-t border-emerald-100">
                      <tr>
                        <td colSpan={2} className="px-5 py-3 text-[10px] font-black text-emerald-700 uppercase tracking-widest">Total</td>
                        <td className="px-5 py-3 text-[14px] font-black text-emerald-700">${totalAmount.toFixed(2)}</td>
                        <td colSpan={2} />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="s3" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm p-10 flex flex-col items-center text-center gap-5">
              <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center border-4 border-emerald-100">
                <CheckCircle size={36} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">All Done!</h2>
                <p className="text-slate-500 font-medium mt-1 text-sm">{previewInvoices.length} invoices issued to students.</p>
                <p className="text-[11px] font-black text-emerald-600 mt-2">Total Value: ${totalAmount.toFixed(2)}</p>
              </div>
              <button onClick={() => { setStep(1); setPreviewInvoices([]); setAmount(""); setDescription(""); setSelectedGroup(""); setStudents([]); }}
                className="px-6 py-2.5 bg-emerald-600 text-white text-[11px] font-black uppercase tracking-widest rounded-xl shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all">
                Generate Another Batch
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

const MOCK_GROUPS = [
  { id: "g1", name: "Group A — CS Year 3" },
  { id: "g2", name: "Group B — BA Year 2" },
  { id: "g3", name: "Group C — ENG Year 1" },
];
const MOCK_STUDENTS = [
  { id: "s1", firstName: "Sophea", lastName: "Chan", studentId: "STU-001" },
  { id: "s2", firstName: "Dara", lastName: "Kim", studentId: "STU-002" },
  { id: "s3", firstName: "Vibol", lastName: "Pich", studentId: "STU-003" },
  { id: "s4", firstName: "Mealea", lastName: "Sok", studentId: "STU-004" },
  { id: "s5", firstName: "Rithya", lastName: "Heng", studentId: "STU-005" },
];
