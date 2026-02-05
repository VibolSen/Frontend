import { fetchAPI } from "@/lib/api";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import EditExamView from "./EditExamView";

async function getExamData(examId) {
  return await fetchAPI(`/exams/${examId}`);
}

export default async function EditExamPage({ params }) {
  const { examId } = await params;
  const exam = await getExamData(examId);
  
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return <div className="p-8">Error: Could not authenticate user.</div>;
  }

  if (!exam) {
    return <div className="p-8">Error: Exam not found.</div>;
  }

  return <EditExamView exam={exam} loggedInUser={loggedInUser} />;
}
