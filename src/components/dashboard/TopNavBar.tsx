"use client";

import type { User } from "@supabase/supabase-js";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Layers, Menu, Settings } from "lucide-react";
import ProfileDropdown from "@/components/ProfileDropdown";
import { LocaleToggle } from "@/components/LocaleToggle";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useDictionary } from "@/lib/i18n/provider";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  const items = [
    { href: "/dashboard/projects", label: t.projects, icon: FolderOpen },
    { href: "/dashboard/templates", label: t.templates, icon: Layers },
    { href: "/dashboard/settings", label: t.settings, icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between gap-3 border-b border-border bg-background/80 px-6 backdrop-blur-md">
      <div className="flex min-w-0 items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon-lg" className="lg:hidden" aria-label={t.dashboardMenu}>
              <Menu className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64 p-2">
            {items.map(({ href, label, icon: Icon }) => (
              <DropdownMenuItem key={href} asChild className="min-h-11">
                <Link href={href}>
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <div className="flex min-h-11 items-center justify-between px-2">
              <span className="text-caption text-muted-foreground">Language</span>
              <LocaleToggle className="flex gap-1" />
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        <span className="truncate text-title text-foreground">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        <LocaleToggle className="hidden gap-1 sm:flex" />
        <ThemeToggle />
        <ProfileDropdown user={user} />
      </div>
    </header>
  );
}
