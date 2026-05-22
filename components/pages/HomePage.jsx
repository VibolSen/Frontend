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
          className="max-w-6xl mx-auto px-6 relative z-10"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div className="space-y-8" variants={itemVariants}>
              <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-slate-500">
                  Institutional Ecosystem v2.4
                </span>
              </div>

              <h1 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight tracking-tight">
                Modernizing <br />
                <span className="bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">
                  Institutional Governance
                </span>
              </h1>

              <p className="text-base text-slate-600 max-w-lg leading-relaxed">
                A unified, high-fidelity platform engineered to streamline academic operations, 
                secure financial workflows, and empower the next generation of global learners.
              </p>

              <div className="flex flex-wrap gap-3 pt-2">
                <motion.a
                  href="/login"
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-indigo-200/50 group"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Access Dashboard
                  <LayoutGrid className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                </motion.a>

                <motion.a
                  href="/about"
                  className="flex items-center gap-2 px-6 py-3 bg-white text-slate-900 border border-slate-200 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  View Blueprint
                  <FileText className="w-3.5 h-3.5" />
                </motion.a>
              </div>


            </motion.div>

            <motion.div 
              className="relative hidden lg:block"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="relative z-10 bg-white p-3 rounded-[2rem] shadow-2xl shadow-indigo-100/50 border border-slate-100">
                <div className="relative overflow-hidden rounded-[1.5rem]">
                  <img
                    src="/illustration/Coding workshop.gif"
                    alt="Institutional Management Visualization"
                    className="w-full h-auto"
                  />
                </div>
              </div>

              {/* Float Cards */}
              <motion.div 
                className="absolute -top-6 -left-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3 z-20"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <ArrowRight className="w-5 h-5 -rotate-45" />
                </div>
                <div>
                  <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">Growth Rate</p>
                  <p className="text-sm font-black text-slate-900">+42.8%</p>
                </div>
              </motion.div>

              <motion.div 
                className="absolute -bottom-6 -right-6 bg-white p-4 rounded-2xl shadow-xl border border-slate-50 flex items-center gap-3 z-20"
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[9px] font-black tracking-widest text-slate-400 uppercase">System Uptime</p>
                  <p className="text-sm font-black text-slate-900">99.98%</p>
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
