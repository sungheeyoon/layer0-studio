import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createGetPublishedSiteUseCase } from '@/lib/di/container';
import { loadTheme } from '@/themes/registry';
import type { Metadata } from 'next';
import React from 'react';
import ThemeClientWrapper from '@/themes/ThemeClientWrapper';

interface Props {
  params: Promise<{ domain: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { domain } = await params;
  const supabase = await createClient();
  const useCase = createGetPublishedSiteUseCase(supabase);

  try {
    const site = await useCase.execute(domain);
    const heroTitle = site.siteJson.sections.find(s => s.type === 'hero')?.data['title']?.value;

    return {
      title: site.siteName,
      description: heroTitle || `${site.siteName} — Built with Layer0 Studio`,
    };
  } catch {
    return { title: 'Site Not Found' };
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
      <ThemeClientWrapper
        themeKey={siteJson.themeKey || 'corporate'}
        siteJson={siteJson}
        selectedSectionId={null}
      />
    </main>
  );
}
