import type { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';
import { SITE_URL } from '@/lib/seo/base-url';
import { ContentModel, isMultiContent } from '@/domain/entities/template.entity';

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/templates`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('user_sites')
    .select('domain, published_at, content')
    .eq('status', 'active')
    .not('domain', 'is', null)
    .order('published_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('[sitemap] failed to list published sites:', error.message);
    return staticEntries;
  }

  const siteEntries: MetadataRoute.Sitemap = [];
  for (const row of data ?? []) {
    const base = `${SITE_URL}/site/${row.domain}`;
    const lastModified = row.published_at ?? now;
    const content = row.content as ContentModel | null;

    if (content && isMultiContent(content)) {
      // Every routable (visible) Page gets a URL: the first page = home (base),
      // the rest at `${base}/${slug}`. Pages hidden from the top nav are still
      // routable, so they are included too.
      content.pages.forEach((page, index) => {
        if (!page.visible) return;
        siteEntries.push({
          url: index === 0 ? base : `${base}/${page.slug}`,
          lastModified,
          changeFrequency: 'weekly',
          priority: index === 0 ? 0.7 : 0.6,
        });
      });
    } else {
      // Single Site (or unreadable json) — one continuous scroll at the base.
      siteEntries.push({ url: base, lastModified, changeFrequency: 'weekly', priority: 0.7 });
    }
  }

  return [...staticEntries, ...siteEntries];
}
