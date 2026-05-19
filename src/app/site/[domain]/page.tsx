import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createGetPublishedSiteUseCase } from '@/lib/di/container';
import { loadTemplate } from '@/themes/registry';
import { SITE_URL } from '@/lib/seo/base-url';
import { getFieldValue } from '@/domain/entities/template.entity';
import type { Metadata } from 'next';
import React from 'react';

interface Props {
  params: Promise<{ domain: string }>;
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
  const { domain } = await params;
  const supabase = await createClient();
  const useCase = createGetPublishedSiteUseCase(supabase);

  try {
    const site = await useCase.execute(domain);
    const { siteJson } = site;

    const homePage = siteJson.pages.find(p => p.slug === '/' || p.id === 'home') || siteJson.pages[0];
    const heroSection = homePage?.sections.find(s => s.type === 'hero');
    const heroTitle = getFieldValue(heroSection?.data['title']) || getFieldValue(heroSection?.data['heading']) || '';
    const heroSubtitle = getFieldValue(heroSection?.data['subtitle']) || '';
    const description = buildDescription(site.siteName, homePage?.title, heroTitle, heroSubtitle);

    const canonical = `${SITE_URL}/site/${domain}`;

    return {
      title: site.siteName,
      description,
      alternates: { canonical },
      openGraph: {
        title: site.siteName,
        description,
        type: 'website',
        siteName: site.siteName,
        url: canonical,
      },
      twitter: {
        card: 'summary_large_image',
        title: site.siteName,
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
  const { domain } = await params;
  const supabase = await createClient();
  const useCase = createGetPublishedSiteUseCase(supabase);

  let site;
  try {
    site = await useCase.execute(domain);
  } catch (error) {
    console.error('[PublicSitePage]', error);
    notFound();
  }

  const { siteJson } = site;

  const templateKey = siteJson.templateKey || 'corporate';
  const templateModule = await loadTemplate(templateKey);

  if (!templateModule) {
    console.error(`[PublicSitePage] Theme "${templateKey}" not found`);
    notFound();
  }

  const TemplateRenderer = templateModule.default;

  const homePage = siteJson.pages.find(p => p.slug === '/' || p.id === 'home') || siteJson.pages[0];
  const activePageId = homePage?.id;

  const themeVariables = {
    '--theme-primary': siteJson.globalStyles.primaryColor,
    '--theme-secondary': siteJson.globalStyles.secondaryColor,
    '--theme-font-family': siteJson.globalStyles.fontFamily,
    '--theme-font-size': siteJson.globalStyles.fontSize,
  } as React.CSSProperties;

  return (
    <main
      className="min-h-screen"
      style={themeVariables}
    >
      <TemplateRenderer
        siteJson={siteJson}
        selectedSectionId={null}
        activePageId={activePageId}
      />
    </main>
  );
}
