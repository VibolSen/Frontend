import { Inter } from "next/font/google";
import "./globals.css";
import "./darkmode.css";
import "./accessibility.css";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";

import { NextAuthProvider } from "@/components/providers/NextAuthProvider";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "School Management System",
  description: "School Management System",
  icons: {
    icon: "/favicon.ico", // ✅ points to /public/favicon.ico
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning={true}>
        <NextAuthProvider>
          <AccessibilityProvider>
            <ThemeProvider>
              <UserProvider>{children}</UserProvider>
            </ThemeProvider>
          </AccessibilityProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
