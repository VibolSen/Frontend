"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { Briefcase, MapPin, DollarSign, Clock, Calendar, ArrowLeft, CheckCircle2, Send } from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import FullPageLoading from "@/components/ui/FullPageLoading";
import JobApplicationModal from "@/components/careers/JobApplicationModal";
import { apiClient } from "@/lib/api";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 60 } },
};

export default function JobDetailPage() {
  const { id } = useParams();
  const [jobPosting, setJobPosting] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchJobDetail = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await apiClient.get(`/careers/job-postings/${id}`);
        setJobPosting(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchJobDetail();
  }, [id]);

  if (isLoading) return <FullPageLoading message="Fetching job posting details..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-rose-200/50 shadow-2xl p-10 text-center max-w-md">
          <h2 className="text-xl font-black tracking-tight text-slate-900 mb-2">Error</h2>
          <p className="text-slate-500 text-sm mb-6">{error}</p>
          <Link href="/careers" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Job Postings
          </Link>
        </motion.div>
      </div>
    );
  }

  if (!jobPosting) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-2xl p-10 text-center max-w-md">
          <h2 className="text-xl font-black tracking-tight text-slate-900 mb-2">Job Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">The job you are looking for does not exist or is no longer available.</p>
          <Link href="/careers" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Job Postings
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div className="max-w-4xl mx-auto" initial="hidden" animate="visible" variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>
        {/* Back Button */}
        <motion.div variants={itemVariants}>
          <Link href="/careers" className="group inline-flex items-center gap-3 mb-6 px-4 py-2.5 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">Back to positions</span>
          </Link>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants} className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden">
          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 px-6 py-8">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10">
              <h1 className="text-xl md:text-2xl font-black tracking-tight text-white mb-3">{jobPosting.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-indigo-100 text-[11px] font-medium opacity-90">
                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {jobPosting.location}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" /> {jobPosting.employmentType}</span>
                {jobPosting.salaryRange && <span className="flex items-center gap-1.5"><DollarSign className="w-3.5 h-3.5" /> {jobPosting.salaryRange}</span>}
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Apply by: {jobPosting.applicationDeadline ? format(new Date(jobPosting.applicationDeadline), "PPP") : "N/A"}</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <p className="text-slate-600 leading-relaxed mb-6 text-sm">{jobPosting.description}</p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-xl p-5 border border-indigo-100/50">
                <h2 className="text-[9px] font-black tracking-widest uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" /> Requirements
                </h2>
                <ul className="space-y-1.5">
                  {jobPosting.requirements?.map((req, index) => (
                    <li key={index} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0" />{req}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-gradient-to-br from-blue-50/50 to-slate-50/50 rounded-xl p-5 border border-blue-100/50">
                <h2 className="text-[9px] font-black tracking-widest uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" /> Responsibilities
                </h2>
                <ul className="space-y-1.5">
                  {jobPosting.responsibilities?.map((res, index) => (
                    <li key={index} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 flex-shrink-0" />{res}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="text-center pt-4 border-t border-slate-100">
              <motion.button onClick={() => setIsModalOpen(true)} whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-blue-700 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-lg shadow-indigo-200/50 hover:shadow-xl hover:shadow-indigo-300/50 transition-all duration-300">
                <Send className="w-4 h-4" /> Apply Now
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>

      <JobApplicationModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} jobPostingId={jobPosting.id} jobTitle={jobPosting.title} />
    </div>
  );
}
