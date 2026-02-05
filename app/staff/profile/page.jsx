"use client";

import { useUser } from "@/context/UserContext";
import FullPageLoading from "@/components/ui/FullPageLoading";
import ProfilePageContent from "@/components/ProfilePageContent";
import { apiClient } from "@/lib/api";

export default function ProfilePage() {
  const { user, loading, fetchUser } = useUser();

  const handleUpdateProfile = async (formData) => {
    try {
      const data = await apiClient.put("/profile/update", formData);
      if (fetchUser) fetchUser();
      return data.user;
    } catch (error) {
      console.error("Error updating profile:", error);
      throw error;
    }
  };

  if (loading) {
    return <FullPageLoading message="Verifying staff credentials..." />;
  }

  return (
    <ProfilePageContent
      user={user}
      isCurrentUser={true}
      onUpdateProfile={handleUpdateProfile}
    />
  );
}
