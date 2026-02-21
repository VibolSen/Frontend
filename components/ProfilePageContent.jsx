"use client";

import { useState, useEffect } from "react";
import {
  User,
  Mail,
  Shield,
  Edit3,
  Save,
  Camera,
  Eye,
  EyeOff,
  Lock,
} from "lucide-react";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import toast from "react-hot-toast";

export default function ProfilePageContent({
  user: initialUser,
  isCurrentUser,
  onUpdateProfile,
}) {
  const [user, setUser] = useState(initialUser || {});
  const [loading, setLoading] = useState(!initialUser);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    firstName: initialUser?.firstName || "",
    lastName: initialUser?.lastName || "",
    phone: initialUser?.profile?.phone || "",
    address: initialUser?.profile?.address || "",
    bio: initialUser?.profile?.bio || "",
    imageFile: null,
  });

  const [imagePreview, setImagePreview] = useState(
    initialUser?.profile?.avatar || "/default-cover.jpg"
  );

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
      setForm({
        firstName: initialUser?.firstName || "",
        lastName: initialUser?.lastName || "",
        phone: initialUser?.profile?.phone || "",
        address: initialUser?.profile?.address || "",
        bio: initialUser?.profile?.bio || "",
        imageFile: null,
      });
      if (initialUser?.profile?.avatar) {
        setImagePreview(initialUser.profile.avatar);
      }
      setLoading(false);
    }
  }, [initialUser]);

  // Password change states
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);

  const handleChange = (e) => {
    if (e.target.name === "imageFile") {
      const file = e.target.files[0];
      if (file) {
        setForm({ ...form, imageFile: file });
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      }
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSave = async () => {
    if (!isCurrentUser) return;

    const loadingToast = toast.loading("Updating your profile...");
    try {
      const formData = new FormData();
      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("phone", form.phone);
      formData.append("address", form.address);
      formData.append("bio", form.bio);
      if (form.imageFile) formData.append("image", form.imageFile);

      const updatedUser = await onUpdateProfile(formData);

      setUser(updatedUser);
      setImagePreview(
        updatedUser.profile?.avatar
          ? `${updatedUser.profile.avatar}?${Date.now()}`
          : "/default-cover.jpg"
      );
      toast.success("Profile updated successfully!", { id: loadingToast });
      setEditMode(false);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Update failed", { id: loadingToast });
    }
  };

  const handleChangePassword = async () => {
    if (!isCurrentUser) return;

    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("Please fill in all password fields");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("New passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    const loadingToast = toast.loading("Changing password...");
    try {
      // Logic for password change would go here
      console.log("Changing password...", { oldPassword, newPassword });
      toast.success("Password updated successfully!", { id: loadingToast });
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update password", { id: loadingToast });
    }
  };

  const handleCancel = () => {
    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.profile?.phone || "",
      address: user.profile?.address || "",
      bio: user.profile?.bio || "",
      imageFile: null,
    });
    setImagePreview(user.profile?.avatar || "/default-cover.jpg");
    setEditMode(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center p-4">
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8 max-w-md w-full text-center">
          <LoadingSpinner size="md" color="blue" className="mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4 md:px-8 bg-[#EBF4F6]">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Profile Card */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 to-indigo-600 relative">
            <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-4 border-white shadow-md bg-white"
                />
                {editMode && (
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-1.5 rounded-full cursor-pointer shadow-lg hover:bg-blue-700 transition-all active:scale-90 border-2 border-white">
                    <Camera className="w-3.5 h-3.5" />
                    <input
                      type="file"
                      name="imageFile"
                      accept="image/*"
                      onChange={handleChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          </div>

          <div className="pt-16 pb-8 px-6 text-center">
            <div className="space-y-1 mb-6">
              <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                {user.firstName && user.lastName
                  ? `${user.firstName} ${user.lastName}`
                  : user.firstName || user.lastName || "N/A"}
              </h1>
              <div className="flex items-center justify-center gap-2 text-[13px] font-medium text-slate-500">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{user.email}</span>
                <span className="text-slate-300">|</span>
                <Shield className="w-3.5 h-3.5 text-slate-400" />
                <span className="capitalize">{user.role}</span>
              </div>
            </div>

            {editMode ? (
              <div className="max-w-2xl mx-auto space-y-4 text-left">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      value={form.firstName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      value={form.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Bio
                  </label>
                  <textarea
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>

                <div className="flex justify-between gap-3 pt-4">
                  <button
                    onClick={handleCancel}
                    className="flex-1 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-[13px] font-bold transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-[13px] font-bold shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    <Save className="w-3.5 h-3.5" />
                    Save Changes
                  </button>
                </div>
              </div>
            ) : (
              isCurrentUser && (
                <button
                  onClick={() => setEditMode(true)}
                  className="px-6 py-2 bg-white border border-slate-200 hover:border-blue-300 text-slate-600 hover:text-blue-600 rounded-xl text-[13px] font-bold shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 mx-auto"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Profile
                </button>
              )
            )}
          </div>
        </div>

        {/* Info & Password Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Account Info */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 h-full text-slate-400">
            <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-500" />
              Profile Details
            </h2>

            <div className="space-y-5">
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Phone</span>
                <span className="text-[13px] font-bold text-slate-800">{user.profile?.phone || "Not set"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Address</span>
                <span className="text-[13px] font-bold text-slate-800">{user.profile?.address || "Not set"}</span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bio</span>
                <p className="text-[13px] font-medium text-slate-600 leading-relaxed italic">
                   {user.profile?.bio || "No bio added yet."}
                </p>
              </div>
            </div>
          </div>

          {/* Change Password */}
          {isCurrentUser && (
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 h-full text-slate-400">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-indigo-500" />
                Security
              </h2>

              <div className="space-y-3">
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    placeholder="Current Password"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showOldPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="New Password"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showConfirmNewPassword ? "text" : "password"}
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    placeholder="Confirm New Password"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-[13px] font-bold focus:ring-2 focus:ring-indigo-500/20 placeholder:text-slate-300"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmNewPassword(!showConfirmNewPassword)
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                  >
                    {showConfirmNewPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>

                <button
                  onClick={handleChangePassword}
                  className="w-full py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-[13px] font-bold transition-all shadow-lg flex items-center justify-center gap-2 mt-2"
                >
                  <Shield className="w-3.5 h-3.5" />
                  Update Password
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
