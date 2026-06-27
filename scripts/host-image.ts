/**
 * template:image — fetch a stock image and host it in the template_assets bucket.
 *
 * Thin CLI wrapper around `fetchAndHostImage` (scripts/lib/image-fetch.ts).
 * The `new-template` Skill calls this to fill `type: 'image'` fields: the agent
 * decides the query string, this command fetches (Unsplash/Pexels), uploads to
 * Supabase Storage (`template_assets/<templateKey>/`), and prints the public URL.
 *
 * Requires env: UNSPLASH_ACCESS_KEY and/or PEXELS_API_KEY (else picsum fallback),
 * plus Supabase service-role creds. Run via:
 *   pnpm tsx --env-file=.env.local scripts/host-image.ts <templateKey> "<query>" [wide|square|portrait]
 *
 * Usage:
 *   pnpm template:image <templateKey> "<query>" [aspect]
 *     aspect: wide (default) | square | portrait
 */
import { fetchAndHostImage, type AspectRatio } from './lib/image-fetch';

const ASPECTS: AspectRatio[] = ['wide', 'square', 'portrait'];

async function main() {
  const [templateKey, query, aspectArg] = process.argv.slice(2);

  if (!templateKey || !query) {
    console.error('Usage: pnpm template:image <templateKey> "<query>" [wide|square|portrait]');
    process.exit(1);
  }

  const aspectRatio: AspectRatio =
    aspectArg && ASPECTS.includes(aspectArg as AspectRatio) ? (aspectArg as AspectRatio) : 'wide';

  console.log(`\n🖼  Fetching "${query}"  (${aspectRatio}) for ${templateKey}…\n`);

  const result = await fetchAndHostImage({ templateKey, query, aspectRatio });

  console.log(result.url);
  if (result.fallback) {
    console.log('\n⚠️  picsum fallback used (no provider key, or fetch/upload failed).');
  } else {
    console.log(`\nsource: ${result.source}`);
    if (result.attribution) {
      console.log(`credit: ${result.attribution.artist} — ${result.attribution.sourceUrl}`);
    }
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
