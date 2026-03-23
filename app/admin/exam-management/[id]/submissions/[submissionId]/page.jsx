import { fetchAPI } from "@/lib/api-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import ExamGradingView from "@/components/exam/ExamGradingView";
import BackButton from "@/components/ui/BackButton";

async function getSubmissionData(submissionId) {
  try {
    return await fetchAPI(`/exam-submissions/${submissionId}`);
  } catch (error) {
    return null;
  }
}

export default async function ExamAdminGradingPage({ params }) {
  const awaitedParams = await params;
  const { id: examId, submissionId } = awaitedParams;
  const submission = await getSubmissionData(submissionId);
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div className="p-8">Unauthorized. Please login.</div>;
  }

  if (!submission) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold italic text-slate-400">Submission data unavailable</h1>
        <div className="mt-6 flex justify-center">
          <BackButton href={`/admin/exam-management/${examId}`} label="Back to Exam Roster" />
        </div>
      </div>
    );
  }

  return <ExamGradingView initialSubmission={submission} backLink={`/admin/exam-management/${examId}`} />;
}
