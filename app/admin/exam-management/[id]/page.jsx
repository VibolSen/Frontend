import { fetchAPI } from "@/lib/api-server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import ExamDetailView from "@/components/exam/ExamDetailView"; 
import Link from "next/link";

async function getExamData(params) {
  const { id } = await params; 
  try {
    return await fetchAPI(`/exams/${id}`);
  } catch (error) {
    return null;
  }
}

export default async function AdminExamDetailPage({ params }) {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser || loggedInUser.role !== "ADMIN") {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p className="text-slate-500">You must be an administrator to view this page.</p>
      </div>
    );
  }

  const exam = await getExamData(params);

  if (!exam) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Exam Not Found</h1>
        <p className="text-slate-500">This exam could not be located.</p>
        <Link
          href="/admin/exam-management"
          className="text-blue-600 hover:underline mt-4 inline-block"
        >
          &larr; Back to Exam Management
        </Link>
      </div>
    );
  }

  return <ExamDetailView initialExam={exam} loggedInUser={loggedInUser} />;
}
