import { SupabaseClient } from '@supabase/supabase-js';
import { IUserSiteRepository } from '@/domain/repositories/user-site.repository';
import {
  UserSite,
  CreateUserSiteDto,
  UpdateUserSiteDto,
} from '@/domain/entities/user-site.entity';
import { TemplateJson } from '@/domain/entities/template.entity';
import { TemplateError } from '@/domain/errors/template.error';
import { UserSiteRow } from '@/types/database';

export class SupabaseUserSiteRepositoryImpl implements IUserSiteRepository {
  constructor(private supabase: SupabaseClient) {}

  private mapRow = (row: UserSiteRow): UserSite => {
    return {
      id: row.id,
      userId: row.user_id,
      templateId: row.template_id,
      siteName: row.site_name,
      domain: row.domain,
      status: row.status,
      siteJson: row.site_json,
      templateSnapshot: row.template_snapshot,
      publishedAt: row.published_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
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

  async updateSiteJson(id: string, siteJson: TemplateJson, expectedUpdatedAt?: string): Promise<UserSite> {
    // Extract new asset usages. slot_key namespace (ADR-0007):
    //   Single:        `${section.id}.${key}`
    //   Multi page:    `${page.id}.${section.id}.${key}`
    //   Multi shared:  `shared.${slot}.${section.id}.${key}`
    const newUsages: Array<{ asset_id: string; slot_key: string }> = [];

    const collectFromSection = (
      section: { id: string; data?: Record<string, unknown> },
      prefix: string,
    ) => {
      if (!section.data) return;
      for (const [key, field] of Object.entries(section.data)) {
        const f = field as { type?: string; assetId?: string };
        if (f.type === 'image' && f.assetId) {
          newUsages.push({ asset_id: f.assetId, slot_key: `${prefix}${section.id}.${key}` });
        }
      }
    };

    if (siteJson && siteJson.mode === 'single') {
      for (const section of siteJson.sections ?? []) {
        collectFromSection(section, '');
      }
    } else if (siteJson && siteJson.mode === 'multi') {
      for (const slot of ['header', 'footer'] as const) {
        for (const section of siteJson.shared?.[slot] ?? []) {
          collectFromSection(section, `shared.${slot}.`);
        }
      }
      for (const page of siteJson.pages ?? []) {
        for (const section of page.sections ?? []) {
          collectFromSection(section, `${page.id}.`);
        }
      }
    }

    // Call Postgres RPC — atomic lock, usage diff, json update
    const { data: rpcResult, error: rpcError } = await this.supabase.rpc('save_site_template_with_lock', {
      p_site_id: id,
      p_new_json: siteJson,
      p_new_usages: newUsages,
      p_expected_updated_at: expectedUpdatedAt ?? null,
    });

    if (rpcError) {
      console.error('[SupabaseUserSiteRepo::updateSiteJson]', rpcError.message);
      throw new TemplateError('UNKNOWN');
    }

    if (rpcResult === 'STALE_VERSION') {
      throw new TemplateError('STALE_VERSION');
    }

    // Return the updated row
    const { data: updatedData, error: fetchError } = await this.supabase
      .from('user_sites')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !updatedData) {
      throw new TemplateError('SITE_NOT_FOUND');
    }

    return this.mapRow(updatedData);
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

  async findByUserIdAndName(userId: string, name: string): Promise<UserSite | null> {
    const { data, error } = await this.supabase
      .from('user_sites')
      .select('*')
      .eq('user_id', userId)
      .eq('site_name', name)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // not found
      console.error('[SupabaseUserSiteRepo::findByUserIdAndName]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return data ? this.mapRow(data) : null;
  }
}
