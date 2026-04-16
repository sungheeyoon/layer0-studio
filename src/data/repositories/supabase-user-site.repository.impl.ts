import { SupabaseClient } from '@supabase/supabase-js';
import { IUserSiteRepository } from '@/domain/repositories/user-site.repository';
import {
  UserSite,
  CreateUserSiteDto,
  UpdateUserSiteDto,
} from '@/domain/entities/user-site.entity';
import { TemplateJson } from '@/domain/entities/template.entity';
import { TemplateError } from '@/domain/errors/template.error';

export class SupabaseUserSiteRepositoryImpl implements IUserSiteRepository {
  constructor(private supabase: SupabaseClient) {}

  private mapRow(row: Record<string, unknown>): UserSite {
    return {
      id: row.id as string,
      userId: row.user_id as string,
      templateId: (row.template_id as string) ?? null,
      siteName: row.site_name as string,
      domain: (row.domain as string) ?? null,
      status: row.status as UserSite['status'],
      siteJson: row.site_json as TemplateJson,
      templateSnapshot: row.template_snapshot as TemplateJson,
      publishedAt: (row.published_at as string) ?? null,
      createdAt: row.created_at as string,
      updatedAt: row.updated_at as string,
    };
  }

  async findByUserId(userId: string): Promise<UserSite[]> {
    const { data, error } = await this.supabase
      .from('user_sites')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseUserSiteRepo::findByUserId]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return (data ?? []).map(this.mapRow);
  }

  async findById(id: string): Promise<UserSite | null> {
    const { data, error } = await this.supabase
      .from('user_sites')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      console.error('[SupabaseUserSiteRepo::findById]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return data ? this.mapRow(data) : null;
  }

  async findAll(): Promise<UserSite[]> {
    const { data, error } = await this.supabase
      .from('user_sites')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[SupabaseUserSiteRepo::findAll]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return (data ?? []).map(this.mapRow);
  }

  async create(dto: CreateUserSiteDto): Promise<UserSite> {
    const { data, error } = await this.supabase
      .from('user_sites')
      .insert({
        user_id: dto.userId,
        template_id: dto.templateId,
        site_name: dto.siteName,
        domain: dto.domain,
        status: dto.status,
        site_json: dto.siteJson,
        template_snapshot: dto.templateSnapshot,
        published_at: dto.publishedAt,
      })
      .select()
      .single();

    if (error) {
      console.error('[SupabaseUserSiteRepo::create]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return this.mapRow(data);
  }

  async update(id: string, dto: UpdateUserSiteDto): Promise<UserSite> {
    const updatePayload: Record<string, unknown> = {};
    if (dto.templateId !== undefined) updatePayload.template_id = dto.templateId;
    if (dto.siteName !== undefined) updatePayload.site_name = dto.siteName;
    if (dto.domain !== undefined) updatePayload.domain = dto.domain;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.siteJson !== undefined) updatePayload.site_json = dto.siteJson;
    if (dto.templateSnapshot !== undefined) updatePayload.template_snapshot = dto.templateSnapshot;
    if (dto.publishedAt !== undefined) updatePayload.published_at = dto.publishedAt;
    updatePayload.updated_at = new Date().toISOString();

    const { data, error } = await this.supabase
      .from('user_sites')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseUserSiteRepo::update]', error.message);
      if (error.code === 'PGRST116') {
        throw new TemplateError('SITE_NOT_FOUND');
      }
      throw new TemplateError('UNKNOWN');
    }

    return this.mapRow(data);
  }

  async updateSiteJson(id: string, siteJson: TemplateJson): Promise<UserSite> {
    const { data, error } = await this.supabase
      .from('user_sites')
      .update({
        site_json: siteJson,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('[SupabaseUserSiteRepo::updateSiteJson]', error.message);
      if (error.code === 'PGRST116') {
        throw new TemplateError('SITE_NOT_FOUND');
      }
      throw new TemplateError('UNKNOWN');
    }

    return this.mapRow(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('user_sites')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[SupabaseUserSiteRepo::delete]', error.message);
      throw new TemplateError('UNKNOWN');
    }
  }

  async findByDomain(domain: string): Promise<UserSite | null> {
    const { data, error } = await this.supabase
      .from('user_sites')
      .select('*')
      .eq('domain', domain)
      .eq('status', 'active')
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      console.error('[SupabaseUserSiteRepo::findByDomain]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return data ? this.mapRow(data) : null;
  }
}
