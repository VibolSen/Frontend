import React, { useState, useEffect, useMemo } from "react";
import { SubmissionStatus } from "../types";
import LoadingSpinner from "./ui/LoadingSpinner";
import { apiClient } from "@/lib/api";

const getStatusBadge = (status, grade) => {
  switch (status) {
    case SubmissionStatus.PENDING:
      return (
        <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-200 rounded-full">
          Not Submitted
        </span>
      );
    case SubmissionStatus.SUBMITTED:
      return (
        <span className="px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-200 rounded-full">
          Submitted
        </span>
      );
    case SubmissionStatus.LATE:
      return (
        <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-200 rounded-full">
          Late
        </span>
      );
    case SubmissionStatus.GRADED:
      return (
        <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-200 rounded-full">
          Graded: {grade}%
        </span>
      );
    default:
      return null;
  }
};

const SubmissionDetailView = ({ assignment, course, onBack, onEdit }) => {
  const [submissions, setSubmissions] = useState([]);
  const [courseStudents, setCourseStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingGrade, setEditingGrade] = useState(null);
  const [gradeValue, setGradeValue] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [submissionsData, studentsData] = await Promise.all([
          apiClient.get(`/submissions?assignmentId=${assignment.id}`),
          apiClient.get(`/students?courseId=${course.id}`),
        ]);

        setSubmissions(submissionsData || []);
        setCourseStudents(studentsData || []);
      } catch (err) {
        setError(err.message || "An unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [assignment.id, course.id]);

  const submissionDetails = useMemo(() => {
    const details = courseStudents
      .map((student) => {
        const submission = submissions.find(
          (s) => s.assignmentId === assignment.id && s.studentId === student.id
        );
        if (submission) {
          return { studentName: student.name, ...submission };
        }
        return {
          id: `placeholder-${student.id}`,
          assignmentId: assignment.id,
          studentId: student.id,
          submissionDate: null,
          status: SubmissionStatus.PENDING,
          grade: null,
          studentName: student.name,
        };
      })
      .sort((a, b) => a.studentName.localeCompare(b.studentName));

    if (statusFilter === "All") {
      return details;
    }
    return details.filter((sub) => sub.status === statusFilter);
  }, [assignment.id, courseStudents, submissions, statusFilter]);

  const handleGradeClick = (sub) => {
    setEditingGrade({ submissionId: sub.id, studentId: sub.studentId });
    setGradeValue(sub.grade?.toString() || "");
  };

  const handleGradeChange = (e) => {
    setGradeValue(e.target.value);
  };

  const handleSaveGrade = async (submissionId, studentId) => {
    const grade = parseInt(gradeValue, 10);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      alert("Please enter a valid grade between 0 and 100.");
      return;
    }

    try {
      const updatedSubmission = await apiClient.put(`/submissions/${submissionId}`, { 
        grade, 
        status: SubmissionStatus.GRADED 
      });

      const updatedSubmissions = submissions.map((s) =>
        s.id === updatedSubmission.id ? updatedSubmission : s
      );
      setSubmissions(updatedSubmissions);
      setEditingGrade(null);
      setGradeValue("");
    } catch (error) {
      alert(error.response?.data?.error || error.message || "An unknown error occurred");
    }
  };

  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const handleViewSubmission = (sub) => {
    setSelectedSubmission(sub);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <LoadingSpinner size="xl" />
        <p className="text-slate-500 font-semibold animate-pulse tracking-wide">
          Retrieving Submission Details...
        </p>
      </div>
    );
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <button
        onClick={onBack}
        className="flex items-center text-sm font-semibold text-blue-600 hover:underline"
      >
        <svg
          className="w-4 h-4 mr-1"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 19l-7-7 7-7"
          ></path>
        </svg>
        Back to Assignments
      </button>

      <div className="bg-white p-6 rounded-xl shadow-md">
        <div className="border-b border-slate-200 pb-4 mb-4">
          <div className="flex justify-between items-start gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                {assignment.title}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {course.name} &bull; Due:{" "}
                {new Date(assignment.dueDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => onEdit(assignment)}
              className="flex-shrink-0 bg-white border border-slate-300 text-slate-700 px-3 py-1.5 rounded-md text-sm font-semibold hover:bg-slate-50 transition"
            >
              Edit Assignment
            </button>
          </div>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-700 mb-2 flex items-center justify-between">
            Description & Instructions
            {assignment.attachmentUrls?.length > 0 && (
                <span className="text-[10px] bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-black uppercase tracking-widest border border-blue-100">
                    {assignment.attachmentUrls.length} Board Materials
                </span>
            )}
          </h2>
          <div className="space-y-4">
              <p className="text-slate-600 whitespace-pre-wrap leading-relaxed">
                {assignment.description ||
                  "No description was provided for this assignment."}
              </p>
              
              {assignment.attachmentUrls?.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mt-4">
                      {assignment.attachmentUrls.map((url, idx) => (
                          <a 
                            key={idx}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-2 bg-slate-50 border border-slate-100 rounded-xl hover:bg-blue-50 hover:border-blue-200 transition-all group"
                          >
                              <div className="w-8 h-8 flex items-center justify-center bg-white rounded-lg border border-slate-200 group-hover:border-blue-200 shrink-0 shadow-sm">
                                  <svg className="w-4 h-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                              </div>
                              <span className="text-xs font-bold text-slate-600 truncate group-hover:text-blue-700">
                                  {url.split('/').pop()}
                              </span>
                          </a>
                      ))}
                  </div>
              )}
          </div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-md border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="flex items-center gap-3">
              <div className="w-1.5 h-6 bg-indigo-600 rounded-full" />
              <h2 className="text-xl font-black text-slate-800 tracking-tight uppercase">
                Academic Submissions ({submissionDetails.length})
              </h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Filter Status</span>
            <select
              id="submission-status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value={SubmissionStatus.PENDING}>Not Submitted</option>
              <option value={SubmissionStatus.SUBMITTED}>Submitted</option>
              <option value={SubmissionStatus.LATE}>Late</option>
              <option value={SubmissionStatus.GRADED}>Graded</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-100">
          {submissionDetails.length > 0 ? (
            <table className="w-full text-sm text-left">
              <thead className="text-[10px] text-slate-400 font-black uppercase bg-slate-50 tracking-widest">
                <tr>
                  <th scope="col" className="px-6 py-4">Student</th>
                  <th scope="col" className="px-6 py-4">Timeline</th>
                  <th scope="col" className="px-6 py-4">Status</th>
                  <th scope="col" className="px-6 py-4 text-center">Score</th>
                  <th scope="col" className="px-6 py-4 text-center">Operations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {submissionDetails.map((sub) => (
                  <tr
                    key={sub.id}
                    className="bg-white hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold shadow-sm">
                              {sub.studentName.charAt(0)}
                          </div>
                          <span className="font-bold text-slate-700">{sub.studentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex flex-col">
                          <span className={`text-xs font-bold ${sub.status === SubmissionStatus.LATE ? "text-red-500" : "text-slate-600"}`}>
                            {sub.submissionDate ? new Date(sub.submissionDate).toLocaleDateString() : "—"}
                          </span>
                          {sub.submissionDate && (
                              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
                                  {new Date(sub.submissionDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                          )}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(sub.status, sub.grade)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {editingGrade?.submissionId === sub.id ? (
                        <input
                          type="number"
                          min="0"
                          max="100"
                          value={gradeValue}
                          onChange={handleGradeChange}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              handleSaveGrade(sub.id, sub.studentId);
                            } else if (e.key === "Escape") {
                              setEditingGrade(null);
                            }
                          }}
                          className="w-16 h-10 bg-indigo-50 border-2 border-indigo-200 rounded-xl text-sm text-center font-black text-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500"
                          autoFocus
                        />
                      ) : (
                        <div className={`inline-flex items-center justify-center w-12 h-10 rounded-xl font-black text-sm ${sub.grade !== null ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-50 text-slate-400 border border-slate-100"}`}>
                            {sub.grade !== null ? sub.grade : "—"}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center items-center gap-2">
                        {sub.status !== SubmissionStatus.PENDING && (
                            <button
                                onClick={() => handleViewSubmission(sub)}
                                className="p-2 bg-blue-50 text-blue-600 rounded-xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                                title="View Work"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                            </button>
                        )}
                        
                        {editingGrade?.submissionId === sub.id ? (
                          <div className="flex gap-1">
                              <button
                                onClick={() => handleSaveGrade(sub.id, sub.studentId)}
                                className="p-2 bg-emerald-500 text-white rounded-xl shadow-md hover:bg-emerald-600 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              </button>
                              <button
                                onClick={() => setEditingGrade(null)}
                                className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-all"
                              >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleGradeClick(sub)}
                            className="p-2 bg-slate-50 text-slate-500 border border-slate-200 rounded-xl hover:bg-indigo-600 hover:text-white hover:border-indigo-600 transition-all shadow-sm"
                            title="Assign Grade"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-20 bg-slate-50/50 rounded-2xl border-2 border-dashed border-slate-100">
               <div className="w-16 h-16 bg-white rounded-2xl border border-slate-100 flex items-center justify-center mx-auto mb-4 shadow-sm text-slate-300">
                   <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                   </svg>
               </div>
               <h3 className="font-black text-slate-800 uppercase tracking-tight">No Submissions Detected</h3>
               <p className="text-slate-500 text-xs mt-1">Refine your filters or wait for student uploads.</p>
            </div>
          )}
        </div>
      </div>

      {/* Submission Detail Modal */}
      {selectedSubmission && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
              <div className="bg-white rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col border border-white/20 animate-in zoom-in-95 duration-300">
                  <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
                      <div className="flex items-center gap-4">
                          <div className="w-14 h-14 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-200">
                              {selectedSubmission.studentName.charAt(0)}
                          </div>
                          <div>
                              <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-none mb-1">{selectedSubmission.studentName}'s Work</h2>
                              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{assignment.title}</p>
                          </div>
                      </div>
                      <button 
                        onClick={() => setSelectedSubmission(null)}
                        className="p-3 bg-slate-100 text-slate-400 rounded-2xl hover:bg-red-50 hover:text-red-500 transition-all active:scale-95"
                      >
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                      </button>
                  </div>
                  
                  <div className="p-8 overflow-y-auto space-y-8 flex-1 scrollbar-hide">
                      <div className="space-y-3">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Submitted Description</h3>
                          <div className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100 text-slate-600 leading-relaxed whitespace-pre-wrap min-h-[150px] shadow-inner">
                              {selectedSubmission.content || "The student provided no written text for this submission."}
                          </div>
                      </div>
                      
                      <div className="space-y-4">
                          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Evidence & Attachments</h3>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {selectedSubmission.fileUrls && selectedSubmission.fileUrls.length > 0 ? (
                                  selectedSubmission.fileUrls.map((url, idx) => (
                                      <a 
                                        key={idx}
                                        href={url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-4 p-4 bg-white border border-slate-100 rounded-[1.5rem] hover:border-indigo-500 hover:shadow-xl hover:shadow-indigo-50 transition-all group shadow-sm"
                                      >
                                          <div className="w-12 h-12 flex items-center justify-center bg-indigo-50 rounded-2xl group-hover:bg-indigo-600 transition-colors shrink-0">
                                              <svg className="w-6 h-6 text-indigo-600 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                              </svg>
                                          </div>
                                          <div className="flex flex-col min-w-0">
                                              <span className="text-sm font-black text-slate-800 truncate">{url.split('/').pop()}</span>
                                              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Document Material</span>
                                          </div>
                                      </a>
                                  ))
                              ) : (
                                  <div className="col-span-full py-12 flex flex-col items-center justify-center bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-100 opacity-50">
                                      <svg className="w-12 h-12 text-slate-200 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                      </svg>
                                      <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No Cloud Attachments Located</span>
                                  </div>
                              )}
                          </div>
                      </div>
                  </div>
                  
                  <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
                      <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            Captured: {selectedSubmission.submissionDate ? new Date(selectedSubmission.submissionDate).toLocaleString() : "Sync Trace Offline"}
                          </span>
                      </div>
                      <button 
                        onClick={() => {
                            setEditingGrade({ submissionId: selectedSubmission.id, studentId: selectedSubmission.studentId });
                            setGradeValue(selectedSubmission.grade?.toString() || "");
                            setSelectedSubmission(null);
                        }}
                        className="bg-indigo-600 text-white text-[11px] font-black uppercase tracking-widest px-8 py-3 rounded-2xl hover:bg-indigo-700 shadow-lg shadow-indigo-100 transition-all active:scale-95"
                      >
                         Initiate Evaluation
                      </button>
                  </div>
              </div>
          </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scale-in {
            from { transform: scale(0.9); opacity: 0; }
            to { transform: scale(1); opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-scale-in {
            animation: scale-in 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
        @keyframes shake {
            0%, 100% { transform: translateX(0); }
            10%, 30%, 50%, 70%, 90% { transform: translateX(-2px); }
            20%, 40%, 60%, 80% { transform: translateX(2px); }
        }
        .animate-shake {
            animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
      `}</style>
    </div>
  );
};

export default SubmissionDetailView;
