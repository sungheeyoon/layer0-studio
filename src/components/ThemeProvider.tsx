"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

// Wraps next-themes (class strategy) for the Studio chrome — light + dark
// per ADR-0011. The visible toggle lands in a later surface-migration commit.
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
