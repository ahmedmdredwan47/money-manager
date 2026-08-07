"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
}

export function Dialog({ open, onOpenChange, title, description, children }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
      <div className="relative w-full max-w-lg rounded-xl border border-border bg-background p-6 shadow-2xl animate-in zoom-in-95">
        <button
          onClick={() => onOpenChange(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        {title && <h2 className="text-lg font-semibold tracking-tight">{title}</h2>}
        {description && <p className="text-sm text-muted-foreground mt-1 mb-4">{description}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
