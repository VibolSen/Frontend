"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ManageGroupMembers from "@/components/group/ManageGroupMembers";
import ConfirmationDialog from "@/components/ConfirmationDialog";
import BackButton from "@/components/ui/BackButton";
import { Users } from "lucide-react";
import { apiClient } from "@/lib/api";

export default function ManageGroupMembersPage({ group, allStudents, role }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSaveChanges = async (studentIds) => {
    setIsLoading(true);
    try {
      await apiClient.put(`/groups/${group.id}`, { studentIds });
      setIsSuccessModalOpen(true);
    } catch (err) {
      setErrorMessage(err.message || "Failed to save members");
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    router.push(`/${role}/groups/${group.id}`);
  };

  return (
    <div className="min-h-screen bg-slate-50/20 p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1">
            <BackButton href={`/${role}/groups/${group.id}`} label="Back to Group Details" className="mb-4" />
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 rounded-xl">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">
                  Manage Roster
                </h1>
                <p className="text-[12px] font-bold text-slate-500 uppercase tracking-widest">
                  Configure membership for <span className="text-blue-600 font-black">{group.name}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden h-[800px] flex flex-col">
          <ManageGroupMembers
            initialGroup={group}
            allStudents={allStudents}
            onSaveChanges={handleSaveChanges}
            isLoading={isLoading}
            onClose={handleClose}
          />
        </div>

        <ConfirmationDialog
          isOpen={isSuccessModalOpen}
          title="Roster Updated"
          message="Group members have been successfully updated."
          onConfirm={handleClose}
          onCancel={handleClose}
          confirmText="Acknowledge"
          type="success"
        />

        <ConfirmationDialog
          isOpen={isErrorModalOpen}
          title="Update Failed"
          message={errorMessage}
          onConfirm={() => setIsErrorModalOpen(false)}
          onCancel={() => setIsErrorModalOpen(false)}
          confirmText="Dismiss"
          type="danger"
        />
      </div>
    </div>
  );
}
