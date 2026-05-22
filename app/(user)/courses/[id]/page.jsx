"use client";
import React, { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, BookOpen, Users, Building2 } from "lucide-react";
import Link from "next/link";
import FullPageLoading from "@/components/ui/FullPageLoading";
import { apiClient } from "@/lib/api";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 60 } },
};

export default function CourseDetailPage({ params }) {
  const { id } = use(params);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchCourse() {
      try {
        setLoading(true);
        const data = await apiClient.get(`/courses?id=${id}`);
        setCourse(data);
      } catch (err) {
        setError(err.message);
        console.error("Error fetching course:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCourse();
  }, [id]);

  if (loading) return <FullPageLoading message="Retrieving course details..." />;

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-rose-200/50 shadow-2xl p-10 text-center max-w-md">
          <h2 className="text-xl font-black tracking-tight text-slate-900 mb-2">Error</h2>
          <p className="text-rose-500 text-sm">{error}</p>
        </motion.div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-2xl p-10 text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <BookOpen className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 mb-2">Course Not Found</h2>
          <p className="text-slate-500 text-sm">The course you are looking for does not exist.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 py-8 px-4 sm:px-6 lg:px-8">
      <motion.div className="max-w-4xl mx-auto" initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>

        {/* Back Button */}
        <motion.div variants={itemVariants}>
          <button onClick={() => router.back()}
            className="group inline-flex items-center gap-3 mb-6 px-4 py-2.5 bg-white/80 backdrop-blur-md rounded-xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
            <div className="w-7 h-7 bg-indigo-50 rounded-lg flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <ArrowLeft className="w-3.5 h-3.5 text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[9px] font-black tracking-widest uppercase text-slate-500">Go Back</span>
          </button>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden">

          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 px-6 py-8">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            <div className="absolute top-4 right-4 w-24 h-24 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/20 shadow-lg">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-black tracking-tight text-white">{course.name}</h1>
                <p className="text-indigo-200 text-[10px] font-mono mt-0.5 opacity-80">ID: {course.id}</p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-4">
            {/* Lead Instructor */}
            {course.leadBy && (
              <motion.div variants={itemVariants}
                className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-xl p-5 border border-indigo-100/50">
                <h2 className="text-[9px] font-black tracking-widest uppercase text-slate-400 mb-2 flex items-center gap-2">
                  <Users className="w-3.5 h-3.5 text-indigo-500" /> Lead Instructor
                </h2>
                <p className="text-base font-bold text-slate-900">{course.leadBy.firstName} {course.leadBy.lastName}</p>
              </motion.div>
            )}

            {/* Departments */}
            {course.courseDepartments?.length > 0 && (
              <motion.div variants={itemVariants}
                className="bg-gradient-to-br from-blue-50/50 to-slate-50/50 rounded-xl p-5 border border-blue-100/50">
                <h2 className="text-[9px] font-black tracking-widest uppercase text-slate-400 mb-3 flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-blue-500" /> Departments
                </h2>
                <div className="flex flex-wrap gap-2">
                  {course.courseDepartments.map((cd) => (
                    <span key={cd.department.id}
                      className="inline-flex items-center px-3 py-1.5 bg-white/80 backdrop-blur-sm rounded-lg border border-slate-200/60 text-xs font-semibold text-slate-700 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all duration-300">
                      {cd.department.name}
                    </span>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
