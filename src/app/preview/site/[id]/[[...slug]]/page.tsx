import { notFound } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { createGetUserSiteUseCase } from '@/lib/di/site-read';
import { isMultiContent } from '@/domain/entities/template.entity';
import { globalStylesToThemeVars } from '@/lib/template/design-tokens';
import type { Metadata } from 'next';
import React from 'react';
import TemplateClientWrapper from '@/templates/TemplateClientWrapper';

/**
 * Full-page preview of a Site's **draft**.
 *
 * Separate from `/preview/[id]`, which previews a *Template* catalog row — the
 * dashboard used to link Site ids at that route, so it looked up a `user_sites`
 * id in the `templates` table and 404'd for every Site, always.
 *
 * This is the only surface that renders the draft at full size. Since ADR-0017
 * the public renderer serves `publishedContent` and never the draft, so
 * "see it before publishing" has nowhere else to live.
 *
 * Owner-only. RLS (`manage own sites`) already scopes the read to the owner, so
 * a stranger's id resolves to nothing; the explicit check below states the
 * intent in code and keeps working if that policy is ever loosened.
 */
interface Props {
  params: Promise<{ id: string; slug?: string[] }>;
}

async function loadOwnedSite(id: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  try {
    const site = await createGetUserSiteUseCase(supabase).execute(id);
    if (site.userId !== user.id) return null;
    return site;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const site = await loadOwnedSite(id);
  if (!site) return { title: 'Preview', robots: { index: false, follow: false } };

  return {
    // A draft must never be indexable — it is unpublished by definition.
    title: `${site.siteName} — Preview`,
    robots: { index: false, follow: false },
  };
}

export default async function SitePreviewPage({ params }: Props) {
  const { id, slug } = await params;
  const site = await loadOwnedSite(id);
  if (!site) notFound();

  const { content } = site;
  const slugPath = (slug ?? []).join('/');

  // Mirror the public renderer's routing so the preview answers the same
  // question the live site will: empty slug = home, unknown or hidden Page →
  // 404, Single Sites have no sub-paths.
  let activePageId: string | undefined;
  if (isMultiContent(content)) {
    const { pages } = content;
    const activePage = slugPath === '' ? pages[0] : pages.find((p) => p.slug === slugPath);
    if (!activePage || !activePage.visible) notFound();
    activePageId = activePage.id;
  } else if (slugPath !== '') {
    notFound();
  }

  const themeVariables = globalStylesToThemeVars(content.globalStyles) as React.CSSProperties;

  return (
    <main className="min-h-screen" style={themeVariables}>
      <TemplateClientWrapper
        templateKey={content.templateKey || 'corporate-default'}
        content={content}
        selectedSectionId={null}
        activePageId={activePageId}
        basePath={`/preview/site/${id}`}
      />
    </main>
  );
}
