"use client";

import "./globals.css";
import { AuthProvider } from "@/context/auth-context"; // adjust path if needed
import localFont from "next/font/local";

const inter = localFont({
  src: [
    { path: "./fonts/Inter-Regular.ttf", weight: "400", style: "normal" },
    { path: "./fonts/Inter-Italic.ttf", weight: "400", style: "italic" },
  ],
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.className}>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
