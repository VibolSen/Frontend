import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import TeacherDashboard from "@/components/dashboard/TeacherDashboard";

// The main page for the route /teacher/dashboard
export default async function TeacherDashboardPage() {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return <div className="p-8">Error: Could not authenticate user.</div>;
  }

  // Pass the user data as a prop to our client component
  return <TeacherDashboard loggedInUser={loggedInUser} />;
}
