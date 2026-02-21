"use client";
import React from "react";
import Link from "next/link";
import {
  Home,
  Users,
  Book,
  BarChart2,
  BookOpen,
  TrendingUp,
  Settings,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  CheckSquare,
  Calendar,
  LogOut,
  Bell,
  Coffee
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";

const NavLink = ({ icon, label, href, isCollapsed, isActive }) => (
  <li>
    <Link
      href={href}
      className={`group flex items-center gap-3 my-1 px-3 py-2.5 rounded-xl transition-all duration-300 relative
        ${
          isActive
            ? "bg-amber-600 text-white shadow-lg shadow-amber-500/20"
            : "text-slate-500 hover:text-amber-700 hover:bg-white"
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
const TEACHER_NAV_GROUPS = [
  {
    group: "Overview",
    items: [
      { label: "Dashboard", icon: <Home />, href: "/teacher/dashboard" },
      { label: "My Schedules", icon: <Calendar />, href: "/teacher/schedule" },
    ]
  },
  {
    group: "Classroom",
    items: [
      { label: "My Students", icon: <Users />, href: "/teacher/students" },
      { label: "My Courses", icon: <Book />, href: "/teacher/courses" },
      { label: "E-Library", icon: <BookOpen />, href: "/teacher/e-library" },
    ]
  },
  {
    group: "Academics",
    items: [
      { label: "Assignments", icon: <ClipboardList />, href: "/teacher/assignment" },
      { label: "Exams", icon: <FileText />, href: "/teacher/exam" },
      { label: "Gradebook", icon: <BookOpen />, href: "/teacher/gradebook" },
      { label: "Performance", icon: <TrendingUp />, href: "/teacher/student-performance" },
    ]
  },
  {
    group: "Personnel",
    items: [
      { label: "My Attendance", icon: <CheckSquare />, href: "/teacher/my-attendance" },
      { label: "Student Attendance", icon: <CheckSquare />, href: "/teacher/student-attendance" },
      { label: "My Leaves", icon: <FileText />, href: "/teacher/my-absence" },
    ]
  },
  {
    group: "Administration",
    items: [
      { label: "Preferences", icon: <Settings />, href: "/teacher/settings" },
    ]
  },
];

// -------------------------
// Main Sidebar Component
// -------------------------
export default function TeacherSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  const { user } = useUser();
  const [collapsedGroups, setCollapsedGroups] = React.useState({});

  const isCollapsed = !isOpen;

  const toggleGroup = (groupName) => {
    setCollapsedGroups(prev => ({
      ...prev,
      [groupName]: !prev[groupName]
    }));
  };

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
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-amber-600/5 to-transparent pointer-events-none" />
        
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
              <div className="h-10 w-10 bg-amber-600 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20 rotate-3">
                <Coffee className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-black text-slate-800 tracking-widest leading-none uppercase italic">
                   Edu. Hub
                </h1>
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">Faculty Member</span>
              </div>
            </motion.div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-amber-600 transition-all hover:bg-white group shadow-sm ${isCollapsed ? "" : "ml-4"}`}
          >
            {isOpen ? (
              <ChevronLeft size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-4 py-8 overflow-y-auto custom-scrollbar relative z-10 text-slate-500">
          <div className="space-y-6">
            {TEACHER_NAV_GROUPS.map((group, groupIdx) => {
              const isGroupCollapsed = collapsedGroups[group.group];
              return (
                <div key={groupIdx} className="space-y-2">
                  {!isCollapsed && (
                    <button 
                      onClick={() => toggleGroup(group.group)}
                      className="w-full flex items-center justify-between px-4 mb-2 group/header"
                    >
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] group-hover/header:text-amber-600 transition-colors">
                        {group.group}
                      </span>
                      <motion.div
                        animate={{ rotate: isGroupCollapsed ? 0 : 90 }}
                        className="text-slate-300 group-hover/header:text-amber-400"
                      >
                         <ChevronRight size={10} />
                      </motion.div>
                    </button>
                  )}
                  
                  <motion.ul 
                    initial={false}
                    animate={{ 
                      height: isGroupCollapsed && !isCollapsed ? 0 : "auto",
                      opacity: isGroupCollapsed && !isCollapsed ? 0 : 1,
                      marginBottom: isGroupCollapsed && !isCollapsed ? 0 : 8
                    }}
                    className="space-y-1 overflow-hidden"
                  >
                    {group.items.map((item) => (
                      <NavLink
                        key={item.label}
                        icon={item.icon}
                        label={item.label}
                        href={item.href}
                        isCollapsed={isCollapsed}
                        isActive={pathname === item.href}
                      />
                    ))}
                  </motion.ul>
                </div>
              );
            })}
          </div>
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
                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Academic Expert</p>
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
        <div className="h-1 bg-gradient-to-r from-amber-600 via-orange-500 to-amber-600" />
      </aside>
    </>
  );
}
