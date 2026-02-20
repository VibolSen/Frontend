"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Calendar,
  BarChart3,
  Settings,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Users,
  ClipboardList,
  UserPlus,
  FileText,
  CheckSquare,
  LogOut,
  Bell,
  Fingerprint
} from "lucide-react";
import { useUser } from "@/context/UserContext";
import { motion } from "framer-motion";

const NavLink = ({ icon, label, href, isCollapsed, isActive }) => (
  <li>
    <Link
      href={href}
      className={`group flex items-center gap-3 my-1 px-3 py-2.5 rounded-xl transition-all duration-300 relative
        ${
          isActive
            ? "bg-rose-600 text-white shadow-lg shadow-rose-500/20"
            : "text-slate-500 hover:text-rose-700 hover:bg-white"
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

const HR_NAV_ITEMS = [
  {
    label: "Dashboard",
    icon: <Home size={20} />,
    href: "/hr/dashboard",
  },
  {
    label: "Staff",
    icon: <Briefcase size={20} />,
    href: "/hr/staff",
  },
  {
    label: "Job Postings",
    icon: <ClipboardList size={20} />,
    href: "/hr/job-postings",
  },
  {
    label: "Attendance",
    icon: <Calendar size={20} />,
    href: "/hr/attendance",
  },
  {
    label: "Leave Management",
    icon: <FileText size={20} />,
    href: "/hr/leave-management",
  },
  {
    label: "Recruitment",
    icon: <UserPlus size={20} />,
    href: "/hr/recruitment",
  },
  {
    label: "Manage Attendance",
    icon: <CheckSquare size={20} />,
    href: "/hr/manage-attendance",
  },
  {
    label: "My Absence",
    icon: <Calendar size={20} />,
    href: "/hr/my-absence",
  },
  {
    label: "Reports & Analytics",
    icon: <BarChart3 size={20} />,
    href: "/hr/reports",
  },
];

const HRSidebar = ({ isOpen, setIsOpen }) => {
  const isCollapsed = !isOpen;
  const pathname = usePathname();
  const { user } = useUser();

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
        <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-rose-600/5 to-transparent pointer-events-none" />
        
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
              <div className="h-10 w-10 bg-rose-600 rounded-xl flex items-center justify-center shadow-lg shadow-rose-500/20 rotate-3">
                <Fingerprint className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-base font-black text-slate-800 tracking-widest leading-none uppercase italic">
                   Staff Hub
                </h1>
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] mt-1">HR Administration</span>
              </div>
            </motion.div>
          )}

          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`p-2 rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-rose-600 transition-all hover:bg-white group shadow-sm ${isCollapsed ? "" : "ml-4"}`}
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
          {!isCollapsed && (
             <div className="mb-4 px-2">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em]">Human Resources</span>
             </div>
          )}
          <ul className="space-y-1.5">
            {HR_NAV_ITEMS.map((item) => (
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

        {/* Bottom Navigation */}
        <div className="px-4 py-4 border-t border-slate-200 relative z-10">
           <NavLink
              icon={<Settings />}
              label="Preferences"
              href="/hr/settings"
              isCollapsed={isCollapsed}
              isActive={pathname === "/hr/settings"}
           />
        </div>

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
                 <p className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Personnel Manager</p>
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
        <div className="h-1 bg-gradient-to-r from-rose-600 via-pink-500 to-rose-600" />
      </aside>
    </>
  );
};

export default HRSidebar;