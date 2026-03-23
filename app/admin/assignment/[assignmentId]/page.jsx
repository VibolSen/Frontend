import { fetchAPI } from "@/lib/api-server";
import GradingView from "./GradingView"; 
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";

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
        <div className="mt-6 flex justify-center">
          <BackButton href="/admin/assignment-management" label="Back to Assignment Management" className="mb-0" />
        </div>
      </div>

    );
  }

  return <GradingView initialAssignment={assignment} />;
}
