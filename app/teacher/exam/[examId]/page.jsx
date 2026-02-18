import { fetchAPI } from "@/lib/api-server";
import ExamDetailView from "@/components/exam/ExamDetailView";
import Link from "next/link";

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

  if (!exam) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Exam Not Found</h1>
        <Link
          href="/teacher/exam"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          &larr; Back to Exams
        </Link>
      </div>
    );
  }

  return <ExamDetailView initialExam={exam} />;
}
