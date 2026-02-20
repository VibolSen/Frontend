import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import TeacherCourseDetailView from "@/components/course/TeacherCourseDetailView";

export default async function CourseDetailPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return <div className="p-8">Error: Could not authenticate user.</div>;
  }

  return <TeacherCourseDetailView courseId={id} loggedInUser={loggedInUser} />;
}
