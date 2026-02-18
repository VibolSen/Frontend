import { fetchAPI } from "@/lib/api-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import EditAssignmentView from "./EditAssignmentView";

async function getAssignmentData(assignmentId) {
  try {
    return await fetchAPI(`/assignments/${assignmentId}`);
  } catch (error) {
    return null;
  }
}

export default async function EditAssignmentPage({ params }) {
  const { assignmentId } = await params;
  const assignment = await getAssignmentData(assignmentId);
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return <div className="p-8">Error: Could not authenticate user.</div>;
  }

  if (!assignment) {
    return <div className="p-8">Error: Assignment not found.</div>;
  }

  return <EditAssignmentView assignment={assignment} loggedInUser={loggedInUser} />;
}
