"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminSidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "DASHBOARD", href: "/admin", icon: "dashboard" },
    { name: "TEMPLATES", href: "/admin/templates", icon: "extension" },
    { name: "PROJECTS", href: "/admin/projects", icon: "folder_open" },
    { name: "CONTENT_EDITOR", href: "/admin/editor", icon: "edit_note" },
    { name: "DOMAINS", href: "/admin/domains", icon: "language" },
  ];

  return (
    <aside className="flex flex-col h-screen fixed left-0 top-0 bg-neutral-100 dark:bg-neutral-900 border-r border-neutral-300 dark:border-neutral-800 w-64 z-50">
      <div className="px-6 py-8 flex flex-col gap-1">
        <span className="text-sm font-medium tracking-[0.2em] text-neutral-900 dark:text-neutral-100">
          ARCHITECT_OS
        </span>
        <span className="font-['Inter'] font-light tracking-[0.1em] text-[0.6875rem] uppercase text-neutral-500">
          VER_2.0.4
        </span>
      </div>
      <nav className="flex-1 px-0 mt-8">
        <ul className="flex flex-col h-full">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <li key={item.name} className="group">
                <Link
                  href={item.href}
                  className={`flex items-center gap-4 px-6 py-3 font-['Inter'] font-light tracking-[0.1em] text-[0.6875rem] uppercase transition-colors duration-75 ${
                    isActive
                      ? "border-l-2 border-neutral-900 dark:border-neutral-100 bg-neutral-200 dark:bg-neutral-800 font-medium text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800"
                  }`}
                >
                  <span className="material-symbols-outlined" data-icon={item.icon}>
                    {item.icon}
                  </span>
                  <span>{item.name}</span>
                </Link>
              </li>
            );
          })}
          <li className="group mt-auto pb-8">
            <Link
              href="/admin/settings"
              className="flex items-center gap-4 px-6 py-3 font-['Inter'] font-light tracking-[0.1em] text-[0.6875rem] uppercase text-neutral-500 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors duration-75"
            >
              <span className="material-symbols-outlined" data-icon="settings">
                settings
              </span>
              <span>SETTINGS</span>
            </Link>
          </li>
        </ul>
      </nav>
    </aside>
  );
}
