"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, Pause, Play } from "lucide-react";
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
  const [activeIndex, setActiveIndex] = useState(0);
  const [manualPaused, setManualPaused] = useState(false);
  const [interactionPaused, setInteractionPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const templateCount = templates.length;
  const paused = manualPaused || interactionPaused;
  const featured = templates[activeIndex];
  const previousIndex = templateCount > 0
    ? (activeIndex - 1 + templateCount) % templateCount
    : 0;
  const nextIndex = templateCount > 0 ? (activeIndex + 1) % templateCount : 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncPreference = () => setReducedMotion(mediaQuery.matches);
    syncPreference();
    mediaQuery.addEventListener("change", syncPreference);
    return () => mediaQuery.removeEventListener("change", syncPreference);
  }, []);

  useEffect(() => {
    if (templateCount < 2 || paused || reducedMotion) return;
    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % templateCount);
    }, 5000);
    return () => window.clearTimeout(timer);
  }, [activeIndex, paused, reducedMotion, templateCount]);

  const showPrevious = () => setActiveIndex(previousIndex);
  const showNext = () => setActiveIndex(nextIndex);

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

        <div
          className="relative mx-auto w-full max-w-2xl"
          onMouseEnter={() => setInteractionPaused(true)}
          onMouseLeave={() => setInteractionPaused(false)}
          onFocusCapture={() => setInteractionPaused(true)}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
              setInteractionPaused(false);
            }
          }}
        >
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
            <div className="relative aspect-video overflow-hidden rounded-xl bg-muted" aria-live="polite">
              {featured?.thumbnailUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={featured.id}
                  src={featured.thumbnailUrl}
                  alt={featured.name}
                  className="h-full w-full object-cover object-top motion-safe:animate-in motion-safe:fade-in-0 motion-safe:zoom-in-95 motion-safe:duration-700"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-caption text-muted-foreground">
                  Layer0 Studio
                </div>
              )}
              {featured && (
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 bg-gradient-to-t from-black/75 via-black/25 to-transparent p-4 pt-14 text-white sm:p-5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/70">
                      {featured.category}
                    </p>
                    <p className="truncate text-base font-semibold sm:text-lg">{featured.name}</p>
                  </div>
                  <span className="shrink-0 text-xs tabular-nums text-white/70">
                    {String(activeIndex + 1).padStart(2, "0")} / {String(templateCount).padStart(2, "0")}
                  </span>
                </div>
              )}
            </div>

            {templateCount > 1 && (
              <div className="flex items-center justify-between gap-3 px-1 pt-2 sm:pt-3">
                <div className="flex items-center gap-1">
                  <Button type="button" variant="ghost" size="icon" onClick={showPrevious} aria-label={copy.previousTemplate}>
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                  <Button type="button" variant="ghost" size="icon" onClick={showNext} aria-label={copy.nextTemplate}>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex min-w-0 flex-1 justify-center gap-1.5" aria-label={copy.selectTemplate}>
                  {templates.map((template, index) => (
                    <button
                      key={template.id}
                      type="button"
                      onClick={() => setActiveIndex(index)}
                      aria-label={`${copy.selectTemplate}: ${template.name}`}
                      aria-current={index === activeIndex ? "true" : undefined}
                      className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${index === activeIndex ? "w-8 bg-primary" : "w-2 bg-border hover:bg-muted-foreground/60"}`}
                    />
                  ))}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setManualPaused((current) => !current)}
                  aria-label={manualPaused ? copy.playCarousel : copy.pauseCarousel}
                  aria-pressed={manualPaused}
                >
                  {manualPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                </Button>
              </div>
            )}
          </div>
          {templateCount > 2 && [previousIndex, nextIndex].map((templateIndex, index) => {
            const template = templates[templateIndex];
            return (
            <button
              key={`${index === 0 ? "previous" : "next"}-${template.id}`}
              type="button"
              onClick={() => setActiveIndex(templateIndex)}
              aria-label={`${copy.selectTemplate}: ${template.name}`}
              className={`absolute bottom-16 hidden w-40 overflow-hidden rounded-xl border border-border bg-card p-1.5 text-left shadow-xl transition-transform duration-300 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:block ${index === 0 ? "-left-8 -rotate-2" : "-right-8 rotate-2"}`}
            >
              <div className="aspect-video overflow-hidden rounded-lg bg-muted">
                {template.thumbnailUrl && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={template.thumbnailUrl} alt="" className="h-full w-full object-cover object-top" />
                )}
              </div>
              <p className="truncate px-1 pt-1.5 text-caption font-medium">{template.name}</p>
            </button>
          )})}
        </div>
      </div>
    </section>
  );
}
