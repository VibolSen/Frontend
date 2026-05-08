"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Award, Building2, Calendar, ShieldCheck, Printer, ArrowLeft, GraduationCap, BookOpen, User } from "lucide-react";
import { apiClient } from "@/lib/api";
import { motion } from "framer-motion";

export default function CertificateDetailView() {
  const { id } = useParams();
  const router = useRouter();
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    const fetchCertificate = async () => {
      try {
        const data = await apiClient.get(`/certificates/${id}`);
        setCertificate(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchCertificate();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <div className="h-10 w-10 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-[11px] font-black uppercase tracking-widest text-slate-400">
          Loading Certificate...
        </p>
      </div>
    );
  }

  if (error || !certificate) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-slate-50">
        <Award size={40} className="text-slate-300" />
        <p className="text-slate-500 font-bold">
          {error ? `Error: ${error}` : "Certificate not found."}
        </p>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 transition-colors"
        >
          Go Back
        </button>
      </div>
    );
  }

  const issueDate = new Date(certificate.issueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const expiryDate = certificate.expiryDate
    ? new Date(certificate.expiryDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const courseName = certificate.course?.name || "Academic Program";
  const recipientName = certificate.recipient || "—";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-4">
      {/* Action Bar */}
      <div className="w-full max-w-5xl flex items-center justify-between mb-8 print:hidden">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all"
        >
          <ArrowLeft size={15} />
          Back
        </button>

        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Printer size={15} />
          Print / Save PDF
        </button>
      </div>

      {/* Certificate Card — A4 proportions */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative bg-white w-full max-w-5xl rounded-3xl shadow-2xl shadow-slate-300/40 overflow-hidden border border-slate-200 print:shadow-none print:rounded-none"
        style={{ aspectRatio: "1.414 / 1" }}
      >
        {/* ── Decorative top bar ── */}
        <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600" />

        {/* ── Left accent stripe ── */}
        <div className="absolute inset-y-0 left-0 w-1.5 bg-gradient-to-b from-indigo-600 via-blue-400 to-indigo-600" />

        {/* ── Watermark ── */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none">
          <GraduationCap
            size={360}
            className="text-indigo-50 opacity-60"
            strokeWidth={0.5}
          />
        </div>

        {/* ── Corner ornaments ── */}
        <div className="absolute top-6 right-6 w-20 h-20 rounded-full border-4 border-indigo-100 opacity-30" />
        <div className="absolute bottom-6 left-6 w-14 h-14 rounded-full border-4 border-indigo-100 opacity-30" />

        {/* ── Main content ── */}
        <div className="relative z-10 h-full flex flex-col items-center justify-between p-10 md:p-14 text-center">

          {/* Institution Header */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-14 flex items-center justify-center">
                <img src="/logo/STEP.png" alt="STEP Academy Logo" className="h-full w-auto object-contain drop-shadow-sm" />
              </div>
              <div className="text-left">
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-indigo-600">
                  STEP Academy
                </p>
                <p className="text-[8px] font-bold uppercase tracking-widest text-slate-400">
                  Department of Academic Affairs
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Title */}
          <div className="space-y-2">
            <div className="flex items-center justify-center gap-3 mb-1">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-indigo-300" />
              <Award size={22} className="text-indigo-500" />
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-indigo-300" />
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">
              Certificate of{" "}
              <span className="text-indigo-600">{certificate.title || "Completion"}</span>
            </h1>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest">
              This is to certify that
            </p>
          </div>

          {/* Recipient */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest">
              <User size={10} />
              Recipient
            </div>
            <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
              {recipientName}
            </h2>
            <p className="text-sm text-slate-500 font-medium">
              has successfully completed the requirements for
            </p>
          </div>

          {/* Course */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 text-slate-400 text-[9px] font-black uppercase tracking-widest">
              <BookOpen size={10} />
              Course
            </div>
            <h3 className="text-lg md:text-2xl font-black text-indigo-600 tracking-tight px-6">
              {courseName}
            </h3>
          </div>

          {/* Footer: dates + cert ID */}
          <div className="w-full flex items-end justify-between text-left">
            {/* Dates */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar size={13} className="text-indigo-400" />
                <div>
                  <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Issue Date</p>
                  <p className="text-[12px] font-black text-slate-700">{issueDate}</p>
                </div>
              </div>
              {expiryDate && (
                <div className="flex items-center gap-2 text-slate-500">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <div>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-400">Valid Until</p>
                    <p className="text-[12px] font-black text-slate-700">{expiryDate}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Cert ID */}
            <div className="text-center">
              <div className="h-10 w-10 bg-indigo-50 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-1 shadow-sm">
                <ShieldCheck size={18} className="text-indigo-500" />
              </div>
              <p className="text-[7px] font-black uppercase tracking-widest text-slate-300">Certificate ID</p>
              <p className="text-[9px] font-mono text-slate-400">{certificate.id?.slice(-12)?.toUpperCase() || "N/A"}</p>
            </div>

            {/* Signature */}
            <div className="text-right space-y-1">
              <div className="border-b-2 border-slate-300 w-32 ml-auto" />
              <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                Authorized Signature
              </p>
              <p className="text-[8px] text-slate-300 font-medium">
                STEP Academy Registrar
              </p>
            </div>
          </div>

        </div>

        {/* ── Decorative bottom bar ── */}
        <div className="absolute inset-x-0 bottom-0 h-1.5 bg-gradient-to-r from-indigo-600 via-blue-500 to-indigo-600" />
      </motion.div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          [class*="shadow"] { box-shadow: none !important; }
        }
      `}</style>
    </div>
  );
}
