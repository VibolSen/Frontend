import GroupDetailPage from "@/components/group/GroupDetailPage"; 
import Link from "next/link";
import BackButton from "@/components/ui/BackButton";

import { fetchAPI } from "@/lib/api-server";

async function getGroupData(groupId) {
  try {
    const group = await fetchAPI(`/groups/${groupId}`);
    const allStudents = await fetchAPI(`/users?role=STUDENT`);
    return { group, allStudents: allStudents || [] };
  } catch (error) {
    console.error("Failed to fetch group data:", error);
    return { group: null, allStudents: [] };
  }
}

export default async function GroupDetailPageRoute({ params }) {
  const { groupId } = await params; 

  const { group, allStudents } = await getGroupData(groupId);

  if (!group || group.error) { 
    return (
      <div className="text-center p-8">
        <h1 className="text-2xl font-bold">Group Not Found</h1>
        <p>The group you are looking for does not exist.</p>
        <div className="mt-6 flex justify-center">
          <BackButton href="/admin/groups" label="Back to Groups" className="mb-0" />
        </div>
      </div>

    );
  }

  return <GroupDetailPage initialGroup={group} allStudents={allStudents} role="admin" />;
}