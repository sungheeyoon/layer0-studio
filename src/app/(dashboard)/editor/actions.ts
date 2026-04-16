'use server';

import { createClient } from '@/utils/supabase/server';
import {
  createGetUserSiteUseCase,
  createUpdateSiteJsonUseCase,
  createDeleteUserSiteUseCase,
} from '@/lib/di/container';
import { TemplateJson } from '@/domain/entities/template.entity';
import { TemplateError } from '@/domain/errors/template.error';
import { revalidatePath } from 'next/cache';

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
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'UNAUTHORIZED' };
  }

  try {
    const useCase = createUpdateSiteJsonUseCase(supabase);
    const site = await useCase.executeFieldUpdate(siteId, sectionId, fieldKey, value, user.id);

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

  // Directly update status + published_at via supabase for simplicity
  const { error } = await supabase
    .from('user_sites')
    .update({
      status: 'active',
      published_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', siteId)
    .eq('user_id', user.id);

  if (error) {
    return { error: 'UNKNOWN' };
  }

  revalidatePath('/editor');
  return { success: true };
}

export async function updateSiteDomainAction(siteId: string, domain: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return { error: 'UNAUTHORIZED' };
  }

  // domain slug validation
  const slug = domain.toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 50);
  if (!slug) {
    return { error: 'INVALID_DOMAIN' };
  }

  // Check uniqueness
  const { data: existing } = await supabase
    .from('user_sites')
    .select('id')
    .eq('domain', slug)
    .neq('id', siteId)
    .single();

  if (existing) {
    return { error: 'DOMAIN_TAKEN' };
  }

  const { error } = await supabase
    .from('user_sites')
    .update({
      domain: slug,
      updated_at: new Date().toISOString(),
    })
    .eq('id', siteId)
    .eq('user_id', user.id);

  if (error) {
    console.error('[updateSiteDomainAction]', error.message);
    return { error: 'UNKNOWN' };
  }

  revalidatePath('/editor');
  return { success: true, domain: slug };
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
