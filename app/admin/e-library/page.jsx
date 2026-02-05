"use client";
import React, { useState, useEffect } from "react";
import ELibraryView from "@/components/e-library/ELibraryView";
import { apiClient } from "@/lib/api";

export default function ELibraryPage() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  useEffect(() => {
    apiClient.get("/me")
      .then(data => {
        if (data?.user) setLoggedInUser(data.user);
      })
      .catch(console.error);
  }, []);

  return <ELibraryView loggedInUser={loggedInUser} />;
}
