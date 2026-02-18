"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";
import { 
  User, 
  DollarSign, 
  Calendar, 
  CheckCircle, 
  Clock, 
  ChevronRight, 
  Plus,
  ArrowLeft,
  Search,
  Filter,
  Download,
  ShieldCheck,
  AlertCircle
} from "lucide-react";

export default function PayrollPage() {
  const [payrolls, setPayrolls] = useState([]);
  const [benefits, setBenefits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("payrolls"); // payrolls, benefits
  const [isGenerating, setIsGenerating] = useState(false);
  const [period, setPeriod] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === "payrolls") {
        const data = await apiClient.get("/financial/payrolls");
        setPayrolls(data || []);
      } else {
        const data = await apiClient.get("/financial/benefits");
        setBenefits(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePayroll = async () => {
    setIsGenerating(true);
    try {
      await apiClient.post("/financial/payrolls/generate", { period });
      fetchData();
    } catch (error) {
      console.error("Failed to generate payroll:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial <span className="text-indigo-600">Payroll</span></h1>
          <p className="text-slate-500 font-medium">Automated staff salary processing and benefit management.</p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button 
                onClick={() => setActiveTab("payrolls")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "payrolls" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"}`}
              >
                Payrolls
              </button>
              <button 
                onClick={() => setActiveTab("benefits")}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === "benefits" ? "bg-indigo-600 text-white shadow-md shadow-indigo-100" : "text-slate-500 hover:bg-slate-50"}`}
              >
                Salary Structures
              </button>
           </div>
        </div>
      </div>

      {activeTab === "payrolls" ? (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                   <h3 className="font-black text-slate-800 tracking-tight">Generate Monthly Payroll</h3>
                   <p className="text-xs text-slate-500 font-medium">Bulk process salaries for all staff members.</p>
                </div>
                <div className="flex items-center gap-3 w-full md:w-auto">
                   <input 
                      type="month" 
                      value={period}
                      onChange={(e) => setPeriod(e.target.value)}
                      className="flex-1 md:w-40 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                   />
                   <button 
                      onClick={handleGeneratePayroll}
                      disabled={isGenerating}
                      className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50 flex items-center gap-2"
                   >
                      {isGenerating ? <Clock className="animate-spin" size={16} /> : <Plus size={16} />}
                      Process Payroll
                   </button>
                </div>
             </div>
             <div className="bg-indigo-600 p-6 rounded-2xl shadow-xl shadow-indigo-100 text-white flex items-center justify-between">
                <div>
                   <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Total Payroll (MTD)</p>
                   <p className="text-2xl font-black">{formatCurrency(payrolls.filter(p => p.period === period).reduce((sum, p) => sum + p.netSalary, 0))}</p>
                </div>
                <div className="h-12 w-12 bg-white/20 rounded-xl flex items-center justify-center">
                   <DollarSign size={24} />
                </div>
             </div>
          </div>

          {/* List */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Payroll Records</h3>
                <div className="flex items-center gap-4">
                   <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input 
                        type="text" 
                        placeholder="Search staff..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none w-64"
                      />
                   </div>
                </div>
             </div>
             
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50">
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Period</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Net Salary</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {payrolls.filter(p => !searchQuery || `${p.user.firstName} ${p.user.lastName}`.toLowerCase().includes(searchQuery.toLowerCase())).map((payroll) => (
                         <tr key={payroll.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-black text-xs">
                                     {payroll.user.firstName[0]}{payroll.user.lastName[0]}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-slate-800">{payroll.user.firstName} {payroll.user.lastName}</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase">{payroll.user.role}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4">
                               <span className="text-xs font-black text-slate-600 bg-slate-100 px-2 py-1 rounded-md">{payroll.period}</span>
                            </td>
                            <td className="px-6 py-4">
                               <p className="text-sm font-black text-indigo-600">{formatCurrency(payroll.netSalary)}</p>
                            </td>
                            <td className="px-6 py-4">
                               <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                                  payroll.status === "PAID" ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                               }`}>
                                  {payroll.status === "PAID" ? <CheckCircle size={12} /> : <Clock size={12} />}
                                  {payroll.status}
                               </span>
                            </td>
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-2">
                                  {payroll.status === "PENDING" && (
                                     <button className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                                        <CheckCircle size={14} />
                                     </button>
                                  )}
                                  <button className="p-2 bg-slate-50 text-slate-400 rounded-lg hover:bg-slate-100 transition-all">
                                     <Download size={14} />
                                  </button>
                               </div>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
             {payrolls.length === 0 && !loading && (
                <div className="text-center py-20">
                   <div className="h-16 w-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300 mb-4">
                      <AlertCircle size={32} />
                   </div>
                   <p className="text-slate-400 font-bold tracking-tight">No payroll records found for this period.</p>
                </div>
             )}
          </div>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
           {/* Benefits Management Section */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
             <div className="p-6 border-b border-slate-100">
                <h3 className="font-black text-slate-800 uppercase text-xs tracking-widest">Salary Structures & Benefits</h3>
             </div>
             <div className="overflow-x-auto">
                <table className="w-full text-left">
                   <thead>
                      <tr className="bg-slate-50/50">
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Staff Member</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Base Salary</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Allowances</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Deductions</th>
                         <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Actions</th>
                      </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                      {benefits.map((benefit) => (
                         <tr key={benefit.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 py-4">
                               <div className="flex items-center gap-3">
                                  <div className="h-9 w-9 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600 font-black text-xs">
                                     {benefit.user.firstName[0]}{benefit.user.lastName[0]}
                                  </div>
                                  <div>
                                     <p className="text-sm font-bold text-slate-800">{benefit.user.firstName} {benefit.user.lastName}</p>
                                     <p className="text-[10px] text-slate-400 font-bold uppercase">{benefit.user.role}</p>
                                  </div>
                               </div>
                            </td>
                            <td className="px-6 py-4 text-sm font-black text-slate-700">{formatCurrency(benefit.baseSalary)}</td>
                            <td className="px-6 py-4 text-sm font-black text-emerald-600">+{formatCurrency(benefit.allowance)}</td>
                            <td className="px-6 py-4 text-sm font-black text-rose-600">-{formatCurrency(benefit.deduction)}</td>
                            <td className="px-6 py-4">
                               <button className="px-4 py-1.5 bg-slate-100 text-slate-900 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all">
                                  Edit Structure
                               </button>
                            </td>
                         </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
