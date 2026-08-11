import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import EditorPreview from "@/components/EditorPreview";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";
import { listPaginatedTemplatesAction } from "@/app/(authenticated)/dashboard/(with-sidebar)/templates/actions";

export default async function Home() {
  const [user, locale, templateResult] = await Promise.all([
    getCurrentUser(),
    getLocale(),
    listPaginatedTemplatesAction(1, 7),
  ]);
  const t = getDictionary(locale).landing;
  const featuredTemplates = templateResult.data;
  const editorTemplate = featuredTemplates[5] ?? featuredTemplates[1] ?? featuredTemplates[0];
  const spotlightTemplate = featuredTemplates[6] ?? featuredTemplates[2] ?? featuredTemplates[0];
  const primaryCtaHref = user ? "/dashboard" : "/signup";
  const primaryCtaLabel = user ? t.cta.authed : t.cta.guest;

  const steps = [
    { n: "01", title: t.howItWorks.chooseTitle, body: t.howItWorks.chooseBody },
    { n: "02", title: t.howItWorks.customizeTitle, body: t.howItWorks.customizeBody },
    { n: "03", title: t.howItWorks.publishTitle, body: t.howItWorks.publishBody },
  ];

  return (
    <>
      <main className="min-h-screen pt-16">
        <Hero
          copy={t.hero}
          ctaLabel={t.common.browseTemplates}
          primaryCtaHref={primaryCtaHref}
          primaryCtaLabel={primaryCtaLabel}
          templates={featuredTemplates.slice(0, 5)}
        />

        <EditorPreview
          previewImage={editorTemplate?.thumbnailUrl}
          previewName={editorTemplate?.name}
        />

        <Features copy={t.features} />

        {/* How It Works */}
        <section className="border-b border-border px-6 py-24 md:px-10">
          <div className="mx-auto max-w-6xl">
            <div className="mb-16 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
              <h2 className="text-heading">
                {t.howItWorks.title}{" "}
                <span className="text-muted-foreground">{t.howItWorks.subtitle}</span>
              </h2>
              <p className="max-w-sm text-body text-muted-foreground">
                {t.howItWorks.lead}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {steps.map((step) => (
                <Card key={step.n} className="border-border">
                  <CardContent className="p-8">
                    <span className="mb-6 block text-4xl font-light text-primary">
                      {step.n}
                    </span>
                    <h3 className="text-title mb-3">{step.title}</h3>
                    <p className="text-body text-muted-foreground">{step.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Template Preview */}
        <section className="border-b border-border bg-muted/30 px-6 py-24 md:px-10">
          <div className="mx-auto flex max-w-6xl flex-col">
            <div className="mb-12 flex items-end justify-between">
              <h2 className="text-heading">{t.templates.title}</h2>
              <Button asChild variant="link" className="hidden md:inline-flex">
                <Link href="/templates">
                  {t.templates.browseAll}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
              <div className="lg:col-span-7">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
                  <div className="relative aspect-video overflow-hidden bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={spotlightTemplate?.name ?? t.templates.corporateTitle}
                      className="h-full w-full scale-105 object-cover transition-transform duration-700 hover:scale-100"
                      src={spotlightTemplate?.thumbnailUrl ?? "/favicon.ico"}
                    />
                    <div className="absolute left-4 top-4 rounded-md bg-primary px-3 py-1.5 text-caption uppercase tracking-wide text-primary-foreground">
                      {spotlightTemplate?.category ?? t.templates.bestForBusiness}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-col justify-center lg:col-span-5">
                <h3 className="text-title mb-4">{spotlightTemplate?.name ?? t.templates.corporateTitle}</h3>
                <p className="mb-8 text-body text-muted-foreground">
                  {spotlightTemplate?.description ?? t.templates.corporateBody}
                </p>
                <ul className="mb-10 space-y-3">
                  {[
                    t.features.layouts.title,
                    t.features.editing.title,
                    t.features.publishing.title,
                  ].map(
                    (bullet) => (
                      <li key={bullet} className="flex items-center gap-3 text-body">
                        <Check className="h-4 w-4 shrink-0 text-primary" />
                        {bullet}
                      </li>
                    ),
                  )}
                </ul>
                <Button asChild variant="outline" className="w-max">
                  <Link href="/templates">{t.templates.useThis}</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="flex flex-col items-center justify-center border-t border-border px-6 py-32 text-center md:px-10">
          <h2 className="text-display mb-10 max-w-3xl text-balance">
            {t.finalCta.titleLine1}{" "}
            <span className="text-primary">{t.finalCta.titleEmphasis}</span>
          </h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg">
              <Link href={primaryCtaHref}>
                {primaryCtaLabel}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/templates">{t.common.browseTemplates}</Link>
            </Button>
          </div>
        </section>
      </main>
      <Footer copy={t.footer} />
    </>
  );
}
