'use server';

import { createClient } from '@/utils/supabase/server';
import {
  createGetUserSiteUseCase,
} from '@/lib/di/site-read';
import {
  createDeleteUserSiteUseCase,
} from '@/lib/di/site-write';
import { createSiteWriteUseCase } from '@/lib/di/site-content-write';
import {
  createAssetUploadUseCase,
} from '@/lib/di/asset';
import { ContentModel } from '@/domain/entities/template.entity';
import { TemplateError } from '@/domain/errors/template.error';
import { revalidatePath } from 'next/cache';
import { withUser } from '@/lib/actions/server-action';

export async function loadSiteAction(siteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const useCase = createGetUserSiteUseCase(supabase);

  try {
    const site = await useCase.execute(siteId);
    if (site && user && site.userId !== user.id) {
      console.warn('[loadSiteAction] FORBIDDEN: user %s attempted to access site %s', user?.id, siteId);
      return null;
    }
    return site;
  } catch (err) {
    if (err instanceof TemplateError) return null;
    console.error('[loadSiteAction] unexpected error for site %s:', siteId, err);
    return null;
  }
}

export async function saveContentAction(siteId: string, content: ContentModel, expectedUpdatedAt: string) {
  return withUser(async (user, supabase) => {
    const useCase = createSiteWriteUseCase(supabase);
    const site = await useCase.saveContent(siteId, user.id, content, expectedUpdatedAt);
    return { success: true as const, updatedAt: site.updatedAt };
  });
}

export async function publishSiteAction(siteId: string, expectedUpdatedAt: string) {
  return withUser(async (user, supabase) => {
    const { data: latestPublish } = await supabase
      .from('user_sites')
      .select('published_at')
      .eq('user_id', user.id)
      .not('published_at', 'is', null)
      .order('published_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (latestPublish?.published_at) {
      const elapsed = (Date.now() - new Date(latestPublish.published_at).getTime()) / 1000;
      if (elapsed < 30) return { error: 'RATE_LIMITED' as const };
    }

    const useCase = createSiteWriteUseCase(supabase);
    const site = await useCase.publish(siteId, user.id, expectedUpdatedAt);
    revalidatePath('/dashboard/editor');
    if (site.domain) revalidatePath(`/site/${site.domain}`);
    return { success: true as const, updatedAt: site.updatedAt };
  });
}

export async function updateSiteDomainAction(siteId: string, domain: string, expectedUpdatedAt: string) {
  return withUser(async (user, supabase) => {
    const useCase = createSiteWriteUseCase(supabase);
    const site = await useCase.setDomain(siteId, user.id, domain, expectedUpdatedAt);
    revalidatePath('/dashboard/editor');
    return { success: true as const, domain: site.domain, updatedAt: site.updatedAt };
  });
}

export async function deleteSiteAction(siteId: string) {
  return withUser(async (user, supabase) => {
    const useCase = createDeleteUserSiteUseCase(supabase);
    await useCase.execute(siteId, user.id);
    revalidatePath('/dashboard/projects');
    return { success: true as const };
  });
}

export async function updateSiteNameAction(siteId: string, siteName: string, expectedUpdatedAt: string) {
  const trimmed = siteName.trim();
  if (!trimmed) return { error: 'INVALID_NAME' };
  return withUser(async (user, supabase) => {
    const useCase = createSiteWriteUseCase(supabase);
    const site = await useCase.rename(siteId, user.id, trimmed, expectedUpdatedAt);
    revalidatePath('/dashboard/projects');
    return { success: true as const, updatedAt: site.updatedAt };
  });
}

export async function unpublishSiteAction(siteId: string, expectedUpdatedAt: string) {
  return withUser(async (user, supabase) => {
    const useCase = createSiteWriteUseCase(supabase);
    const site = await useCase.unpublish(siteId, user.id, expectedUpdatedAt);
    revalidatePath('/dashboard/projects');
    revalidatePath('/dashboard/editor');
    if (site.domain) revalidatePath(`/site/${site.domain}`);
    return { success: true as const, updatedAt: site.updatedAt };
  });
}

export async function initUploadAction(
  filename: string,
  mimeType: string,
  size: number,
) {
  return withUser(async (user, supabase) => {
    const useCase = createAssetUploadUseCase(supabase);
    const asset = await useCase.executeInit({ userId: user.id, filename, mimeType, size });
    const uploadPath = `${user.id}/${asset.id}/${filename}`;
    return { success: true as const, assetId: asset.id, uploadPath };
  });
}

export async function confirmUploadAction(assetId: string, uploadPath: string) {
  return withUser(async (user, supabase) => {
    const useCase = createAssetUploadUseCase(supabase);
    const asset = await useCase.executeConfirm({ userId: user.id, assetId, uploadPath });
    const { data: { publicUrl } } = supabase.storage
      .from('user_assets')
      .getPublicUrl(uploadPath);
    return { success: true as const, asset, publicUrl };
  });
}
