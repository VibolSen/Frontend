"use client";

import React, { useState, useEffect } from "react";

import { useRouter } from "next/navigation";
import { apiClient } from '@/lib/api';

const TeacherSubmissionDetailView = ({ submission: initialSubmission }) => {
  const [submission, setSubmission] = useState(initialSubmission);
  const [grade, setGrade] = useState(initialSubmission.grade || "");
  const [feedback, setFeedback] = useState(initialSubmission.feedback || "");
  const [statusId, setStatusId] = useState(initialSubmission.statusId);
  const [statuses, setStatuses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const data = await apiClient.get("/utils/statuses");
        setStatuses(data);
      } catch (err) {
        console.error(err.message);
      }
    };
    fetchStatuses();
  }, []);


  const handleSave = async () => {
    setIsLoading(true);
    try {
      const updated = await apiClient.put(
        `/submissions/${submission.id}`,
        { grade, feedback, status: statusId } // statusId mapped to status
      );
      setSubmission(updated);
      console.log("Submission updated successfully!");
    } catch (err) {
      console.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!submission) {
    return <p className="text-center py-10">Submission not found.</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white shadow-lg rounded-lg p-8">
        <div className="border-b pb-4 mb-6">
          <h1 className="text-3xl font-bold text-slate-800">
            Submission for: {submission.assignment.title}
          </h1>
          <p className="text-slate-600 mt-1">
            Student: {submission.student.firstName}{" "}
            {submission.student.lastName}
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Course: {submission.assignment.course.title}
          </p>
          <p className="text-sm text-slate-500">
            Submitted On:{" "}
            {submission.submittedAt
              ? new Date(submission.submittedAt).toLocaleString()
              : "N/A"}
          </p>
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-slate-800">Content</h2>
          <p className="text-slate-600 whitespace-pre-wrap">
            {submission.content || "No content submitted."}
          </p>
          {submission.fileUrls && submission.fileUrls.length > 0 && (
            <div className="mt-4 space-y-2">
              <h3 className="text-sm font-semibold text-slate-700">Submitted Files:</h3>
              <div className="flex flex-wrap gap-3">
                {submission.fileUrls.map((url, idx) => (
                  <a
                    key={idx}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-100 text-sm font-medium"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    File {idx + 1}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <h2 className="text-xl font-semibold text-slate-800 mb-3">Grading</h2>
          <div className="mb-4">
            <label
              htmlFor="grade"
              className="block text-sm font-medium text-slate-700"
            >
              Grade (out of 100)
            </label>
            <input
              type="number"
              id="grade"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              min="0"
              max="100"
            />
          </div>
          <div className="mb-4">
            <label
              htmlFor="feedback"
              className="block text-sm font-medium text-slate-700"
            >
              Feedback
            </label>
            <textarea
              id="feedback"
              rows="4"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            ></textarea>
          </div>
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-slate-700"
            >
              Status
            </label>
            <select
              id="status"
              value={statusId}
              onChange={(e) => setStatusId(e.target.value)}
              className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            >
              {statuses.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={() => router.back()}
            className="px-4 py-2 bg-slate-200 text-slate-700 rounded-md hover:bg-slate-300"
          >
            Back
          </button>
          <button
            onClick={handleSave}
            disabled={isLoading}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {isLoading ? "Saving..." : "Save Grade & Feedback"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default TeacherSubmissionDetailView;
