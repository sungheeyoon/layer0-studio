/**
 * Fetch a photo from Unsplash + Pexels, host it on our Supabase bucket
 * (`template_assets`, see migration 014), and return our own CDN URL.
 *
 * Why both providers — broader coverage and less déjà-vu across templates.
 * Why offset-random — the "top result" is the most-cliché shot for any
 * query (skim Unsplash for 'coffee shop' a few times and you'll see the
 * same hero photo everywhere). We grab the top 10 and randomly pick from
 * indices 1-9.
 *
 * Wiring: `generate_section` (Issue #13) is intended to call this whenever
 * its fieldsSchema declares an `image` field; the LLM only picks the query
 * text, this helper handles fetch + host. This file stands alone — no
 * integration touchpoint exists yet (deferred to #13).
 */

import crypto from 'crypto';
import path from 'path';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

import {
  uploadTemplateAsset,
  TEMPLATE_ASSETS_BUCKET,
} from '../../src/lib/template/template-assets';

// ─── Public types ────────────────────────────────────────────────────────────

export type AspectRatio = 'wide' | 'square' | 'portrait';

export interface FetchAndHostImageOptions {
  /** Search query — e.g. "minimalist cafe interior dark wood". */
  query: string;
  /** Template key (used to namespace storage path: `template_assets/<templateKey>/<file>`). */
  templateKey: string;
  /** Aspect hint — maps to provider orientation params and storage filename. */
  aspectRatio?: AspectRatio;
  /** Section role context (for logging only). */
  role?: string;
  /** Inject for tests — defaults to `Math.random`. */
  random?: () => number;
  /** Inject for tests — defaults to global `fetch`. */
  fetchImpl?: typeof fetch;
  /** Inject for tests — defaults to a fresh admin client built from env. */
  supabase?: SupabaseClient;
}

export interface FetchAndHostImageResult {
  /** Public CDN URL of the hosted image (or picsum.photos fallback URL on total failure). */
  url: string;
  /** True when the picsum fallback was used. */
  fallback: boolean;
  /** Source provider (only set when `fallback === false`). */
  source?: 'unsplash' | 'pexels';
  /** Photographer credit metadata (only set when `fallback === false`). */
  attribution?: { artist: string; artistUrl: string; sourceUrl: string };
}

// ─── Internal types ──────────────────────────────────────────────────────────

export interface ImageCandidate {
  source: 'unsplash' | 'pexels';
  id: string;
  downloadUrl: string;                              // raw image URL to GET
  /** Unsplash requires hitting this endpoint *before* downloading, per ToS. */
  downloadTrackUrl?: string;
  artist: string;
  artistUrl: string;
  /** Public photo page URL (used in attribution metadata). */
  sourceUrl: string;
  width: number;
  height: number;
}

// ─── Pool selection (testable in isolation) ──────────────────────────────────

/**
 * Pick one candidate from a pool, skewing away from the most-cliché result.
 *
 *   - 0 candidates → throws
 *   - 1 candidate  → returns it
 *   - 2+           → random pick from indices 1..N-1 (max 9), never index 0
 *
 * Index 0 — the "most relevant" result for any query — is the photo every
 * AI-generated template would pick if asked. Skipping it gives variety.
 */
export function pickFromPool(
  candidates: ImageCandidate[],
  random: () => number = Math.random,
): ImageCandidate {
  if (candidates.length === 0) {
    throw new Error('pickFromPool: empty pool');
  }
  if (candidates.length === 1) return candidates[0];
  // Top 10 → choose index in [1, min(9, N-1)]. With 5 candidates, range is [1,4].
  const upperBound = Math.min(candidates.length - 1, 9);
  const idx = 1 + Math.floor(random() * upperBound);
  return candidates[idx];
}

// ─── Provider adapters ───────────────────────────────────────────────────────

function unsplashOrientation(ar: AspectRatio | undefined): string | null {
  switch (ar) {
    case 'wide':     return 'landscape';
    case 'portrait': return 'portrait';
    case 'square':   return 'squarish';
    default:         return null;
  }
}

function pexelsOrientation(ar: AspectRatio | undefined): string | null {
  switch (ar) {
    case 'wide':     return 'landscape';
    case 'portrait': return 'portrait';
    case 'square':   return 'square';
    default:         return null;
  }
}

