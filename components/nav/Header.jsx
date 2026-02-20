import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useUser } from "@/context/UserContext";
import { signOut } from "next-auth/react";
import NotificationDropdown from "./NotificationDropdown";
import { 
  LogOut, 
  User, 
  ChevronDown, 
  Menu,
  Clock
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Header({ toggleSidebar }) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState("");
  const router = useRouter();
  const dropdownTimeoutRef = useRef(null);

  const { user, loading } = useUser();

  const handleMouseEnter = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setDropdownOpen(true);
  };

  const handleMouseLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setDropdownOpen(false);
    }, 200);
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const updateDate = () => {
      const now = new Date();
      const options = {
        weekday: "short",
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      setCurrentDate(now.toLocaleDateString(undefined, options));
    };
    updateDate();
    const interval = setInterval(updateDate, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    localStorage.removeItem("user");
    Cookies.remove("token");
    await signOut({ callbackUrl: "/" });
  };

  const handleProfileClick = () => {
    if (user?.role) {
      const roleSlug = user.role.toLowerCase().replace(/_/g, "-");
      router.push(`/${roleSlug}/profile`);
    } else {
      console.warn("User role not found, cannot navigate to profile");
    }
  };

  if (loading) {
    return (
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200 p-4 h-20 flex justify-between items-center sticky top-0 z-30">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 rounded-xl bg-slate-100 animate-pulse" />
          <div className="hidden md:block">
            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse mb-2" />
            <div className="h-3 w-20 bg-slate-100 rounded animate-pulse" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/60 p-4 h-20 flex justify-between items-center sticky top-0 z-30 px-6">
      {/* Search or Left Section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleSidebar}
          className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all md:hidden bg-slate-50 border border-slate-200"
        >
          <Menu size={20} />
        </button>
        
        <div className="hidden lg:flex items-center gap-2 bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-wider">
           <Clock size={14} className="text-blue-500" />
           <span>{currentDate}</span>
        </div>
      </div>

      {/* Action Items */}
      <div className="flex items-center gap-4">
        <NotificationDropdown />

        {/* Divider */}
        <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block" />

        {/* Profile Dropdown */}
        <div 
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className={`flex items-center gap-3 p-1.5 pr-3 rounded-2xl transition-all border ${
              dropdownOpen 
                ? "bg-white border-blue-200 shadow-lg shadow-blue-500/5 translate-y-[-1px]" 
                : "bg-slate-50 border-slate-200 hover:border-blue-200"
            }`}
          >
            <div className="relative">
              <img
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-white shadow-sm"
                src={user?.profile?.avatar || "/default-cover.jpg"}
                alt={user?.name || "Guest"}
                onError={(e) => (e.currentTarget.src = "/default-cover.jpg")}
              />
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
            </div>
            
            <div className="hidden sm:block text-left">
              <p className="text-[12px] font-black text-slate-800 leading-tight">
                {user ? `${user.firstName} ${user.lastName}` : "Guest User"}
              </p>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter mt-0.5">
                {user ? user.role || "Unauthorized" : "Spectator"}
              </p>
            </div>

            <ChevronDown 
              size={14} 
              className={`text-slate-400 transition-transform duration-300 ${dropdownOpen ? "rotate-180 text-blue-500" : ""}`} 
            />
          </button>

          <AnimatePresence>
            {dropdownOpen && (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.12)] border border-slate-100 py-2.5 z-50 pointer-events-auto"
              >
                <div className="px-4 py-2 border-b border-slate-50 mb-1">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Account Hub</p>
                </div>

                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors group"
                >
                  <div className="p-1.5 rounded-lg bg-slate-50 group-hover:bg-white transition-colors">
                    <User size={16} />
                  </div>
                  <span className="font-semibold">My Profile</span>
                </button>

                <div className="h-[1px] bg-slate-100 my-1 mx-4" />

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-rose-600 hover:bg-rose-50 transition-colors group"
                >
                  <div className="p-1.5 rounded-lg bg-rose-50 group-hover:bg-white transition-colors">
                    <LogOut size={16} />
                  </div>
                  <span className="font-semibold">Sign Out</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}
