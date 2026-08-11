"use client";

import { usePathname } from "next/navigation";

export default function StudioChromeBoundary({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isTemplateSurface = pathname.startsWith("/site/") || pathname.startsWith("/preview/");

  if (isTemplateSurface) return <>{children}</>;

  return <div className="studio-chrome contents">{children}</div>;
}
