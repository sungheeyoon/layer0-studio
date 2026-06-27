import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncTemplates } from '../sync';

/**
 * Regression test for the thumbnail-clobber guard (friction doc TODO-2).
 *
 * When a preset's `thumbnailPath` points at a file that does NOT exist on disk,
 * the upload never runs and the computed URL is still the raw
 * `public/thumbnails/…` path — a non-URL. Persisting that would overwrite a
 * previously-good stored URL with a broken relative path (every catalog/admin
 * thumbnail 404s). The guard must instead keep the existing row's URL, and use
 * `null` on a brand-new row.
 */
vi.mock('@/templates/_generated', () => ({
  templateMap: {},
  templateCategories: { 'missing-thumb': 'test' },
  getAvailableTemplateKeys: () => ['missing-thumb'],
  presetMap: {
    'missing-thumb': () => Promise.resolve({
      default: {
        slug: 'missing-thumb',
        templateJson: {
          mode: 'single',
          templateKey: 'missing-thumb',
          sections: [],
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
  validateTemplateJson: vi.fn(() => ({ errors: [], warnings: [] })),
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
        template_json: { old: 'data' }, // differs → forces an UPDATE
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

  it('inserts null thumbnail_url on a new row when the source file is missing', async () => {
    mockSupabase.in.mockResolvedValueOnce({ data: [], error: null });

    const summary = await syncTemplates(mockSupabase, { dryRun: false });

    expect(summary.creates).toBe(1);
    const insertArg = mockSupabase.insert.mock.calls[0][0];
    expect(insertArg.thumbnail_url).toBeNull();
  });
});
