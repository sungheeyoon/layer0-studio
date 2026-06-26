"use client";

import type { User } from "@supabase/supabase-js";
import ProfileDropdown from "@/components/ProfileDropdown";
import { LocaleToggle } from "@/components/LocaleToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";

interface TopNavBarProps {
  user: User;
}

export default function TopNavBar({ user }: TopNavBarProps) {
  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-end gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <LocaleToggle className="flex gap-1" />
      <ThemeToggle />
      <Separator orientation="vertical" className="h-5" />
      <ProfileDropdown user={user} />
    </header>
  );
}
