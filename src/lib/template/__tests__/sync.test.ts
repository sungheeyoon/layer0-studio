import { describe, it, expect, vi, beforeEach } from 'vitest';
import { syncTemplates } from '../sync';
import { deriveTemplateJsonFromPreset } from '../preset';
import { TemplatePreset } from '@/themes/types';
import { ArrayTemplateField, TextTemplateField } from '@/domain/entities/template.entity';

// Mock presetMap and validateTemplateJson
vi.mock('@/themes/_generated', () => ({
  themeMap: {},
  getAvailableThemeKeys: () => ['test'],
  presetMap: {
    'test/default': () => Promise.resolve({
      default: {
        slug: 'test-default',
        templateJson: { 
          themeKey: 'test', 
          pages: [{ id: 'index', title: 'Index', slug: 'index', sections: [], order: 0 }], 
          globalStyles: { primaryColor: '#000', secondaryColor: '#fff', fontFamily: 'f', fontSize: '16px', layout: 'wide' } 
        },
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

describe('deriveTemplateJsonFromPreset — array fields', () => {
  it('should preserve array fields during derivation', () => {
    const preset: TemplatePreset = {
      slug: 'test-array',
      version: '1.0.0',
      thumbnailPath: 't.jpg',
      defaults: { name: 'N', description: 'D', category: 'C' },
      templateJson: {
        themeKey: 'test',
        globalStyles: { primaryColor: '#000', secondaryColor: '#fff', fontFamily: 'f', fontSize: '16px', layout: 'wide' },
        pages: [{
          id: 'p1',
          title: 'P1',
          slug: '/',
          order: 0,
          sections: [{
            id: 's1',
            type: 'menu',
            visible: true,
            editable: true,
            data: {
              items: {
                type: 'array',
                label: 'Items',
                items: [
                  { title: { type: 'text', label: 'T', value: 'V' } }
                ]
              }
            }
          }]
        }]
      }
    };

    const result = deriveTemplateJsonFromPreset(preset, null);
    const itemsField = result.pages[0].sections[0].data.items as ArrayTemplateField;
    expect(itemsField.type).toBe('array');
    expect(itemsField.items).toHaveLength(1);
    expect((itemsField.items[0].title as TextTemplateField).value).toBe('V');
  });
});

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
    expect(mockSupabase.insert).toHaveBeenCalledWith(expect.objectContaining({
      slug: 'test-default',
      name: 'New Name',
      category: 'new'
    }));
  });
});
