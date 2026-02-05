import { cookies } from "next/headers";
import { jwtVerify } from "jose";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "your-super-secret-key-that-is-long";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getLoggedInUser() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get("token");

  if (!tokenCookie) return null;

  try {
    // Verify token
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    console.log("JWT Payload:", payload);

    // Call Backend API to get user data
    const response = await fetch(`${API_URL}/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${tokenCookie.value}`,
        'Content-Type': 'application/json'
      },
      cache: 'no-store' // Don't cache user data
    });

    if (!response.ok) {
      console.error("Failed to fetch user from backend:", response.status);
      return null;
    }

    const user = await response.json();
    console.log("Fetched User from Backend:", user);

    return user;
  } catch (error) {
    console.error("Failed to verify token or fetch user:", error);
    return null;
  }
}
