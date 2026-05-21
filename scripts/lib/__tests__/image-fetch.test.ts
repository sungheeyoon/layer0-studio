import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  pickFromPool,
  fetchAndHostImage,
  type ImageCandidate,
} from '../image-fetch';

function fakeCandidate(idx: number, source: 'unsplash' | 'pexels' = 'unsplash'): ImageCandidate {
  return {
    source,
    id: `id-${idx}`,
    downloadUrl: `https://example.test/${idx}.jpg`,
    downloadTrackUrl: source === 'unsplash' ? `https://api.test/download/${idx}` : undefined,
    artist: `artist-${idx}`,
    artistUrl: 'https://example.test/artist',
    sourceUrl: 'https://example.test/source',
    width: 1600,
    height: 900,
  };
}

describe('pickFromPool', () => {
  it('throws on empty pool', () => {
    expect(() => pickFromPool([], () => 0)).toThrowError(/empty pool/);
  });

  it('returns the only candidate when N=1 (no random call)', () => {
    const c = fakeCandidate(0);
    expect(pickFromPool([c], () => 0).id).toBe('id-0');
  });

  it('NEVER returns index 0 when N >= 2', () => {
    const pool = Array.from({ length: 10 }, (_, i) => fakeCandidate(i));
    // Even with random()=0 (which would otherwise want index 0), we land on 1.
    expect(pickFromPool(pool, () => 0).id).toBe('id-1');
    // random()=0.9999 with 10 candidates → upper bound 9, idx = 1 + 8 = 9.
    expect(pickFromPool(pool, () => 0.9999).id).toBe('id-9');
  });

  it('caps the upper bound at index 9 even for larger pools', () => {
    const pool = Array.from({ length: 20 }, (_, i) => fakeCandidate(i));
    expect(pickFromPool(pool, () => 0.9999).id).toBe('id-9'); // still ≤ 9
  });

  it('uses the full available range for small pools (N=3 → indices 1-2)', () => {
    const pool = [fakeCandidate(0), fakeCandidate(1), fakeCandidate(2)];
    expect(pickFromPool(pool, () => 0).id).toBe('id-1');
    expect(pickFromPool(pool, () => 0.99).id).toBe('id-2');
  });
});

// ─── fetchAndHostImage — exercise full flow with injected fetch + supabase ──

