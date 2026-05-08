"use client";
import CertificateManagementView from "@/components/certificate-management/CertificateManagementView";

export default function StudyOfficeCertificateManagementPage() {
  return (
    <CertificateManagementView
      canDelete={true}
      canBulkIssue={true}
      canCreate={true}
      role="study-office"
    />
  );
}