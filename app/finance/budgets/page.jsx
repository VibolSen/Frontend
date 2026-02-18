"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { apiClient } from "@/lib/api";
import { 
  PieChart as PieChartIcon, 
  Plus, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building,
  Calendar,
  ChevronRight,
  ArrowLeft,
  Activity,
  AlertCircle,
  MoreVertical,
  Target
} from "lucide-react";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBudget, setNewBudget] = useState({ departmentId: "", amount: 0, period: new Date().getFullYear().toString() });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [budgetsData, departmentsData] = await Promise.all([
        apiClient.get("/financial/budgets"),
        apiClient.get("/departments")
      ]);
      setBudgets(budgetsData || []);
      setDepartments(departmentsData || []);
    } catch (error) {
      console.error("Failed to fetch budgets:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBudget = async (e) => {
    e.preventDefault();
    try {
      await apiClient.post("/financial/budgets", {
        ...newBudget,
        amount: parseFloat(newBudget.amount)
      });
      setShowCreateModal(false);
      fetchData();
    } catch (error) {
      console.error("Failed to create budget:", error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  const calculateProgress = (spent, total) => {
    const percentage = (spent / total) * 100;
    return Math.min(percentage, 100);
  };

  return (
    <div className="min-h-screen bg-slate-50/50 p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Departmental <span className="text-violet-600">Budgets</span></h1>
          <p className="text-slate-500 font-medium">Strategic financial planning and departmental expense monitoring.</p>
        </div>
        
        <button 
          onClick={() => setShowCreateModal(true)}
          className="px-6 py-2.5 bg-violet-600 text-white rounded-xl font-bold text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-100 flex items-center gap-2"
        >
          <Plus size={18} />
          Allocate New Budget
        </button>
      </div>

      {loading ? (
        <div className="h-64 flex items-center justify-center">
           <div className="w-10 h-10 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {budgets.map((budget) => (
            <motion.div 
               key={budget.id} 
               whileHover={{ y: -5 }}
               className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden group cursor-pointer"
            >
               <div className="p-6 space-y-4">
                  <div className="flex items-center justify-between">
                     <div className="h-12 w-12 bg-violet-50 text-violet-600 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110">
                        <Building size={24} />
                     </div>
                     <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-md uppercase tracking-widest">{budget.period}</span>
                  </div>

                  <div>
                     <h3 className="text-xl font-black text-slate-900 leading-tight">{budget.department.name}</h3>
                     <p className="text-xs text-slate-500 font-bold uppercase tracking-tighter mt-1">Resource Allocation</p>
                  </div>

                  <div className="space-y-2">
                     <div className="flex items-center justify-between text-xs font-black uppercase">
                        <span className="text-slate-400">Spending Progress</span>
                        <span className={calculateProgress(budget.spent, budget.amount) > 90 ? "text-rose-600" : "text-violet-600"}>
                           {calculateProgress(budget.spent, budget.amount).toFixed(1)}%
                        </span>
                     </div>
                     <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div 
                           initial={{ width: 0 }}
                           animate={{ width: `${calculateProgress(budget.spent, budget.amount)}%` }}
                           className={`h-full rounded-full ${calculateProgress(budget.spent, budget.amount) > 90 ? "bg-rose-500" : "bg-violet-600"}`}
                        />
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Budget</p>
                        <p className="text-sm font-black text-slate-900">{formatCurrency(budget.amount)}</p>
                     </div>
                     <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Spent</p>
                        <p className="text-sm font-black text-slate-900">{formatCurrency(budget.spent)}</p>
                     </div>
                  </div>
               </div>
               
               <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between transition-colors group-hover:bg-violet-50 group-hover:border-violet-100">
                  <div className="flex items-center gap-2">
                     <Activity size={14} className="text-violet-600" />
                     <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">View Expenditures</span>
                  </div>
                  <ChevronRight size={16} className="text-slate-400 group-hover:text-violet-600 transition-colors" />
               </div>
            </motion.div>
          ))}

          {budgets.length === 0 && (
            <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-300 flex flex-col items-center justify-center text-center px-6">
                <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mb-4">
                   <Target size={40} />
                </div>
                <h3 className="text-xl font-black text-slate-800 tracking-tight">No Active Budgets</h3>
                <p className="text-slate-500 max-w-sm mt-2">Start your financial planning by allocating budgets to departments and monitoring their expenditures.</p>
                <button 
                  onClick={() => setShowCreateModal(true)}
                  className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-xl font-black text-sm hover:scale-105 active:scale-95 transition-all"
                >
                  Create First Allocation
                </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
         {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 onClick={() => setShowCreateModal(false)}
                 className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm px-4"
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200"
               >
                  <div className="p-8">
                     <div className="flex items-center justify-between mb-8">
                        <div>
                           <h2 className="text-2xl font-black text-slate-900 tracking-tight">New Allocation</h2>
                           <p className="text-slate-500 text-sm font-medium uppercase tracking-tighter">Budgeting System</p>
                        </div>
                        <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                           <DollarSign size={20} className="text-slate-400" />
                        </button>
                     </div>

                     <form onSubmit={handleCreateBudget} className="space-y-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Department</label>
                           <select 
                             required
                             className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-violet-500 outline-none appearance-none"
                             value={newBudget.departmentId}
                             onChange={(e) => setNewBudget({...newBudget, departmentId: e.target.value})}
                           >
                              <option value="">Select Department</option>
                              {departments.map(d => (
                                 <option key={d.id} value={d.id}>{d.name}</option>
                              ))}
                           </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Amount ($)</label>
                              <input 
                                type="number" 
                                required
                                placeholder="0.00"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-violet-500 outline-none"
                                value={newBudget.amount}
                                onChange={(e) => setNewBudget({...newBudget, amount: e.target.value})}
                              />
                           </div>
                           <div className="space-y-2">
                              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Fiscal Year</label>
                              <input 
                                type="text" 
                                required
                                placeholder="2024"
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-violet-500 outline-none"
                                value={newBudget.period}
                                onChange={(e) => setNewBudget({...newBudget, period: e.target.value})}
                              />
                           </div>
                        </div>

                        <div className="pt-4 flex gap-3">
                           <button 
                             type="button"
                             onClick={() => setShowCreateModal(false)}
                             className="flex-1 py-3 text-slate-400 font-bold hover:text-slate-600 transition-colors"
                           >
                              Cancel
                           </button>
                           <button 
                             type="submit"
                             className="flex-[2] py-4 bg-violet-600 text-white rounded-2xl font-black text-sm hover:bg-violet-700 transition-all shadow-lg shadow-violet-100"
                           >
                              Confirm Allocation
                           </button>
                        </div>
                     </form>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}
