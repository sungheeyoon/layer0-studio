import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncTemplates } from '../sync';

/**
 * Regression test for the thumbnail-clobber guard (PR #92).
 *
 * When a preset's `thumbnailPath` points at a file that does NOT exist on disk,
 * the upload never runs and the computed URL is still the raw
 * `public/thumbnails/…` path — a non-URL. Persisting that would overwrite a
 * previously-good stored URL with a broken relative path (every catalog/admin
 * thumbnail 404s). On an UPDATE the guard keeps the existing row's URL.
 *
 * On a CREATE the behaviour is stronger (ADR-0012 §6): a new row registers as
 * `active` (user-visible immediately), so a missing thumbnail must abort the
 * registration rather than publish a thumbnail-less card.
 */
vi.mock('@/templates/_generated', () => ({
  templateMap: {},
  templateCategories: { 'missing-thumb': 'test' },
  getAvailableTemplateKeys: () => ['missing-thumb'],
  presetMap: {
    'missing-thumb': () => Promise.resolve({
      default: {
        slug: 'missing-thumb',
        content: {
          mode: 'single',
          templateKey: 'missing-thumb',
          blocks: [],
          globalStyles: { primaryColor: '#000', secondaryColor: '#fff', fontFamily: 'f', fontSize: '16px', layout: 'wide' },
        },
        // File intentionally does not exist on disk → upload is skipped.
        thumbnailPath: 'public/thumbnails/template-missing-thumb-DOES-NOT-EXIST.webp',
        version: '2.0.0',
        defaults: { name: 'Missing Thumb', description: 'desc' },
      },
    }),
  },
}));

vi.mock('../validate', () => ({
  validateContent: vi.fn(() => ({ errors: [], warnings: [] })),
}));

describe('syncTemplates — thumbnail guard', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ error: null }),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({ error: null }),
      storage: {
        from: vi.fn().mockReturnValue({
          list: vi.fn().mockResolvedValue({ data: [], error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://example.com/t.jpg' } }),
          upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        }),
      },
    };
  });

  it('keeps the existing thumbnail_url when the source file is missing (no clobber)', async () => {
    mockSupabase.in.mockResolvedValueOnce({
      data: [{
        slug: 'missing-thumb',
        name: 'Missing Thumb',
        description: 'desc',
        category: 'test',
        content: { old: 'data' }, // differs → forces an UPDATE
        version: '1.0.0',
        thumbnail_url: 'https://cdn.example/stored-good.webp',
      }],
      error: null,
    });

    await syncTemplates(mockSupabase, { dryRun: false });

    const updateArg = mockSupabase.update.mock.calls[0][0];
    // Preserved, NOT overwritten with the broken local path.
    expect(updateArg.thumbnail_url).toBe('https://cdn.example/stored-good.webp');
    expect(updateArg.thumbnail_url).not.toContain('public/thumbnails/');
  });

  it('REFUSES to register (CREATE) when the thumbnail source is missing', async () => {
    mockSupabase.in.mockResolvedValueOnce({ data: [], error: null });

    const summary = await syncTemplates(mockSupabase, { dryRun: false });

    // ADR-0012 §6: a new row goes live as `active`, so a thumbnail-less card
    // must never be published — registration errors out instead of inserting.
    expect(summary.creates).toBe(0);
    expect(summary.errors).toBe(1);
    expect(mockSupabase.insert).not.toHaveBeenCalled();
    expect(summary.details[0].action).toBe('ERROR');
  });

  it('registers a NEW template as active, fetching the thumbnail from thumbnailBaseUrl', async () => {
    mockSupabase.in.mockResolvedValueOnce({ data: [], error: null });
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new Uint8Array([1, 2, 3]).buffer,
    });
    vi.stubGlobal('fetch', fetchMock);
    try {
      const summary = await syncTemplates(mockSupabase, {
        dryRun: false,
        thumbnailBaseUrl: 'https://deploy.example',
      });

      expect(summary.creates).toBe(1);
      // Bytes fetched from the just-deployed public CDN, not local disk.
      expect(fetchMock).toHaveBeenCalledWith(
        'https://deploy.example/thumbnails/template-missing-thumb-DOES-NOT-EXIST.webp',
      );
      const insertArg = mockSupabase.insert.mock.calls[0][0];
      expect(insertArg.status).toBe('active');
      expect(insertArg.thumbnail_url).toBe('http://example.com/t.jpg');
    } finally {
      vi.unstubAllGlobals();
    }
  });
});
