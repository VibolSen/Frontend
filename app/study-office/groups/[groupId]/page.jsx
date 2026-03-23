import { fetchAPI } from "@/lib/api-server";
import GroupDetailPage from "@/components/group/GroupDetailPage"; // Adjust path as needed
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";

async function getGroupData(groupId) {
  const group = await fetchAPI(`/groups/${groupId}`);
  const allStudents = await fetchAPI(`/users?role=STUDENT`);

  return { group, allStudents };
}

export default async function GroupDetailPageRoute({ params }) {
  const { groupId } = await params; // params must be awaited in Next.js 15

  const { group, allStudents } = await getGroupData(groupId);

  if (!group) {
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Group Not Found</h1>
        <p>The group you are looking for does not exist.</p>
        <div className="mt-6 flex justify-center">
          <BackButton href="/study-office/groups" label="Back to Groups" className="mb-0" />
        </div>
      </div>

    );
  }

  return <GroupDetailPage initialGroup={group} allStudents={allStudents} role="study-office" />;
}
