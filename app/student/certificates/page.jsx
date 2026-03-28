"use client";

import React, { useState, useEffect } from "react";
import StudentCertificateView from "@/components/student/StudentCertificateView";
import { apiClient } from "@/lib/api";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function StudentCertificatesPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        const userId = storedUser ? JSON.parse(storedUser).id : null;
        if (userId) {
          const data = await apiClient.get(`/auth/me?userId=${userId}`);
          if (data) setCurrentUser(data);
        }
      } catch (error) {
        console.error("Failed to fetch current user:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <LoadingSpinner size="lg" color="blue" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8">
      <StudentCertificateView loggedInUser={currentUser} />
    </div>
  );
}
