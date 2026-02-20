// lib/api.js (Client-side safe version)
import axios from "axios";
import Cookies from "js-cookie";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:5000/api";

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
    
    // If sending FormData, let the browser set the Content-Type with boundary
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor to return data directly
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const status = error.response ? error.response.status : null;

    if (status === 401 || status === 403) {
      // Clear token and user data from storage
      Cookies.remove("token");
      if (typeof window !== "undefined") {
        localStorage.removeItem("user");
        
        // Only show toast and redirect if we're not already on the login page
        if (!window.location.pathname.includes("/login")) {
          // Import toast dynamically to avoid issues
          import("react-hot-toast").then((module) => {
            const toast = module.default;
            toast.error("Session expired. Please login to your account again!", {
              id: "session-expired", // Prevent multiple toasts
            });
          });
          
          // Small delay before redirect to allow user to see toast
          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      }
    }
    
    return Promise.reject(error);
  }
);
