import { SupabaseClient } from '@supabase/supabase-js';
import { IUserSiteRepository } from '@/domain/repositories/user-site.repository';
import {
  UserSite,
  CreateUserSiteDto,
  UpdateUserSiteDto,
} from '@/domain/entities/user-site.entity';
import { ContentModel } from '@/domain/entities/template.entity';
import { TemplateError } from '@/domain/errors/template.error';
import { isNotFoundError } from '@/data/errors/supabase-error.adapter';
import { collectAssetUsages } from '@/lib/template/asset-usages';
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
      if (isNotFoundError(error)) return null;
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

  async update(id: string, dto: UpdateUserSiteDto, expectedUpdatedAt: string | null): Promise<UserSite> {
    const updatePayload: Record<string, unknown> = {};
    if (dto.templateId !== undefined) updatePayload.template_id = dto.templateId;
    if (dto.siteName !== undefined) updatePayload.site_name = dto.siteName;
    if (dto.domain !== undefined) updatePayload.domain = dto.domain;
    if (dto.status !== undefined) updatePayload.status = dto.status;
    if (dto.siteJson !== undefined) updatePayload.site_json = dto.siteJson;
    if (dto.templateSnapshot !== undefined) updatePayload.template_snapshot = dto.templateSnapshot;
    if (dto.publishedAt !== undefined) updatePayload.published_at = dto.publishedAt;
    updatePayload.updated_at = new Date().toISOString();

    // Optimistic-concurrency compare-and-swap: when a token is given, the WHERE
    // only matches if the row still carries the version the caller read. `null`
    // is an explicit admin bypass (no version filter). See ADR-0004.
    let query = this.supabase.from('user_sites').update(updatePayload).eq('id', id);
    if (expectedUpdatedAt !== null) {
      query = query.eq('updated_at', expectedUpdatedAt);
    }
    const { data, error } = await query.select().single();

    if (error) {
      if (isNotFoundError(error)) {
        // No row matched. Disambiguate a version conflict from a genuinely
        // missing row (e.g. deleted between the caller's ownership check and
        // here) so the two report distinct, honest codes.
        if (expectedUpdatedAt !== null) {
          const stillExists = await this.findById(id);
          throw new TemplateError(stillExists ? 'STALE_VERSION' : 'SITE_NOT_FOUND');
        }
        throw new TemplateError('SITE_NOT_FOUND');
      }
      console.error('[SupabaseUserSiteRepo::update]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return this.mapRow(data);
  }

  async updateSiteJson(id: string, siteJson: ContentModel, expectedUpdatedAt: string): Promise<UserSite> {
    // Extract new asset usages (Single / Multi page / Multi shared slot_keys).
    const newUsages = collectAssetUsages(siteJson);

    // Call Postgres RPC — atomic lock, usage diff, json update
    const { data: rpcResult, error: rpcError } = await this.supabase.rpc('save_site_template_with_lock', {
      p_site_id: id,
      p_new_json: siteJson,
      p_new_usages: newUsages,
      p_expected_updated_at: expectedUpdatedAt,
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
      if (isNotFoundError(error)) return null; // not found
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
      if (isNotFoundError(error)) return null; // not found
      console.error('[SupabaseUserSiteRepo::findByUserIdAndName]', error.message);
      throw new TemplateError('UNKNOWN');
    }

    return data ? this.mapRow(data) : null;
  }
}
