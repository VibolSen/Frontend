// app/(auth)/login/page.jsx
"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { signIn, getSession } from "next-auth/react";
import Cookies from "js-cookie";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [otpRequired, setOtpRequired] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      if (!otpRequired) {
        // Step 1: Validate credentials & trigger OTP for Admin
        const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!verifyRes.ok) {
          const errorData = await verifyRes.json();
          throw new Error(errorData.error || "Invalid email or password");
        }

        const verifyData = await verifyRes.json();
        if (verifyData.otpRequired) {
          // Admin: show OTP screen, OTP was sent to email
          setOtpRequired(true);
          setIsLoading(false);
          return;
        }
      }

      // Step 2: Use NextAuth signIn to establish session.
      // For Admin, NextAuth calls backend once with the otp — no double-call issue.
      const result = await signIn("credentials", {
        email,
        password,
        otp: otpRequired ? otp : undefined,
        redirect: false,
      });

      if (result.error) {
        // NextAuth might return 'CredentialsSignin' or the actual error message depending on config
        // In our case, we want to show the specific error from authOptions if possible
        const errorMessage = result.error === "CredentialsSignin" 
          ? "Invalid email or password" 
          : result.error;
        throw new Error(errorMessage);
      }

      // 2. Fetch the session to get the accessToken
      const session = await getSession();
      
      if (!session) {
        throw new Error("Failed to establish session");
      }

      // 3. Manually set the 'token' cookie for compatibility with apiClient and middleware
      if (session.accessToken) {
        Cookies.set("token", session.accessToken, {
          expires: 1,
          secure: true,
          sameSite: "strict",
        });
      }

      // 4. Store user data in localStorage for UserContext (client-side state)
      if (session.user) {
        // Construct the user object for localStorage if it's missing fields
        // NextAuth session.user usually has name/email/image, but we need role etc.
        localStorage.setItem('user', JSON.stringify({
          ...session.user,
          id: session.user.id,
          role: session.user.role
        }));
      }

      const roleName = session?.user?.role?.toLowerCase() || "";

      if (roleName === "admin") window.location.href = "/admin/dashboard";
      else if (roleName === "hr") window.location.href = "/hr/dashboard";
      else if (roleName === "finance") window.location.href = "/finance/dashboard";
      else if (roleName === "study-office" || roleName === "study_office")
        window.location.href = "/study-office/dashboard";
      else if (roleName === "faculty")
        window.location.href = "/faculty/dashboard";
      else if (roleName === "teacher")
        window.location.href = "/teacher/dashboard";
      else if (roleName === "student")
        window.location.href = "/student/dashboard";
      else window.location.href = "/";
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen w-full relative overflow-hidden flex items-center justify-center p-6 bg-[#F8FAFC]">
      {/* Soft Background Gradients */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-400/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-400/10 blur-[120px] rounded-full" />
      </div>

      {/* Main Content Dashboard-style Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 15, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-4xl grid lg:grid-cols-2 gap-10 items-center"
      >
        {/* Left Side: Modern Brand Experience */}
        <div className="hidden lg:flex flex-col space-y-6">
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 shadow-sm"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[9px] font-black text-indigo-600 uppercase tracking-widest px-0.5">Academic Excellence Protocol</span>
            </motion.div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-[1.1]">
              Transforming <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-700">
                Education.
              </span>
            </h1>
            <p className="text-sm text-slate-500 font-medium max-w-[320px] leading-relaxed">
              Unlock a world of sophisticated learning management designed for visionary institutions and future leaders.
            </p>
          </div>

          <div className="relative transform hover:scale-[1.01] transition-transform duration-700 w-full max-w-[280px]">
            <div className="absolute inset-0 bg-blue-500/10 blur-2xl rounded-full opacity-30" />
            <img
              src="/illustration/login.png"
              alt="Education illustration"
              className="w-full relative z-10 drop-shadow-xl"
            />
          </div>
        </div>

        {/* Right Side: Light Liquid Glass Form (Compact) */}
        <div className="w-full max-w-[380px] mx-auto lg:ml-auto lg:mr-0">
          <div className="relative group">
            {/* Subtle Outer Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-[2rem] blur-lg opacity-40 transition duration-1000" />
            
            <div className="relative bg-white/50 backdrop-blur-[24px] border border-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.06)] p-8 overflow-hidden">
              {/* Glass Reflection Accent */}
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-blue-200/40 to-transparent" />
              
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-indigo-500/20 transform hover:rotate-3 transition-transform cursor-pointer">
                  <LogIn className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-xl font-black text-slate-900 tracking-tight">Login Portal</h2>
                <p className="text-[11px] text-slate-400 mt-1.5 font-bold uppercase tracking-widest opacity-80">School Management System</p>
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-rose-50 border border-rose-100 text-rose-600 px-3.5 py-3 rounded-xl mb-6 text-[12px] font-bold flex items-center gap-3 shadow-sm shadow-rose-500/5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.3)]" />
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {otpRequired ? (
                  <>
                    {/* OTP Field */}
                    <div className="space-y-2 text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 pl-1">OTP Verification Code</label>
                      <div className="relative group/field">
                        <Lock className="w-3.5 h-3.5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within/field:text-indigo-600 transition-colors" />
                        <input
                          type="text"
                          maxLength={6}
                          name="otp"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                          required
                          placeholder="Enter 6-digit code"
                          className="w-full bg-slate-50/50 border border-slate-200 px-4 py-4 pl-11 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all duration-300 text-slate-900 placeholder:text-slate-300 text-[13px] font-mono tracking-[4px] text-center font-bold"
                        />
                      </div>
                      <p className="text-[10px] text-slate-400 leading-normal pl-1.5 mt-1 font-semibold">
                        A 6-digit OTP code has been sent to your email. Enter it above to continue.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading || otp.length !== 6}
                      className={`relative w-full py-4 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-500 overflow-hidden group/btn ${
                        isLoading || otp.length !== 6
                          ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100"
                          : "bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99]"
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      <div className="relative flex items-center justify-center gap-2.5">
                        {isLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                            <span className="text-slate-300">Verifying...</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Verify & Login</span>
                          </>
                        )}
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setOtpRequired(false);
                        setOtp("");
                        setError("");
                      }}
                      className="w-full text-center text-[10px] font-black text-slate-400 hover:text-indigo-600 uppercase tracking-widest transition-colors cursor-pointer py-1"
                    >
                      Back to Credentials
                    </button>
                  </>
                ) : (
                  <>
                    {/* Email Field */}
                    <div className="space-y-1.5 text-left">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 pl-1">Authorized Email</label>
                      <div className="relative group/field">
                        <Mail className="w-3.5 h-3.5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within/field:text-indigo-600 transition-colors" />
                        <input
                          type="email"
                          name="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          placeholder="e.g. name@school.edu"
                          className="w-full bg-slate-50/50 border border-slate-200 px-4 py-4 pl-11 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all duration-300 text-slate-900 placeholder:text-slate-300 text-[13px] font-medium"
                        />
                      </div>
                    </div>

                    {/* Password Field */}
                    <div className="space-y-1.5 text-left">
                      <div className="flex justify-between items-center ml-1 pl-1">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Security Pin</label>
                        <a href="/forgot-password" size="sm" className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:text-indigo-700 transition-colors cursor-pointer">Forgot?</a>
                      </div>
                      <div className="relative group/field">
                        <Lock className="w-3.5 h-3.5 text-slate-300 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within/field:text-indigo-600 transition-colors" />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          placeholder="••••••••"
                          className="w-full bg-slate-50/50 border border-slate-200 px-4 py-4 pl-11 pr-12 rounded-xl focus:outline-none focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 focus:bg-white transition-all duration-300 text-slate-900 placeholder:text-slate-300 text-[13px] font-medium"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 px-1 ml-1">
                      <input
                        type="checkbox"
                        id="remember"
                        className="w-3.5 h-3.5 rounded border-slate-300 bg-white text-indigo-600 focus:ring-2 focus:ring-indigo-500/10 transition-all cursor-pointer"
                      />
                      <label htmlFor="remember" className="text-[11px] font-bold text-slate-500 cursor-pointer hover:text-slate-700 transition-colors">Keep me signed in</label>
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className={`relative w-full py-4 px-6 rounded-xl font-black text-[11px] uppercase tracking-widest transition-all duration-500 overflow-hidden group/btn ${
                        isLoading
                          ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-slate-100"
                          : "bg-gradient-to-r from-indigo-600 to-blue-700 text-white shadow-xl shadow-indigo-500/10 hover:shadow-indigo-500/25 hover:scale-[1.01] active:scale-[0.99]"
                      }`}
                    >
                      <div className="absolute inset-0 bg-white/10 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                      <div className="relative flex items-center justify-center gap-2.5">
                        {isLoading ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin" />
                            <span className="text-slate-300">Authenticating...</span>
                          </>
                        ) : (
                          <>
                            <LogIn className="w-3.5 h-3.5" />
                            <span>Confirm Login</span>
                          </>
                        )}
                      </div>
                    </button>
                  </>
                )}
              </form>

              <div className="mt-8 pt-6 border-t border-slate-50 text-center">
                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest leading-loose">
                  Institutional Security <br />
                  <span className="text-slate-400 font-extrabold opacity-50">System Version 2.5.2</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
