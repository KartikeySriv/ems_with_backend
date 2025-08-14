"use client";

import "./globals.css";
import { AuthProvider } from "@/context/auth-context"; // adjust path if needed
import localFont from "next/font/local";

const inter = localFont({
  src: [
    { path: "../assets/fonts/inter/Inter-Regular.ttf", weight: "400", style: "normal" },
    { path: "../assets/fonts/inter/Inter-Italic.ttf", weight: "400", style: "italic" },
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
