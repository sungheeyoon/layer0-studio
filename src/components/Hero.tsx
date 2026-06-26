import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Messages } from "@/lib/i18n/messages/ko";

export default function Hero({
  copy,
  ctaLabel,
}: {
  copy: Messages["landing"]["hero"];
  ctaLabel: string;
}) {
  return (
    <section className="relative flex min-h-[80vh] items-center overflow-hidden border-b border-border px-6 md:px-10">
      {/* Soft brand wash, no blueprint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-primary/[0.04]"
      />
      <div className="relative z-10 mx-auto w-full max-w-5xl py-24 text-center">
        <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-caption text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Layer0 Studio
        </span>
        <h1 className="text-display mx-auto max-w-3xl text-balance">
          {copy.titleLine1}{" "}
          <span className="text-primary">{copy.titleEmphasis}</span>{" "}
          {copy.titleLine3}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-body text-muted-foreground">
          {copy.description}
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild size="lg">
            <Link href="/templates">
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
