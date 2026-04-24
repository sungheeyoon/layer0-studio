import { SupabaseClient } from '@supabase/supabase-js';
import { ITemplateRepository } from '@/domain/repositories/template.repository';
import {
  Template,
  CreateTemplateDto,
  UpdateTemplateDto,
} from '@/domain/entities/template.entity';
import { TemplateError } from '@/domain/errors/template.error';

export class SupabaseTemplateRepositoryImpl implements ITemplateRepository {
  constructor(private supabase: SupabaseClient) {}

  private mapRow = (row: Record<string, unknown>): Template => {
    return {
      id: row.id as string,
      name: row.name as string,
      description: (row.description as string) ?? null,
      slug: row.slug as string,
      category: (row.category as string) ?? 'general',
      status: row.status as Template['status'],
      thumbnailUrl: (row.thumbnail_url as string) ?? null,
      templateJson: this.migrateTemplateJson(row.template_json as any),
      version: (row.version as string) ?? '1.0.0',
      createdBy: row.created_by as string,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  private migrateTemplateJson(json: any): any {
    if (!json) return json;
    
    // Add runtime conversion for pages if sections exist but pages do not
    if (json.sections && (!json.pages || json.pages.length === 0)) {
      json.pages = [
        {
          id: 'home',
          title: 'Home',
          slug: '/',
          order: 0,
          sections: json.sections,
        }
      ];
    }
    
    return json;
  }

  async findAll(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseTemplateRepo::findAll]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return (data ?? []).map(this.mapRow);
  }

  async findActiveTemplates(): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseTemplateRepo::findActiveTemplates]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return (data ?? []).map(this.mapRow);
  }

  async findActiveByCategory(category: string): Promise<Template[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('status', 'active')
      .eq('category', category)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseTemplateRepo::findActiveByCategory]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return (data ?? []).map(this.mapRow);
  }

  async findActivePaginated(page: number, limit: number, category?: string | null): Promise<{ data: Template[]; total: number }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    
    let query = this.supabase
      .from('templates')
      .select('*', { count: 'exact' })
      .eq('status', 'active');
      
    if (category) {
      query = query.eq('category', category);
    }
    
    const { data, error, count } = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      console.error('[SupabaseTemplateRepo::findActivePaginated]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return { data: (data ?? []).map(this.mapRow), total: count ?? 0 };
  }

  async getDistinctCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('category')
      .eq('status', 'active');

    if (error) {
      console.error('[SupabaseTemplateRepo::getDistinctCategories]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return [...new Set((data ?? []).map(r => r.category as string))].filter(Boolean);
  }

  async findById(id: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[SupabaseTemplateRepo::findById]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return data ? this.mapRow(data) : null;
  }

  async findBySlug(slug: string): Promise<Template | null> {
    const { data, error } = await this.supabase
      .from('templates')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[SupabaseTemplateRepo::findBySlug]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return data ? this.mapRow(data) : null;
  }

  async create(dto: CreateTemplateDto): Promise<Template> {
    const { data, error } = await this.supabase
      .from('templates')
      .insert({
        name: dto.name,
        description: dto.description,
        slug: dto.slug,
        category: dto.category,
        status: dto.status,
        thumbnail_url: dto.thumbnailUrl,
        template_json: dto.templateJson,
        version: dto.version,
        created_by: dto.createdBy,
      })
      .select()
      .single();

    if (error) {
      console.error('[SupabaseTemplateRepo::create]', error.message);
      if (error.message.includes('duplicate key') || error.message.includes('unique')) {
        throw new TemplateError('TEMPLATE_SLUG_EXISTS');
      }
      throw new TemplateError('UNKNOWN');
    }

    return this.mapRow(data);
  }

  async update(id: string, dto: UpdateTemplateDto): Promise<Template> {
    const updatePayload: Record<string, unknown> = {};
    if (dto.name !== undefined) updatePayload.name = dto.name;
    if (dto.description !== undefined) updatePayload.description = dto.description;
    if (dto.slug !== undefined) updatePayload.slug = dto.slug;
    if (dto.category !== undefined) updatePayload.category = dto.category;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.thumbnailUrl !== undefined) updatePayload.thumbnail_url = dto.thumbnailUrl;
    if (dto.templateJson !== undefined) updatePayload.template_json = dto.templateJson;
    if (dto.version !== undefined) updatePayload.version = dto.version;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('templates')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseTemplateRepo::update]', error.message);
      if (error.code === 'PGRST116') {
        throw new TemplateError('TEMPLATE_NOT_FOUND');
      }
      if (error.message.includes('duplicate key') || error.message.includes('unique')) {
        throw new TemplateError('TEMPLATE_SLUG_EXISTS');
      }
      throw new TemplateError('UNKNOWN');
    }

    return this.mapRow(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[SupabaseTemplateRepo::delete]', error.message);
      throw new TemplateError('UNKNOWN');
    }
  }
}
