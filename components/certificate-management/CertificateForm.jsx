"use client";
import React, { useState, useEffect } from "react";
import { apiClient } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, User, BookOpen, Calendar, Search } from "lucide-react";

// Helper for premium input layout
const FieldLayout = ({ label, icon, children, error }) => (
  <div className="space-y-1.5 focus-within:text-blue-600 transition-colors">
    <label className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.15em] text-slate-500 mb-2">
      {icon}
      {label}
    </label>
    <div className="relative group">
      {children}
    </div>
    <AnimatePresence>
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
          className="text-[10px] font-bold text-rose-500 mt-1 uppercase tracking-widest pl-1"
        >
          ! {error}
        </motion.p>
      )}
    </AnimatePresence>
  </div>
);

const CertificateForm = ({ initialData = {}, onSubmit, onCancel, isLoading = false }) => {
  const [formData, setFormData] = useState({
    recipient: "", studentId: "", course: "", issueDate: "", expiryDate: "",
  });
  const [errors, setErrors] = useState({});
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const data = await apiClient.get("/courses");
        setCourses(data || []);
      } catch (error) { console.error("Failed to fetch courses:", error); }
    };
    const fetchStudents = async () => {
      try {
        const data = await apiClient.get("/users?role=STUDENT"); 
        setStudents(data || []);
      } catch (error) { console.error("Failed to fetch students:", error); }
    };
    fetchCourses();
    fetchStudents();
  }, []);

  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0) {
      setFormData({
        recipient: initialData.recipient || "",
        studentId: initialData.studentId || "",
        course: initialData.course || "",
        issueDate: initialData.issueDate ? new Date(initialData.issueDate).toISOString().split('T')[0] : "",
        expiryDate: initialData.expiryDate ? new Date(initialData.expiryDate).toISOString().split('T')[0] : "",
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
    
    if (name === "recipient") {
      if (value.trim()) {
         const filtered = students.filter(student => 
            `${student.firstName} ${student.lastName}`.toLowerCase().includes(value.toLowerCase()) ||
            (student.email && student.email.toLowerCase().includes(value.toLowerCase()))
         );
         setFilteredStudents(filtered);
         setShowStudentDropdown(true);
      } else {
         setShowStudentDropdown(false);
      }
      if (formData.studentId) {
          setFormData(prev => ({ ...prev, studentId: "" }));
      }
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleStudentSelect = (student) => {
     setFormData(prev => ({
        ...prev, recipient: `${student.firstName} ${student.lastName}`, studentId: student.id
     }));
     setShowStudentDropdown(false);
     setErrors(prev => ({ ...prev, recipient: "" }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.recipient.trim()) newErrors.recipient = "Identity mapping required";
    if (!formData.course) newErrors.course = "Program context required";
    if (!formData.issueDate) newErrors.issueDate = "Issuance timestamp required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col h-full bg-white">
      <div className="px-8 py-8 grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-50/30">
        
        {/* Recipient Search / Match */}
        <div className="relative md:col-span-2">
          <FieldLayout label="Recipient Identity" icon={<User size={12} strokeWidth={3} />} error={errors.recipient}>
            {formData.studentId ? (
              <motion.div initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between p-4 bg-emerald-50/50 border border-emerald-200/60 rounded-xl shadow-sm">
                <div>
                  <div className="font-black text-slate-800 tracking-tight text-lg">{formData.recipient}</div>
                  <div className="mt-1 text-[9px] text-emerald-700 flex items-center gap-1 font-black uppercase tracking-widest">
                    <CheckCircle2 size={12} strokeWidth={3} /> Verified Internal Registry ID: {formData.studentId}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, recipient: "", studentId: "" }))}
                  className="px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 bg-white border border-slate-200 hover:border-rose-200 hover:bg-rose-50 rounded-lg transition-all"
                >
                  Unlink
                </button>
              </motion.div>
            ) : (
              <>
                <div className="relative">
                   <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
                     <Search size={16} strokeWidth={2.5}/>
                   </div>
                   <input
                     id="recipient" name="recipient" value={formData.recipient} onChange={handleChange} autoComplete="off"
                     placeholder="Search internal registry or type external name..."
                     className={`w-full pl-12 pr-4 py-3.5 bg-white border rounded-xl text-sm font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-medium tracking-tight ${
                       errors.recipient ? "border-rose-400 ring-4 ring-rose-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                     } transition-all outline-none`}
                   />
                </div>
                
                {showStudentDropdown && filteredStudents.length > 0 && (
                  <ul className="absolute z-20 w-full bg-white border border-slate-200 rounded-xl mt-2 max-h-56 overflow-y-auto shadow-2xl shadow-blue-900/10 divide-y divide-slate-50">
                     {filteredStudents.map((student, i) => (
                        <motion.li 
                          initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.02 }}
                          key={student.id} 
                          className="px-5 py-4 hover:bg-blue-50/50 cursor-pointer group transition-colors"
                          onClick={() => handleStudentSelect(student)}
                        >
                           <div className="font-extrabold text-slate-800 tracking-tight group-hover:text-blue-700">{student.firstName} {student.lastName}</div>
                           <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{student.email}</div>
                        </motion.li>
                     ))}
                  </ul>
                )}
              </>
            )}
          </FieldLayout>
        </div>

        {/* Academic Program */}
        <div className="md:col-span-2">
           <FieldLayout label="Academic Program" icon={<BookOpen size={12} strokeWidth={3} />} error={errors.course}>
              <select
                id="course" name="course" value={formData.course} onChange={handleChange}
                className={`w-full px-4 py-3.5 bg-white border rounded-xl text-sm font-bold text-slate-800 ${
                  errors.course ? "border-rose-400 ring-4 ring-rose-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                } transition-all outline-none appearance-none cursor-pointer`}
              >
                <option value="" disabled className="text-slate-400 font-medium">Select target program context...</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>{course.name}</option>
                ))}
              </select>
              {/* Custom dropdown arrow */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-blue-500">
                 <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
              </div>
           </FieldLayout>
        </div>

        {/* Action Timestamps */}
        <FieldLayout label="Issuance Timestamp" icon={<Calendar size={12} strokeWidth={3}/>} error={errors.issueDate}>
           <input
             type="date" id="issueDate" name="issueDate" value={formData.issueDate} onChange={handleChange}
             className={`w-full px-4 py-3.5 bg-white border rounded-xl text-sm font-bold text-slate-800 ${
               errors.issueDate ? "border-rose-400 ring-4 ring-rose-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
             } transition-all outline-none`}
           />
        </FieldLayout>
        <FieldLayout label="Expiry Threshold (Optional)" icon={<Calendar size={12} strokeWidth={3}/>} error={errors.expiryDate}>
           <input
             type="date" id="expiryDate" name="expiryDate" value={formData.expiryDate} onChange={handleChange}
             className={`w-full px-4 py-3.5 bg-white border rounded-xl text-sm font-bold text-slate-800 ${
               errors.expiryDate ? "border-rose-400 ring-4 ring-rose-500/10" : "border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
             } transition-all outline-none`}
           />
        </FieldLayout>

      </div>

      <div className="px-8 py-6 bg-white border-t border-slate-100 flex justify-end items-center gap-3 mt-auto">
        <button
          type="button" onClick={onCancel} disabled={isLoading}
          className="px-6 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all active:scale-95"
        >
          Abort Operation
        </button>
        <button
          type="submit" disabled={isLoading}
          className="flex flex-row items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white border border-transparent rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <><div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"/> Executing...</>
          ) : "Commit Record"}
        </button>
      </div>
    </form>
  );
};

export default CertificateForm;
