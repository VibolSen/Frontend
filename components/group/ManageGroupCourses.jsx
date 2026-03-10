"use client";

import React, { useState, useMemo } from "react";
import { Search, Plus, Minus, ArrowRightLeft, CheckCircle2, BookOpen } from "lucide-react";

export default function ManageGroupCourses({
  initialGroup,
  allCourses,
  onSaveChanges,
  isLoading,
  onClose,
}) {
  const [assignedCourseIds, setAssignedCourseIds] = useState(
    initialGroup.courses?.map((c) => c.id) || []
  );
  const [searchTerm, setSearchTerm] = useState("");

  const { assignedCourses, availableCourses } = useMemo(() => {
    const assignedSet = new Set(assignedCourseIds);

    const filtered = allCourses.filter(c => {
      const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSearch;
    });

    const assigned = allCourses.filter(c => assignedSet.has(c.id));
    const available = filtered.filter(c => !assignedSet.has(c.id));

    return { assignedCourses: assigned, availableCourses: available };
  }, [allCourses, assignedCourseIds, searchTerm]);

  const handleAddCourse = (courseId) => {
    setAssignedCourseIds((prev) => [...prev, courseId]);
  };

  const handleRemoveCourse = (courseId) => {
    setAssignedCourseIds((prev) => prev.filter((id) => id !== courseId));
  };

  const handleSave = () => {
    onSaveChanges(assignedCourseIds);
  };

  const CourseCard = ({ course, type }) => (
    <div className="group flex items-center justify-between p-3 bg-white border border-slate-100 rounded-2xl hover:border-indigo-200 hover:shadow-md hover:shadow-indigo-500/5 transition-all mb-2">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${type === 'assigned' ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400'}`}>
          <BookOpen size={18} />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 tracking-tight">{course.name}</p>
          {course.leadBy && (
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">Lecturer: {course.leadBy.firstName} {course.leadBy.lastName}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => type === 'assigned' ? handleRemoveCourse(course.id) : handleAddCourse(course.id)}
        className={`p-2 rounded-xl transition-all ${type === 'assigned'
          ? 'text-rose-400 hover:bg-rose-50 hover:text-rose-600'
          : 'text-emerald-400 hover:bg-emerald-50 hover:text-emerald-600'
          }`}
      >
        {type === 'assigned' ? <Minus size={18} /> : <Plus size={18} />}
      </button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative group max-w-md mx-auto">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-500 transition-colors">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search academic catalog..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-semibold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start relative">
        {/* Available Courses */}
        <div className="flex flex-col h-[400px] lg:h-[450px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-slate-400">Available Courses</span>
              <span className="bg-slate-200 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{availableCourses.length}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
            {availableCourses.length > 0 ? (
              availableCourses.map((course) => (
                <CourseCard key={course.id} course={course} type="available" />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 border-2 border-dashed border-slate-100 rounded-3xl">
                <Search size={32} strokeWidth={1.5} />
                <p className="text-xs font-bold uppercase tracking-widest">No courses found</p>
              </div>
            )}
          </div>
        </div>

        {/* Transfer Indicator (Desktop only) */}
        <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10">
          <div className="p-3 bg-white rounded-full shadow-xl border border-slate-100 text-slate-300">
            <ArrowRightLeft size={24} />
          </div>
        </div>

        {/* Assigned Courses */}
        <div className="flex flex-col h-[400px] lg:h-[450px]">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-widest text-indigo-500">Selected Curriculum</span>
              <span className="bg-indigo-100 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full">{assignedCourses.length}</span>
            </div>
            {assignedCourses.length > 0 && (
              <button
                onClick={() => setAssignedCourseIds([])}
                className="text-[10px] font-bold text-rose-500 hover:underline"
              >
                Remove All
              </button>
            )}
          </div>

          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-1">
            {assignedCourses.length > 0 ? (
              assignedCourses.map((course) => (
                <CourseCard key={course.id} course={course} type="assigned" />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-300 gap-3 border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                <Plus size={32} strokeWidth={1.5} />
                <p className="text-xs font-bold uppercase tracking-widest text-center px-8">Assign courses to build curriculum</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t border-slate-200 mt-4">
        <div className="flex items-center gap-2 text-emerald-600">
          <CheckCircle2 size={16} />
          <span className="text-[11px] font-bold uppercase tracking-wider">Curriculum Ready</span>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-8 py-2.5 bg-indigo-600 text-white rounded-2xl text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:transform-none flex items-center gap-2"
          >
            {isLoading ? "Updating..." : "Confirm Assignment"}
          </button>
        </div>
      </div>
    </div>
  );
}
