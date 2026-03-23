import { fetchAPI } from "@/lib/api-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import AssignmentGradingView from "@/components/assignment/AssignmentGradingView";
import BackButton from "@/components/ui/BackButton";

async function getSubmissionData(submissionId) {
  try {
    return await fetchAPI(`/teacher/submissions/${submissionId}`);
  } catch (error) {
    return null;
  }
}

export default async function AssignmentGradingPage({ params }) {
  const awaitedParams = await params;
  const { assignmentId, submissionId } = awaitedParams;
  const submission = await getSubmissionData(submissionId);
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div className="p-8">Unauthorized. Please login.</div>;
  }

  if (!submission) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold italic text-slate-400 font-outfit uppercase tracking-widest">Submission details unavailable</h1>
        <div className="mt-6 flex justify-center">
          <BackButton href={`/teacher/assignment/${assignmentId}`} label="Back to Roster" />
        </div>
      </div>
    );
  }

  return <AssignmentGradingView initialSubmission={submission} backLink={`/teacher/assignment/${assignmentId}`} />;
}
