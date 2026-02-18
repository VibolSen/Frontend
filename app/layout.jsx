import { Inter } from "next/font/google";
import "./globals.css";
import "./darkmode.css";
import "./accessibility.css";
import { UserProvider } from "@/context/UserContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AccessibilityProvider } from "@/context/AccessibilityContext";

import { NextAuthProvider } from "@/components/providers/NextAuthProvider";
import { Toaster } from 'react-hot-toast';

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
              <UserProvider>
                {children}
                <Toaster 
                  position="top-center"
                  reverseOrder={false}
                  gutter={8}
                  containerClassName=""
                  containerStyle={{}}
                  toastOptions={{
                    // Define default options
                    className: '',
                    duration: 5000,
                    style: {
                      background: '#363636',
                      color: '#fff',
                    },

                    // Default options for specific types
                    success: {
                      duration: 3000,
                      theme: {
                        primary: 'green',
                        secondary: 'black',
                      },
                    },
                    error: {
                        duration: 4000,
                        style: {
                            background: '#ef4444',
                            color: '#fff',
                        }
                    }
                  }}
                />
              </UserProvider>
            </ThemeProvider>
          </AccessibilityProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
