import React from "react";
import MyGroupsView from "@/components/teacher/MyGroupsView";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";
import { redirect } from "next/navigation";

export default async function TeacherGroupsPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  // Ensure the user is a teacher
  if (session.user.role !== "TEACHER") {
    redirect("/dashboard");
  }

  return (
    <div className="p-4 md:p-8">
      <MyGroupsView loggedInUser={session.user} />
    </div>
  );
}
