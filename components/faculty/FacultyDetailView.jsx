"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Building2, GraduationCap, BookOpen, Users,
    ChevronDown, ChevronUp, UserCircle, Search, BadgeCheck
} from "lucide-react";
import { apiClient } from "@/lib/api";

const yearColors = {
    1: "bg-blue-100 text-blue-700",
    2: "bg-indigo-100 text-indigo-700",
    3: "bg-violet-100 text-violet-700",
    4: "bg-purple-100 text-purple-700",
};

function StatCard({ icon: Icon, label, value, color = "blue" }) {
    const colors = {
        blue: "bg-blue-50 text-blue-600 border-blue-100",
        indigo: "bg-indigo-50 text-indigo-600 border-indigo-100",
        emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
        amber: "bg-amber-50 text-amber-600 border-amber-100",
    };
    return (
        <div className={`flex items-center gap-3 p-4 rounded-2xl border ${colors[color]}`}>
            <div className="p-2 rounded-xl bg-white/70">
                <Icon size={18} className="opacity-80" />
            </div>
            <div>
                <p className="text-2xl font-black">{value}</p>
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">{label}</p>
            </div>
        </div>
    );
}

function DepartmentCard({ dept, index, role }) {
    const [expanded, setExpanded] = useState(false);
    const [tab, setTab] = useState("students"); // "students" | "courses"

    const studentsByYear = useMemo(() => {
        const map = { 1: [], 2: [], 3: [], 4: [], null: [] };
        (dept.users || []).forEach(s => {
            const yr = s.profile?.academicYear || null;
            (map[yr] || map[null]).push(s);
        });
        return map;
    }, [dept.users]);

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm"
        >
            {/* Department Header */}
            <button
                onClick={() => setExpanded(v => !v)}
                className="w-full flex items-center justify-between p-5 hover:bg-slate-50/60 transition-colors text-left"
            >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center border border-blue-200">
                        <Building2 size={18} className="text-indigo-600" />
                    </div>
                    <div>
                        <h3 className="text-[14px] font-black text-slate-800">{dept.name}</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {dept.head ? `Head: ${dept.head.firstName} ${dept.head.lastName}` : "No Head Assigned"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                    <span className="hidden sm:flex items-center gap-3">
                        <span className="px-2 py-1 text-[9px] font-black bg-indigo-50 text-indigo-700 border border-indigo-100 rounded-lg uppercase tracking-wide">
                            {dept.users?.length || 0} Students
                        </span>
                        <span className="px-2 py-1 text-[9px] font-black bg-blue-50 text-blue-700 border border-blue-100 rounded-lg uppercase tracking-wide">
                            {dept.departmentCourses?.length || 0} Courses
                        </span>
                    </span>
                    {expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                </div>
            </button>

            {/* Expanded Content */}
            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="overflow-hidden"
                    >
                        <div className="border-t border-slate-100 p-5 space-y-4">
                            {/* Tabs */}
                            <div className="flex gap-2">
                                {["students", "courses"].map(t => (
                                    <button key={t} onClick={() => setTab(t)}
                                        className={`px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${tab === t ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                            }`}>
                                        {t === "students" ? `Students (${dept.users?.length || 0})` : `Courses (${dept.departmentCourses?.length || 0})`}
                                    </button>
                                ))}
                            </div>

                            {/* Students Tab */}
                            {tab === "students" && (
                                <div className="space-y-3">
                                    {dept.users?.length === 0 ? (
                                        <div className="text-center py-8 text-slate-300">
                                            <GraduationCap size={28} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-xs font-bold">No students enrolled yet</p>
                                        </div>
                                    ) : (
                                        [1, 2, 3, 4].map(yr => {
                                            const group = studentsByYear[yr];
                                            if (!group || group.length === 0) return null;
                                            return (
                                                <div key={yr}>
                                                    <p className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-widest mb-2 ${yearColors[yr]}`}>
                                                        Year {yr} — {group.length} student{group.length !== 1 ? "s" : ""}
                                                    </p>
                                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                                                        {group.map(student => (
                                                            <div key={student.id} className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                                                <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center text-[9px] font-black shrink-0">
                                                                    {student.firstName[0]}{student.lastName[0]}
                                                                </div>
                                                                <div className="min-w-0">
                                                                    <p className="text-[11px] font-black text-slate-700 truncate">{student.firstName} {student.lastName}</p>
                                                                    <p className="text-[9px] text-slate-400 truncate">{student.profile?.studentId || student.email}</p>
                                                                </div>
                                                                {student.profile?.generation && (
                                                                    <span className="ml-auto text-[8px] font-bold text-slate-400 shrink-0">{student.profile.generation}</span>
                                                                )}
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            )}

                            {/* Courses Tab */}
                            {tab === "courses" && (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {dept.departmentCourses?.length === 0 ? (
                                        <div className="col-span-2 text-center py-8 text-slate-300">
                                            <BookOpen size={28} className="mx-auto mb-2 opacity-50" />
                                            <p className="text-xs font-bold">No courses assigned yet</p>
                                        </div>
                                    ) : (
                                        dept.departmentCourses.map(({ course }) => (
                                            <div key={course.id} className="flex items-start gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                                                <div className="p-2 bg-blue-100 rounded-lg shrink-0">
                                                    <BookOpen size={14} className="text-blue-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[12px] font-black text-slate-800 truncate">{course.name}</p>
                                                    <div className="flex items-center gap-2 mt-1">

                                                        <span className="text-[9px] text-slate-400">{course._count?.enrollments || 0} enrolled</span>
                                                        <span className="text-slate-200">•</span>
                                                        <span className="text-[9px] text-slate-400">{course._count?.groups || 0} group{(course._count?.groups || 0) !== 1 ? "s" : ""}</span>
                                                    </div>
                                                    {course.leadBy && (
                                                        <p className="text-[9px] text-slate-400 mt-0.5 truncate">
                                                            Taught by {course.leadBy.firstName} {course.leadBy.lastName}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

export default function FacultyDetailView({ role = "admin" }) {
    const { id } = useParams();
    const router = useRouter();
    const [faculty, setFaculty] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState("");

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        apiClient.get(`/faculties/${id}`)
            .then(setFaculty)
            .catch(err => setError(err.message))
            .finally(() => setIsLoading(false));
    }, [id]);

    const filteredDepts = useMemo(() => {
        if (!faculty) return [];
        return (faculty.departments || []).filter(d =>
            d.name.toLowerCase().includes(search.toLowerCase())
        );
    }, [faculty, search]);

    const stats = useMemo(() => {
        if (!faculty) return { depts: 0, students: 0, courses: 0 };
        const depts = faculty.departments || [];
        const students = depts.reduce((sum, d) => sum + (d.users?.length || 0), 0);
        const courses = depts.reduce((sum, d) => sum + (d.departmentCourses?.length || 0), 0);
        return { depts: depts.length, students, courses };
    }, [faculty]);

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error || !faculty) return (
        <div className="text-center py-20 text-slate-400">
            <p className="font-bold">Failed to load faculty: {error}</p>
            <button onClick={() => router.back()} className="mt-4 text-sm text-blue-600 hover:underline">Go back</button>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <div className="space-y-4">
                <button onClick={() => router.back()}
                    className="flex items-center gap-1.5 text-slate-500 hover:text-blue-600 text-sm font-semibold transition-colors">
                    <ArrowLeft size={14} />
                    Back to Faculties
                </button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-blue-200">
                            {faculty.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{faculty.name}</h1>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <StatCard icon={Building2} label="Departments" value={stats.depts} color="blue" />
                    <StatCard icon={GraduationCap} label="Students" value={stats.students} color="indigo" />
                    <StatCard icon={BookOpen} label="Courses" value={stats.courses} color="emerald" />
                </div>
            </div>

            {/* Departments Section */}
            <div className="space-y-4">
                <div className="flex items-center justify-between gap-3">
                    <h2 className="text-sm font-black text-slate-700 uppercase tracking-widest">Departments</h2>
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Search departments..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-400 w-48 text-slate-700"
                        />
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    </div>
                </div>

                {filteredDepts.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 text-slate-300">
                        <Building2 size={32} className="mx-auto mb-3" />
                        <p className="font-bold text-sm">No departments found</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filteredDepts.map((dept, i) => (
                            <DepartmentCard key={dept.id} dept={dept} index={i} role={role} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
