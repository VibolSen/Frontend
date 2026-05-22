"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import {
  Facebook,
  Send,
  Github,
  Target,
  Sparkles,
  School,
  GraduationCap,
  BookOpen,
  Lightbulb,
  ShieldCheck,
  Zap,
  Globe,
  Award,
} from "lucide-react";

const AboutUs = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.2 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  };

  const pillars = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-indigo-600" />,
      title: "Integrity & Security",
      description: "Implementing rigorous RBAC and encryption standards to safeguard sensitive institutional data.",
    },
    {
      icon: <Zap className="w-6 h-6 text-blue-600" />,
      title: "Agile Innovation",
      description: "A commitment to iterative development, ensuring the platform evolves with modern academic needs.",
    },
    {
      icon: <Globe className="w-6 h-6 text-indigo-600" />,
      title: "Global Standards",
      description: "Adopting enterprise-grade technologies like Next.js and Bakong for world-class performance.",
    },
  ];

  return (
    <div className="min-h-screen bg-white relative overflow-hidden">
      {/* Institutional Background Texture */}
      <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none select-none z-0">
        <div className="absolute top-20 left-20 transform -rotate-12">
          <School size={400} />
        </div>
      </div>

      <motion.div
        className="max-w-6xl mx-auto px-6 py-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Institutional Hero Section */}
        <motion.section className="max-w-3xl mb-16" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600">
              Our Foundational Mission
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
            Modernizing <br />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Academic Governance
            </span>
          </h1>
          <p className="text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl">
            EduSys was engineered as a response to the administrative fragmentation in modern education. 
            We bridge the gap between traditional management and digital excellence through high-fidelity systems integration.
          </p>
        </motion.section>

        {/* Vision Pillars Grid */}
        <motion.section className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20" variants={itemVariants}>
          {pillars.map((pillar, i) => (
            <div key={i} className="p-8 bg-slate-50 rounded-2xl border border-slate-100 group hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500">
              <div className="mb-5 p-3.5 bg-white rounded-xl w-fit shadow-sm group-hover:scale-110 transition-transform duration-300">
                {pillar.icon}
              </div>
              <h3 className="text-xs font-black tracking-widest uppercase text-slate-900 mb-3">{pillar.title}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </motion.section>

        {/* Architect Profile Section */}
        <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-24" variants={itemVariants}>
          <div className="relative group max-w-md mx-auto lg:mx-0">
            <div className="absolute inset-0 bg-indigo-600 rounded-3xl rotate-2 group-hover:rotate-3 transition-transform duration-500" />
            <div className="relative aspect-square overflow-hidden rounded-3xl border-4 border-white shadow-2xl">
              <Image
                src="/profile.jpg"
                alt="Architect"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            {/* Float Accents */}
            <div className="absolute -bottom-4 -right-4 bg-white p-4 rounded-2xl shadow-xl flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[9px] font-black tracking-widest uppercase text-slate-400">Lead Architect</p>
                <p className="text-sm font-black text-slate-900">Mr. Sen Vibol</p>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-600">The Architect's Vision</h2>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
              Designing for the <br />
              <span className="text-indigo-600">Future of Learning.</span>
            </h3>
            <p className="text-slate-600 leading-relaxed text-base">
              "My journey with EduSys began with a single objective: to eliminate the operational friction that slows down academic progress. 
              By focusing on high-density architecture and localized financial standards like Bakong, 
              we've created a platform that doesn't just manage data—it empowers institutions."
            </p>
            <div className="flex gap-3 pt-2">
              <a href="https://github.com/VibolSen" className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center hover:scale-110 transition-transform">
                <Github size={18} />
              </a>
              <a href="https://t.me/vibolsen" className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                <Send size={18} />
              </a>
              <a href="https://www.facebook.com/vibolsen02" className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-transform">
                <Facebook size={18} />
              </a>
            </div>
          </div>
        </motion.section>

        {/* Development Trajectory Section */}
        <motion.section className="py-16 bg-slate-900 rounded-[2rem] px-8 md:px-16 text-white relative overflow-hidden" variants={itemVariants}>
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500 to-transparent" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-4">
              <h4 className="text-[10px] font-black tracking-[0.4em] uppercase text-indigo-400 mb-4">Strategic Trajectory</h4>
              <h2 className="text-2xl font-black mb-6 leading-tight">Project <br />Milestones</h2>
              <div className="flex gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-800" />
                <div className="w-1.5 h-1.5 rounded-full bg-indigo-900" />
              </div>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-indigo-400 text-[9px] font-black mb-1.5 tracking-widest uppercase">Phase 01 — Q1 2026</p>
                <h5 className="font-black text-lg mb-3">Core Engine Launch</h5>
                <p className="text-slate-400 text-xs leading-relaxed">Implementation of the high-density Admin Command Center and RBAC firewall logic.</p>
              </div>
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-indigo-400 text-[9px] font-black mb-1.5 tracking-widest uppercase">Phase 02 — Q2 2026</p>
                <h5 className="font-black text-lg mb-3">Financial Pillar</h5>
                <p className="text-slate-400 text-xs leading-relaxed">Integration of national Bakong KHQR gateways and automated tuition billing systems.</p>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default AboutUs;
