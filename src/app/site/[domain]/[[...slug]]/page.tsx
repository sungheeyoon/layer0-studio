import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createGetPublishedSiteUseCase } from '@/lib/di/site-read';
import { loadTemplate } from '@/templates/registry';
import { globalStylesToThemeVars } from '@/lib/template/design-tokens';
import { SITE_URL } from '@/lib/seo/base-url';
import {
  getFieldValue,
  allSections,
  isMultiContent,
  resolveActivePageSeo,
} from '@/domain/entities/template.entity';
import type { Metadata } from 'next';
import React from 'react';

interface Props {
  params: Promise<{ domain: string; slug?: string[] }>;
}

function buildDescription(siteName: string, homeTitle: string | undefined, heroTitle: string, heroSubtitle: string): string {
  const parts: string[] = [];
  if (heroSubtitle) parts.push(heroSubtitle);
  else if (heroTitle) parts.push(heroTitle);
  if (homeTitle && homeTitle !== siteName && !parts.join(' ').includes(homeTitle)) {
    parts.push(homeTitle);
  }
  if (parts.length === 0) return `${siteName} — official website`;
  return parts.join(' · ').slice(0, 200);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain, slug } = await params;
  const supabase = await createClient();
  const useCase = createGetPublishedSiteUseCase(supabase);

  try {
    const site = await useCase.execute(domain);
    const { content } = site;
    const slugPath = (slug ?? []).join('/');

    // Resolve the active page (Multi) so SEO is read per-page.
    let activePageId: string | undefined;
    if (isMultiContent(content)) {
      const { pages } = content;
      const activePage = slugPath === '' ? pages[0] : pages.find((p) => p.slug === slugPath);
      activePageId = activePage?.id;
    }

    // Explicit PageSeo wins; fall back to hero extraction when none is authored.
    const seo = resolveActivePageSeo(content, activePageId);
    const heroSection = allSections(content).find(s => s.type === 'hero');
    const heroTitle = getFieldValue(heroSection?.fields['title']) || getFieldValue(heroSection?.fields['heading']) || '';
    const heroSubtitle = getFieldValue(heroSection?.fields['subtitle']) || '';
    const title = seo?.title || site.siteName;
    const description = seo?.description || buildDescription(site.siteName, undefined, heroTitle, heroSubtitle);

    const canonical = slugPath
      ? `${SITE_URL}/site/${domain}/${slugPath}`
      : `${SITE_URL}/site/${domain}`;

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        type: 'website',
        siteName: site.siteName,
        url: canonical,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
      },
      robots: { index: true, follow: true },
    };
  } catch {
    return {
      title: 'Site Not Found',
      robots: { index: false, follow: false },
    };
  }
}

export default async function PublicSitePage({ params }: Props) {
  const { domain, slug } = await params;
  const supabase = await createClient();
  const useCase = createGetPublishedSiteUseCase(supabase);

  let site;
  try {
    site = await useCase.execute(domain);
  } catch (error) {
    console.error('[PublicSitePage]', error);
    notFound();
  }

  const { content } = site;
  const slugPath = (slug ?? []).join('/');

  // Resolve the active page (Multi) or guard against stray slugs (Single).
  // Empty slug = home (first page). Unknown / non-routable page → 404.
  let activePageId: string | undefined;
  if (isMultiContent(content)) {
    const { pages } = content;
    const activePage = slugPath === '' ? pages[0] : pages.find((p) => p.slug === slugPath);
    if (!activePage || !activePage.visible) notFound();
    activePageId = activePage.id;
  } else if (slugPath !== '') {
    // Single Sites are one continuous scroll — no sub-paths.
    notFound();
  }

  const templateKey = content.templateKey || 'corporate-default';
  const templateModule = await loadTemplate(templateKey);

  if (!templateModule) {
    console.error(`[PublicSitePage] Template "${templateKey}" not found`);
    notFound();
  }

  const TemplateRenderer = templateModule.default;

  const themeVariables = globalStylesToThemeVars(content.globalStyles) as React.CSSProperties;

  return (
    <main
      className="min-h-screen"
      style={themeVariables}
    >
      <TemplateRenderer
        content={content}
        selectedSectionId={null}
        activePageId={activePageId}
        basePath={`/site/${domain}`}
      />
    </main>
  );
}
