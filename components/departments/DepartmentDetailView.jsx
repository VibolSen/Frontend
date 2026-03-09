"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft, Building2, GraduationCap, BookOpen, Users,
    ChevronDown, ChevronUp, UserCircle, Search, BadgeCheck,
    Mortarboard, School, Calendar, RefreshCcw, UserPlus, CheckCircle2, AlertCircle, X
} from "lucide-react";
import { apiClient } from "@/lib/api";

const yearColors = {
    1: "bg-blue-100 text-blue-700",
    2: "bg-indigo-100 text-indigo-700",
    3: "bg-violet-100 text-violet-700",
    4: "bg-purple-100 text-purple-700",
    5: "bg-slate-100 text-slate-700",
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

const StudentSmallCard = ({ student }) => (
    <div className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-indigo-200 hover:bg-white transition-all cursor-default">
        <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-black shadow-sm group-hover:scale-110 transition-transform overflow-hidden relative">
                {student.profile?.avatar ? (
                    <img
                        src={student.profile.avatar}
                        alt={`${student.firstName} ${student.lastName}`}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span>{student.firstName[0]}{student.lastName[0]}</span>
                )}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-sm font-black text-slate-800 truncate">{student.firstName} {student.lastName}</p>
                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{student.profile?.studentId || "NO ID"}</p>
                    <span className="text-slate-300">•</span>
                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-tight">
                        Y{student.profile?.academicYear || 1} S{student.profile?.semester || 1}
                    </p>
                    {student.profile?.generation && (
                        <>
                            <span className="text-slate-300">•</span>
                            <div className="flex items-center gap-1">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-tight">{student.profile.generation}</p>
                                {student.profile.batch && (
                                    <span className={`text-[8px] font-black uppercase px-1 rounded-sm ${student.profile.batch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                        {student.profile.batch.status[0]}
                                    </span>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default function DepartmentDetailView({ role = "admin" }) {
    const { id } = useParams();
    const router = useRouter();
    const [department, setDepartment] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tab, setTab] = useState("students"); // "students" | "courses"
    const [studentView, setStudentView] = useState("year"); // "year" | "generation"
    const [search, setSearch] = useState("");
    const [sortBy, setSortBy] = useState("name-asc"); // "name-asc", "name-desc", "id-asc", "id-desc"
    const [filters, setFilters] = useState({
        gender: "",
        status: "",
        semester: ""
    });
    const [isGenerationModalOpen, setIsGenerationModalOpen] = useState(false);
    const [selectedGeneration, setSelectedGeneration] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    const fetchDepartment = async () => {
        if (!id) return;
        setIsLoading(true);
        try {
            const data = await apiClient.get(`/departments/${id}`);
            setDepartment(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchDepartment();
    }, [id]);

    const handlePromoteGeneration = async (batchId) => {
        if (!confirm("Are you sure you want to promote all students in this generation to the next academic year?")) return;
        setIsActionLoading(true);
        try {
            await apiClient.post(`/batches/${batchId}/promote`);
            await fetchDepartment();
            alert("Generation promoted successfully!");
        } catch (err) {
            alert("Failed to promote generation: " + err.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleUpdateGenerationStatus = async (batchId, status) => {
        if (!confirm(`Are you sure you want to set all students in this generation to ${status}?`)) return;
        setIsActionLoading(true);
        try {
            await apiClient.post(`/batches/${batchId}/status`, { academicStatus: status });
            await apiClient.put(`/batches/${batchId}`, { status });
            await fetchDepartment();
            alert("Generation status updated successfully!");
        } catch (err) {
            alert("Failed to update generation: " + err.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSaveGeneration = async (batchData) => {
        setIsActionLoading(true);
        try {
            if (selectedGeneration) {
                await apiClient.put(`/batches/${selectedGeneration.id}`, batchData);
            } else {
                await apiClient.post('/batches', { ...batchData, departmentId: id });
            }
            await fetchDepartment();
            setIsGenerationModalOpen(false);
            setSelectedGeneration(null);
        } catch (err) {
            alert("Failed to save generation: " + err.message);
        } finally {
            setIsActionLoading(false);
        }
    };

    const studentsByYear = useMemo(() => {
        if (!department) return { 1: [], 2: [], 3: [], 4: [], 5: [], null: [] };
        const map = { 1: [], 2: [], 3: [], 4: [], 5: [], null: [] };
        (department.users || []).forEach(s => {
            const yr = s.profile?.academicYear || null;
            if (map[yr]) map[yr].push(s);
            else map[null].push(s);
        });
        return map;
    }, [department]);

    const filteredStudents = useMemo(() => {
        if (!department) return [];
        let list = (department.users || []).filter(s => {
            const matchesSearch = `${s.firstName} ${s.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
                s.profile?.studentId?.toLowerCase().includes(search.toLowerCase());

            const matchesGender = !filters.gender || s.profile?.gender === filters.gender;
            const matchesStatus = !filters.status || s.profile?.academicStatus === filters.status;
            const matchesSemester = !filters.semester || s.profile?.semester === parseInt(filters.semester);

            return matchesSearch && matchesGender && matchesStatus && matchesSemester;
        });

        // Apply Sorting
        return [...list].sort((a, b) => {
            if (sortBy === "name-asc") return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
            if (sortBy === "name-desc") return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`);
            if (sortBy === "id-asc") return (a.profile?.studentId || "").localeCompare(b.profile?.studentId || "");
            if (sortBy === "id-desc") return (b.profile?.studentId || "").localeCompare(a.profile?.studentId || "");
            return 0;
        });
    }, [department, search, sortBy, filters]);

    const filteredCourses = useMemo(() => {
        if (!department) return [];
        return (department.departmentCourses || []).filter(({ course }) =>
            course.name.toLowerCase().includes(search.toLowerCase()) ||
            course.code?.toLowerCase().includes(search.toLowerCase())
        );
    }, [department, search]);

    const uniqueGenerations = useMemo(() => {
        if (!department || !department.users) return [];
        const gens = department.users
            .map(u => u.profile?.generation)
            .filter(g => g && g.trim() !== "");
        return [...new Set(gens)].sort();
    }, [department]);

    const studentsByGeneration = useMemo(() => {
        if (!department) return {};
        const map = {};
        (department.users || []).forEach(s => {
            const gen = s.profile?.generation || "Unassigned";
            if (!map[gen]) map[gen] = [];
            map[gen].push(s);
        });
        return map;
    }, [department]);

    const stats = useMemo(() => {
        if (!department) return { students: 0, courses: 0, generations: 0 };
        return {
            students: department._count?.users || 0,
            courses: department._count?.departmentCourses || 0,
            generations: uniqueGenerations.length
        };
    }, [department, uniqueGenerations]);

    if (isLoading) return (
        <div className="flex items-center justify-center py-32">
            <div className="h-8 w-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    if (error || !department) return (
        <div className="text-center py-20 text-slate-400">
            <p className="font-bold">Failed to load department: {error}</p>
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
                    Back to Departments
                </button>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
                            {department.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">{department.name}</h1>
                                {department.faculty && (
                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[10px] font-bold uppercase tracking-widest border border-slate-200">
                                        {department.faculty.name}
                                    </span>
                                )}
                            </div>
                            {department.head ? (
                                <div className="flex items-center gap-1.5 mt-1">
                                    <BadgeCheck size={13} className="text-emerald-500" />
                                    <span className="text-sm text-slate-500 font-medium">
                                        Head: <span className="font-bold text-slate-700">{department.head.firstName} {department.head.lastName}</span>
                                    </span>
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic mt-1">No Head Assigned</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    <StatCard icon={GraduationCap} label="Students" value={stats.students} color="indigo" />
                    <StatCard icon={BookOpen} label="Courses" value={stats.courses} color="emerald" />
                    <StatCard icon={Users} label="Generations" value={stats.generations} color="amber" />
                    {department.faculty && (
                        <div className="flex items-center gap-3 p-4 rounded-2xl border bg-slate-50 text-slate-600 border-slate-100">
                            <div className="p-2 rounded-xl bg-white/70">
                                <School size={18} className="opacity-80" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black truncate">{department.faculty.name}</p>
                                <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Faculty</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Generation Enrollment Summary (Now powered by the New Batch Management) */}
                {(department.batches || []).length > 0 && (
                    <div className="bg-amber-50/50 border border-amber-100 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar size={14} className="text-amber-600" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-amber-700">Generation Enrollment Summary</h3>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {(department.batches || []).map(batch => {
                                const count = studentsByGeneration[batch.name]?.length || 0;
                                return (
                                    <div key={batch.id} className="flex items-center bg-white border border-amber-200 rounded-lg shadow-sm overflow-hidden text-[10px] font-black">
                                        <div className="flex flex-col border-r border-amber-100">
                                            <span className="px-3 py-0.5 text-amber-700">{batch.name}</span>
                                            {batch.startDate && (
                                                <span className="px-3 pb-1 text-[8px] text-amber-400 font-bold -mt-1 tracking-tight">
                                                    Starts {new Date(batch.startDate).getFullYear()}
                                                </span>
                                            )}
                                        </div>
                                        <span className="px-2 py-2 bg-amber-600 text-white min-h-full flex items-center">{count} Students</span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Content Tabs */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="p-6 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex gap-2">
                            {["students", "courses", "generations"].map(t => (
                                <button
                                    key={t}
                                    onClick={() => setTab(t)}
                                    className={`px-5 py-2 text-[11px] font-black uppercase tracking-widest rounded-xl transition-all ${tab === t
                                        ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100"
                                        : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                                        }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder={`Search ${tab}...`}
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-full sm:w-64"
                            />
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        </div>
                    </div>

                    {tab === "students" && (
                        <div className="flex flex-wrap items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="flex items-center gap-2 pr-4 border-r border-slate-200">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent text-[11px] font-bold text-slate-700 focus:outline-none cursor-pointer"
                                >
                                    <option value="name-asc">Name (A-Z)</option>
                                    <option value="name-desc">Name (Z-A)</option>
                                    <option value="id-asc">ID (Low-High)</option>
                                    <option value="id-desc">ID (High-Low)</option>
                                </select>
                            </div>

                            <div className="flex flex-wrap items-center gap-4 flex-1">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Filters:</span>

                                <select
                                    value={filters.gender}
                                    onChange={(e) => setFilters(p => ({ ...p, gender: e.target.value }))}
                                    className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 focus:outline-none focus:border-indigo-300 transition-all"
                                >
                                    <option value="">Any Gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                </select>

                                <select
                                    value={filters.status}
                                    onChange={(e) => setFilters(p => ({ ...p, status: e.target.value }))}
                                    className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 focus:outline-none focus:border-indigo-300 transition-all"
                                >
                                    <option value="">Any Status</option>
                                    <option value="ACTIVE">Active</option>
                                    <option value="ON_LEAVE">On Leave</option>
                                    <option value="GRADUATED">Graduated</option>
                                </select>

                                <select
                                    value={filters.semester}
                                    onChange={(e) => setFilters(p => ({ ...p, semester: e.target.value }))}
                                    className="bg-white px-2 py-1 rounded-lg border border-slate-200 text-[10px] font-bold text-slate-600 focus:outline-none focus:border-indigo-300 transition-all"
                                >
                                    <option value="">Any Semester</option>
                                    <option value="1">Semester 1</option>
                                    <option value="2">Semester 2</option>
                                </select>

                                {(filters.gender || filters.status || filters.semester) && (
                                    <button
                                        onClick={() => setFilters({ gender: "", status: "", semester: "" })}
                                        className="text-[10px] font-black text-indigo-600 uppercase hover:text-indigo-800 transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                            </div>
                        </div>
                    )}

                    {tab === "students" && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Group by:</span>
                                <button
                                    onClick={() => setStudentView("year")}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${studentView === "year" ? "bg-indigo-100 text-indigo-700 border border-indigo-200" : "text-slate-500 hover:bg-slate-100"
                                        }`}
                                >
                                    Academic Year
                                </button>
                                <button
                                    onClick={() => setStudentView("generation")}
                                    className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-tight transition-all ${studentView === "generation" ? "bg-amber-100 text-amber-700 border border-amber-200" : "text-slate-500 hover:bg-slate-100"
                                        }`}
                                >
                                    Generation
                                </button>
                            </div>

                            {studentView === "year" ? (
                                [1, 2, 3, 4, 5].map(yr => {
                                    const yrStudents = filteredStudents.filter(s => s.profile?.academicYear === yr);
                                    if (yrStudents.length === 0 && search) return null;
                                    if (yrStudents.length === 0 && !search) {
                                        const totalInYear = studentsByYear[yr]?.length || 0;
                                        if (totalInYear === 0) return null;
                                    }

                                    return (
                                        <div key={yr} className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <p className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${yearColors[yr] || "bg-slate-100 text-slate-500"}`}>
                                                    Year {yr}
                                                </p>
                                                <div className="h-px flex-1 bg-slate-100" />
                                                <span className="text-[10px] font-bold text-slate-400">{yrStudents.length} Students</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {yrStudents.map(student => (
                                                    <StudentSmallCard key={student.id} student={student} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                Object.keys(studentsByGeneration).sort().map(gen => {
                                    const genStudents = filteredStudents.filter(s => (s.profile?.generation || "Unassigned") === gen);
                                    if (genStudents.length === 0) return null;

                                    return (
                                        <div key={gen} className="space-y-3">
                                            <div className="flex items-center gap-3">
                                                <p className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 border border-amber-200 text-[10px] font-black uppercase tracking-widest">
                                                    {gen}
                                                </p>
                                                <div className="h-px flex-1 bg-slate-100" />
                                                <span className="text-[10px] font-bold text-slate-400">{genStudents.length} Students</span>
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {genStudents.map(student => (
                                                    <StudentSmallCard key={student.id} student={student} />
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })
                            )}

                            {filteredStudents.length === 0 && (
                                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Users size={32} className="mx-auto mb-3 text-slate-300" />
                                    <p className="text-sm font-bold text-slate-400">No students found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === "courses" && (
                        <div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredCourses.map(({ course }) => (
                                    <div key={course.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-md hover:shadow-indigo-50 transition-all flex items-start gap-4">
                                        <div className="p-3 bg-white rounded-xl border border-indigo-100 shadow-sm shrink-0">
                                            <BookOpen size={20} className="text-indigo-600" />
                                        </div>
                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-[14px] font-black text-slate-800 truncate">{course.name}</p>
                                                {course.code && (
                                                    <span className="px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-wider">
                                                        {course.code}
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                                                <div className="flex items-center gap-1.5">
                                                    <Users size={12} className="text-slate-400" />
                                                    <span className="text-[11px] font-bold text-slate-500">{course._count?.enrollments || 0} Enrolled</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <School size={12} className="text-slate-400" />
                                                    <span className="text-[11px] font-bold text-slate-500">{course._count?.groups || 0} Groups</span>
                                                </div>
                                            </div>
                                            {course.leadBy && (
                                                <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center gap-2">
                                                    <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-[8px] font-black text-slate-500">
                                                        {course.leadBy.firstName[0]}
                                                    </div>
                                                    <p className="text-[10px] font-bold text-slate-400">
                                                        Led by <span className="text-slate-600 font-black">{course.leadBy.firstName} {course.leadBy.lastName}</span>
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {filteredCourses.length === 0 && (
                                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <BookOpen size={32} className="mx-auto mb-3 text-slate-300" />
                                    <p className="text-sm font-bold text-slate-400">No courses found</p>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === "generations" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                                <div>
                                    <h3 className="text-[12px] font-black uppercase tracking-widest text-slate-800">Academic Generations</h3>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">Manage cohorts, dates, and graduation cycles</p>
                                </div>
                                <button
                                    onClick={() => setIsGenerationModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-700 shadow-md shadow-indigo-100"
                                >
                                    <UserPlus size={14} />
                                    New Generation
                                </button>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {(department.batches || []).map(batch => (
                                    <div key={batch.id} className="p-5 bg-white border border-slate-200 rounded-3xl shadow-sm hover:shadow-md transition-all">
                                        <div className="flex flex-col lg:flex-row justify-between gap-6">
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-3">
                                                    <h4 className="text-lg font-black text-slate-800">{batch.name}</h4>
                                                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${batch.status === 'ACTIVE' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'
                                                        }`}>
                                                        {batch.status}
                                                    </span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-slate-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={14} className="text-slate-400" />
                                                        <span className="text-[11px] font-bold">
                                                            {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'N/A'} — {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'N/A'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={14} className="text-slate-400" />
                                                        <span className="text-[11px] font-bold">
                                                            {studentsByGeneration[batch.name]?.length || 0} Students Assigned
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6">
                                                <button
                                                    onClick={() => handlePromoteGeneration(batch.id)}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-100"
                                                >
                                                    <RefreshCcw size={14} />
                                                    Promote Year
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateGenerationStatus(batch.id, 'GRADUATED')}
                                                    className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-100"
                                                >
                                                    <CheckCircle2 size={14} />
                                                    Set Graduated
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedGeneration(batch);
                                                        setIsGenerationModalOpen(true);
                                                    }}
                                                    className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100"
                                                >
                                                    Edit Generation
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {(department.batches || []).length === 0 && (
                                <div className="text-center py-20 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                                    <Calendar size={32} className="mx-auto mb-3 text-slate-300" />
                                    <p className="text-sm font-bold text-slate-400">No generations defined for this department</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            <GenerationModal
                isOpen={isGenerationModalOpen}
                onClose={() => {
                    setIsGenerationModalOpen(false);
                    setSelectedGeneration(null);
                }}
                onSave={handleSaveGeneration}
                generationToEdit={selectedGeneration}
                isLoading={isActionLoading}
            />
        </div>
    );
}

function GenerationModal({ isOpen, onClose, onSave, generationToEdit, isLoading }) {
    const [name, setName] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    useEffect(() => {
        if (isOpen) {
            setName(generationToEdit?.name || "");
            setStartDate(generationToEdit?.startDate ? new Date(generationToEdit.startDate).toISOString().split('T')[0] : "");
            setEndDate(generationToEdit?.endDate ? new Date(generationToEdit.endDate).toISOString().split('T')[0] : "");
        }
    }, [isOpen, generationToEdit]);

    // Auto-calculate end date (4 years after start date)
    const handleStartDateChange = (e) => {
        const start = e.target.value;
        setStartDate(start);

        if (start) {
            const date = new Date(start);
            date.setFullYear(date.getFullYear() + 4);
            setEndDate(date.toISOString().split('T')[0]);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
            >
                <div className="p-6 border-b flex justify-between items-center">
                    <h2 className="text-xl font-black text-slate-800">{generationToEdit ? "Edit Generation" : "New Generation"}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={20} /></button>
                </div>
                <form onSubmit={(e) => { e.preventDefault(); onSave({ name, startDate, endDate }); }} className="p-6 space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Generation Name</label>
                        <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. G1" className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Start Date</label>
                            <input type="date" value={startDate} onChange={handleStartDateChange} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">End Date</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-5 py-2 text-sm font-bold text-slate-500">Cancel</button>
                        <button type="submit" disabled={isLoading} className="px-6 py-2 bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 disabled:opacity-50">
                            {isLoading ? "Saving..." : generationToEdit ? "Update Generation" : "Save Generation"}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
