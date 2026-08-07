"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownMenuProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  align?: "left" | "right";
}

export function DropdownMenu({ trigger, children, align = "right" }: DropdownMenuProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={menuRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {isOpen && (
        <div
          className={cn(
            "absolute z-50 mt-2 min-w-[12rem] rounded-xl border border-border bg-popover p-1 text-popover-foreground shadow-lg animate-in fade-in-80 slide-in-from-top-1",
            align === "right" ? "right-0" : "left-0"
          )}
          onClick={() => setIsOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export function DropdownMenuItem({
  className,
  children,
  onClick,
}: {
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground text-left",
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownMenuHeader({ children }: { children: React.ReactNode }) {
  return <div className="px-3 py-2 text-xs font-semibold text-muted-foreground border-b border-border/50 mb-1">{children}</div>;
}

export function DropdownMenuSeparator() {
  return <div className="my-1 h-px bg-border/50" />;
}
