import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Messages } from "@/lib/i18n/messages/ko";
import type { Template } from "@/domain/entities/template.entity";

export default function Hero({
  copy,
  ctaLabel,
  primaryCtaHref,
  primaryCtaLabel,
  templates,
}: {
  copy: Messages["landing"]["hero"];
  ctaLabel: string;
  primaryCtaHref: string;
  primaryCtaLabel: string;
  templates: Template[];
}) {
  const featured = templates[0];

  return (
    <section className="relative flex min-h-[calc(100svh-4rem)] items-center overflow-hidden border-b border-border px-4 py-12 sm:px-6 sm:py-16 md:px-10 lg:py-20">
      {/* Soft brand wash, no blueprint grid */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-1/2 bg-primary/[0.04]"
      />
      <div className="relative z-10 mx-auto grid w-full max-w-6xl items-center gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
        <div className="text-center lg:text-left">
        <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-caption text-muted-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Layer0 Studio
        </span>
        <h1 className="text-display max-w-3xl text-balance">
          {copy.titleLine1}{" "}
          <span className="text-primary">{copy.titleEmphasis}</span>
          <br />
          {copy.titleLine3}
        </h1>
        <p className="mt-5 max-w-xl text-balance text-body text-muted-foreground lg:text-left">
          {copy.description}
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row lg:justify-start">
          <Button asChild size="lg">
            <Link href={primaryCtaHref}>
              {primaryCtaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href="/templates">
              {ctaLabel}
            </Link>
          </Button>
        </div>
        </div>

        <div className="relative mx-auto w-full max-w-2xl">
          <div aria-hidden className="absolute -inset-6 rounded-[2rem] bg-primary/10 blur-3xl" />
          <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-2 shadow-2xl sm:p-3">
            <div className="flex items-center gap-1.5 border-b border-border px-2 pb-2 sm:px-3 sm:pb-3">
              <span className="size-2 rounded-full bg-destructive" />
              <span className="size-2 rounded-full bg-warning" />
              <span className="size-2 rounded-full bg-success" />
              <span className="ml-2 truncate text-caption text-muted-foreground">
                {featured?.name ?? "Layer0 Studio"}
              </span>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted">
              {featured?.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={featured.thumbnailUrl}
                  alt={featured.name}
                  className="h-full w-full object-cover object-top"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-caption text-muted-foreground">
                  Layer0 Studio
                </div>
              )}
            </div>
          </div>
          {templates.slice(1, 3).map((template, index) => (
            <div
              key={template.id}
              className={`absolute bottom-5 hidden w-40 overflow-hidden rounded-xl border border-border bg-card p-1.5 shadow-xl sm:block ${index === 0 ? "-left-8" : "-right-8"}`}
            >
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                {template.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={template.thumbnailUrl} alt="" className="h-full w-full object-cover object-top" />
                )}
              </div>
              <p className="truncate px-1 pt-1.5 text-caption font-medium">{template.name}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
