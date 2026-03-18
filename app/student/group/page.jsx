import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { redirect } from "next/navigation";
import StudentGroupView from "@/components/student/StudentGroupView";

export default async function StudentGroupPage() {
  const session = await getServerSession(authOptions);

  if (!session) redirect("/login");
  if (session.user.role !== "STUDENT") redirect("/dashboard");

  return (
    <div className="p-4 md:p-8">
      <StudentGroupView loggedInUser={session.user} />
    </div>
  );
}
