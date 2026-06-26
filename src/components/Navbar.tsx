import Link from "next/link";
import type { User } from "@supabase/supabase-js";
import ProfileDropdown from "./ProfileDropdown";
import { LocaleToggle } from "./LocaleToggle";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Messages } from "@/lib/i18n/messages/ko";

interface NavbarProps {
  user: User | null;
  copy: Messages["nav"];
}

export default function Navbar({ user, copy }: NavbarProps) {
  return (
    <nav className="fixed top-0 left-0 z-50 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 px-6 backdrop-blur-md md:px-10">
      <Link href="/" className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-primary" />
        <span className="text-title font-semibold tracking-tight">
          Layer0 Studio
        </span>
      </Link>

      <div className="hidden items-center gap-8 text-sm md:flex">
        <Link
          href="/templates"
          className="text-muted-foreground transition-colors hover:text-foreground"
        >
          {copy.templates}
        </Link>
      </div>

      <div className="flex items-center gap-3">
        <LocaleToggle className="flex gap-1" />
        <ThemeToggle />
        <Separator orientation="vertical" className="h-5" />
        {user ? (
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
              <Link href="/dashboard">{copy.dashboard}</Link>
            </Button>
            <ProfileDropdown user={user} />
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/login">{copy.signIn}</Link>
            </Button>
            <Button asChild size="sm">
              <Link href="/signup">{copy.getStarted}</Link>
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
