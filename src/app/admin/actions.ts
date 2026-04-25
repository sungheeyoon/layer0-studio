'use server';

import { createClient, createAdminClient } from '@/utils/supabase/server';
import {
  createListUserSitesUseCase,
  createCreateSiteFromTemplateUseCase,
  createDeleteUserSiteUseCase,
  createAdminUpdateSiteUseCase,
} from '@/lib/di/container';
import { TemplateJson } from '@/domain/entities/template.entity';
import { TemplateError } from '@/domain/errors/template.error';
import { revalidatePath } from 'next/cache';

async function checkAdmin() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.app_metadata?.role !== 'admin') {
    return null;
  }
  const adminSupabase = await createAdminClient();
  return { user, adminSupabase };
}

export async function listAllSitesAction() {
  const admin = await checkAdmin();
  if (!admin) return { error: 'FORBIDDEN' };

  try {
    const useCase = createListUserSitesUseCase(admin.adminSupabase);
    return await useCase.executeAll();
  } catch (err) {
    console.error('[Admin::listAllSites]', err);
    return { error: 'UNKNOWN' };
  }
}

export async function createCustomSiteAction(
  userId: string,
  siteName: string,
  siteJson: TemplateJson,
  domain?: string,
) {
  const admin = await checkAdmin();
  if (!admin) return { error: 'FORBIDDEN' };

  try {
    const useCase = createCreateSiteFromTemplateUseCase(admin.adminSupabase);
    const site = await useCase.executeCustom({
      userId,
      siteName,
      siteJson,
      domain,
    });

    revalidatePath('/admin');
    return { success: true, site };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}

export async function updateSiteStatusAction(siteId: string, status: 'draft' | 'active' | 'suspended') {
  const admin = await checkAdmin();
  if (!admin) return { error: 'FORBIDDEN' };

  try {
    const useCase = createAdminUpdateSiteUseCase(admin.adminSupabase);
    await useCase.updateStatus(siteId, status);

    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    console.error('[Admin::updateSiteStatus]', err);
    return { error: 'UNKNOWN' };
  }
}

export async function adminUpdateSiteDomainAction(siteId: string, domain: string) {
  const admin = await checkAdmin();
  if (!admin) return { error: 'FORBIDDEN' };

  try {
    const useCase = createAdminUpdateSiteUseCase(admin.adminSupabase);
    await useCase.updateDomain(siteId, domain);

    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    console.error('[Admin::updateSiteDomain]', err);
    return { error: 'UNKNOWN' };
  }
}

export async function terminateSiteAction(siteId: string) {
  const admin = await checkAdmin();
  if (!admin) return { error: 'FORBIDDEN' };

  try {
    const useCase = createDeleteUserSiteUseCase(admin.adminSupabase);
    await useCase.executeAsAdmin(siteId);

    revalidatePath('/admin');
    return { success: true };
  } catch (err) {
    if (err instanceof TemplateError) {
      return { error: err.code };
    }
    return { error: 'UNKNOWN' };
  }
}
