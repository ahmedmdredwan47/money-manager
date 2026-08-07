import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppProviders } from "@/providers/app-providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "WealthWise - Modern Money Management",
  description:
    "Production-ready scalable money manager application built with Next.js 15, TypeScript, Tailwind CSS, Supabase, and Feature-Based Architecture.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans min-h-screen bg-background text-foreground`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
