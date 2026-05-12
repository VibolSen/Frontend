'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, GraduationCap, Building2, FolderOpen } from 'lucide-react';
import FullPageLoading from '@/components/ui/FullPageLoading';
import { apiClient } from '@/lib/api';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, type: "spring", stiffness: 60 } },
};

export default function FacultyPage() {
  const { id } = useParams();
  const router = useRouter();
  const [faculty, setFaculty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      async function fetchFaculty() {
        try {
          const data = await apiClient.get(`/faculties/${id}`);
          setFaculty(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchFaculty();
    }
  }, [id]);

  if (loading) return <FullPageLoading message="Connecting to faculty database..." />;

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

  if (!faculty) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 flex items-center justify-center p-6">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/50 shadow-2xl p-10 text-center max-w-md">
          <div className="w-14 h-14 mx-auto mb-4 bg-indigo-50 rounded-2xl flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-indigo-400" />
          </div>
          <h2 className="text-xl font-black tracking-tight text-slate-900 mb-2">Faculty Not Found</h2>
          <p className="text-slate-500 text-sm">The faculty you are looking for does not exist.</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/30 to-blue-50/20 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div className="max-w-4xl mx-auto" initial="hidden" animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.1 } } }}>

        {/* Back Button */}
        <motion.div variants={itemVariants}>
          <button onClick={() => router.back()}
            className="group inline-flex items-center gap-3 mb-8 px-5 py-3 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-200 transition-all duration-300">
            <div className="w-8 h-8 bg-indigo-50 rounded-xl flex items-center justify-center group-hover:bg-indigo-100 transition-colors">
              <ArrowLeft className="w-4 h-4 text-indigo-600 group-hover:-translate-x-0.5 transition-transform" />
            </div>
            <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">Go Back</span>
          </button>
        </motion.div>

        {/* Main Card */}
        <motion.div variants={itemVariants}
          className="bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200/60 shadow-2xl overflow-hidden">

          {/* Header Banner */}
          <div className="relative bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 px-8 py-10">
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
            <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center gap-5">
              <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/20 shadow-lg">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase text-indigo-200 mb-1">Faculty</p>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">{faculty.name}</h1>
              </div>
            </div>
          </div>

          {/* Departments */}
          <div className="p-8">
            <div className="bg-gradient-to-br from-indigo-50/50 to-blue-50/50 rounded-2xl p-6 border border-indigo-100/50">
              <h2 className="text-[10px] font-black tracking-widest uppercase text-slate-400 mb-5 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-indigo-500" /> Departments
              </h2>
              {faculty.departments.length > 0 ? (
                <div className="grid sm:grid-cols-2 gap-3">
                  {faculty.departments.map((dept, index) => (
                    <motion.div key={dept.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ y: -2 }}
                      className="flex items-center gap-3 px-5 py-4 bg-white/80 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm hover:shadow-lg hover:border-indigo-200 hover:shadow-indigo-100 transition-all duration-300">
                      <div className="w-9 h-9 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center shadow-md flex-shrink-0">
                        <FolderOpen className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">{dept.name}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-sm font-medium">No departments found for this faculty.</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}