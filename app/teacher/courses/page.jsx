import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import MyCoursesView from "@/components/MyCoursesView";

export default async function MyCoursesPage() {
  const session = await getServerSession(authOptions);
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return (
      <div className="p-8">
        Error: Could not authenticate user. Please log in again.
      </div>
    );
  }

  // Render the client component and pass the user data to it as a prop
  return <MyCoursesView loggedInUser={loggedInUser} />;
}
