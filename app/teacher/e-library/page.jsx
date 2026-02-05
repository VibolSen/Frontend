"use client";
import React, { useState, useEffect } from "react";
import ELibraryView from "@/components/e-library/ELibraryView";
import { useUser } from "@/context/UserContext";

export default function ELibraryPage() {
  const { user } = useUser();

  return <ELibraryView loggedInUser={user} />;
}
