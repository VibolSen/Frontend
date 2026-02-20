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
  const timeoutRef = useRef(null);

  const handleMouseEnter = (type) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setActiveDropdown(type);
  };

  const handleMouseLeave = () => {
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
        <Link href="/" className="flex items-center gap-3 group transition-transform hover:scale-[1.02]">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg shadow-blue-500/10 ring-2 ring-blue-50 relative group-hover:rotate-3 transition-transform duration-500">
            <img
              src="/logo/STEP.jpg"
              alt="STEP Logo"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col">
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
          <button className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all hidden sm:flex">
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
                        className="flex items-center gap-3 px-4 py-3 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-all group"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <UserIcon size={16} className="text-slate-400 group-hover:text-blue-600" />
                        <span className="font-semibold text-sm">Client Profile</span>
                      </Link>
                      <div className="h-[1px] bg-slate-50 my-1 mx-4" />
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-50 text-rose-600 transition-all group"
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
                className="group flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-slate-900/20 hover:shadow-blue-500/20 hover:bg-blue-600 transition-all duration-500 hover:scale-[1.05] active:scale-[0.98]"
              >
                <span>Login</span>
                <motion.div
                   animate={{ x: [0, 4, 0] }}
                   transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <Search size={14} className="rotate-90" />
                </motion.div>
              </Link>
            )
          )}
          
          {/* Mobile Menu Toggle */}
          <button className="p-2.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all lg:hidden bg-slate-50 border border-slate-200">
             <Menu size={20} />
          </button>
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, label }) {
  return (
    <Link 
      href={href} 
      className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-300 relative group overflow-hidden"
    >
      {label}
      <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-300" />
    </Link>
  );
}
