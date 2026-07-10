"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Layers, Settings } from "lucide-react";
import { useDictionary } from "@/lib/i18n/provider";

const navItems = [
  { key: "projects", href: "/dashboard/projects", icon: FolderOpen },
  { key: "templates", href: "/dashboard/templates", icon: Layers },
  { key: "settings", href: "/dashboard/settings", icon: Settings },
] as const;

export default function Sidebar() {
  const pathname = usePathname();
  const t = useDictionary().dashboard.sidebar;

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-full w-64 flex-col border-r border-sidebar-border bg-sidebar py-8">
      <div className="px-6 mb-10">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-title font-semibold tracking-tight text-sidebar-foreground">
            Layer0 Studio
          </span>
        </Link>
      </div>
      <nav className="flex-1 flex flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive = 'exact' in item && item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.key}
              href={item.href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{t[item.key]}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
