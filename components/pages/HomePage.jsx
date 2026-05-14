"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles, LayoutGrid, FileText } from "lucide-react";
import Features from "./Features";
import Partners from "./Partners";
import FAQ from "./FAQ";

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  return (
    <div className="relative min-h-screen bg-white overflow-x-hidden">
      {/* Strategic Hero Section */}
      <section className="relative pt-24 pb-20 lg:pt-32 lg:pb-32 overflow-hidden">
        {/* Advanced Background Accents */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-50/50 to-transparent pointer-events-none" />
        <div className="absolute top-[20%] left-[-5%] w-[400px] h-[400px] bg-indigo-100/30 rounded-full blur-[100px] pointer-events-none" />
        
        <motion.div 
          className="container mx-auto px-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <motion.div className="space-y-10" variants={itemVariants}>
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-slate-50 border border-slate-100">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">
                  Institutional Ecosystem v2.4
                </span>
              </div>

              <h1 className="text-5xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tight">
                Modernizing <br />
                <span className="bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  Institutional Governance
                </span>
              </h1>

              <p className="text-xl text-slate-600 max-w-xl leading-relaxed">
                A unified, high-fidelity platform engineered to streamline academic operations, 
                secure financial workflows, and empower the next generation of global learners.
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <motion.a
                  href="/login"
                  className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-200/50 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Access Dashboard
                  <LayoutGrid className="w-4 h-4 group-hover:rotate-12 transition-transform" />
                </motion.a>

                <motion.a
                  href="/about"
                  className="flex items-center gap-3 px-8 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Blueprint
                  <FileText className="w-4 h-4" />
                </motion.a>
              </div>

              <div className="pt-8 flex items-center gap-4 text-slate-400">
                <div className="flex -space-x-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 overflow-hidden">
                      <img src={`https://i.pravatar.cc/150?u=${i + 10}`} alt="User" />
                    </div>
                  ))}
                </div>
                <p className="text-sm font-medium">
                  Trusted by <span className="text-slate-900 font-bold">12,000+</span> Institutional Stakeholders
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="relative"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative z-10 bg-white p-4 rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-slate-100">
                <div className="relative overflow-hidden rounded-[2.5rem]">
                  <img
                    src="/illustration/Coding workshop.gif"
                    alt="Institutional Management Visualization"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Float Cards */}
              <motion.div 
                className="absolute -top-10 -left-10 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 flex items-center gap-4 z-20"
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <ArrowRight className="w-6 h-6 -rotate-45" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">Growth Rate</p>
                  <p className="font-black text-slate-900">+42.8%</p>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -bottom-10 -right-10 bg-white p-6 rounded-3xl shadow-xl border border-slate-50 flex items-center gap-4 z-20"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black tracking-widest text-slate-400 uppercase">System Uptime</p>
                  <p className="font-black text-slate-900">99.98%</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Primary Feature Architecture */}
      <Features />

      {/* Ecosystem Partners */}
      <Partners />

      {/* Strategic Queries */}
      <FAQ />
    </div>
  );
}
