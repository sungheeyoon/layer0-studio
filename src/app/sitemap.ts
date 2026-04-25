import type { MetadataRoute } from 'next';
import { createClient } from '@/utils/supabase/server';
import { SITE_URL } from '@/lib/seo/base-url';

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
    .select('domain, published_at')
    .eq('status', 'active')
    .not('domain', 'is', null)
    .order('published_at', { ascending: false })
    .limit(500);

  if (error) {
    console.error('[sitemap] failed to list published sites:', error.message);
    return staticEntries;
  }

  const siteEntries: MetadataRoute.Sitemap = (data ?? []).map((row) => ({
    url: `${SITE_URL}/site/${row.domain}`,
    lastModified: row.published_at ?? now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [...staticEntries, ...siteEntries];
}
