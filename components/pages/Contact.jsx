"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  Phone,
  MapPin,
  User,
  BookText,
  MessageSquare,
  Facebook,
  Github,
  Youtube,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    alert("Institutional Query Received. Our administration will contact you shortly.");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { duration: 0.8, staggerChildren: 0.15 },
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

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative Brand Accents */}
      <div className="absolute top-0 right-0 w-1/3 h-1/3 bg-gradient-to-br from-indigo-100/40 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-1/3 h-1/3 bg-gradient-to-tr from-blue-100/40 to-transparent blur-3xl pointer-events-none" />

      <motion.div
        className="max-w-6xl mx-auto px-6 py-12 relative z-10"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header Section */}
        <motion.section className="text-center mb-12" variants={itemVariants}>
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 border border-indigo-100 mb-6">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="text-[10px] font-black tracking-widest uppercase text-indigo-600">
              Institutional Support
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
            Connect with our <br />
            <span className="bg-gradient-to-r from-indigo-600 to-blue-700 bg-clip-text text-transparent">
              Global Administration
            </span>
          </h1>
          <p className="text-slate-600 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Have an inquiry regarding enrollment, partnerships, or technical support? 
            Our dedicated team is ready to assist you.
          </p>
        </motion.section>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto">
          {/* Contact Details Side */}
          <motion.div className="lg:col-span-5 space-y-6" variants={itemVariants}>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-[10px] font-black tracking-[0.3em] uppercase text-indigo-600 mb-8">
                Institutional Contact
              </h2>
              
              <div className="space-y-6">
                <div className="flex gap-5 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-[11px] tracking-widest uppercase mb-1">Location</h3>
                    <p className="text-slate-600 text-xs leading-relaxed">
                      Russian Federation Blvd (110)<br />
                      Phnom Penh, Cambodia
                    </p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-[11px] tracking-widest uppercase mb-1">Email Queries</h3>
                    <p className="text-slate-600 text-xs">vibolsen2002@gmail.com</p>
                  </div>
                </div>

                <div className="flex gap-5 group">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                    <Phone className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 text-[11px] tracking-widest uppercase mb-1">Hotline</h3>
                    <p className="text-slate-600 text-xs">(+855) 96 684 5795</p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-100">
                <h3 className="text-[9px] font-black tracking-[0.4em] uppercase text-slate-400 mb-4">
                  Official Channels
                </h3>
                <div className="flex gap-3">
                  {[Facebook, Github, Youtube].map((Icon, i) => (
                    <motion.a 
                      key={i} 
                      href="#" 
                      className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
                      whileHover={{ y: -2 }}
                    >
                      <Icon className="w-3.5 h-4" />
                    </motion.a>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-white p-3 rounded-2xl shadow-sm border border-slate-100 overflow-hidden h-[250px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3908.784220372338!2d104.89069731526113!3d11.56734334731053!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3109519fe4077d69%3A0x0!2sRoyal%20University%20of%20Phnom%20Penh!5e0!3m2!1sen!2skh!4v1672345678901!5m2!1sen!2skh"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                className="rounded-xl"
                title="Campus Location"
              ></iframe>
            </div>
          </motion.div>

          {/* Contact Form Side */}
          <motion.div className="lg:col-span-7" variants={itemVariants}>
            <div className="bg-white p-8 md:p-10 rounded-2xl shadow-xl shadow-indigo-100/20 border border-slate-100">
              <h2 className="text-xl font-black text-slate-900 mb-6 tracking-tight">
                Submit Formal Inquiry
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black tracking-widest uppercase text-slate-400 ml-2">Full Name</label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="e.g. John Smith"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all text-xs text-slate-900 font-medium"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black tracking-widest uppercase text-slate-400 ml-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="john@institution.edu"
                        required
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all text-xs text-slate-900 font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black tracking-widest uppercase text-slate-400 ml-2">Subject Matter</label>
                  <div className="relative group">
                    <BookText className="absolute left-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="e.g. Academic Enrollment Query"
                      required
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all text-xs text-slate-900 font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[9px] font-black tracking-widest uppercase text-slate-400 ml-2">Detailed Message</label>
                  <div className="relative group">
                    <MessageSquare className="absolute left-4 top-5 w-3.5 h-3.5 text-slate-300 group-focus-within:text-indigo-600 transition-colors" />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Please provide comprehensive details regarding your inquiry..."
                      rows={5}
                      required
                      className="w-full pl-10 pr-4 py-4 bg-slate-50 border border-transparent rounded-xl focus:bg-white focus:border-indigo-600 outline-none transition-all text-xs text-slate-900 font-medium resize-none"
                    />
                  </div>
                </div>

                <motion.button
                  type="submit"
                  className="w-full bg-gradient-to-r from-indigo-600 to-blue-700 text-white px-6 py-4 rounded-xl font-black text-[10px] uppercase tracking-[0.2em] hover:shadow-xl hover:shadow-indigo-200/50 transition-all duration-300 flex items-center justify-center gap-2 mt-4 group"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  Dispatch Inquiry
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </form>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default ContactUs;