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
  (error) => Promise.reject(error)
);
