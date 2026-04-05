import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "MBJB Voice Agent | Majlis Bandaraya Johor Bahru",
  description:
    "AI-powered voice assistant for Johor Bahru citizens. Ask about property tax, licensing, complaints, and municipal services.",
  keywords: [
    "MBJB",
    "Johor Bahru",
    "voice agent",
    "citizen services",
    "municipal council",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-bg-deep">{children}</body>
    </html>
  );
}
