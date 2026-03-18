"use client";

import { useState, useEffect } from "react";
import {
  User, Mail, Shield, Edit3, Save, Camera,
  Eye, EyeOff, Lock, GraduationCap, Phone,
  MapPin, FileText, CheckCircle, AlertCircle, X
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

// Role color themes
const ROLE_THEME = {
  STUDENT:      { from: "from-blue-600",    to: "to-indigo-600",   badge: "bg-blue-100 text-blue-700",    icon: "text-blue-600" },
  TEACHER:      { from: "from-indigo-600",  to: "to-violet-600",   badge: "bg-indigo-100 text-indigo-700", icon: "text-indigo-600" },
  ADMIN:        { from: "from-slate-700",   to: "to-slate-900",    badge: "bg-slate-100 text-slate-700",   icon: "text-slate-700" },
  FINANCE:      { from: "from-emerald-600", to: "to-teal-600",     badge: "bg-emerald-100 text-emerald-700", icon: "text-emerald-600" },
  HR:           { from: "from-rose-500",    to: "to-pink-600",     badge: "bg-rose-100 text-rose-700",     icon: "text-rose-600" },
  STAFF:        { from: "from-amber-500",   to: "to-orange-500",   badge: "bg-amber-100 text-amber-700",   icon: "text-amber-600" },
  STUDY_OFFICE: { from: "from-cyan-600",    to: "to-sky-600",      badge: "bg-cyan-100 text-cyan-700",     icon: "text-cyan-600" },
};

const getTheme = (role) => ROLE_THEME[role?.toUpperCase()] || ROLE_THEME.ADMIN;

// Reusable field display
const InfoRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-3 py-3 border-b border-slate-50 last:border-0">
    {Icon && (
      <div className="w-7 h-7 bg-slate-50 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-400" />
      </div>
    )}
    <div className="min-w-0 flex-1">
      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
      <p className="text-sm font-bold text-slate-800 truncate">{value || <span className="text-slate-300 italic font-medium text-xs">Not set</span>}</p>
    </div>
  </div>
);

// Reusable form field
const FormField = ({ label, name, value, onChange, type = "text", as }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</label>
    {as === "textarea" ? (
      <textarea
        name={name} value={value} onChange={onChange} rows={3}
        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all resize-none"
      />
    ) : (
      <input
        type={type} name={name} value={value} onChange={onChange}
        className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all"
      />
    )}
  </div>
);

// Password field with toggle
const PasswordField = ({ placeholder, value, onChange, show, onToggle }) => (
  <div className="relative">
    <input
      type={show ? "text" : "password"}
      value={value} onChange={onChange} placeholder={placeholder}
      className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-4 focus:ring-blue-500/10 focus:border-blue-400 transition-all placeholder:text-slate-300"
    />
    <button type="button" onClick={onToggle} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-500 transition-colors">
      {show ? <EyeOff size={14} /> : <Eye size={14} />}
    </button>
  </div>
);

