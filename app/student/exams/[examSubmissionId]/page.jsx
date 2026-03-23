import { fetchAPI } from "@/lib/api-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import BackButton from "@/components/ui/BackButton";
import ExamSubmissionView from "./ExamSubmissionView";
import Link from "next/link";

async function getExamSubmissionData(params) {
  const { examSubmissionId } = await params;
  try {
    return await fetchAPI(`/exam-submissions/${examSubmissionId}`);
  } catch (error) {
    return null;
  }
}

// The main page component for this dynamic route
export default async function ExamSubmissionPage({ params }) {
  // ✅ FIX #2: Call the data fetching function *before* trying to use any params.
  // Pass the whole params object directly.
  const examSubmission = await getExamSubmissionData(params);
  const session = await getServerSession(authOptions);
  
  if (!session) {
    return <div className="p-8 text-center text-rose-500 font-bold">Unauthorized. Please login.</div>;
  }

  if (!examSubmission) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Exam Not Found</h1>
        <p className="text-slate-500">This submission could not be located.</p>
        <div className="mt-6 flex justify-center">
          <BackButton href="/student/exams" label="Back to My Exams" className="mb-0" />
        </div>
      </div>

    );
  }

  return <ExamSubmissionView initialSubmission={examSubmission} userId={session?.user?.id} />;
}
