import Link from "next/link";
import Hero from "@/components/Hero";
import Features from "@/components/Features";
import Footer from "@/components/Footer";
import EditorPreview from "@/components/EditorPreview";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getLocale } from "@/lib/i18n/server";
import { getDictionary } from "@/lib/i18n/dictionary";

export default async function Home() {
  const [user, locale] = await Promise.all([getCurrentUser(), getLocale()]);
  const t = getDictionary(locale).landing;
  const primaryCtaHref = user ? "/dashboard" : "/signup";
  const primaryCtaLabel = user ? t.cta.authed : t.cta.guest;

  return (
    <>
      <main className="pt-16 min-h-screen">
        <Hero copy={t.hero} ctaLabel={t.common.browseTemplates} />

        <Features copy={t.features} />

        <EditorPreview />

        {/* How It Works (Steps) - User Centric Flow */}
        <section className="py-32 px-10 border-b border-surface-container">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-baseline mb-20 gap-8">
              <h2 className="text-4xl font-light text-primary tracking-tight">{t.howItWorks.title} <br /><span className="text-outline">{t.howItWorks.subtitle}</span></h2>
              <p className="text-outline font-light text-sm max-w-sm">
                {t.howItWorks.lead}
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-px bg-outline-variant border border-outline-variant">
              <div className="md:col-span-4 bg-surface p-12">
                <span className="text-[3rem] font-thin text-tertiary leading-none mb-8 block">01</span>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-primary">{t.howItWorks.chooseTitle}</h4>
                <p className="text-outline font-light text-sm leading-relaxed">
                  {t.howItWorks.chooseBody}
                </p>
              </div>
              <div className="md:col-span-4 bg-surface p-12">
                <span className="text-[3rem] font-thin text-tertiary leading-none mb-8 block">02</span>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-primary">{t.howItWorks.customizeTitle}</h4>
                <p className="text-outline font-light text-sm leading-relaxed">
                  {t.howItWorks.customizeBody}
                </p>
              </div>
              <div className="md:col-span-4 bg-surface p-12">
                <span className="text-[3rem] font-thin text-tertiary leading-none mb-8 block">03</span>
                <h4 className="text-xs font-bold uppercase tracking-[0.2em] mb-4 text-primary">{t.howItWorks.publishTitle}</h4>
                <p className="text-outline font-light text-sm leading-relaxed">
                  {t.howItWorks.publishBody}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Template Preview - Result Oriented */}
        <section className="py-32 px-10 bg-surface-container-highest/30">
          <div className="max-w-7xl mx-auto flex flex-col">
            <div className="flex justify-between items-end mb-16">
              <div>
                <h2 className="text-3xl font-light mb-4 text-primary tracking-tight">{t.templates.title}</h2>
                <p className="text-outline text-[0.625rem] uppercase tracking-[0.3em]">Curated Library // Available: 01</p>
              </div>
              <div className="hidden md:block">
                <Link
                  href="/templates"
                  className="text-[0.6875rem] font-medium uppercase tracking-widest border-b border-primary pb-1"
                >
                  {t.templates.browseAll}
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
              <div className="lg:col-span-7">
                <div className="bg-white border border-outline-variant p-2 shadow-xl group cursor-pointer">
                  <div className="aspect-video bg-surface-container-low overflow-hidden relative">
                    <div className="absolute inset-0 grid-blueprint opacity-20"></div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Corporate Blueprint"
                      className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000 scale-105 group-hover:scale-100"
                      src="https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80&w=1200"
                    />
                    <div className="absolute top-6 left-6 bg-primary text-white px-4 py-2 text-[10px] uppercase tracking-[0.2em]">
                      {t.templates.bestForBusiness}
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 flex flex-col justify-center">
                <h3 className="text-2xl font-light mb-6 text-primary tracking-tight">{t.templates.corporateTitle}</h3>
                <p className="text-outline font-light text-sm leading-relaxed mb-8">
                  {t.templates.corporateBody}
                </p>
                <ul className="space-y-4 mb-10">
                  <li className="flex items-center gap-4 text-[0.625rem] uppercase tracking-widest text-on-surface">
                    <span className="w-1.5 h-1.5 bg-tertiary"></span> {t.templates.bullet1}
                  </li>
                  <li className="flex items-center gap-4 text-[0.625rem] uppercase tracking-widest text-on-surface">
                    <span className="w-1.5 h-1.5 bg-tertiary"></span> {t.templates.bullet2}
                  </li>
                  <li className="flex items-center gap-4 text-[0.625rem] uppercase tracking-widest text-on-surface">
                    <span className="w-1.5 h-1.5 bg-tertiary"></span> {t.templates.bullet3}
                  </li>
                </ul>
                <Link
                  href="/templates"
                  className="w-max border border-outline px-10 py-4 text-[0.6875rem] font-medium uppercase tracking-[0.2em] hover:bg-primary hover:text-white transition-all"
                >
                  {t.templates.useThis}
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section - Direct and Actionable */}
        <section className="py-48 px-10 grid-blueprint flex flex-col items-center justify-center text-center border-t border-surface-container overflow-hidden relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-24 bg-outline-variant"></div>

          <h2 className="text-5xl md:text-7xl font-light mb-12 tracking-tightest max-w-4xl text-primary">
            {t.finalCta.titleLine1} <br />
            <span className="italic text-outline-variant">{t.finalCta.titleEmphasis}</span>
          </h2>
          <div className="flex flex-col md:flex-row gap-6">
            <Link
              href={primaryCtaHref}
              className="bg-primary text-on-primary px-16 py-6 text-[0.75rem] font-medium uppercase tracking-[0.3em] hover:brightness-110 transition-all shadow-2xl"
            >
              {primaryCtaLabel}
            </Link>
            <Link
              href="/templates"
              className="border border-outline px-16 py-6 text-[0.75rem] font-medium uppercase tracking-[0.3em] hover:bg-surface-container transition-all"
            >
              {t.common.browseTemplates}
            </Link>
          </div>

          <div className="mt-20 text-[0.625rem] font-mono text-outline uppercase tracking-[0.4em] opacity-40">
            System_v1.0.4 // Production_Ready
          </div>
        </section>
      </main>
      <Footer copy={t.footer} />
    </>
  );
}
