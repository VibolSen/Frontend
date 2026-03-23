import { fetchAPI } from "@/lib/api-server";
import ExamDetailView from "@/components/exam/ExamDetailView";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import BackButton from "@/components/ui/BackButton";

async function getExamData(params) {
  const { examId } = await params;
  try {
      return await fetchAPI(`/exams/${examId}`);
  } catch (e) {
      return null;
  }
}

export default async function ExamDetailPage({ params }) {
  const resolvedParams = await params;
  const exam = await getExamData(resolvedParams);
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!exam) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Exam Not Found</h1>
        <div className="mt-6 flex justify-center">
          <BackButton href="/teacher/exam" label="Back to Exams" className="mb-0" />
        </div>
      </div>

    );
  }

  return <ExamDetailView initialExam={exam} loggedInUser={loggedInUser} />;
}
