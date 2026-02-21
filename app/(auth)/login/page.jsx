// app/(auth)/login/page.jsx
"use client";

import { useState } from "react";
import { LogIn, Mail, Lock, Eye, EyeOff, CheckCircle } from "lucide-react";
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // 1. Direct validation call to capture specific backend errors (like suspension message)
      const verifyRes = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:5001'}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!verifyRes.ok) {
        const errorData = await verifyRes.json();
        throw new Error(errorData.error || "Invalid email or password");
      }

      // 2. Use NextAuth signIn to establish session for Server Components
      const result = await signIn("credentials", {
        email,
        password,
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
    <div className="min-h-screen bg-[#EBF4F6] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Illustration */}
        <div className="hidden lg:flex flex-col items-center justify-center text-center space-y-6">
          <div className="space-y-4 text-slate-700 w-full flex flex-col items-center">
            <h2 className="text-3xl font-black text-balance max-w-md tracking-tight leading-tight">
              Welcome Back to Your Educational Journey!
            </h2>
            <p className="text-lg text-slate-500 text-pretty max-w-md font-medium">
              Continue your learning experience with thousands of students
              transforming their future.
            </p>
          </div>
          <div className="relative flex justify-center transform hover:scale-105 transition-transform duration-500">
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-200 to-indigo-200 rounded-full opacity-20 blur-3xl"></div>
            <img
              src="/illustration/login.png"
              alt="Student logging in"
              className="w-80 h-80 object-contain drop-shadow-2xl relative z-10"
            />
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto lg:mr-auto lg:ml-0">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xl p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
            
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">
                Login to Your Account
              </h2>
              <p className="text-[13px] text-slate-500 mt-2 font-medium">
                Enter your credentials to continue learning
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-[13px] font-medium flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5 ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="Enter your email address"
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 placeholder:text-slate-400 text-[13px] font-medium"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-1.5">
                <label className="text-[13px] font-bold text-slate-700 flex items-center gap-1.5 ml-1">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 group-focus-within:text-blue-600 transition-colors" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="w-full bg-slate-50 border border-slate-200 px-3 py-2.5 pl-10 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-200 text-slate-800 placeholder:text-slate-400 text-[13px] font-medium"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-[13px]">
                <label className="flex items-center gap-2 text-slate-600 font-medium cursor-pointer group">
                  <input
                    type="checkbox"
                    className="rounded text-blue-600 focus:ring-blue-500 border-slate-300 w-4 h-4 transition-all"
                  />
                  <span className="group-hover:text-slate-800 transition-colors">Remember me</span>
                </label>
                <a
                  href="/forgot-password"
                  className="text-blue-600 hover:text-blue-700 font-bold transition-colors hover:underline"
                >
                  Forgot password?
                </a>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-[13px] uppercase tracking-wide ${
                  isLoading
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                    : "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transform hover:-translate-y-0.5 active:translate-y-0"
                }`}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="xs" color="slate" className="mr-2" />
                    Logging in...
                  </>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Login
                  </>
                )}
              </button>
            </form>


          </div>
        </div>
      </div>
    </div>
  );
}
