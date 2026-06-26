"use client";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDictionary } from "@/lib/i18n/provider";

/**
 * Light/dark switch (ADR-0011). next-themes is wired in the root layout with the
 * `class` strategy (system off). Icons swap via CSS `dark:` variants so there's
 * no mount-gating effect / hydration dance; the click handler reads the resolved
 * theme, which is only ever invoked client-side.
 */
export function ThemeToggle({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useDictionary().nav;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      className={className}
      aria-label={t.toggleTheme}
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
    >
      <Sun className="hidden h-4 w-4 dark:block" />
      <Moon className="h-4 w-4 dark:hidden" />
    </Button>
  );
}
