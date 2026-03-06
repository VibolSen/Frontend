'use client';

import React from 'react';
import FacultyManagement from '@/components/faculty/FacultyManagement';

const AdminFacultyPage = () => {
  return (
    <div className="flex flex-col gap-5">
      <FacultyManagement role="admin" />
    </div>
  );
};

export default AdminFacultyPage;