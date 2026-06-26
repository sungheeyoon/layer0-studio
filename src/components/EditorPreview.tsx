'use client';

import { Eye, MousePointerClick } from "lucide-react";
import { useDictionary } from "@/lib/i18n/provider";

export default function EditorPreview() {
  const t = useDictionary().landing.editorPreview;
  return (
    <section className="border-b border-border bg-muted/30 px-6 py-24 md:px-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 grid grid-cols-1 items-end gap-8 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 className="text-heading">
              {t.title}{" "}
              <span className="text-muted-foreground">{t.titleEmphasis}</span>
            </h2>
            <p className="mt-4 max-w-sm text-body text-muted-foreground">
              {t.description}
            </p>
            <div className="mt-8 grid grid-cols-2 gap-6">
              <div>
                <span className="text-caption uppercase tracking-wide text-primary">
                  {t.experienceLabel}
                </span>
                <p className="text-title">{t.experienceValue}</p>
              </div>
              <div>
                <span className="text-caption uppercase tracking-wide text-primary">
                  {t.feedbackLabel}
                </span>
                <p className="text-title">{t.feedbackValue}</p>
              </div>
            </div>
          </div>
          <div className="hidden lg:col-span-7 lg:block">
            <div className="flex justify-end gap-3 text-caption uppercase tracking-wide text-muted-foreground">
              <span>{t.step1}</span>
              <span>/</span>
              <span>{t.step2}</span>
              <span>/</span>
              <span>{t.step3}</span>
            </div>
          </div>
        </div>

        {/* Mock Editor UI */}
        <div className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <div className="flex h-[600px] overflow-hidden">
            {/* Mock Left Sidebar */}
            <div className="hidden w-[240px] flex-col border-r border-border md:flex">
              <div className="flex gap-2 border-b border-border p-4">
                <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                <div className="h-2.5 w-2.5 rounded-full bg-green-400" />
              </div>
              <div className="flex border-b border-border">
                <div className="flex-1 border-b-2 border-primary py-3 text-center text-xs font-semibold text-primary">
                  Content
                </div>
                <div className="flex-1 py-3 text-center text-xs font-medium text-muted-foreground">
                  Design
                </div>
              </div>
              <div className="space-y-8 p-6">
                <div>
                  <div className="mb-4 text-caption uppercase tracking-wide text-muted-foreground">
                    Sections
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">Hero</span>
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-sm">About</span>
                      <Eye className="h-4 w-4" />
                    </div>
                    <div className="flex items-center justify-between text-muted-foreground">
                      <span className="text-sm">Features</span>
                      <Eye className="h-4 w-4" />
                    </div>
                  </div>
                </div>
                <div>
                  <div className="mb-4 text-caption uppercase tracking-wide text-muted-foreground">
                    Properties
                  </div>
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <div className="text-caption uppercase text-muted-foreground">Title</div>
                      <div className="flex h-7 items-center border-b border-border text-sm text-foreground">
                        Digital Portfolio
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="text-caption uppercase text-muted-foreground">Theme Color</div>
                      <div className="flex items-center gap-2">
                        <div className="h-4 w-4 rounded bg-primary" />
                        <div className="text-sm text-foreground">#4F46E5</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-auto border-t border-border p-4">
                <div className="cursor-pointer rounded-md bg-primary py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-primary-foreground transition-all hover:bg-primary/90">
                  Publish Site
                </div>
              </div>
            </div>

            {/* Mock Canvas Area */}
            <div className="relative flex flex-grow flex-col overflow-hidden bg-muted/40 p-8">
              <div className="absolute left-4 top-4 flex gap-2">
                <div className="rounded bg-primary px-3 py-1 text-caption uppercase tracking-wide text-primary-foreground">
                  Live Preview
                </div>
                <div className="rounded border border-border bg-card px-3 py-1 text-caption uppercase tracking-wide text-muted-foreground">
                  Desktop
                </div>
              </div>

              <div className="mt-12 flex flex-grow flex-col overflow-hidden rounded-lg border border-border bg-card shadow-xl">
                <div className="flex h-8 items-center gap-2 border-b border-border bg-muted px-4">
                  <div className="h-2 w-2 rounded-full bg-border" />
                  <div className="h-3 w-32 rounded-full bg-border" />
                </div>
                <div className="space-y-12 p-12">
                  <div className="space-y-4">
                    <div className="h-2 w-16 bg-primary" />
                    <div className="text-heading text-foreground">Digital Portfolio</div>
                    <div className="max-w-sm text-sm text-muted-foreground">
                      Designing high-performance web experiences.
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-6">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="flex aspect-square flex-col justify-end rounded-md border border-border bg-muted/40 p-4"
                      >
                        <div className="mb-2 h-2 w-1/2 bg-primary" />
                        <div className="h-1 w-full bg-border" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 transition-opacity group-hover:opacity-100">
                <div className="animate-bounce rounded-full bg-primary p-4 text-primary-foreground shadow-2xl">
                  <MousePointerClick className="h-8 w-8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
