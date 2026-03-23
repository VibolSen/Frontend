"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useParams } from "next/navigation";
import ProfilePageContent from "@/components/ProfilePageContent";
import Link from "next/link";
import FullPageLoading from "@/components/ui/FullPageLoading";
import { ArrowLeft } from "lucide-react";
import { apiClient } from "@/lib/api";
import BackButton from "@/components/ui/BackButton";

export default function TeacherStudentProfilePage() {
  const { user: teacher, loading: userLoading } = useUser();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchStudent = async () => {
        setIsLoading(true);
        try {
          const data = await apiClient.get(`/users/${id}`);
          setStudent(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudent();
    }
  }, [id]);

  if (isLoading || userLoading) {
    return <FullPageLoading message="Accessing student record..." />;
  }

  if (error) {
    return (
      <div className="p-8 text-center bg-red-50 text-red-600 rounded-xl border border-red-100">
        <p className="font-semibold">Error: {error}</p>
        <div className="mt-6 flex justify-center">
          <BackButton href="/teacher/students" label="Back to My Students" className="mb-0" />
        </div>
      </div>

    );
  }

  if (!student) {
    return (
      <div className="p-8 text-center bg-gray-50 text-gray-600 rounded-xl border border-gray-100">
        <p className="font-semibold">Student member not found.</p>
        <div className="mt-6 flex justify-center">
          <BackButton href="/teacher/students" label="Back to My Students" className="mb-0" />
        </div>
      </div>

    );
  }

  return (
    <div className="space-y-4">
      <BackButton href="/teacher/students" label="Back to Students" className="mb-4" />
      <ProfilePageContent

        user={student}
        isCurrentUser={false}
        onUpdateProfile={async () => {}}
      />
    </div>
  );
}
