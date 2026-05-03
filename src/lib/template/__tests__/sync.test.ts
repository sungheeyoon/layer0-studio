import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncTemplates } from '../sync';

// Mock presetMap and validateTemplateJson
vi.mock('@/themes/_generated', () => ({
  themeMap: {},
  getAvailableThemeKeys: () => ['test'],
  presetMap: {
    'test/default': () => Promise.resolve({
      default: {
        slug: 'test-default',
        templateJson: { themeKey: 'test', pages: [{ slug: 'index', sections: [] }], globalStyles: { primaryColor: '#000', secondaryColor: '#fff' } },
        thumbnailPath: 'test.jpg',
        version: '1.1.0',
        defaults: {
          name: 'New Name',
          description: 'New Description',
          category: 'new',
        }
      }
    })
  }
}));

vi.mock('../validate', () => ({
  validateTemplateJson: vi.fn(() => ({ errors: [], warnings: [] }))
}));

describe('syncTemplates', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mockSupabase: any = {
    from: vi.fn(),
    select: vi.fn(),
    in: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    eq: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSupabase.from.mockReturnValue(mockSupabase);
    mockSupabase.select.mockReturnValue(mockSupabase);
    mockSupabase.in.mockReturnValue(mockSupabase);
    mockSupabase.insert.mockReturnValue(mockSupabase);
    mockSupabase.update.mockReturnValue(mockSupabase);
    mockSupabase.eq.mockReturnValue(mockSupabase);
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
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'test-default',
      name: 'New Name',
      category: 'new'
    }));
  });
});
