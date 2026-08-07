"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./theme-toggle";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuHeader,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Menu,
  Search,
  Bell,
  Plus,
  User,
  Settings,
  LogOut,
} from "lucide-react";

interface NavbarProps {
  onOpenMobileSidebar: () => void;
}

export function Navbar({ onOpenMobileSidebar }: NavbarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/40 bg-background/80 px-4 md:px-6 backdrop-blur-md transition-all">
      {/* Left section */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden flex h-10 w-10 items-center justify-center rounded-xl border border-border/50 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          aria-label="Open mobile menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Global Search Bar Placeholder */}
        <div className="hidden sm:flex items-center gap-2 rounded-xl border border-border/50 bg-muted/40 px-3 py-1.5 text-sm text-muted-foreground w-64 md:w-80 hover:border-border transition-colors">
          <Search className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-xs truncate">Search transactions, accounts, categories...</span>
          <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Quick Add Action */}
        <Button
          variant="gradient"
          size="sm"
          className="hidden sm:inline-flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="h-4 w-4" />
          <span>New Entry</span>
        </Button>

        {/* Theme Switcher */}
        <ThemeToggle />

        {/* Notifications Dropdown */}
        <DropdownMenu
          trigger={
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 rounded-lg border border-border/40 hover:bg-accent text-muted-foreground hover:text-foreground"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-background" />
              <span className="sr-only">Notifications</span>
            </Button>
          }
        >
          <DropdownMenuHeader>Notifications</DropdownMenuHeader>
          <div className="px-3 py-2 text-xs text-muted-foreground">
            <p className="font-semibold text-foreground">Welcome to WealthWise!</p>
            <p className="mt-0.5">Your money manager application backbone is ready.</p>
          </div>
          <DropdownMenuSeparator />
          <DropdownMenuItem className="text-xs text-emerald-500 justify-center font-medium">
            Mark all as read
          </DropdownMenuItem>
        </DropdownMenu>

        {/* User Profile Menu */}
        <DropdownMenu
          trigger={
            <button className="flex items-center gap-2 rounded-full p-0.5 ring-offset-background transition-all hover:ring-2 hover:ring-emerald-500/50">
              <Avatar
                fallback="JD"
                className="h-9 w-9 border-2 border-emerald-500/20"
              />
            </button>
          }
        >
          <DropdownMenuHeader>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-semibold text-foreground">Alex Morgan</p>
              <p className="text-xs font-normal text-muted-foreground">alex.morgan@wealthwise.io</p>
            </div>
          </DropdownMenuHeader>
          <DropdownMenuItem>
            <Link href="/profile" className="flex items-center gap-2 w-full">
              <User className="h-4 w-4 text-muted-foreground" />
              <span>Profile</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Link href="/settings" className="flex items-center gap-2 w-full">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span>Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleSignOut}
            className="text-destructive focus:text-destructive cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenu>
      </div>
    </header>
  );
}
