import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import MyStudentsView from "@/components/MyStudentsView";

// The main page for the /teacher/my-students route
export default async function MyStudentsPage() {
  const session = await getServerSession(authOptions);
  
  // Create a minimal user object that satisfies what MyStudentsView needs (id)
  const loggedInUser = session?.user || null;

  if (!loggedInUser) {
    return (
      <div className="p-8">
        Error: Could not authenticate user. Please log in again.
      </div>
    );
  }

  // Render the client component and pass the user data to it as a prop
  return <MyStudentsView loggedInUser={loggedInUser} />;
}
