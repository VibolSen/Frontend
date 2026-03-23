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
    icon: "/logo/favicon2.ico",
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
                    className: '',
                    duration: 5000,
                    style: {
                      background: 'rgba(255, 255, 255, 0.85)',
                      backdropFilter: 'blur(16px)',
                      color: '#1e293b',
                      fontSize: '12px',
                      fontWeight: '800',
                      letterSpacing: '0.05em',
                      borderRadius: '16px',
                      padding: '12px 24px',
                      boxShadow: '0 10px 40px -10px rgba(0,0,0,0.1)',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                    },
                    success: {
                      duration: 4000,
                      iconTheme: {
                        primary: '#10b981',
                        secondary: '#fff',
                      },
                      style: {
                        background: 'rgba(236, 253, 245, 0.85)',
                        border: '1px solid rgba(16, 185, 129, 0.2)',
                        color: '#065f46',
                      }
                    },
                    error: {
                        duration: 5000,
                        iconTheme: {
                          primary: '#ef4444',
                          secondary: '#fff',
                        },
                        style: {
                            background: 'rgba(254, 242, 242, 0.85)',
                            border: '1px solid rgba(239, 68, 68, 0.2)',
                            color: '#991b1b',
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
