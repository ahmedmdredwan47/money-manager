"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navigationConfig } from "@/config/navigation";
import { cn } from "@/lib/utils";
import {
  Wallet,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  X,
} from "lucide-react";

interface SidebarProps {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export function Sidebar({ mobileOpen, setMobileOpen }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const mainItems = navigationConfig.filter((item) => item.category === "main");
  const managementItems = navigationConfig.filter(
    (item) => item.category === "management"
  );
  const systemItems = navigationConfig.filter(
    (item) => item.category === "system"
  );

  const renderNavGroup = (title: string, items: typeof navigationConfig) => (
    <div className="py-2">
      {!collapsed && (
        <h2 className="px-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2">
          {title}
        </h2>
      )}
      <ul className="space-y-1 px-2">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20 font-semibold"
                    : "text-muted-foreground hover:bg-accent/80 hover:text-foreground"
                )}
                title={collapsed ? item.title : undefined}
              >
                <Icon
                  className={cn(
                    "h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110",
                    isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )}
                />
                {!collapsed && (
                  <span className="truncate">{item.title}</span>
                )}
                {isActive && !collapsed && (
                  <div className="ml-auto h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 flex flex-col border-r border-border/50 bg-card text-card-foreground transition-all duration-300 ease-in-out",
          collapsed ? "w-20" : "w-64",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
      >
        {/* Brand Header */}
        <div className="flex h-16 items-center justify-between border-b border-border/40 px-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-md shadow-emerald-500/20 text-white font-bold">
              <Wallet className="h-5 w-5" />
            </div>
            {!collapsed && (
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight bg-gradient-to-r from-emerald-500 to-teal-600 bg-clip-text text-transparent">
                  WealthWise
                </span>
                <span className="text-[10px] font-medium text-muted-foreground tracking-widest uppercase">
                  Money Manager
                </span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation items */}
        <div className="flex-1 overflow-y-auto py-3 space-y-1 scrollbar-none">
          {renderNavGroup("Overview", mainItems)}
          <div className="my-2 px-3">
            <div className="h-px bg-border/40" />
          </div>
          {renderNavGroup("Finance", managementItems)}
          <div className="my-2 px-3">
            <div className="h-px bg-border/40" />
          </div>
          {renderNavGroup("Account", systemItems)}
        </div>

        {/* Footer Pro Banner (when expanded) */}
        {!collapsed && (
          <div className="p-3 m-3 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-transparent border border-emerald-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-4 w-4 text-emerald-500" />
              <span className="text-xs font-semibold text-foreground">
                Pro Backbone Active
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-tight">
              Feature-based architecture initialized & ready.
            </p>
          </div>
        )}

        {/* Collapse Button (Desktop Only) */}
        <div className="hidden lg:flex items-center justify-end border-t border-border/40 p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/60 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title={collapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
