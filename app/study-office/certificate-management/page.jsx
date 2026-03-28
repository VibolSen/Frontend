"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import CertificateModal from '@/components/certificate-management/CertificateModal';
import BulkCertificateModal from '@/components/certificate-management/BulkCertificateModal';
import CertificateTable from '@/components/certificate-management/CertificateTable';
import ConfirmationDialog from '@/components/ConfirmationDialog';
import { apiClient } from '@/lib/api';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

import StudyOfficeCertificateView from "@/components/study-office/StudyOfficeCertificateView";

const CertificateManagementPage = () => {
  return <StudyOfficeCertificateView />;
};
          
export default CertificateManagementPage;