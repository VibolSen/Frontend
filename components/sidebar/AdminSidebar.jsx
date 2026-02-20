"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Users,
  Book,
  BarChart3,
  BookOpen,
  Settings,
  ChevronLeft,
  ChevronRight,
  Briefcase,
  User as UserIcon,
  LayoutGrid,
  Hash,
  TrendingUp,
  Calendar,
  Award,
  DollarSign,
  FileText,
  Library,
  ClipboardList,
  LogOut,
  Bell
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";

// -------------------------
// Single Nav Item Component
// -------------------------
const NavLink = ({ icon, label, href, isCollapsed, isActive }) => (
  <li>
    <Link
      href={href}
      className={`group flex items-center gap-3 my-1 px-3 py-2.5 rounded-xl transition-all duration-300 relative
        ${
          isActive
            ? "bg-blue-600 text-white shadow-lg shadow-blue-500/20"
            : "text-slate-500 hover:text-blue-700 hover:bg-white"
        }
      `}
      title={isCollapsed ? label : ""}
    >
      <div
        className={`flex items-center justify-center shrink-0 transition-transform duration-300 ${
          isActive ? "scale-110" : "group-hover:scale-110"
        }`}
      >
        {React.cloneElement(icon, { size: 18, strokeWidth: isActive ? 2.5 : 2 })}
      </div>

      <span
        className={`font-semibold text-xs tracking-tight transition-all duration-300 whitespace-nowrap
          ${
            isCollapsed
              ? "opacity-0 translate-x-4 pointer-events-none"
              : "opacity-100 translate-x-0"
          }`}
      >
        {label}
      </span>

      {isActive && !isCollapsed && (
        <motion.div
           layoutId="activeIndicator"
           className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/50"
        />
      )}
      
      {isCollapsed && (
        <div className="absolute left-full ml-4 px-3 py-1.5 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all pointer-events-none z-50 whitespace-nowrap shadow-xl">
             {label}
        </div>
      )}
    </Link>
  </li>
);

// -------------------------
// Sidebar Item Definitions
// -------------------------
const ADMIN_NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: <Home />,
    href: "/admin/dashboard",
  },
  {
    label: "Users",
    icon: <Users />,
    href: "/admin/users",
  },
  {
    label: "Staff",
    icon: <Briefcase />,
    href: "/admin/staff",
  },
  {
    label: "Teachers",
    icon: <Users />,
    href: "/admin/teachers",
  },
  {
    label: "Students",
    icon: <UserIcon />,
    href: "/admin/students",
  },
  {
    label: "Faculty",
    icon: <Book />,
    href: "/admin/faculty",
  },
  {
    label: "Departments",
    icon: <LayoutGrid />,
    href: "/admin/departments",
  },
  {
    label: "Courses",
    icon: <Book />,
    href: "/admin/courses",
  },
  {
    label: "Groups",
    icon: <Hash />,
    href: "/admin/groups",
  },
  {
    label: "Assignment Management",
    icon: <ClipboardList />,
    href: "/admin/assignment-management",
  },
  {
    label: "Exam Management",
    icon: <FileText />,
    href: "/admin/exam-management",
  },
  {
    label: "Course Analytics",
    icon: <BarChart3 />,
    href: "/admin/course-analytics",
  },
  {
    label: "E-Library",
    icon: <Library />,
    href: "/admin/e-library",
  },
  {
    label: "Student Performance",
    icon: <TrendingUp />,
    href: "/admin/student-performance",
  },
  {
    label: "Gradebook",
    icon: <BookOpen />,
    href: "/admin/gradebook",
  },
  {
    label: "Attendance",
    icon: <Calendar />,
    href: "/admin/attendance",
  },
  {
    label: "Financial Management",
    icon: <DollarSign />,
    href: "/admin/finance",
  },
  {
    label: "Schedule",
    icon: <Calendar />,
    href: "/admin/schedule",
  },
  {
    label: "Campus Facilities",
    icon: <LayoutGrid />,
    href: "/admin/rooms",
  },
  {
    label: "Certificates",
    icon: <Award />,
    href: "/admin/certificate-management",
  },
  {
    label: "Job Postings",
    icon: <Briefcase />,
    href: "/admin/job-postings",
  },
  {
    label: "Leave Management",
    icon: <ClipboardList />,
    href: "/admin/leave-management",
  },
  {
    label: "Recruitment",
    icon: <Users />,
    href: "/admin/recruitment",
  },
  {
    label: "Settings",
    icon: <Settings />,
    href: "/admin/settings",
  },
];

// -------------------------
// Main Sidebar Component
// -------------------------
export default function AdminSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { user } = useUser();

  const isCollapsed = !isOpen;

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-30 transition-opacity md:hidden ${
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsOpen(false)}
      />

      <aside
        className={`bg-[#EBF4F6] border-r border-slate-200 text-slate-800 flex flex-col fixed md:relative transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-40 h-full
          ${isOpen ? "w-72" : "w-20"} overflow-hidden shadow-xl`}
      >
        {/* Decorative Background Elements */}
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-blue-600/5 to-transparent pointer-events-none" />
        
        {/* Header */}
        <div
          className={`flex items-center px-6 border-b border-slate-200 h-24 transition-all duration-300 relative z-10 ${
            isCollapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!isCollapsed && (
            <motion.div 
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               className="flex items-center gap-3"
            >
              <div className="h-10 w-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 rotate-3">
                <LayoutGrid className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-black text-slate-800 tracking-widest leading-none uppercase italic">
                  Step Acad.
                </h1>
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Super Admin</span>
              </div>
            </motion.div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-blue-600 transition-all hover:bg-white group shadow-sm ${isCollapsed ? "" : "ml-4"}`}
          >
            {isOpen ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar relative z-10">
          {!isCollapsed && (
             <div className="mb-4 px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Management Suite</span>
             </div>
          )}
          <ul className="space-y-1.5">
            {ADMIN_NAV_ITEMS.map((item) => (
              <NavLink
                key={item.label}
                icon={item.icon}
                label={item.label}
                href={item.href}
                isCollapsed={isCollapsed}
                isActive={pathname === item.href}
              />
            ))}
          </ul>
        </nav>

        {/* User Profile Summary */}
        <div className="p-4 border-t border-slate-200 relative z-10 bg-white/50 backdrop-blur-md">
           <div className={`flex items-center gap-3 p-2 rounded-2xl transition-all ${isCollapsed ? "justify-center" : "bg-white border border-slate-100 shadow-sm"}`}>
             <div className="relative shrink-0">
               <img 
                 src={user?.profile?.avatar || "/default-cover.jpg"} 
                 className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100"
                 alt="Profile"
               />
               <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
             </div>
             
             {!isCollapsed && (
               <div className="flex-1 min-w-0">
                 <p className="text-[11px] font-black text-slate-800 truncate">{user?.firstName} {user?.lastName}</p>
                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">System Authority</p>
               </div>
             )}
             
             {!isCollapsed && (
               <button className="p-2 text-slate-400 hover:text-rose-500 transition-colors">
                 <LogOut size={14} />
               </button>
             )}
           </div>
        </div>

        {/* Bottom Accent Line */}
        <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-blue-600" />
      </aside>
    </>
  );
}
