"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useParams } from "next/navigation";
import ProfilePageContent from "@/components/ProfilePageContent";
import BackButton from "@/components/ui/BackButton";
import FullPageLoading from "@/components/ui/FullPageLoading";
import { apiClient } from "@/lib/api";

export default function StudentProfilePage() {
  const { user, loading: userLoading } = useUser();
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
    return <FullPageLoading message="Loading student records..." />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!student) {
    return <div>Student not found.</div>;
  }

  return (
    <div>
      <BackButton href="/study-office/students" label="Back to Student Management" />
      <ProfilePageContent
        user={student}
        isCurrentUser={false}
        onUpdateProfile={async () => {}}
      />
    </div>
  );
}
