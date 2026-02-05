import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import MyExamsView from "@/components/MyExamsView";

export default async function StudentExamsPage() {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return (
      <div className="p-8">
        Error: Could not authenticate user. Please log in again.
      </div>
    );
  }

  return <MyExamsView loggedInUser={loggedInUser} />;
}