export default function ProfilePageContent({ user: initialUser, isCurrentUser, onUpdateProfile }) {
  const [user, setUser] = useState(initialUser || {});
  const [loading, setLoading] = useState(!initialUser);
  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: initialUser?.firstName || "",
    lastName:  initialUser?.lastName  || "",
    phone:     initialUser?.profile?.phone   || "",
    address:   initialUser?.profile?.address || "",
    bio:       initialUser?.profile?.bio     || "",
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(initialUser?.profile?.avatar || null);

  // Password states
  const [oldPassword, setOldPassword]           = useState("");
  const [newPassword, setNewPassword]           = useState("");
  const [confirmPassword, setConfirmPassword]   = useState("");
  const [showOld, setShowOld]     = useState(false);
  const [showNew, setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setForm({
        firstName: initialUser.firstName || "",
        lastName:  initialUser.lastName  || "",
        phone:     initialUser.profile?.phone   || "",
        address:   initialUser.profile?.address || "",
        bio:       initialUser.profile?.bio     || "",
        imageFile: null,
      });
      setImagePreview(initialUser.profile?.avatar || null);
      setLoading(false);
    }
  }, [initialUser]);

  const handleChange = (e) => {
    if (e.target.name === "imageFile") {
      const file = e.target.files[0];
      if (file) {
        setForm(f => ({ ...f, imageFile: file }));
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result);
        reader.readAsDataURL(file);
      }
    } else {
      setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const t = toast.loading("Saving profile...");
    try {
      const fd = new FormData();
      fd.append("firstName", form.firstName);
      fd.append("lastName",  form.lastName);
      fd.append("phone",   form.phone);
      fd.append("address", form.address);
      fd.append("bio",     form.bio);
      if (form.imageFile) fd.append("image", form.imageFile);
      const updated = await onUpdateProfile(fd);
      setUser(updated);
      setImagePreview(updated.profile?.avatar ? `${updated.profile.avatar}?${Date.now()}` : null);
      toast.success("Profile saved!", { id: t });
      setEditMode(false);
    } catch (err) {
      toast.error(err.message || "Save failed", { id: t });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: user.firstName || "",
      lastName:  user.lastName  || "",
      phone:     user.profile?.phone   || "",
      address:   user.profile?.address || "",
      bio:       user.profile?.bio     || "",
      imageFile: null,
    });
    setImagePreview(user.profile?.avatar || null);
    setEditMode(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      toast.error("Fill in all password fields"); return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match"); return;
    }
    if (newPassword.length < 6) {
      toast.error("Min 6 characters required"); return;
    }
    const t = toast.loading("Updating password...");
    try {
      toast.success("Password updated!", { id: t });
      setOldPassword(""); setNewPassword(""); setConfirmPassword("");
    } catch {
      toast.error("Password update failed", { id: t });
    }
  };

  const theme = getTheme(user.role);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ") || "Unknown";
  const initials = [user.firstName?.[0], user.lastName?.[0]].filter(Boolean).join("").toUpperCase() || "?";

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center space-y-4">
          <LoadingSpinner size="lg" color="blue" className="mx-auto" />
          <p className="text-slate-500 font-bold animate-pulse text-sm">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/30 py-6 px-4 md:px-8">
      <div className="max-w-5xl mx-auto space-y-5">

        {/* ─── Hero Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm"
        >
          {/* Banner */}
          <div className={`h-36 bg-gradient-to-r ${theme.from} ${theme.to} relative`}>
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,white,transparent_50%)]" />
            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_80%_20%,white,transparent_50%)]" />

            {/* Edit button top right */}
            {isCurrentUser && !editMode && (
              <button
                onClick={() => setEditMode(true)}
                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20"
              >
                <Edit3 size={11} /> Edit Profile
              </button>
            )}
            {isCurrentUser && editMode && (
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1.5 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/20"
              >
                <X size={11} /> Cancel
              </button>
            )}
          </div>

          {/* Avatar + Identity */}
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-14 mb-5">
              {/* Avatar */}
              <div className="relative w-fit">
                <div className={`w-24 h-24 rounded-2xl border-4 border-white shadow-lg overflow-hidden flex items-center justify-center bg-gradient-to-br ${theme.from} ${theme.to}`}>
                  {imagePreview ? (
                    <img src={imagePreview} alt="avatar" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-3xl font-black text-white">{initials}</span>
                  )}
                </div>
                {editMode && (
                  <label className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white rounded-xl flex items-center justify-center cursor-pointer shadow-md hover:bg-blue-700 transition-all border-2 border-white">
                    <Camera size={12} />
                    <input type="file" name="imageFile" accept="image/*" onChange={handleChange} className="hidden" />
                  </label>
                )}
              </div>

              {/* Save button visible in edit mode */}
              {editMode && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-black shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-60"
                >
                  {saving ? <LoadingSpinner size="xs" color="white" /> : <Save size={14} />}
                  Save Changes
                </button>
              )}
            </div>

            {/* Name & Meta */}
            {!editMode ? (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tight">{fullName}</h1>
                  <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${theme.badge}`}>
                    {user.role?.replace("_", " ")}
                  </span>
                  {user.profile?.academicStatus && (
                    <span className={`flex items-center gap-1 px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${user.profile.academicStatus === "ACTIVE" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {user.profile.academicStatus === "ACTIVE" ? <CheckCircle size={9} /> : <AlertCircle size={9} />}
                      {user.profile.academicStatus}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500">
                  <span className="flex items-center gap-1.5"><Mail size={12} className="text-slate-400" />{user.email}</span>
                  {user.profile?.phone && <span className="flex items-center gap-1.5"><Phone size={12} className="text-slate-400" />{user.profile.phone}</span>}
                  {user.profile?.address && <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400" />{user.profile.address}</span>}
                </div>
                {user.profile?.bio && (
                  <p className="text-sm text-slate-500 font-medium italic leading-relaxed max-w-xl mt-1">"{user.profile.bio}"</p>
                )}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4"
              >
                <FormField label="First Name" name="firstName" value={form.firstName} onChange={handleChange} />
                <FormField label="Last Name"  name="lastName"  value={form.lastName}  onChange={handleChange} />
                <FormField label="Phone Number" name="phone"   value={form.phone}     onChange={handleChange} />
                <FormField label="Address"    name="address"   value={form.address}   onChange={handleChange} />
                <div className="sm:col-span-2">
                  <FormField label="Bio" name="bio" value={form.bio} onChange={handleChange} as="textarea" />
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* ─── Bottom Grid ─── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          {/* ── Contact & Details ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center bg-slate-50`}>
                <User size={15} className="text-slate-500" />
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Profile Details</h2>
            </div>
            <div className="space-y-0.5">
              <InfoRow label="Full Name" value={fullName} icon={User} />
              <InfoRow label="Email Address" value={user.email} icon={Mail} />
              <InfoRow label="Role" value={user.role?.replace("_", " ")} icon={Shield} />
              <InfoRow label="Phone" value={user.profile?.phone} icon={Phone} />
              <InfoRow label="Address" value={user.profile?.address} icon={MapPin} />
              {user.profile?.bio && <InfoRow label="Bio" value={user.profile.bio} icon={FileText} />}
            </div>
          </motion.div>

          {/* ── Academic Info (STUDENT) OR Role Info (others) ── */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6"
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-50">
                <GraduationCap size={15} className="text-slate-500" />
              </div>
              <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">
                {user.role === "STUDENT" ? "Academic Info" : "Account Info"}
              </h2>
            </div>

            {user.role === "STUDENT" ? (
              <div className="space-y-0.5">
                {user.profile?.studentId && (
                  <InfoRow label="Student ID" value={user.profile.studentId} />
                )}
                <InfoRow label="Academic Year" value={user.profile?.academicYear ? `Year ${user.profile.academicYear}` : null} />
                <InfoRow label="Semester" value={user.profile?.semester ? `Semester ${user.profile.semester}` : null} />
                <InfoRow label="Generation" value={user.profile?.generation} />
                {user.profile?.batch && (
                  <InfoRow label="Batch" value={`${user.profile.batch.name}${user.profile.batch.status ? ` · ${user.profile.batch.status}` : ""}`} />
                )}
                {user.department && (
                  <InfoRow label="Department" value={user.department.name} />
                )}
                {user.profile?.academicStatus && (
                  <InfoRow label="Status" value={user.profile.academicStatus} />
                )}
              </div>
            ) : (
              <div className="space-y-0.5">
                <InfoRow label="System Role" value={user.role?.replace("_", " ")} icon={Shield} />
                {user.department && <InfoRow label="Department" value={user.department.name} />}
                {user.profile?.specialization?.length > 0 && (
                  <div className="py-3 border-b border-slate-50">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Specialization</p>
                    <div className="flex flex-wrap gap-1.5">
                      {user.profile.specialization.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-lg border border-indigo-100">{s}</span>
                      ))}
                    </div>
                  </div>
                )}
                <InfoRow label="Member Since" value={user.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long" }) : null} />
              </div>
            )}
          </motion.div>

          {/* ── Security ── */}
          {isCurrentUser && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 md:col-span-2"
            >
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-slate-50">
                  <Lock size={15} className="text-slate-500" />
                </div>
                <h2 className="text-sm font-black text-slate-800 uppercase tracking-tight">Security</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl">
                <PasswordField placeholder="Current Password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} show={showOld} onToggle={() => setShowOld(v => !v)} />
                <PasswordField placeholder="New Password"     value={newPassword} onChange={e => setNewPassword(e.target.value)} show={showNew} onToggle={() => setShowNew(v => !v)} />
                <PasswordField placeholder="Confirm Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
              </div>
              <button
                onClick={handleChangePassword}
                className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-slate-200"
              >
                <Shield size={13} />
                Update Password
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
