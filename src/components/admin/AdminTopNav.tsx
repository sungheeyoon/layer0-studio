"use client";

import { ThemeToggle } from "@/components/ThemeToggle";

export default function AdminTopNav() {
  return (
    <header className="fixed top-0 z-40 ml-64 flex h-14 w-[calc(100%-16rem)] items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <span className="text-sm font-medium text-foreground">Admin Console</span>
      <ThemeToggle />
    </header>
  );
}
