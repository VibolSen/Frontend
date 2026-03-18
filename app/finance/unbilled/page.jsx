import StudentPaymentReport from "@/components/admin/finance/StudentPaymentReport";

export default function UnbilledStudentsPage() {
  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-slate-800 tracking-tight">Unbilled Students</h1>
        <p className="text-slate-500 font-medium text-sm">Review students who haven't been invoiced for the current period.</p>
      </div>
      <StudentPaymentReport initialStatus="UNBILLED" />
    </div>
  );
}
