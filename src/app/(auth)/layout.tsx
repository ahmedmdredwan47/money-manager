import React from "react";
import Link from "next/link";
import { Wallet } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen w-full flex flex-col items-center justify-center bg-background px-4 py-8 overflow-hidden selection:bg-emerald-500/20 selection:text-emerald-500">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

      {/* Brand Header */}
      <Link href="/" className="mb-8 flex items-center gap-3 group">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-xl shadow-emerald-500/25 text-white font-bold transition-transform group-hover:scale-105">
          <Wallet className="h-6 w-6" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-2xl tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
            WealthWise
          </span>
          <span className="text-[11px] font-semibold text-muted-foreground tracking-widest uppercase">
            Money Manager
          </span>
        </div>
      </Link>

      {/* Main Form Container */}
      <div className="relative z-10 w-full flex justify-center animate-in fade-in-50 duration-300">
        {children}
      </div>

      {/* Footer Disclaimer */}
      <footer className="mt-8 text-center text-xs text-muted-foreground">
        <p>© 2026 WealthWise Money Manager. All rights reserved.</p>
      </footer>
    </div>
  );
}
