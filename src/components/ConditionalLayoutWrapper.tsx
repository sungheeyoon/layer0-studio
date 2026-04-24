"use client";

import { usePathname } from "next/navigation";

export default function ConditionalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // Paths where the main Navbar should be hidden (dashboard, admin, site preview, etc.)
  const isDashboard = pathname.startsWith("/dashboard");
  const isAdmin = pathname.startsWith("/admin");
  const isSite = pathname.startsWith("/site/");
  const isPreview = pathname.startsWith("/preview/");
  const isEditor = pathname.startsWith("/editor"); // In case the editor path is independent

  if (isDashboard || isAdmin || isSite || isPreview || isEditor) {
    return null;
  }

  return <>{children}</>;
}