interface UnsplashPhoto {
  id: string;
  width: number;
  height: number;
  urls: { regular: string; full: string };
  links: { download_location: string; html: string };
  user: { name: string; links: { html: string } };
}

async function fetchUnsplash(
  query: string,
  aspectRatio: AspectRatio | undefined,
  fetchImpl: typeof fetch,
): Promise<ImageCandidate[]> {
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return [];
  const url = new URL('https://api.unsplash.com/search/photos');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '10');
  url.searchParams.set('content_filter', 'high');
  const orientation = unsplashOrientation(aspectRatio);
  if (orientation) url.searchParams.set('orientation', orientation);

  const res = await fetchImpl(url, {
    headers: {
      'Accept-Version': 'v1',
      Authorization: `Client-ID ${key}`,
    },
  });
  if (!res.ok) {
    console.warn(`[image-fetch] Unsplash HTTP ${res.status} for "${query}"`);
    return [];
  }
  const data = (await res.json()) as { results: UnsplashPhoto[] };
  return (data.results ?? []).map((p): ImageCandidate => ({
    source: 'unsplash',
    id: p.id,
    downloadUrl: p.urls.regular,
    downloadTrackUrl: p.links.download_location,
    artist: p.user.name,
    artistUrl: `${p.user.links.html}?utm_source=layer0-studio&utm_medium=referral`,
    sourceUrl: `${p.links.html}?utm_source=layer0-studio&utm_medium=referral`,
    width: p.width,
    height: p.height,
  }));
}

interface PexelsPhoto {
  id: number;
  width: number;
  height: number;
  url: string;
  photographer: string;
  photographer_url: string;
  src: { large: string; large2x: string; original: string };
}

async function fetchPexels(
  query: string,
  aspectRatio: AspectRatio | undefined,
  fetchImpl: typeof fetch,
): Promise<ImageCandidate[]> {
  const key = process.env.PEXELS_API_KEY;
  if (!key) return [];
  const url = new URL('https://api.pexels.com/v1/search');
  url.searchParams.set('query', query);
  url.searchParams.set('per_page', '10');
  const orientation = pexelsOrientation(aspectRatio);
  if (orientation) url.searchParams.set('orientation', orientation);

  const res = await fetchImpl(url, { headers: { Authorization: key } });
  if (!res.ok) {
    console.warn(`[image-fetch] Pexels HTTP ${res.status} for "${query}"`);
    return [];
  }
  const data = (await res.json()) as { photos: PexelsPhoto[] };
  return (data.photos ?? []).map((p): ImageCandidate => ({
    source: 'pexels',
    id: String(p.id),
    downloadUrl: p.src.large2x,
    artist: p.photographer,
    artistUrl: p.photographer_url,
    sourceUrl: p.url,
    width: p.width,
    height: p.height,
  }));
}

// ─── Unsplash attribution (license requirement) ──────────────────────────────

/**
 * Hit Unsplash's `download_location` endpoint *before* downloading the photo
 * — required by their API ToS to count actual usage. Failures are
 * non-fatal (logged + ignored).
 */
async function triggerUnsplashAttribution(
  candidate: ImageCandidate,
  fetchImpl: typeof fetch,
): Promise<void> {
  if (candidate.source !== 'unsplash' || !candidate.downloadTrackUrl) return;
  const key = process.env.UNSPLASH_ACCESS_KEY;
  if (!key) return;
  try {
    await fetchImpl(candidate.downloadTrackUrl, {
      headers: {
        'Accept-Version': 'v1',
        Authorization: `Client-ID ${key}`,
      },
    });
  } catch (err) {
    console.warn('[image-fetch] Unsplash attribution trigger failed (non-fatal):', err);
  }
}

// ─── Download + upload ───────────────────────────────────────────────────────

