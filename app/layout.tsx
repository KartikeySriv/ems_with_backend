"use client";

import "./globals.css";
import { AuthProvider } from "@/context/auth-context"; // adjust path if needed



export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
