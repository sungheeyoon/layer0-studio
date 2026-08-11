"use client";

import Link from "next/link";
import { LocaleToggle } from "@/components/LocaleToggle";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function AuthHeader() {
  return (
    <header className="mb-8 flex items-center justify-between gap-4">
      <Link href="/" className="flex min-w-0 items-center gap-2 whitespace-nowrap">
        <span className="h-2 w-2 shrink-0 rounded-full bg-primary" />
        <span className="truncate text-lg font-semibold tracking-tight">Layer0 Studio</span>
      </Link>
      <div className="flex shrink-0 items-center gap-1">
        <LocaleToggle className="hidden gap-1 sm:flex" />
        <ThemeToggle />
      </div>
    </header>
  );
}
