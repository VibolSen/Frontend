'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calendar, 
  Award, 
  ChevronRight,
  PlusCircle,
  MinusCircle,
  ShieldCheck,
  BarChart3,
  Bookmark,
  Sparkles,
  Info
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { apiClient } from '@/lib/api';
import { useUser } from '@/context/UserContext';

const StudentPointsPage = () => {
  const { user } = useUser();
  const [points, setPoints] = useState([]);
  const [eligibility, setEligibility] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [pointsData, eligibilityData] = await Promise.all([
        apiClient.get('/student/points'),
        apiClient.get(`/certifications/eligibility/${user?.id}`)
      ]);
      
      setPoints(Array.isArray(pointsData) ? pointsData : []);
      setEligibility(eligibilityData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derived Values
  const totalMerits = points.reduce((sum, item) => sum + item.points, 0);
  const earnedMerits = points.filter(p => p.points > 0).reduce((sum, item) => sum + item.points, 0);
  const deductedMerits = points.filter(p => p.points < 0).reduce((sum, item) => sum + Math.abs(item.points), 0);

  const totalCreditsEarned = eligibility?.yearlyProgress?.reduce((s, yr) => s + yr.creditsEarned, 0) || 0;

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-200 blur-2xl opacity-20 animate-pulse rounded-full" />
          <LoadingSpinner size="lg" color="indigo" className="relative z-10" />
        </div>
        <p className="text-slate-500 font-black tracking-widest animate-pulse uppercase text-[11px]">Syncing academic standings...</p>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.12 }
    }
  };

  const itemVariants = {
    hidden: { y: 15, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { duration: 0.5, ease: "easeOut" } }
  };

  return (
    <div className="min-h-screen bg-slate-50/20 pb-16">
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto p-4 md:p-8 space-y-8"
      >
        {/* ── Header Section ── */}
        <motion.header variants={itemVariants} className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 text-indigo-600 mb-2">
              <div className="p-2 bg-indigo-50 rounded-xl border border-indigo-100 shadow-sm">
                <Trophy size={22} className="drop-shadow-sm" />
              </div>
              <span className="text-[11px] font-black uppercase tracking-[0.2em]">Institutional Recognition</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Merit & <span className="text-indigo-600">Standings</span></h1>
            <p className="text-slate-500 font-medium text-base">Your official record of academic progression and behavioral recognition.</p>
          </div>
          
          <div className="flex items-center gap-4 bg-white px-5 py-3 rounded-2xl border border-slate-200 shadow-sm">
             <div className="text-right">
               <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Total Credits</p>
               <p className="text-xl font-black text-indigo-600 leading-none">{totalCreditsEarned}</p>
             </div>
             <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
               <ShieldCheck size={20} />
             </div>
          </div>
        </motion.header>

        {/* ── Degree Progress Section (Dynamic Only) ── */}
        <motion.section variants={itemVariants} className="relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-violet-600 rounded-3xl blur-2xl opacity-[0.08]" />
          <div className="relative bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden p-6 md:p-8">
            <div className="space-y-8">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0 border border-indigo-100 shadow-sm">
                    <BarChart3 size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Academic Progression</h3>
                    <p className="text-[12px] text-slate-500 font-medium">Breakdown of credits earned per academic year.</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100">
                   <Sparkles size={14} className="text-amber-500" />
                   <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{totalCreditsEarned} Credits Total</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {eligibility?.yearlyProgress?.length > 0 ? (
                  eligibility.yearlyProgress.map((year, idx) => (
                    <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 hover:border-indigo-200 hover:bg-white transition-all group">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">{year.yearLabel.replace('_', ' ')}</p>
                      <div className="flex items-end justify-between">
                        <div className="space-y-0.5">
                          <p className="text-2xl font-black text-slate-800 tracking-tight">{year.creditsEarned}</p>
                          <p className="text-[10px] font-bold text-indigo-600 uppercase">Credits Earned</p>
                        </div>
                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform ${year.eligible_next_year ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-200 text-slate-400'}`}>
                          {year.eligible_next_year ? <ShieldCheck size={20} /> : <Activity size={20} />}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
                     <p className="text-sm font-bold text-slate-400 uppercase tracking-widest italic">No credit progression data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ── Merit Points Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Main List Area */}
          <div className="lg:col-span-2 space-y-6">
            <motion.header variants={itemVariants} className="flex items-center justify-between px-1">
               <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-50 text-violet-600 rounded-xl border border-violet-100 shadow-sm">
                    <Bookmark size={20} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-800 tracking-tight">Behavioral Merit Log</h3>
                    <p className="text-[12px] text-slate-500 font-medium">History of your behavioral recognition.</p>
                  </div>
               </div>
            </motion.header>

            <motion.div
              variants={itemVariants}
              className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-slate-50/70 border-b border-slate-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Transaction Reason</th>
                      <th className="px-6 py-4 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Date Issued</th>
                      <th className="px-6 py-4 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Adjustment</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <AnimatePresence mode="popLayout">
                      {points.length > 0 ? (
                        points.map((point, index) => (
                          <motion.tr
                            key={point.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-slate-50/40 transition-colors"
                          >
                            <td className="px-6 py-5">
                              <span className="text-sm font-black text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors uppercase">{point.reason}</span>
                            </td>
                            <td className="px-6 py-5 text-center">
                              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-xl shadow-sm">
                                <Calendar size={12} className="text-slate-400" />
                                <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                  {new Date(point.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-5 text-right">
                              <div className={`inline-flex items-center gap-1.5 font-black px-3.5 py-1.5 rounded-xl ${point.points >= 0 ? 'bg-emerald-50 text-emerald-600 border border-emerald-100' : 'bg-rose-50 text-rose-600 border border-rose-100'}`}>
                                {point.points >= 0 ? <PlusCircle size={14} /> : <MinusCircle size={14} />}
                                <span className="text-sm tracking-tight">{point.points >= 0 ? `+${point.points}` : point.points}</span>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr className="bg-white">
                          <td colSpan="3" className="p-24 text-center">
                            <motion.div 
                               initial={{ opacity: 0 }} 
                               animate={{ opacity: 1 }}
                               className="flex flex-col items-center max-w-xs mx-auto text-slate-300"
                            >
                               <Award size={48} className="mb-4 opacity-50" />
                               <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest">No merit history available</h4>
                            </motion.div>
                          </td>
                        </tr>
                      )}
                    </AnimatePresence>
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>

          {/* Sidebar Area - Dynamic Only */}
          <div className="space-y-6">
            <motion.section variants={itemVariants} className="bg-white rounded-[2rem] border border-slate-200 p-8 shadow-sm overflow-hidden relative group">
              <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:scale-110 transition-transform duration-700">
                <Trophy size={160} />
              </div>
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-8">Summary Metrics</h4>
              
              <div className="space-y-4">
                {[
                  { label: "Current Balance", value: totalMerits, color: "indigo" },
                  { label: "Points Earned", value: earnedMerits, color: "emerald" },
                  { label: "Deductions", value: deductedMerits, color: "rose" },
                ].map((s) => (
                  <div key={s.label} className="flex items-center justify-between p-5 bg-slate-50/50 rounded-2xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{s.label}</p>
                    <div className={`text-2xl font-black text-${s.color}-600`}>{s.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                 <div className="flex items-center gap-3 text-slate-400 group-hover:text-indigo-600 transition-colors">
                    <Info size={16} />
                    <p className="text-[11px] font-bold leading-tight">Standings are updated upon academic committee review.</p>
                 </div>
              </div>
            </motion.section>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentPointsPage;
