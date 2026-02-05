"use client";

import { useUser } from "@/context/UserContext";
import FullPageLoading from "@/components/ui/FullPageLoading";
import ProfilePageContent from "@/components/ProfilePageContent";
import { apiClient } from "@/lib/api";

export default function ProfilePage() {
  const { user, loading } = useUser();

  const handleUpdateProfile = async (formData) => {
    try {
      const updatedUser = await apiClient.put(`/users?id=${user.id}`, formData);
      return updatedUser;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  if (loading) {
    return <FullPageLoading message="Accessing profile data..." />;
  }

  return (
    <ProfilePageContent
      user={user}
      isCurrentUser={true}
      onUpdateProfile={handleUpdateProfile}
    />
  );
}