"use client";

import React, { useState, useEffect } from "react";
import { useUser } from "@/context/UserContext";
import { useParams } from "next/navigation";
import ProfilePageContent from "@/components/ProfilePageContent";
import BackButton from "@/components/ui/BackButton";
import FullPageLoading from "@/components/ui/FullPageLoading";
import { apiClient } from "@/lib/api";

export default function TeacherProfilePage() {
  const { user, loading: userLoading } = useUser();
  const { id } = useParams();
  const [teacher, setTeacher] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (id) {
      const fetchTeacher = async () => {
        setIsLoading(true);
        try {
          const data = await apiClient.get(`/users/${id}`);
          setTeacher(data);
        } catch (err) {
          setError(err.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchTeacher();
    }
  }, [id]);

  if (isLoading || userLoading) {
    return <FullPageLoading message="Gathering teacher credentials..." />;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!teacher) {
    return <div>Teacher not found.</div>;
  }

  return (
    <div>
      <BackButton href="/study-office/teacher" label="Back to Teacher Management" />
      <ProfilePageContent
        user={teacher}
        isCurrentUser={false}
        onUpdateProfile={async () => {}}
      />
    </div>
  );
}
