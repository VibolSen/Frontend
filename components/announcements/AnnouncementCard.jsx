import React from "react";
import { Edit, Trash2, Calendar, User, Clock } from "lucide-react";
import { motion } from "framer-motion";

export default function AnnouncementCard({ announcement, onEdit, onDelete, currentUser }) {
  const canModify = currentUser?.role === 'ADMIN';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-[2rem] border border-white/50 shadow-sm overflow-hidden hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-500 group relative"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
      
      <div className="p-8 relative z-10">
        <div className="flex justify-between items-start gap-4 mb-6">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.6)]" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Priority Bulletin</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-indigo-600 transition-colors">{announcement.title}</h3>
            
            <div className="flex items-center gap-4 pt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                <User size={10} className="text-indigo-500" />
                <span className="text-slate-600">{announcement.author.firstName} {announcement.author.lastName}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-lg border border-slate-100">
                <Clock size={10} className="text-indigo-500" />
                <span className="text-slate-600">{new Date(announcement.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
            </div>
          </div>
          
          {canModify && (
            <div className="flex gap-2 shrink-0 translate-y-1">
              <button 
                onClick={onEdit} 
                className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-white hover:shadow-md border border-transparent hover:border-indigo-100 rounded-xl transition-all duration-300"
                title="Edit Bulletin"
              >
                <Edit size={16} />
              </button>
              <button 
                onClick={onDelete} 
                className="p-2.5 text-slate-400 hover:text-rose-600 hover:bg-white hover:shadow-md border border-transparent hover:border-rose-100 rounded-xl transition-all duration-300"
                title="Remove Bulletin"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>
        
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-indigo-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
          <p className="text-sm text-slate-600 leading-relaxed font-medium pl-0 group-hover:pl-4 transition-all duration-300">{announcement.content}</p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100/50 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                 <Bell size={10} />
              </div>
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Delivered to all students</span>
           </div>
           <button className="text-[9px] font-black text-indigo-600 uppercase tracking-widest hover:tracking-[0.1em] transition-all">Read More →</button>
        </div>
      </div>
    </motion.div>
  );
}
