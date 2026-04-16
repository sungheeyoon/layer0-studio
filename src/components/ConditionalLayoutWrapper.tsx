"use client";

import { usePathname } from "next/navigation";

export default function ConditionalLayoutWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  
  // /admin, /site 경로에서는 메인 Navbar 숨김
  if (pathname.startsWith("/admin") || pathname.startsWith("/site/")) {
    return null;
  }

  return <>{children}</>;
}
