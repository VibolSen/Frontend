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
        className="container mx-auto px-6 py-20 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Institutional Hero Section */}
        <motion.section className="max-w-4xl mb-32" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-8">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-black tracking-widest uppercase text-indigo-600">
              Our Foundational Mission
            </span>
          </div>
          <h1 className="text-6xl md:text-8xl font-black text-slate-900 mb-8 tracking-tight leading-[0.9]">
            Modernizing <br />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Academic Governance
            </span>
          </h1>
          <p className="text-slate-600 text-xl md:text-2xl leading-relaxed max-w-3xl">
            EduSys was engineered as a response to the administrative fragmentation in modern education. 
            We bridge the gap between traditional management and digital excellence through high-fidelity systems integration.
          </p>
        </motion.section>

        {/* Vision Pillars Grid */}
        <motion.section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32" variants={itemVariants}>
          {pillars.map((pillar, i) => (
            <div key={i} className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100 group hover:bg-white hover:shadow-2xl hover:shadow-indigo-100/30 transition-all duration-500">
              <div className="mb-6 p-4 bg-white rounded-2xl w-fit shadow-sm group-hover:scale-110 transition-transform duration-300">
                {pillar.icon}
              </div>
              <h3 className="text-sm font-black tracking-widest uppercase text-slate-900 mb-4">{pillar.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{pillar.description}</p>
            </div>
          ))}
        </motion.section>

        {/* Architect Profile Section */}
        <motion.section className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center mb-32" variants={itemVariants}>
          <div className="relative group">
            <div className="absolute inset-0 bg-indigo-600 rounded-[3rem] rotate-3 group-hover:rotate-6 transition-transform duration-500" />
            <div className="relative aspect-square overflow-hidden rounded-[3rem] border-8 border-white shadow-2xl">
              <Image
                src="/profile.jpg"
                alt="Architect"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
            </div>
            {/* Float Accents */}
            <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-3xl shadow-xl flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[10px] font-black tracking-widest uppercase text-slate-400">Lead Architect</p>
                <p className="font-black text-slate-900">Mr. Sen Vibol</p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <h2 className="text-sm font-black tracking-[0.3em] uppercase text-indigo-600">The Architect's Vision</h2>
            <h3 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight">
              Designing for the <br />
              <span className="text-indigo-600">Future of Learning.</span>
            </h3>
            <p className="text-slate-600 leading-relaxed text-lg">
              "My journey with EduSys began with a single objective: to eliminate the operational friction that slows down academic progress. 
              By focusing on high-density architecture and localized financial standards like Bakong, 
              we've created a platform that doesn't just manage data—it empowers institutions."
            </p>
            <div className="flex gap-4 pt-4">
              <a href="https://github.com/VibolSen" className="w-12 h-12 rounded-2xl bg-slate-900 text-white flex items-center justify-center hover:scale-110 transition-transform">
                <Github size={20} />
              </a>
              <a href="https://t.me/vibolsen" className="w-12 h-12 rounded-2xl bg-blue-500 text-white flex items-center justify-center hover:scale-110 transition-transform">
                <Send size={20} />
              </a>
              <a href="https://www.facebook.com/vibolsen02" className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center hover:scale-110 transition-transform">
                <Facebook size={20} />
              </a>
            </div>
          </div>
        </motion.section>

        {/* Development Trajectory Section */}
        <motion.section className="py-20 bg-slate-900 rounded-[4rem] px-10 md:px-20 text-white relative overflow-hidden" variants={itemVariants}>
          <div className="absolute top-0 right-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-indigo-500 to-transparent" />
          </div>
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-4">
              <h4 className="text-xs font-black tracking-[0.4em] uppercase text-indigo-400 mb-6">Strategic Trajectory</h4>
              <h2 className="text-4xl font-black mb-8 leading-tight">Project <br />Milestones</h2>
              <div className="flex gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600" />
                <div className="w-2 h-2 rounded-full bg-indigo-800" />
                <div className="w-2 h-2 rounded-full bg-indigo-900" />
              </div>
            </div>
            
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-indigo-400 text-xs font-black mb-2 tracking-widest uppercase">Phase 01 — Q1 2026</p>
                <h5 className="font-black text-xl mb-4">Core Engine Launch</h5>
                <p className="text-slate-400 text-sm leading-relaxed">Implementation of the high-density Admin Command Center and RBAC firewall logic.</p>
              </div>
              <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <p className="text-indigo-400 text-xs font-black mb-2 tracking-widest uppercase">Phase 02 — Q2 2026</p>
                <h5 className="font-black text-xl mb-4">Financial Pillar</h5>
                <p className="text-slate-400 text-sm leading-relaxed">Integration of national Bakong KHQR gateways and automated tuition billing systems.</p>
              </div>
            </div>
          </div>
        </motion.section>
      </motion.div>
    </div>
  );
};

export default AboutUs;
