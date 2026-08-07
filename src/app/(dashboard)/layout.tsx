"use client";

import React, { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function DashboardGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="relative min-h-screen bg-background flex">
      {/* Sidebar Component */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64 transition-all duration-300">
        {/* Top Navbar */}
        <Navbar onOpenMobileSidebar={() => setMobileOpen(true)} />

        {/* Page Body Container */}
        <main className="flex-1 p-4 md:p-6 max-w-7xl w-full mx-auto animate-in fade-in-50 duration-300">
          {children}
        </main>
      </div>
    </div>
  );
}
