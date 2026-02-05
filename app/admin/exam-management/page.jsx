import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import ExamManagement from "@/components/exam/ExamManagement";

export default async function ExamManagementPage() {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return <div className="p-8">Error: Could not authenticate user.</div>;
  }

  return <ExamManagement loggedInUser={loggedInUser} />;
}
