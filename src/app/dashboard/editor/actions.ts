'use server';

import { createClient } from '@/utils/supabase/server';
import {
  createGetUserSiteUseCase,
  createUpdateSiteJsonUseCase,
  createDeleteUserSiteUseCase,
  createPublishSiteUseCase,
  createUpdateSiteDomainUseCase,
  createAssetUploadUseCase,
} from '@/lib/di/container';
import { TemplateJson } from '@/domain/entities/template.entity';
import { TemplateError } from '@/domain/errors/template.error';
import { revalidatePath } from 'next/cache';
import { validateAssetInfo } from '@/domain/entities/asset.entity';

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
    if (err instanceof TemplateError) {
      return null;
    }
    console.error('[loadSiteAction] unexpected error for site %s:', siteId, err);
    return null;
  }
}

export async function saveSiteJsonAction(siteId: string, siteJson: TemplateJson) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'UNAUTHORIZED' };
  }

  try {
    const useCase = createUpdateSiteJsonUseCase(supabase);
    const site = await useCase.execute(siteId, siteJson, user.id);

    revalidatePath('/dashboard/editor');
    return { success: true, site };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}

export async function updateSiteFieldAction(
  siteId: string,
  sectionId: string,
  fieldKey: string,
  value: string,
  pageId?: string,
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'UNAUTHORIZED' };
  }

  try {
    const useCase = createUpdateSiteJsonUseCase(supabase);
    const site = await useCase.executeFieldUpdate(siteId, sectionId, fieldKey, value, user.id, pageId);

    return { success: true, site };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}

export async function publishSiteAction(siteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'UNAUTHORIZED' };
  }

  // Rate limit: 30-second cooldown per user across all sites
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
    if (elapsed < 30) {
      return { error: 'RATE_LIMITED' };
    }
  }

  try {
    const useCase = createPublishSiteUseCase(supabase);
    const site = await useCase.execute(siteId, user.id);

    revalidatePath('/dashboard/editor');
    if (site.domain) {
      revalidatePath(`/site/${site.domain}`);
    }
    return { success: true };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}

export async function updateSiteDomainAction(siteId: string, domain: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'UNAUTHORIZED' };
  }

  try {
    const useCase = createUpdateSiteDomainUseCase(supabase);
    const site = await useCase.execute(siteId, domain, user.id);

    revalidatePath('/dashboard/editor');
    return { success: true, domain: site.domain };
  } catch (err: unknown) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}

export async function deleteSiteAction(siteId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'UNAUTHORIZED' };
  }

  try {
    const useCase = createDeleteUserSiteUseCase(supabase);
    await useCase.execute(siteId, user.id);

    revalidatePath('/dashboard/projects');
    return { success: true };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}


export async function initUploadAction(
  filename: string,
  mimeType: string,
  size: number
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'UNAUTHORIZED' };
  }

  try {
    validateAssetInfo(size, mimeType);

    const useCase = createAssetUploadUseCase(supabase);
    const asset = await useCase.initUpload({
      userId: user.id,
      filename,
      mimeType,
      size,
    });

    const uploadPath = `${user.id}/${asset.id}/${filename}`;

    return { success: true, assetId: asset.id, uploadPath };
  } catch (err: unknown) {
    console.error('[initUploadAction]', err);
    return { error: err instanceof Error ? err.message : 'UNKNOWN' };
  }
}

export async function confirmUploadAction(assetId: string, uploadPath: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'UNAUTHORIZED' };
  }

  try {
    const useCase = createAssetUploadUseCase(supabase);
    const asset = await useCase.confirmUpload(assetId, uploadPath);

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('user_assets')
      .getPublicUrl(uploadPath);

    return { success: true, asset, publicUrl };
  } catch (err: unknown) {
    console.error('[confirmUploadAction]', err);
    return { error: err instanceof Error ? err.message : 'UNKNOWN' };
  }
}
