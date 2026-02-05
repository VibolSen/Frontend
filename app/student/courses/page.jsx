import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import StudentCoursesView from "@/components/course/StudentCoursesView";

export default async function CoursesPage() {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return (
      <div className="p-8">
        Error: Could not authenticate user. Please log in again.
      </div>
    );
  }

  return <StudentCoursesView loggedInUser={loggedInUser} />;
}