async function downloadAsBuffer(url: string, fetchImpl: typeof fetch): Promise<Buffer> {
  const res = await fetchImpl(url);
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status} for ${url}`);
  return Buffer.from(await res.arrayBuffer());
}

function inferExt(contentType: string | null, downloadUrl: string): string {
  if (contentType?.includes('jpeg') || contentType?.includes('jpg')) return '.jpg';
  if (contentType?.includes('png')) return '.png';
  if (contentType?.includes('webp')) return '.webp';
  if (contentType?.includes('gif')) return '.gif';
  // Fall back to URL path extension.
  const ext = path.extname(new URL(downloadUrl).pathname).toLowerCase();
  return ext && ['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext) ? ext : '.jpg';
}

function buildScriptAdminClient(): SupabaseClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      'image-fetch upload: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.',
    );
  }
  return createClient(url, key);
}

// ─── Picsum fallback ─────────────────────────────────────────────────────────

function picsumFallback(opts: { aspectRatio?: AspectRatio; seed: string }): string {
  const dims =
    opts.aspectRatio === 'portrait' ? { w: 900, h: 1200 } :
    opts.aspectRatio === 'square'   ? { w: 1000, h: 1000 } :
                                      { w: 1600, h: 900 };
  return `https://picsum.photos/seed/${encodeURIComponent(opts.seed)}/${dims.w}/${dims.h}`;
}

// ─── Orchestrator ────────────────────────────────────────────────────────────

/**
 * Top-level entry point. See module header for behavior.
 *
 * The integration point (`generate_section` auto-calling this when its
 * `fieldsSchema` declares an `image` field) lands in Issue #13.
 */
export async function fetchAndHostImage(
  opts: FetchAndHostImageOptions,
): Promise<FetchAndHostImageResult> {
  const fetchImpl = opts.fetchImpl ?? fetch;
  const random = opts.random ?? Math.random;
  const { query, templateKey, aspectRatio, role } = opts;

  let pool: ImageCandidate[];
  try {
    const [unsplash, pexels] = await Promise.all([
      fetchUnsplash(query, aspectRatio, fetchImpl),
      fetchPexels(query, aspectRatio, fetchImpl),
    ]);
    // Interleave — alternate sources at the top of the pool so neither
    // provider's index-0 dominates after our offset skip.
    pool = [];
    const max = Math.max(unsplash.length, pexels.length);
    for (let i = 0; i < max; i++) {
      if (unsplash[i]) pool.push(unsplash[i]);
      if (pexels[i])   pool.push(pexels[i]);
    }
  } catch (err) {
    console.warn('[image-fetch] Provider query failed (will fall back):', err);
    pool = [];
  }

  if (pool.length === 0) {
    const seed = `${templateKey}-${role ?? 'image'}-${query.slice(0, 20)}`;
    console.warn(`[image-fetch] Empty pool for "${query}" — using picsum fallback`);
    return { url: picsumFallback({ aspectRatio, seed }), fallback: true };
  }

  // Download + upload with 1 retry on download/upload error.
  let lastErr: unknown = null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    const candidate = pickFromPool(pool, random);
    try {
      await triggerUnsplashAttribution(candidate, fetchImpl);
      const buffer = await downloadAsBuffer(candidate.downloadUrl, fetchImpl);

      // Hash the bytes — gives a stable filename and lets the same image
      // skip re-upload if a future call lands on it via upsert.
      const hash = crypto.createHash('md5').update(buffer).digest('hex').slice(0, 12);
      const ext = inferExt(null, candidate.downloadUrl);
      const filename = `${role ?? 'image'}-${candidate.source}-${candidate.id}-${hash}${ext}`;

      const supabase = opts.supabase ?? buildScriptAdminClient();
      const upload = await uploadTemplateAsset(buffer, templateKey, filename, {
        bucket: TEMPLATE_ASSETS_BUCKET,
        client: supabase,
        upsert: true,
      });

      return {
        url: upload.publicUrl,
        fallback: false,
        source: candidate.source,
        attribution: {
          artist: candidate.artist,
          artistUrl: candidate.artistUrl,
          sourceUrl: candidate.sourceUrl,
        },
      };
    } catch (err) {
      lastErr = err;
      console.warn(`[image-fetch] attempt ${attempt} failed: ${err instanceof Error ? err.message : String(err)}`);
    }
  }

  const seed = `${templateKey}-${role ?? 'image'}-${query.slice(0, 20)}`;
  console.warn('[image-fetch] All attempts failed — using picsum fallback. Last error:', lastErr);
  return { url: picsumFallback({ aspectRatio, seed }), fallback: true };
}
