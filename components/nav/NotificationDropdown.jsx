"use client";
import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { 
  Bell, 
  CheckCircle, 
  FileText, 
  GraduationCap, 
  X, 
  Calendar, 
  Info,
  Check
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const router = useRouter();
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (user?.id) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 30000);
      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.get(`/notifications?userId=${user.id}`);
      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.isRead).length);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const markAllRead = async () => {
    try {
      setIsLoading(true);
      await apiClient.post("/notifications/mark-all-read", { userId: user.id });
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all read:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNotificationClick = async (notif) => {
    try {
      if (!notif.isRead) {
        await apiClient.put(`/notifications/${notif.id}/read`);
        setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n));
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      setIsOpen(false);
      if (notif.link) router.push(notif.link);
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "ASSIGNMENT": return <FileText size={14} className="text-blue-500" />;
      case "GRADE": return <GraduationCap size={14} className="text-emerald-500" />;
      case "EXAM": return <CheckCircle size={14} className="text-violet-500" />;
      case "PAYMENT": return <Info size={14} className="text-amber-500" />;
      default: return <Bell size={14} className="text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2.5 rounded-xl transition-all duration-300 ${
          isOpen 
            ? "bg-blue-50 text-blue-600 shadow-sm" 
            : "text-slate-500 hover:text-blue-600 hover:bg-slate-50"
        }`}
      >
        <Bell size={20} className={isOpen ? "animate-pulse" : ""} />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-black text-white ring-2 ring-white shadow-sm">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-[360px] bg-white rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 z-50 overflow-hidden"
          >
            {/* Header */}
            <div className="px-5 py-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/40 backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[9px] font-black rounded-full uppercase">
                    {unreadCount} New
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button 
                  onClick={markAllRead}
                  disabled={isLoading}
                  className="flex items-center gap-1 text-[10px] font-black text-blue-600 hover:text-blue-700 uppercase tracking-tight transition-colors disabled:opacity-50"
                >
                  <Check size={12} strokeWidth={3} />
                  Mark Read
                </button>
              )}
            </div>

            {/* Content */}
            <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-left p-4 border-b border-slate-50 transition-all hover:bg-slate-50/80 flex gap-4 ${
                      !notif.isRead ? "bg-blue-50/30" : "bg-white"
                    }`}
                  >
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl shrink-0 transition-transform duration-300 ${
                      !notif.isRead 
                        ? "bg-white shadow-md ring-1 ring-blue-100 scale-105" 
                        : "bg-slate-50"
                    }`}>
                      {getIcon(notif.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-[12px] truncate ${!notif.isRead ? "text-slate-900 font-bold" : "text-slate-600 font-semibold"}`}>
                          {notif.title}
                        </p>
                        {!notif.isRead && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full shrink-0 animate-pulse" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5 leading-relaxed font-medium">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="flex items-center gap-1 text-[9px] text-slate-400 font-black uppercase tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded-md">
                          <Calendar size={10} />
                          {new Date(notif.createdAt).toLocaleDateString()}
                        </span>
                        <span className="text-[9px] text-slate-400 font-black uppercase tracking-tighter">
                          {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="py-16 flex flex-col items-center justify-center text-center px-10">
                  <div className="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-4 transition-transform hover:rotate-12 duration-500">
                    <Bell size={28} className="text-slate-200" />
                  </div>
                  <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Crystalline Silence</h4>
                  <p className="text-[10px] text-slate-300 font-medium leading-relaxed">No new alerts at the moment. Your desk is clear.</p>
                </div>
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div className="p-3 bg-slate-50/40 border-t border-slate-50">
                <button className="w-full py-2.5 rounded-xl bg-white border border-slate-200 text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-blue-200 hover:text-blue-600 transition-all shadow-sm">
                  Activity Archive
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
