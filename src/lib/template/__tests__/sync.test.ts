import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncTemplates } from '../sync';

// Mock presetMap and validateTemplateJson
// post-β: presetMap/templateMap keys are templateKeys; templateCategories maps to category.
vi.mock('@/templates/_generated', () => ({
  templateMap: {},
  templateCategories: { 'test-default': 'test' },
  getAvailableTemplateKeys: () => ['test-default'],
  presetMap: {
    'test-default': () => Promise.resolve({
      default: {
        slug: 'test-default',
        templateJson: {
          mode: 'single',
          templateKey: 'test-default',
          sections: [],
          globalStyles: { primaryColor: '#000', secondaryColor: '#fff', fontFamily: 'f', fontSize: '16px', layout: 'wide' }
        },
        thumbnailPath: 'test.jpg',
        version: '1.1.0',
        defaults: {
          name: 'New Name',
          description: 'New Description',
        }
      }
    })
  }
}));

vi.mock('../validate', () => ({
  validateTemplateJson: vi.fn(() => ({ errors: [], warnings: [] }))
}));

describe('syncTemplates', () => {
  // Use any to bypass SupabaseClient's complex internal types in tests
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let mockSupabase: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      in: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      storage: {
        from: vi.fn().mockReturnValue({
          list: vi.fn().mockResolvedValue({ data: [], error: null }),
          getPublicUrl: vi.fn().mockReturnValue({ data: { publicUrl: 'http://example.com/t.jpg' } }),
          upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
        })
      }
    };
  });

  it('should preserve existing meta-data on update', async () => {
    // Existing template in DB
    mockSupabase.in.mockResolvedValueOnce({
      data: [{
        slug: 'test-default',
        name: 'Existing Name',
        description: 'Existing Description',
        category: 'existing',
        content: { old: 'data' },
        version: '1.0.0',
        thumbnail_url: 'old.jpg'
      }],
      error: null
    });

    const summary = await syncTemplates(mockSupabase, { dryRun: false });

    expect(summary.updates).toBe(1);
    expect(mockSupabase.update).toHaveBeenCalledWith(expect.objectContaining({
      version: '1.1.0',
      thumbnail_url: 'test.jpg'
    }));

    // name/description are user-editable in the DB and must NOT be clobbered.
    const updateCall = mockSupabase.update.mock.calls[0][0];
    expect(updateCall.name).toBeUndefined();
    expect(updateCall.description).toBeUndefined();
    // category, by contrast, is code-derived (source of truth) and is now
    // reconciled on UPDATE — the dir-derived 'test' replaces the stale slug.
    expect(updateCall.category).toBe('test');
  });

  it('should use default meta-data on create', async () => {
    // No existing template
    mockSupabase.in.mockResolvedValueOnce({
      data: [],
      error: null
    });
    mockSupabase.insert.mockResolvedValue({ error: null });

    const summary = await syncTemplates(mockSupabase, { dryRun: false });

    expect(summary.creates).toBe(1);
    // post-β: category derived from templateCategories map (not preset.defaults.category)
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'test-default',
      name: 'New Name',
      category: 'test'
    }));
  });

  it('does NOT re-activate a taken-down template on UPDATE (takedown durability, ADR-0012 §6)', async () => {
    // An operator manually took this template down to `archived`. A later code
    // change triggers a sync UPDATE — the takedown must survive it.
    mockSupabase.in.mockResolvedValueOnce({
      data: [{
        slug: 'test-default',
        name: 'Existing Name',
        description: 'Existing Description',
        category: 'test',
        content: { old: 'data' }, // differs → forces an UPDATE
        version: '1.0.0',
        thumbnail_url: 'old.jpg',
        status: 'archived',
      }],
      error: null,
    });

    const summary = await syncTemplates(mockSupabase, { dryRun: false });

    expect(summary.updates).toBe(1);
    // The UPDATE payload must never carry `status` — so `archived` (or `draft`)
    // is never silently reverted to `active` by a future sync.
    const updateCall = mockSupabase.update.mock.calls[0][0];
    expect(updateCall).not.toHaveProperty('status');
  });
});
