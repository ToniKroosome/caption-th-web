import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Tum-Mu-Sub-Bu — Thai Caption Generator",
  description: "Generate Thai captions from audio/video in your browser. Free with watermark, paid without.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider>
      <html lang="th">
        <body className="antialiased bg-gray-950 text-white">{children}<Analytics /></body>
      </html>
    </ClerkProvider>
  );
}
