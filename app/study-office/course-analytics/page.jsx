import CourseAnalyticsView from "@/components/course/CourseAnalyticsView";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export default async function StudyOfficeCourseAnalyticsPage() {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return (
      <div className="p-8">
        Error: Could not authenticate user. Please log in again.
      </div>
    );
  }

  return <CourseAnalyticsView loggedInUser={loggedInUser} />;
}