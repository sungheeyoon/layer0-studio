"use client";

import type { User } from "@supabase/supabase-js";
import { usePathname } from "next/navigation";
import ProfileDropdown from "@/components/ProfileDropdown";
import { LocaleToggle } from "@/components/LocaleToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDictionary } from "@/lib/i18n/provider";

interface TopNavBarProps {
  user: User;
}

export default function TopNavBar({ user }: TopNavBarProps) {
  const pathname = usePathname();
  const t = useDictionary().dashboard.sidebar;

  // Fill the previously-empty left side with the active section name, so the
  // header reads as a real page bar instead of a floating cluster of icons.
  const title = pathname.startsWith("/dashboard/templates")
    ? t.templates
    : pathname.startsWith("/dashboard/settings")
      ? t.settings
      : t.projects;

  return (
    <header className="sticky top-0 z-40 flex h-14 w-full items-center justify-between gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <span className="text-body font-medium text-foreground">{title}</span>
      <div className="flex items-center gap-2">
        <LocaleToggle className="flex gap-1" />
        <ThemeToggle />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}
