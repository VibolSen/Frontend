import DepartmentManagementView from "@/components/departments/DepartmentManagementView";

export default function StudyOfficeDepartmentsPage() {
  return (
    <div className="flex flex-col gap-5">
      <DepartmentManagementView role="study-office" />
    </div>
  );
}