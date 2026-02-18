// lib/api-server.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

/**
 * Helper to fetch data from the Backend API in Server Components.
 * Automatically adds the Authorization header if a session exists.
 */
export async function fetchAPI(endpoint, options = {}) {
  const session = await getServerSession(authOptions);
  
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (session?.accessToken) {
    headers["Authorization"] = `Bearer ${session.accessToken}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
      if (res.status === 401) {
          console.error("Unauthorized access to", endpoint);
      }
      return null;
  }
  
  return res.json();
}
