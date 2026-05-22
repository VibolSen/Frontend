"use client";

import { HelpCircle, ChevronRight, Sparkles } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FAQ() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqs = [
    {
      question: "How secure is the Bakong KHQR integration?",
      answer:
        "The system utilizes National Bank of Cambodia's encrypted API standards. All transactions are processed in real-time with atomic state updates, ensuring high-fidelity financial logging and zero data loss.",
    },
    {
      question: "Can I manage multiple faculty hierarchies?",
      answer:
        "Yes. EduSys is built on a high-density institutional architecture that allows for recursive nesting of Faculties, Departments, Batches, and specialized Student Groups.",
    },
    {
      question: "Does the platform support Role-Based Access Control?",
      answer:
        "Absolutely. The platform features a strict RBAC firewall logic that quarantines data and functionality across 7 specific operational ranks (Admin, Teacher, Student, Finance, HR, and more).",
    },
    {
      question: "How does the Intelligence Command Center work?",
      answer:
        "It aggregates real-time academic and financial metrics into high-density dashboards, utilizing predictive algorithms to identify at-risk students based on GPA trajectories and attendance patterns.",
    },
    {
      question: "Is the system optimized for mobile stakeholders?",
      answer:
        "While the Administrative Command Center is optimized for desktop high-density data, the Student and Teacher portals are fully responsive and designed for seamless use on any mobile device.",
    },
  ];

  return (
    <section className="py-16 bg-slate-50 relative overflow-hidden">
      <div className="max-w-4xl mx-auto px-6 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-600">
              Institutional Queries
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight">
            Strategic <span className="bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">Operations</span> FAQ
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Comprehensive answers to the technical and operational dimensions of the EduSys governance platform.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`group rounded-2xl border transition-all duration-300 overflow-hidden
                ${
                  openFaqIndex === index
                    ? "bg-white border-indigo-600 shadow-2xl shadow-indigo-100/50"
                    : "bg-white/50 border-slate-200 hover:border-indigo-300"
                }`}
            >
              <button
                onClick={() => toggleFaq(index)}
                className="flex justify-between items-center w-full text-left p-6 group"
              >
                <span className={`text-base font-black tracking-tight transition-colors duration-300
                  ${openFaqIndex === index ? "text-indigo-600" : "text-slate-900"}`}>
                  {faq.question}
                </span>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-300
                  ${openFaqIndex === index ? "bg-indigo-600 text-white rotate-90" : "bg-slate-100 text-slate-400"}`}>
                  <ChevronRight size={16} />
                </div>
              </button>

              <AnimatePresence>
                {openFaqIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-slate-500 leading-relaxed text-xs max-w-3xl">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
