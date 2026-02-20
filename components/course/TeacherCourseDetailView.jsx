"use client";

import React, { useState, useEffect } from "react";
import { 
  BookOpenIcon, 
  UserIcon, 
  CalendarIcon, 
  InfoIcon,
  MessageSquareIcon,
  ArrowLeftIcon,
  UsersIcon,
  ChevronRightIcon,
  ClipboardListIcon,
  SettingsIcon
} from "lucide-react";
import Link from "next/link";
import AnnouncementsView from "@/components/announcements/AnnouncementsView";
import { apiClient } from "@/lib/api";
import { motion } from "framer-motion";

export default function TeacherCourseDetailView({ courseId, loggedInUser }) {
  const [course, setCourse] = useState(null);
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const [courseData, studentsData] = await Promise.all([
          apiClient.get(`/courses/${courseId}`),
          apiClient.get(`/courses/${courseId}/students`)
        ]);
        setCourse(courseData);
        setStudents(studentsData || []);
      } catch (error) {
        console.error("Error fetching course details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourseDetails();
  }, [courseId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Academic Environment...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
        <InfoIcon className="mx-auto h-12 w-12 text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900">Course Not Found</h2>
        <p className="text-slate-500 mt-2">We couldn't retrieve the details for this course.</p>
        <Link href="/teacher/courses" className="mt-6 inline-flex items-center px-6 py-2.5 bg-slate-900 text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all shadow-lg">
          <ArrowLeftIcon size={16} className="mr-2" /> back to My Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-4">
            <Link href="/teacher/courses" className="inline-flex items-center px-4 py-2 bg-slate-50 text-slate-500 hover:text-indigo-600 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-100 group/back">
              <ArrowLeftIcon size={14} className="mr-2 group-hover/back:-translate-x-1 transition-transform" /> Back to Catalog
            </Link>
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                {course.courseDepartments?.[0]?.department?.name || "General Academic"}
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight leading-tight">
                {course.name}
              </h1>
              <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                <span>CODE: {course.code || "REG-ACAD"}</span>
                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                <span>ID: {course.id?.slice(-8).toUpperCase()}</span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:block">
            <div className="h-24 w-24 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-[2rem] flex items-center justify-center text-indigo-200 border border-indigo-100 shadow-inner">
              <BookOpenIcon size={48} />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center border border-emerald-100">
                <UsersIcon size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{students.length}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Learners</p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center border border-amber-100">
                <ClipboardListIcon size={24} />
              </div>
              <div>
                <p className="text-2xl font-black text-slate-800">{course._count?.announcements || 0}</p>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatched Updates</p>
              </div>
            </div>
          </div>

          {/* Announcements Card */}
          <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-500 flex items-center justify-center border border-orange-100">
                  <MessageSquareIcon size={20} />
                </div>
                <h2 className="text-xl font-black text-slate-800 tracking-tight">Academic Bulletins</h2>
              </div>
              <button className="text-[10px] font-black text-indigo-600 uppercase tracking-widest hover:underline">New Post</button>
            </div>
            <div className="px-8 py-4">
              <AnnouncementsView courseId={courseId} loggedInUser={loggedInUser} hideHeader />
            </div>
          </section>

          {/* Syllabus / Description */}
          <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8 space-y-4">
            <h2 className="text-xl font-black text-slate-800 tracking-tight flex items-center gap-3">
              <div className="w-1 h-6 bg-indigo-600 rounded-full" />
              Curriculum Overview
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              {course.description || "The instructional objectives and detailed curriculum mapping for this course are currently being finalized by the department lead."}
            </p>
          </section>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
          {/* Faculty Card */}
          <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-8">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 border-b border-slate-50 pb-3">Faculty Leadership</h3>
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                  <UserIcon size={28} />
                </div>
                <div>
                  <p className="text-lg font-black text-slate-900 leading-tight">
                    {course.leadBy ? `${course.leadBy.firstName} ${course.leadBy.lastName}` : "Lead Unassigned"}
                  </p>
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mt-1">Course Director</p>
                </div>
              </div>
              
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between text-xs font-bold p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 uppercase tracking-widest">Credits</span>
                  <span className="text-slate-800">{course.credits || 3.0} Units</span>
                </div>
                <div className="flex items-center justify-between text-xs font-bold p-3 bg-slate-50 rounded-xl">
                  <span className="text-slate-400 uppercase tracking-widest">Dept</span>
                  <span className="text-slate-800">{course.courseDepartments?.[0]?.department?.name || "N/A"}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Access Actions */}
          <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-300">
            <div className="flex items-center gap-3 mb-6">
              <SettingsIcon size={18} className="text-indigo-400" />
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management Console</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: "Attendance Registry", icon: UsersIcon, link: "/teacher/student-attendance" },
                { label: "Assignment Control", icon: ClipboardListIcon, link: "/teacher/assignment" },
                { label: "Gradebook Entry", icon: BookOpenIcon, link: "/teacher/gradebook" },
              ].map((action, i) => (
                <Link 
                  key={i}
                  href={action.link}
                  className="w-full py-4 px-5 bg-white/5 hover:bg-white/10 rounded-2xl text-left transition-all border border-white/5 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <action.icon size={18} className="text-indigo-400" />
                    <span className="text-sm font-black tracking-tight">{action.label}</span>
                  </div>
                  <ChevronRightIcon size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
