import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import StudentCourseDetailView from "@/components/course/StudentCourseDetailView";
import Link from "next/link";
import { InfoIcon, ArrowLeftIcon } from "lucide-react";

export default async function CourseDetailsPage({ params }) {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;
  const { courseId } = await params;

  if (!loggedInUser) {
    return (
      <div className="p-8">
        Error: Could not authenticate user. Please log in again.
      </div>
    );
  }

  // We delegate authorization to the Client Component / Backend API.
  // The Client Component should handle 403/404 from the API.

  return (
    <div className="p-4 md:p-8">
      <StudentCourseDetailView courseId={courseId} loggedInUser={loggedInUser} />
    </div>
  );
}

