import React, { useState, useEffect, useRef } from "react";
import { apiClient } from "@/lib/api";
import { useUser } from "@/context/UserContext";
import { useRouter } from "next/navigation";
import { Bell, CheckCircle, FileText, GraduationCap, X } from "lucide-react";

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
      // Poll for notifications every 30 seconds
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
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Mark all as read when opening? Or maybe better to have a button.
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
      if (notif.link) {
        router.push(notif.link);
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "ASSIGNMENT": return <FileText className="w-4 h-4 text-blue-500" />;
      case "GRADE": return <GraduationCap className="w-4 h-4 text-green-500" />;
      case "EXAM": return <CheckCircle className="w-4 h-4 text-purple-500" />;
      default: return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={handleToggle}
        className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden transform origin-top-right animate-in fade-in zoom-in-95 duration-200">
          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Notifications</h3>
            {unreadCount > 0 && (
              <button 
                onClick={markAllRead}
                disabled={isLoading}
                className="text-[10px] font-bold text-blue-600 hover:text-blue-700 uppercase tracking-tight disabled:opacity-50"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`p-4 border-b border-slate-50 cursor-pointer transition-colors flex gap-3 ${
                    notif.isRead ? "bg-white hover:bg-slate-50" : "bg-blue-50/30 hover:bg-blue-50/50"
                  }`}
                >
                  <div className={`w-9 h-9 flex items-center justify-center rounded-xl shrink-0 ${
                    notif.isRead ? "bg-slate-100" : "bg-white shadow-sm ring-1 ring-slate-100"
                  }`}>
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs ${notif.isRead ? "text-slate-700" : "text-slate-900 font-bold"}`}>
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-500 line-clamp-2 mt-0.5">
                      {notif.message}
                    </p>
                    <p className="text-[9px] text-slate-400 font-medium mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  {!notif.isRead && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-1 shrink-0" />
                  )}
                </div>
              ))
            ) : (
              <div className="p-10 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center mb-3">
                    <Bell className="w-6 h-6 text-slate-300" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">No notifications yet</p>
                <p className="text-[10px] text-slate-400 mt-1">We'll alert you when there's news!</p>
              </div>
            )}
          </div>

          {notifications.length > 0 && (
            <div className="p-3 bg-slate-50/50 border-t border-slate-50 text-center">
               <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors">
                  View All Activity
               </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
