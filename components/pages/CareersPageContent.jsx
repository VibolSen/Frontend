"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Calendar, ArrowRight, Sparkles, Search, Building2 } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { apiClient } from "@/lib/api";
import FullPageLoading from "@/components/ui/FullPageLoading";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6, staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 60 } },
};

export default function CareersPageContent() {
  const [jobPostings, setJobPostings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobPostings = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.get("/careers/job-postings");
        setJobPostings(data || []);
      } catch (err) {
        setError(err.message || "Failed to fetch job postings.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobPostings();
  }, []);

  if (isLoading) return <FullPageLoading message="Loading available positions..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-rose-200/50 shadow-2xl p-10 text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 bg-rose-50 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-7 h-7 text-rose-500" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 mb-2">Something Went Wrong</h2>
          <p className="text-slate-500 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-10 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-20 w-60 h-60 bg-blue-400/10 rounded-full blur-3xl" />
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
          className="relative z-10 max-w-6xl mx-auto px-6 py-20 text-center">
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full text-sm font-bold text-white mb-6 shadow-lg border border-white/20">
            <Briefcase className="w-4 h-4" />
            <span className="text-[10px] font-black tracking-widest uppercase">Career Opportunities</span>
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-white mb-6">Join Our Team</h1>
          <p className="text-lg md:text-xl text-indigo-100 max-w-3xl mx-auto leading-relaxed font-light">
            Explore exciting career opportunities and become a part of our mission to empower learners.
          </p>
        </motion.div>
      </section>

      {/* Job Listings */}
      <motion.div className="max-w-6xl mx-auto px-6 py-16" variants={containerVariants} initial="hidden" animate="visible">
        <motion.div variants={itemVariants} className="flex items-center justify-between mb-10">
          <div>
            <p className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-1">Open Positions</p>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {jobPostings.length} {jobPostings.length === 1 ? "Role" : "Roles"} Available
            </h2>
          </div>
        </motion.div>

        {jobPostings.length === 0 ? (
          <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-xl p-16 text-center">
            <div className="w-16 h-16 mx-auto mb-6 bg-indigo-50 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-indigo-400" />
            </div>
            <h3 className="text-xl font-black tracking-tight text-slate-900 mb-2">No Openings Right Now</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto">No job openings available at the moment. Please check back later!</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            <AnimatePresence>
              {jobPostings.map((job) => (
                <motion.div key={job.id} variants={itemVariants} whileHover={{ y: -3 }}
                  className="group bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-lg hover:shadow-2xl hover:shadow-indigo-100 hover:border-indigo-200/60 p-8 transition-all duration-500">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-5">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200/50 flex-shrink-0 group-hover:rotate-3 transition-transform duration-500">
                        <Briefcase className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-700 transition-colors">{job.title}</h2>
                        <div className="flex flex-wrap items-center gap-3 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium"><MapPin className="w-3.5 h-3.5" /> {job.location}</span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium"><Briefcase className="w-3.5 h-3.5" /> {job.employmentType}</span>
                          {job.salaryRange && <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium"><DollarSign className="w-3.5 h-3.5" /> {job.salaryRange}</span>}
                          <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium"><Calendar className="w-3.5 h-3.5" /> Apply by {job.applicationDeadline ? format(new Date(job.applicationDeadline), "PPP") : "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed mb-5">{job.description}</p>
                  <div className="grid md:grid-cols-2 gap-5 mb-6">
                    <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                      <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3">Requirements</h3>
                      <ul className="space-y-1.5">
                        {job.requirements?.map((req, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />{req}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-100">
                      <h3 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-3">Responsibilities</h3>
                      <ul className="space-y-1.5">
                        {job.responsibilities?.map((res, i) => (
                          <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />{res}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <Link href={`/careers/${job.id}`}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:-translate-y-0.5 active:scale-95 transition-all duration-300">
                    View Details & Apply <ArrowRight className="w-4 h-4" />
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </motion.div>
    </div>
  );
}
