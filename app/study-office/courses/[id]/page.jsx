import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import InstitutionalCourseDetailView from "@/components/course/InstitutionalCourseDetailView";

export default async function CourseDetailPage({ params }) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  // Study Office and Admin both have institutional access
  if (!loggedInUser || (loggedInUser.role !== 'ADMIN' && loggedInUser.role !== 'STUDY_OFFICE')) {
    return <div className="p-8">Error: Unauthorized access to institutional curriculum.</div>;
  }

  return (
    <div className="p-4 md:p-8">
      <InstitutionalCourseDetailView courseId={id} backUrl="/study-office/courses" />
    </div>
  );
}
