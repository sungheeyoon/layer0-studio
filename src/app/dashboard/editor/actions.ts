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
      return null;
    }
    return site;
  } catch (err) {
    if (err instanceof TemplateError) {
      return null;
    }
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

    revalidatePath('/editor');
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

  try {
    const useCase = createPublishSiteUseCase(supabase);
    await useCase.execute(siteId, user.id);

    revalidatePath('/editor');
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

    revalidatePath('/editor');
    return { success: true, domain: site.domain };
  } catch (err: any) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    if (err.message === 'INVALID_DOMAIN' || err.message === 'DOMAIN_TAKEN') {
      return { error: err.message };
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

    revalidatePath('/templates');
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
  } catch (err: any) {
    console.error('[initUploadAction]', err);
    return { error: err.message || 'UNKNOWN' };
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
  } catch (err: any) {
    console.error('[confirmUploadAction]', err);
    return { error: err.message || 'UNKNOWN' };
  }
}
