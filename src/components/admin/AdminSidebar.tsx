"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Globe,
  Layers,
  LayoutDashboard,
  FolderOpen,
  Settings,
  SquarePen,
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard, exact: true },
  { name: "Templates", href: "/admin/templates", icon: Layers },
  { name: "Projects", href: "/admin/projects", icon: FolderOpen },
  { name: "Editor", href: "/admin/editor", icon: SquarePen },
  { name: "Domains", href: "/admin/domains", icon: Globe },
] as const;

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-sidebar-border bg-sidebar py-8">
      <div className="px-6 mb-10">
        <Link href="/admin" className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-primary" />
          <span className="text-title font-semibold tracking-tight text-sidebar-foreground">
            Layer0 Admin
          </span>
        </Link>
      </div>
      <nav className="flex flex-1 flex-col gap-1 px-3">
        {navItems.map((item) => {
          const isActive =
            "exact" in item && item.exact
              ? pathname === item.href
              : pathname === item.href || pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.name}</span>
            </Link>
          );
        })}
        <Link
          href="/admin/settings"
          className={`group mt-auto flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
            pathname.startsWith("/admin/settings")
              ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
              : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
          }`}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Link>
      </nav>
    </aside>
  );
}
