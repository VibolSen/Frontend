import { fetchAPI } from "@/lib/api";
import GradingView from "./GradingView";
import Link from "next/link";

async function getAssignmentData(params) {
  const { assignmentId } = await params;
  try {
    return await fetchAPI(`/assignments/${assignmentId}`);
  } catch (error) {
    return null;
  }
}

export default async function GradingPage({ params }) {
  const assignment = await getAssignmentData(params);

  if (!assignment) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Assignment Not Found</h1>
        <Link
          href="/teacher/assignments"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          &larr; Back to Assignments
        </Link>
      </div>
    );
  }

  return <GradingView initialAssignment={assignment} />;
}
