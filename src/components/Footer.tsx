import Link from "next/link";
import type { Messages } from "@/lib/i18n/messages/ko";

export default function Footer({
  copy,
}: {
  copy: Messages["landing"]["footer"];
}) {
  return (
    <footer className="mt-auto flex w-full flex-col items-center justify-between gap-6 border-t border-border bg-background px-6 py-10 text-caption text-muted-foreground md:flex-row md:px-10">
      <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
        <span className="flex items-center gap-2 font-medium text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Layer0 Studio
        </span>
        <span>© 2026 Layer0 Studio. All rights reserved.</span>
      </div>
      <div className="flex items-center gap-6">
        <Link className="transition-colors hover:text-foreground" href="/legal/terms">
          {copy.terms}
        </Link>
        <Link className="transition-colors hover:text-foreground" href="/legal/privacy">
          {copy.privacy}
        </Link>
        <span className="cursor-not-allowed select-none opacity-50" aria-disabled="true">
          {copy.security}
        </span>
        <span className="cursor-not-allowed select-none opacity-50" aria-disabled="true">
          {copy.status}
        </span>
      </div>
    </footer>
  );
}
