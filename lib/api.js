// lib/api.js
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5001/api";

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

/**
 * Axios instance for client-side API calls.
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach token from cookies if available
apiClient.interceptors.request.use(
  (config) => {
    const token = Cookies.get("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to return data directly
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => Promise.reject(error)
);
