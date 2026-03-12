"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ChevronDown,
  Search,
  Menu,
  User as UserIcon,
  LogOut,
  Layout,
  ShieldCheck,
  BookOpen,
  Globe
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { apiClient } from "@/lib/api";
import { signOut } from "next-auth/react";
import Cookies from "js-cookie";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const { user, loading } = useUser();
  const router = useRouter();
  const [courses, setCourses] = useState([]);
  const [faculties, setFaculties] = useState([]);

  const [activeDropdown, setActiveDropdown] = useState(null); // 'faculties', 'courses', 'profile'
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const timeoutRef = useRef(null);

  const handleMouseEnter = (type) => {
    if (window.innerWidth < 1024) return; // Disable hover on mobile
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(type);
  };

  const handleMouseLeave = () => {
    if (window.innerWidth < 1024) return;
    timeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 200);
  };

  useEffect(() => {
    async function fetchData() {
      try {
        const [coursesData, facultiesData] = await Promise.all([
          apiClient.get("/courses"),
          apiClient.get("/faculties")
        ]);
        if (coursesData) setCourses(coursesData);
        if (facultiesData) setFaculties(facultiesData);
      } catch (err) {
        console.error("Failed to fetch navbar data:", err);
      }
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  const handleLogout = async () => {
    try {
      localStorage.removeItem("user");
      Cookies.remove("token");
      await signOut({ callbackUrl: "/" });
    } catch (error) {
      console.error("An error occurred during logout", error);
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">

        {/* Logo Section */}
        <Link href="/" prefetch={false} className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/10 ring-2 ring-blue-50 relative group-hover:rotate-3 transition-transform duration-500">
            <img
              src="/logo/STEP.jpg"
              alt="STEP Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-black text-xl tracking-tighter text-slate-900 leading-none">
              STEP<span className="text-blue-600">ACADEMY</span>
            </span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.3em] mt-1">Institutional Portal</span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          <NavLink href="/" label="Home" />

          {/* Faculties Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('faculties')}
            onMouseLeave={handleMouseLeave}
          >
            <button className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
              ${activeDropdown === 'faculties' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Faculties
              <ChevronDown size={14} className={`transition-transform duration-500 ${activeDropdown === 'faculties' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'faculties' && faculties.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-72 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 py-3 z-50"
                >
                  <div className="px-5 py-2 border-b border-slate-50 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <ShieldCheck size={12} className="text-blue-500" />
                      Academic Divisions
                    </p>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar px-2">
                    {faculties.map((faculty) => (
                      <Link
                        key={faculty.id}
                        href={`/faculties/${faculty.id}`}
                        prefetch={false}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white border border-slate-100 transition-colors">
                          <Globe size={14} />
                        </div>
                        <span className="text-sm font-semibold truncate">{faculty.name}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Courses Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => handleMouseEnter('courses')}
            onMouseLeave={handleMouseLeave}
          >
            <button className={`flex items-center gap-1 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
              ${activeDropdown === 'courses' ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'}`}
            >
              Courses
              <ChevronDown size={14} className={`transition-transform duration-500 ${activeDropdown === 'courses' ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
              {activeDropdown === 'courses' && courses.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full left-0 mt-2 w-80 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 py-3 z-50"
                >
                  <div className="px-5 py-2 border-b border-slate-50 mb-2">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <BookOpen size={12} className="text-blue-500" />
                      Available Modules
                    </p>
                  </div>
                  <div className="max-h-[400px] overflow-y-auto custom-scrollbar px-2">
                    {courses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.id}`}
                        prefetch={false}
                        className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-blue-50 text-slate-700 hover:text-blue-700 transition-all group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center group-hover:bg-white border border-slate-100 transition-colors">
                          <Layout size={14} />
                        </div>
                        <span className="text-sm font-semibold truncate">{course.name}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <NavLink href="/about" label="About" />
          <NavLink href="/careers" label="Careers" />
          <NavLink href="/contact" label="Contact" />
        </nav>

        {/* Right Section: Auth/Search */}
        <div className="flex items-center gap-3">
          {/* Subtle Search */}
          <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hidden sm:flex border border-transparent hover:border-blue-100">
            <Search size={18} />
          </button>

          {!loading && (
            user ? (
              <div
                className="relative"
                onMouseEnter={() => handleMouseEnter('profile')}
                onMouseLeave={handleMouseLeave}
              >
                <button
                  onClick={() => setActiveDropdown(activeDropdown === 'profile' ? null : 'profile')}
                  className={`flex items-center gap-3 p-1.5 pr-3 rounded-2xl border transition-all duration-300
                    ${activeDropdown === 'profile'
                      ? 'bg-white border-blue-200 shadow-xl shadow-blue-500/5 translate-y-[-1px]'
                      : 'bg-slate-50 border-slate-200 hover:border-blue-200 shadow-sm'}`}
                >
                  <div className="relative">
                    <img
                      className="h-8 w-8 rounded-xl object-cover ring-2 ring-white shadow-sm"
                      src={user?.profile?.avatar || "/default-cover.jpg"}
                      alt="User"
                    />
                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-[11px] font-black text-slate-900 leading-none">
                      {user.firstName}
                    </p>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                      Account
                    </p>
                  </div>
                  <ChevronDown size={12} className={`text-slate-400 transition-transform duration-500 ${activeDropdown === 'profile' ? 'rotate-180 text-blue-500' : ''}`} />
                </button>

                <AnimatePresence>
                  {activeDropdown === 'profile' && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute top-full right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 py-2 z-50 overflow-hidden"
                    >
                      <Link
                        href={`/${user.role.toLowerCase().replace(/_/g, "-")}/profile`}
                        prefetch={false}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-all group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <UserIcon size={16} className="text-slate-400 group-hover:text-blue-600" />
                        <span className="font-semibold text-sm">Client Profile</span>
                      </Link>
                      <div className="h-[1px] bg-slate-50 my-1 mx-4" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-rose-600 transition-all group text-left"
                      >
                        <LogOut size={16} />
                        <span className="font-semibold text-sm">Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <Link
                href="/login"
                prefetch={false}
                className="group flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:shadow-blue-500/20 hover:bg-blue-600 transition-all duration-500 hover:scale-[1.05] active:scale-[0.98]"
              >
                <span>Login</span>
                <Search size={14} className="rotate-90" />
              </Link>
            )
          )}

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className={`p-2.5 rounded-xl transition-all lg:hidden bg-slate-50 border 
              ${isMobileMenuOpen ? 'border-blue-200 text-blue-600 bg-blue-50 shadow-inner' : 'border-slate-200 text-slate-500 hover:text-blue-600 hover:bg-blue-50'}`}
          >
            <Menu size={20} className={`transition-transform duration-300 ${isMobileMenuOpen ? 'rotate-90' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-md z-[60] lg:hidden"
            />
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0.5 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-2 right-2 bottom-2 w-[85%] max-w-[320px] h-[calc(100vh-16px)] bg-white/95 backdrop-blur-2xl z-[70] lg:hidden shadow-[0_20px_50px_rgba(0,0,0,0.15)] flex flex-col rounded-[2rem] border border-slate-200/50 overflow-hidden"
            >
              {/* Mobile Header with Logo & Close */}
              <div className="p-6 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                  <span className="font-black text-xs uppercase tracking-[0.2em] text-slate-400">Navigation</span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl transition-all active:scale-90"
                >
                  <LogOut size={18} className="rotate-180" />
                </button>
              </div>

              {/* Mobile User Profile Card */}
              {user && (
                <div className="px-8 pt-6 pb-2">
                  <div className="p-5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl shadow-blue-200 flex items-center gap-4 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl group-hover:scale-150 transition-transform duration-700" />
                    <div className="relative">
                      <img className="w-14 h-14 rounded-2xl object-cover ring-4 ring-white/20 shadow-lg" src={user?.profile?.avatar || "/default-cover.jpg"} alt="User" />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-white rounded-full" />
                    </div>
                    <div className="flex-1 overflow-hidden text-left">
                      <p className="text-white font-black text-lg truncate">{user.firstName} {user.lastName}</p>
                      <p className="text-blue-100/80 text-[10px] uppercase font-black tracking-widest bg-white/10 w-fit px-2 py-0.5 rounded-md mt-1">{user.role}</p>
                    </div>
                    <Link
                      href={`/${user.role.toLowerCase().replace(/_/g, "-")}/profile`}
                      prefetch={false}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2.5 bg-white/10 hover:bg-white text-white hover:text-blue-600 rounded-xl transition-all drop-shadow-sm"
                    >
                      <UserIcon size={20} />
                    </Link>
                  </div>
                </div>
              )}

              {/* Mobile Nav Links Container */}
              <motion.div
                className="flex-1 overflow-y-auto py-6 px-6 space-y-2 custom-scrollbar"
                variants={{
                  open: { transition: { staggerChildren: 0.05, delayChildren: 0.2 } },
                  closed: { transition: { staggerChildren: 0.05, staggerDirection: -1 } }
                }}
                initial="closed"
                animate="open"
              >
                <div className="space-y-1 pt-2 text-left">
                  <MobileNavLink href="/" label="Home Dashboard" icon={<Globe size={20} />} onClick={() => setIsMobileMenuOpen(false)} />
                  <MobileNavLink href="/about" label="About Academy" icon={<ShieldCheck size={20} />} onClick={() => setIsMobileMenuOpen(false)} />
                </div>

                {/* Mobile Faculties */}
                <div className="pt-4 space-y-1 text-left">
                  <p className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-slate-200" />
                    Faculties
                    <span className="w-full h-[1px] bg-slate-200" />
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {faculties.map((faculty) => (
                      <MobileNavLink
                        key={faculty.id}
                        href={`/faculties/${faculty.id}`}
                        label={faculty.name}
                        icon={<Globe size={18} className="text-slate-300 group-hover:text-blue-500" />}
                        onClick={() => setIsMobileMenuOpen(false)}
                      />
                    ))}
                  </div>
                </div>

                {/* Mobile Courses */}
                <div className="pt-4 space-y-1 pb-10 text-left">
                  <p className="px-4 text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-4 h-[1px] bg-slate-200" />
                    Featured Courses
                    <span className="w-full h-[1px] bg-slate-200" />
                  </p>
                  <div className="grid grid-cols-1 gap-1">
                    {courses.slice(0, 8).map((course) => (
                      <MobileNavLink
                        key={course.id}
                        href={`/courses/${course.id}`}
                        label={course.name}
                        icon={<Layout size={18} className="text-slate-300 group-hover:text-amber-500" />}
                        onClick={() => setIsMobileMenuOpen(false)}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Mobile Footer Auth */}
              <div className="p-8 border-t border-slate-50 bg-slate-50/50">
                {!user ? (
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-3 w-full py-5 rounded-[2rem] bg-slate-900 text-white font-black text-sm uppercase tracking-widest shadow-xl shadow-slate-900/20 hover:bg-blue-600 transition-all active:scale-95"
                  >
                    <span>Get Started</span>
                    <Search size={18} className="rotate-90 opacity-40" />
                  </Link>
                ) : (
                  <button
                    onClick={handleLogout}
                    className="flex items-center justify-center gap-3 w-full py-5 rounded-[2rem] bg-rose-50 text-rose-600 font-black text-sm uppercase tracking-widest hover:bg-rose-100 transition-all active:scale-95"
                  >
                    <LogOut size={20} />
                    Sign Out Account
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}

function MobileNavLink({ href, label, icon, onClick }) {
  return (
    <motion.div
      variants={{
        open: { x: 0, opacity: 1 },
        closed: { x: 20, opacity: 0 }
      }}
    >
      <Link
        href={href}
        prefetch={false}
        onClick={onClick}
        className="flex items-center gap-4 px-5 py-4 rounded-2xl text-slate-600 hover:text-blue-700 hover:bg-blue-50/50 font-bold border border-transparent hover:border-blue-100 group transition-all duration-300"
      >
        <div className="p-2 rounded-xl bg-slate-50 group-hover:bg-white border border-slate-100 transition-colors shadow-sm group-hover:shadow-blue-500/5 group-hover:scale-110 duration-500">
          {icon}
        </div>
        <span className="text-[15px]">{label}</span>
      </Link>
    </motion.div>
  );
}


function NavLink({ href, label }) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 relative group overflow-hidden"
    >
      {label}
      <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
    </Link>
  );
}
