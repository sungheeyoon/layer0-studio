"use client";

import { usePathname } from "next/navigation";

export default function ConditionalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const dashboardRoutes = ["/editor", "/templates", "/domains", "/analytics", "/settings"];
  const isDashboard = dashboardRoutes.some(route => pathname.startsWith(route));

  // /admin, /site, 및 대시보드 경로에서는 메인 Navbar 숨김
  if (pathname.startsWith("/admin") || pathname.startsWith("/site/") || isDashboard) {
    return null;
  }

  return <>{children}</>;
}
