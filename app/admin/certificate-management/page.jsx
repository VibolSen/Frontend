"use client";
import CertificateManagementView from "@/components/certificate-management/CertificateManagementView";

export default function AdminCertificateManagementPage() {
  return (
    <CertificateManagementView
      canDelete={true}
      canBulkIssue={true}
      canCreate={true}
      role="admin"
    />
  );
}