describe('fetchAndHostImage', () => {
  const ORIG_ENV = { ...process.env };
  beforeEach(() => {
    process.env.UNSPLASH_ACCESS_KEY = 'fake-unsplash-key';
    delete process.env.PEXELS_API_KEY;
  });
  afterEach(() => {
    process.env = { ...ORIG_ENV };
  });

  function makeSupabaseStub() {
    const uploaded: Array<{ path: string; size: number }> = [];
    const supabase = {
      storage: {
        from: () => ({
          upload: async (path: string, buffer: Buffer | Uint8Array) => {
            uploaded.push({ path, size: buffer.byteLength ?? (buffer as Buffer).length });
            return { error: null };
          },
          getPublicUrl: (path: string) => ({
            data: { publicUrl: `https://stub-cdn.test/template_assets/${path}` },
          }),
        }),
      },
    };
    return { supabase, uploaded };
  }

  it('returns picsum fallback when both providers return empty pools', async () => {
    // No PEXELS_API_KEY → Pexels skipped. Unsplash returns empty results.
    const fetchImpl = vi.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({ results: [] }),
    })) as unknown as typeof fetch;

    const result = await fetchAndHostImage({
      query: 'minimalist cafe',
      templateKey: 'cafe-test',
      aspectRatio: 'wide',
      fetchImpl,
      supabase: makeSupabaseStub().supabase as never,
    });

    expect(result.fallback).toBe(true);
    expect(result.url).toMatch(/^https:\/\/picsum\.photos\/seed\//);
    expect(result.url).toMatch(/\/1600\/900$/); // wide aspect
  });

  it('uploads to template_assets and returns CDN URL when Unsplash returns results', async () => {
    const stub = makeSupabaseStub();
    const fetchImpl = vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.startsWith('https://api.unsplash.com/search')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: Array.from({ length: 5 }, (_, i) => ({
              id: `u-${i}`,
              width: 1600,
              height: 900,
              urls: { regular: `https://images.test/u-${i}.jpg`, full: '' },
              links: { download_location: `https://api.unsplash.com/dl/u-${i}`, html: `https://unsplash.com/photos/u-${i}` },
              user: { name: `Artist ${i}`, links: { html: `https://unsplash.com/@artist${i}` } },
            })),
          }),
        } as Response;
      }
      if (url.includes('/dl/')) {
        // Attribution trigger
        return { ok: true, status: 200 } as Response;
      }
      if (url.startsWith('https://images.test/')) {
        // Download — return some bytes
        return {
          ok: true,
          status: 200,
          arrayBuffer: async () => new Uint8Array([1, 2, 3, 4, 5]).buffer,
        } as Response;
      }
      throw new Error(`unexpected URL: ${url}`);
    }) as unknown as typeof fetch;

    // random → index 2 (1 + floor(0.5 * 4) = 3 because upperBound = min(4, 9) = 4; 1+2 = 3)
    const result = await fetchAndHostImage({
      query: 'minimalist cafe',
      templateKey: 'cafe-test',
      aspectRatio: 'wide',
      role: 'hero',
      fetchImpl,
      random: () => 0.5,
      supabase: stub.supabase as never,
    });

    expect(result.fallback).toBe(false);
    expect(result.source).toBe('unsplash');
    expect(result.url).toMatch(/^https:\/\/stub-cdn\.test\/template_assets\/cafe-test\/hero-unsplash-u-\d+-/);
    expect(result.attribution?.artist).toMatch(/^Artist /);
    // Attribution endpoint was hit
    expect(fetchImpl).toHaveBeenCalledWith(
      expect.stringMatching(/^https:\/\/api\.unsplash\.com\/dl\//),
      expect.any(Object),
    );
    // One upload happened
    expect(stub.uploaded).toHaveLength(1);
  });

  it('skips index 0 even on N=10 Unsplash result set', async () => {
    const stub = makeSupabaseStub();
    const fetchImpl = vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.startsWith('https://api.unsplash.com/search')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: Array.from({ length: 10 }, (_, i) => ({
              id: `u-${i}`,
              width: 1600,
              height: 900,
              urls: { regular: `https://images.test/u-${i}.jpg`, full: '' },
              links: { download_location: `https://api.unsplash.com/dl/u-${i}`, html: `https://unsplash.com/photos/u-${i}` },
              user: { name: `A${i}`, links: { html: `https://unsplash.com/@a${i}` } },
            })),
          }),
        } as Response;
      }
      if (url.includes('/dl/')) return { ok: true, status: 200 } as Response;
      if (url.startsWith('https://images.test/')) {
        return { ok: true, status: 200, arrayBuffer: async () => new Uint8Array(8).buffer } as Response;
      }
      throw new Error('unexpected: ' + url);
    }) as unknown as typeof fetch;

    // random()=0 would otherwise want index 0. Verify we pick something else.
    const result = await fetchAndHostImage({
      query: 'test',
      templateKey: 'tk',
      fetchImpl,
      random: () => 0,
      supabase: stub.supabase as never,
    });
    // u-1 because pool is single-source (Pexels skipped), so upperBound=9 → 1 + 0 = 1.
    expect(result.url).toMatch(/hero|image|u-1-/);
    expect(result.url).not.toMatch(/-u-0-/);
  });

  it('falls back to picsum after both download attempts fail', async () => {
    const stub = makeSupabaseStub();
    const fetchImpl = vi.fn(async (input: RequestInfo | URL): Promise<Response> => {
      const url = typeof input === 'string' ? input : input.toString();
      if (url.startsWith('https://api.unsplash.com/search')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            results: Array.from({ length: 5 }, (_, i) => ({
              id: `u-${i}`,
              width: 1600, height: 900,
              urls: { regular: `https://images.test/u-${i}.jpg`, full: '' },
              links: { download_location: `https://api.unsplash.com/dl/u-${i}`, html: '' },
              user: { name: 'A', links: { html: 'https://unsplash.com/@a' } },
            })),
          }),
        } as Response;
      }
      if (url.includes('/dl/')) return { ok: true, status: 200 } as Response;
      // Always fail downloads
      if (url.startsWith('https://images.test/')) {
        return { ok: false, status: 500, arrayBuffer: async () => new ArrayBuffer(0) } as Response;
      }
      throw new Error('unexpected: ' + url);
    }) as unknown as typeof fetch;

    const result = await fetchAndHostImage({
      query: 'q',
      templateKey: 'tk',
      aspectRatio: 'portrait',
      fetchImpl,
      random: () => 0.3,
      supabase: stub.supabase as never,
    });
    expect(result.fallback).toBe(true);
    expect(result.url).toMatch(/\/900\/1200$/); // portrait aspect
    expect(stub.uploaded).toHaveLength(0);
  });

  it('uses picsum fallback when no API keys are configured', async () => {
    delete process.env.UNSPLASH_ACCESS_KEY;
    delete process.env.PEXELS_API_KEY;
    const fetchImpl = vi.fn() as unknown as typeof fetch;
    const result = await fetchAndHostImage({
      query: 'cafe',
      templateKey: 'tk',
      aspectRatio: 'square',
      fetchImpl,
      supabase: makeSupabaseStub().supabase as never,
    });
    expect(result.fallback).toBe(true);
    expect(result.url).toMatch(/\/1000\/1000$/); // square aspect
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
