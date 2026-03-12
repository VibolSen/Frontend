"use client";

import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  User, 
  Users, 
  BookOpen, 
  X,
  Repeat,
  CalendarDays
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function ScheduleDetailView({ isOpen, onClose, schedule }) {
  if (!schedule) return null;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    return new Date(timeString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getDayInitials = (days) => {
    return (days || []).map(day => day.substring(0, 3));
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all">
                {/* Header Section */}
                <div className="relative h-32 bg-gradient-to-br from-indigo-600 to-blue-700 p-6 overflow-hidden">
                  <div className="absolute top-0 right-0 p-4">
                    <button
                      onClick={onClose}
                      className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -top-12 -right-12 w-48 h-48 bg-blue-400/10 rounded-full blur-3xl" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-2 text-blue-100 font-medium text-xs uppercase tracking-widest">
                      <BookOpen size={14} />
                      Academic Session
                    </div>
                    <Dialog.Title as="h3" className="text-2xl font-bold text-white leading-tight">
                      {schedule.course?.name || schedule.title}
                    </Dialog.Title>
                  </div>
                </div>

                <div className="p-6">
                  {/* Status Badge & Recurrence */}
                  <div className="flex flex-wrap items-center gap-3 mb-8">
                    {schedule.isRecurring ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-100">
                        <Repeat size={12} strokeWidth={3} />
                        RECURRING WEEKLY
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100">
                        <CalendarDays size={12} strokeWidth={3} />
                        SINGLE SESSION
                      </span>
                    )}
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-100">
                      ACTIVE
                    </span>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8 mb-8">
                    {/* Date/Days */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                        <Calendar size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Timeframe</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {schedule.isRecurring 
                            ? `${formatDate(schedule.startDate)} - ${formatDate(schedule.endDate)}`
                            : formatDate(schedule.startDate)
                          }
                        </p>
                        {schedule.isRecurring && schedule.daysOfWeek?.length > 0 && (
                          <div className="mt-2 flex gap-1">
                            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                              <div 
                                key={day}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                                  schedule.daysOfWeek.includes(day)
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : 'bg-slate-100 text-slate-400'
                                }`}
                              >
                                {day.charAt(0)}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Room */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                        <MapPin size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {schedule.room?.name || schedule.location || 'Not Specified'}
                        </p>
                        {schedule.room && (
                          <p className="text-xs text-slate-500 mt-0.5">{schedule.room.type} • Cap: {schedule.room.capacity}</p>
                        )}
                      </div>
                    </div>

                    {/* Teacher */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Instructor</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {schedule.assignedToTeacher 
                            ? `${schedule.assignedToTeacher.firstName} ${schedule.assignedToTeacher.lastName}`
                            : 'Unassigned'}
                        </p>
                      </div>
                    </div>

                    {/* Group */}
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-500 shrink-0">
                        <Users size={20} />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Target Group</p>
                        <p className="text-sm font-semibold text-slate-700">
                          {schedule.assignedToGroup?.name || 'All Students'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Sessions Timeline */}
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <div className="flex items-center gap-2 mb-4 text-slate-800">
                      <Clock size={18} className="text-blue-600" />
                      <h4 className="font-bold text-sm uppercase tracking-tight">Timeline Detail</h4>
                    </div>
                    <div className="space-y-3">
                      {schedule.sessions?.map((session, idx) => (
                        <motion.div 
                          key={idx}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 group hover:bg-blue-50 transition-colors border border-transparent hover:border-blue-100"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                            <span className="text-sm font-bold text-slate-700 uppercase tracking-tight">
                              Session {idx + 1}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 text-slate-500 font-mono text-sm bg-white px-3 py-1.5 rounded-xl border border-slate-200">
                            <span className="text-blue-600 font-bold">{formatTime(session.startTime)}</span>
                            <span className="text-slate-300">→</span>
                            <span className="text-blue-600 font-bold">{formatTime(session.endTime)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50/80 mt-2 border-t border-slate-100 flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 shadow-sm"
                  >
                    Dismiss Details
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
