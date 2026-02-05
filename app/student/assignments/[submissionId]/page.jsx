import { fetchAPI } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import SubmissionView from "./SubmissionView";
import Link from "next/link";

async function getSubmissionData(submissionId) {
  try {
    return await fetchAPI(`/submissions/${submissionId}`);
  } catch (error) {
    return null;
  }
}

export default async function SubmissionPage({ params }) {
  const awaitedParams = await params;
  const { submissionId } = awaitedParams;
  const submission = await getSubmissionData(submissionId);
  const session = await getServerSession(authOptions);

  if (!session) {
    return <div className="p-8">Unauthorized. Please login.</div>;
  }

  if (!submission) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Assignment Not Found</h1>
        <p className="text-slate-500">This submission could not be located.</p>
        <Link
          href="/student/assignments"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          &larr; Back to My Assignments
        </Link>
      </div>
    );
  }

  return <SubmissionView initialSubmission={submission} />;
}
