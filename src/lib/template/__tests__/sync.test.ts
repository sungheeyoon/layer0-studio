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
        template_json: { old: 'data' },
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

    // Check that name/description/category are NOT in the update call
    const updateCall = mockSupabase.update.mock.calls[0][0];
    expect(updateCall.name).toBeUndefined();
    expect(updateCall.description).toBeUndefined();
    expect(updateCall.category).toBeUndefined();
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
});
