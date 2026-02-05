import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import ExamManagement from "@/components/exam/ExamManagement"; 

export default async function ExamsPage() {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return <div className="p-8">Error: Could not authenticate user.</div>;
  }

  // Render the shared ExamManagement component and pass the user data to it as a prop
  return <ExamManagement loggedInUser={loggedInUser} />;
}